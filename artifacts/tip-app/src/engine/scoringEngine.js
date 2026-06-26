import CARDS from "../data/cardData.js";

/**
 * Calculates the base cashback value for a transaction on a given card.
 * @param {object} card - Full card object
 * @param {string} category - Transaction category
 * @param {number} amount - Transaction amount in rupees
 * @returns {number} Cashback value in rupees
 */
function calcBaseCashback(card, category, amount) {
  const catKey = category.toLowerCase();
  const catData = card.categories[catKey] || card.categories["other"];
  if (!catData) return 0;

  if (catData.type === "percent") {
    return (amount * catData.cashback) / 100;
  }
  // flat type: cashback is a fixed rupee value per transaction
  return catData.cashback;
}

/**
 * Calculates the active offer value for a transaction on a given card.
 * Matches by merchant name (case-insensitive), checks minTxn, caps at maxCashback.
 * @param {object} card - Full card object
 * @param {string} merchant - Merchant name from the transaction
 * @param {number} amount - Transaction amount in rupees
 * @returns {number} Offer value in rupees
 */
function calcOfferValue(card, merchant, amount) {
  if (!card.activeOffers || card.activeOffers.length === 0) return 0;

  const merchantLower = merchant.toLowerCase();
  let bestOffer = 0;

  for (const offer of card.activeOffers) {
    if (offer.merchant.toLowerCase() !== merchantLower) continue;
    if (amount < offer.minTxn) continue;

    const offerAmount = Math.min((amount * offer.discount) / 100, offer.maxCashback);
    if (offerAmount > bestOffer) bestOffer = offerAmount;
  }

  return bestOffer;
}

/**
 * Calculates the milestone impact for a transaction on a given card.
 * Finds the next milestone the card hasn't yet reached, and returns a
 * proportional share of that milestone's reward value based on how much
 * of the gap this transaction covers.
 * @param {object} card - Full card object
 * @param {number} amount - Transaction amount in rupees
 * @returns {number} Milestone value in rupees
 */
function calcMilestoneValue(card, amount) {
  if (!card.milestones || card.milestones.length === 0) return 0;

  const currentSpend = card.currentSpend || 0;

  // Find the next unachieved milestone
  const nextMilestone = card.milestones
    .filter((m) => m.spendTarget > currentSpend)
    .sort((a, b) => a.spendTarget - b.spendTarget)[0];

  if (!nextMilestone) return 0;

  const gap = nextMilestone.spendTarget - currentSpend;
  if (gap <= 0) return 0;

  // Proportional share: how much of the remaining gap does this txn cover?
  const fractionCovered = Math.min(amount / gap, 1);
  return fractionCovered * nextMilestone.rewardValue;
}

/**
 * Builds a human-readable breakdown string for a scored card.
 * @param {object} card - Full card object
 * @param {string} category - Transaction category
 * @param {string} merchant - Merchant name
 * @param {number} baseCashback - Calculated base cashback
 * @param {number} offerValue - Calculated offer value
 * @param {number} milestoneValue - Calculated milestone value
 * @param {number} totalValue - Total combined value
 * @returns {string}
 */
function buildBreakdown(card, category, merchant, baseCashback, offerValue, milestoneValue, totalValue) {
  const catKey = category.toLowerCase();
  const catData = card.categories[catKey] || card.categories["other"];
  const rate = catData ? catData.cashback : 0;

  const parts = [];

  parts.push(`${rate}% cashback on ${catKey} = ₹${baseCashback.toFixed(2)}`);

  if (offerValue > 0) {
    const matchedOffer = card.activeOffers.find(
      (o) => o.merchant.toLowerCase() === merchant.toLowerCase()
    );
    if (matchedOffer) {
      parts.push(
        `${matchedOffer.discount}% offer on ${matchedOffer.merchant} (max ₹${matchedOffer.maxCashback}) = ₹${offerValue.toFixed(2)}`
      );
    }
  }

  if (milestoneValue > 0) {
    const currentSpend = card.currentSpend || 0;
    const nextMilestone = card.milestones
      .filter((m) => m.spendTarget > currentSpend)
      .sort((a, b) => a.spendTarget - b.spendTarget)[0];
    if (nextMilestone) {
      parts.push(
        `milestone progress toward "${nextMilestone.reward}" (target ₹${nextMilestone.spendTarget.toLocaleString("en-IN")}) = ₹${milestoneValue.toFixed(2)}`
      );
    }
  }

  return parts.join(" + ") + ` → Total ₹${totalValue.toFixed(2)}`;
}

/**
 * Scores all cards for a given transaction and returns them sorted best to worst.
 * @param {{ amount: number, merchant: string, category: string }} transaction
 * @returns {Array<{
 *   card: object,
 *   baseCashback: number,
 *   offerValue: number,
 *   milestoneValue: number,
 *   totalValue: number,
 *   breakdown: string,
 *   lossVsBest: number
 * }>}
 */
function scoreCards(transaction) {
  const { amount, merchant, category } = transaction;

  const scored = CARDS.map((card) => {
    const baseCashback = calcBaseCashback(card, category, amount);
    const offerValue = calcOfferValue(card, merchant, amount);
    const milestoneValue = calcMilestoneValue(card, amount);
    const totalValue = baseCashback + offerValue + milestoneValue;

    return {
      card,
      baseCashback: parseFloat(baseCashback.toFixed(2)),
      offerValue: parseFloat(offerValue.toFixed(2)),
      milestoneValue: parseFloat(milestoneValue.toFixed(2)),
      totalValue: parseFloat(totalValue.toFixed(2)),
      breakdown: "", // filled in after sorting
      lossVsBest: 0, // filled in after sorting
    };
  });

  // Sort best to worst
  scored.sort((a, b) => b.totalValue - a.totalValue);

  const bestValue = scored[0]?.totalValue ?? 0;

  // Fill in breakdown and lossVsBest now that we know the best
  for (const result of scored) {
    result.breakdown = buildBreakdown(
      result.card,
      category,
      merchant,
      result.baseCashback,
      result.offerValue,
      result.milestoneValue,
      result.totalValue
    );
    result.lossVsBest = parseFloat((bestValue - result.totalValue).toFixed(2));
  }

  return scored;
}

/**
 * Returns the best card for a given spend category without a specific transaction amount.
 * Uses a normalised ₹1000 reference amount for comparison (offer/milestone excluded).
 * @param {string} category - Spend category e.g. "dining", "grocery", "travel"
 * @returns {{ card: object, cashbackRate: number, cashbackPer1000: number } | null}
 */
function getGeneralBestCard(category) {
  const REFERENCE_AMOUNT = 1000;
  const catKey = category.toLowerCase();

  let best = null;
  let bestValue = -1;

  for (const card of CARDS) {
    const catData = card.categories[catKey] || card.categories["other"];
    if (!catData) continue;

    const value = calcBaseCashback(card, catKey, REFERENCE_AMOUNT);

    if (value > bestValue) {
      bestValue = value;
      best = {
        card,
        cashbackRate: catData.cashback,
        cashbackPer1000: parseFloat(value.toFixed(2)),
      };
    }
  }

  return best;
}

export { scoreCards as default, scoreCards, getGeneralBestCard };
