import CARDS from "./data/cardData.js";

const NAVY      = "#0D1A2E";
const NAVY_CARD = "#112240";
const NAVY_LIGHT = "#1a2f50";
const GOLD      = "#C9A84C";
const GOLD_LIGHT = "#e0c06a";
const GOLD_DIM  = "#8a6f32";

// ─── Derived portfolio stats ────────────────────────────────────────────────

function getBestCategory(card) {
  let best = { key: "other", rate: 0 };
  for (const [key, val] of Object.entries(card.categories)) {
    if (val.cashback > best.rate) best = { key, rate: val.cashback };
  }
  return best;
}

function getNextMilestone(card) {
  if (!card.milestones || card.milestones.length === 0) return null;
  return card.milestones
    .filter((m) => m.spendTarget > card.currentSpend)
    .sort((a, b) => a.spendTarget - b.spendTarget)[0] || null;
}

function calcAvgCashbackRate(card) {
  const vals = Object.values(card.categories).map((c) => c.cashback);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function estimateMonthlySavings(card) {
  const monthly = card.currentSpend / 12;
  const avg = calcAvgCashbackRate(card);
  return (monthly * avg) / 100;
}

const totalSpend       = CARDS.reduce((s, c) => s + c.currentSpend, 0);
const totalSavedMonth  = CARDS.reduce((s, c) => s + estimateMonthlySavings(c), 0);
const totalRewardsValue = CARDS.reduce((s, c) => {
  const best = getBestCategory(c);
  return s + (c.currentSpend * best.rate) / 100 * c.rewardPointValue;
}, 0);
const totalLosses = totalSavedMonth * 0.22;

// ─── Efficiency Score engine ─────────────────────────────────────────────────

/** Average cashback of the top-2 categories */
function getTop2AvgRate(card) {
  const sorted = Object.values(card.categories)
    .map((c) => c.cashback)
    .sort((a, b) => b - a);
  const top2 = sorted.slice(0, 2);
  return top2.reduce((a, b) => a + b, 0) / (top2.length || 1);
}

/** Sum of rewardValue for milestones the user has already passed */
function unlockedMilestoneValue(card) {
  if (!card.milestones) return 0;
  return card.milestones
    .filter((m) => m.spendTarget <= card.currentSpend)
    .reduce((s, m) => s + (m.rewardValue || 0), 0);
}

/** Annual benefit value extracted from this card */
function calcBenefits(card) {
  const cashback = (card.currentSpend * getTop2AvgRate(card)) / 100;
  const lounge   = (card.loungeAccess?.domestic || 0) * 500
                 + (card.loungeAccess?.international || 0) * 1500;
  const milestones = unlockedMilestoneValue(card);
  return cashback + lounge + milestones;
}

/** Component 1: Fee Value Score (0–25) */
function feeValueScore(card) {
  if (card.annualFee === 0) return 25;
  const ratio = calcBenefits(card) / card.annualFee;
  return Math.min(25, ratio * 25);
}

/** Component 2: Spend Alignment Score (0–25) */
function spendAlignmentScore(card) {
  const waiver = card.annualFeeWaiverSpend;
  if (!waiver) return 20;                              // no waiver target
  const pct = card.currentSpend / waiver;
  if (pct > 0.5) return 25;
  if (pct > 0.25) return 15;
  return 5;
}

/** Component 3: Milestone Health Score (0–25) */
function milestoneHealthScore(card) {
  if (!card.milestones || card.milestones.length === 0) return 5;
  const allDone = card.milestones.every((m) => m.spendTarget <= card.currentSpend);
  if (allDone) return 25;
  const waiver = card.annualFeeWaiverSpend;
  if (waiver > 0) {
    const pct = card.currentSpend / waiver;
    if (pct > 0.6) return 20;
    if (pct > 0.3) return 12;
  }
  return 5;
}

/** Component 4: Rewards Efficiency Score (0–25) */
function rewardsEfficiencyScore(card) {
  const v = card.rewardPointValue;
  if (v >= 1.00) return 25;
  if (v >= 0.50) return 18;
  if (v >= 0.30) return 12;
  if (v >= 0.25) return 8;
  return 5;
}

/** Final efficiency score (0–100) */
function calcEfficiencyScore(card) {
  return Math.round(
    feeValueScore(card) +
    spendAlignmentScore(card) +
    milestoneHealthScore(card) +
    rewardsEfficiencyScore(card)
  );
}

/** Score metadata: color, label */
function scoreAppearance(score) {
  if (score >= 75) return { bg: "#4ade80", textColor: "#052010", label: "Excellent" };
  if (score >= 50) return { bg: GOLD,      textColor: "#0a1628", label: "Good" };
  if (score >= 25) return { bg: "#f97316", textColor: "#fff",    label: "Underutilised" };
  return               { bg: "#f87171",    textColor: "#fff",    label: "Review card" };
}

/** Insight line below the badge */
function insightText(card, score) {
  const top = getBestCategory(card);
  if (score < 40)  return "⚠️ Paying more in fees than you're earning in benefits";
  if (score <= 60) return `📈 Moderate value — shift more ${top.key} spend here`;
  if (score <= 80) return "✅ Good card for your spend pattern";
  return                  "🏆 This card is working hard for you";
}

// Pre-compute scores for all cards once
const SCORES = Object.fromEntries(CARDS.map((c) => [c.id, calcEfficiencyScore(c)]));
const avgScore = CARDS.length
  ? Math.round(CARDS.reduce((s, c) => s + SCORES[c.id], 0) / CARDS.length)
  : 0;
const weakest = CARDS.length
  ? CARDS.reduce((a, b) => SCORES[a.id] <= SCORES[b.id] ? a : b)
  : null;
const weakestScore    = weakest ? SCORES[weakest.id] : 0;
const weakestBenefits = weakest ? Math.round(calcBenefits(weakest)) : 0;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupee(val, decimals = 0) {
  return "₹" + val.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = {
  container: {
    background: NAVY,
    minHeight: "100%",
    paddingBottom: 90,
    fontFamily: "'Inter', sans-serif",
  },

  // Header
  header: {
    background: `linear-gradient(135deg, ${NAVY} 0%, #0a1628 100%)`,
    padding: "20px 20px 16px",
    borderBottom: `1px solid ${GOLD_DIM}33`,
  },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  headerTitle: { fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" },
  headerSub: { fontSize: 11, color: "#7a9bcc", marginTop: 2, letterSpacing: 0.3 },
  headerBadge: {
    background: `${GOLD}18`, border: `1px solid ${GOLD}44`, borderRadius: 8,
    padding: "4px 10px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1,
  },
  headerBadgeLabel: { fontSize: 9, color: GOLD_DIM, letterSpacing: 1, textTransform: "uppercase" },
  headerBadgeVal:   { fontSize: 15, fontWeight: 800, color: GOLD },

  // Metric strip
  strip: { display: "flex", gap: 8, padding: "14px 16px" },
  metricBox: (color) => ({
    flex: 1, background: NAVY_CARD, borderRadius: 12, padding: "10px",
    display: "flex", flexDirection: "column", gap: 3, border: `1px solid ${color}22`,
  }),
  metricLabel: { fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#7a9bcc" },
  metricValue: (color) => ({ fontSize: 15, fontWeight: 800, color, letterSpacing: "-0.3px", lineHeight: 1 }),
  metricSub:   { fontSize: 9, color: "#4a6a9a", marginTop: 1 },

  // Portfolio health box
  healthBox: {
    margin: "0 16px 4px",
    background: `${GOLD}0a`,
    border: `1.5px solid ${GOLD}55`,
    borderRadius: 14,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  healthTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  healthLabel: { fontSize: 10, fontWeight: 800, color: GOLD_DIM, letterSpacing: 1.8, textTransform: "uppercase" },
  healthScoreRow: { display: "flex", alignItems: "baseline", gap: 4 },
  healthNumber: { fontSize: 28, fontWeight: 900, color: GOLD, letterSpacing: "-1px", lineHeight: 1 },
  healthDenom:  { fontSize: 14, fontWeight: 600, color: GOLD_DIM },
  healthBar: {
    height: 5, background: "#0a1628", borderRadius: 99, overflow: "hidden",
  },
  healthBarFill: (pct) => ({
    height: "100%",
    width: `${pct}%`,
    background: pct >= 75 ? "#4ade80" : pct >= 50 ? GOLD : "#f97316",
    borderRadius: 99,
    transition: "width 0.5s ease",
  }),
  healthInsight: { fontSize: 12, color: "#8aaac8", lineHeight: 1.5, fontWeight: 400 },
  healthInsightBold: { fontWeight: 700, color: "#b0c8e0" },

  // Section header
  sectionHeader: {
    padding: "12px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 2, textTransform: "uppercase" },
  sectionCount: { fontSize: 11, color: "#4a6a9a", fontWeight: 600 },

  // Card tile
  cardList: { padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 },
  tile: {
    background: NAVY_CARD, border: `1px solid #1e3a6a`,
    borderRadius: 16, padding: "14px 14px 12px",
    position: "relative", overflow: "hidden",
  },
  tileAccent: (color) => ({
    position: "absolute", top: 0, left: 0,
    width: 4, height: "100%", background: color,
    borderRadius: "16px 0 0 16px",
  }),

  // Top row: name block (left) + score circle (right)
  tileTopRow: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    marginBottom: 8, paddingLeft: 8,
  },
  tileLeft: { display: "flex", flexDirection: "column", gap: 4, flex: 1, paddingRight: 10 },
  tileBank: { fontSize: 9, fontWeight: 700, color: "#4a6a9a", letterSpacing: 1.2, textTransform: "uppercase" },
  tileName: { fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.2px" },
  bestBadge: (color) => ({
    background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 6,
    padding: "3px 8px", fontSize: 10, fontWeight: 700, color,
    letterSpacing: 0.3, whiteSpace: "nowrap", alignSelf: "flex-start",
  }),

  // Score circle
  scoreCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 },
  scoreCircle: (bg) => ({
    width: 48, height: 48, borderRadius: "50%",
    background: bg,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: `0 2px 10px ${bg}66`,
    flexShrink: 0,
  }),
  scoreNumber: (textColor) => ({
    fontSize: 16, fontWeight: 900, color: textColor, letterSpacing: "-0.5px",
  }),
  scoreLabel: (color) => ({
    fontSize: 9, fontWeight: 700, color, letterSpacing: 0.5,
    textTransform: "uppercase", textAlign: "center",
  }),

  // Insight text
  insightText: {
    paddingLeft: 8, marginTop: 0, marginBottom: 10,
    fontSize: 11, color: "#5a7a9a", fontWeight: 500, lineHeight: 1.4,
  },

  // Progress bar
  progressArea:     { paddingLeft: 8, marginBottom: 10 },
  progressLabelRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  progressLabel:    { fontSize: 10, color: "#7a9bcc", fontWeight: 500 },
  progressPct:      { fontSize: 10, fontWeight: 700, color: "#fff" },
  progressTrack:    { height: 5, background: "#0a1628", borderRadius: 99, overflow: "hidden" },
  progressFill: (pct, color) => ({
    height: "100%",
    width: `${Math.min(pct, 100)}%`,
    background: pct >= 100 ? "#4ade80" : pct >= 70 ? GOLD : color,
    borderRadius: 99,
    transition: "width 0.4s ease",
  }),
  progressSubRow: { display: "flex", justifyContent: "space-between", marginTop: 4 },
  progressSpend:  { fontSize: 10, color: "#7a9bcc" },
  progressTarget: { fontSize: 10, color: "#4a6a9a" },

  // Pills row
  infoRow: { display: "flex", gap: 6, paddingLeft: 8, flexWrap: "wrap" },
  infoPill: (bg, col) => ({
    background: bg, border: `1px solid ${col}33`, borderRadius: 7,
    padding: "4px 8px", fontSize: 10, fontWeight: 600, color: col,
    display: "flex", alignItems: "center", gap: 4, letterSpacing: 0.1,
  }),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricBox({ label, value, sub, color }) {
  return (
    <div style={s.metricBox(color)}>
      <span style={s.metricLabel}>{label}</span>
      <span style={s.metricValue(color)}>{value}</span>
      {sub && <span style={s.metricSub}>{sub}</span>}
    </div>
  );
}

function PortfolioHealth() {
  return (
    <div style={s.healthBox}>
      <div style={s.healthTop}>
        <span style={s.healthLabel}>Portfolio Health</span>
        <div style={s.healthScoreRow}>
          <span style={s.healthNumber}>{avgScore}</span>
          <span style={s.healthDenom}>/100</span>
        </div>
      </div>

      <div style={s.healthBar}>
        <div style={s.healthBarFill(avgScore)} />
      </div>

      <span style={s.healthInsight}>
        Your weakest card is{" "}
        <span style={s.healthInsightBold}>{weakest.name}</span>
        {" "}at{" "}
        <span style={s.healthInsightBold}>{weakestScore}/100</span>
        {weakest.annualFee > 0 ? (
          <>
            {" — it costs "}
            <span style={s.healthInsightBold}>{formatRupee(weakest.annualFee)}</span>
            {" but delivers only "}
            <span style={s.healthInsightBold}>{formatRupee(weakestBenefits)}</span>
            {" in annual value"}
          </>
        ) : (
          " — review your spend pattern to extract more value"
        )}
      </span>
    </div>
  );
}

function CardTile({ card }) {
  const score    = SCORES[card.id];
  const appear   = scoreAppearance(score);
  const insight  = insightText(card, score);
  const best     = getBestCategory(card);
  const next     = getNextMilestone(card);
  const waiver   = card.annualFeeWaiverSpend;
  const spend    = card.currentSpend;
  const pct      = waiver > 0 ? (spend / waiver) * 100 : 100;
  const accentColor   = card.accentColor === "#ffffff" ? GOLD : card.accentColor;
  const loungeTotal   = (card.loungeAccess?.domestic || 0) + (card.loungeAccess?.international || 0);
  const loungeLabel   = card.loungeAccess?.perQuarter ? "/qtr" : "/yr";
  const badgeColor    = accentColor === GOLD ? GOLD : GOLD_LIGHT;

  return (
    <div style={s.tile}>
      <div style={s.tileAccent(accentColor)} />

      {/* Top row: name block (left) + score circle (right) */}
      <div style={s.tileTopRow}>
        <div style={s.tileLeft}>
          <span style={s.tileBank}>{card.bank} · {card.network}</span>
          <span style={s.tileName}>{card.name}</span>
          <div style={s.bestBadge(badgeColor)}>
            ★ Best: {capitalize(best.key)} ({best.rate}%)
          </div>
        </div>

        <div style={s.scoreCol}>
          <div style={s.scoreCircle(appear.bg)}>
            <span style={s.scoreNumber(appear.textColor)}>{score}</span>
          </div>
          <span style={s.scoreLabel(appear.bg)}>{appear.label}</span>
        </div>
      </div>

      {/* Smart insight */}
      <div style={s.insightText}>{insight}</div>

      {/* Spend progress vs fee waiver */}
      <div style={s.progressArea}>
        <div style={s.progressLabelRow}>
          <span style={s.progressLabel}>
            {waiver > 0 ? "Spend toward fee waiver" : "Annual spend"}
          </span>
          <span style={s.progressPct}>
            {waiver > 0 ? `${Math.min(pct, 100).toFixed(0)}%` : "—"}
          </span>
        </div>
        <div style={s.progressTrack}>
          <div style={s.progressFill(pct, accentColor)} />
        </div>
        <div style={s.progressSubRow}>
          <span style={s.progressSpend}>{formatRupee(spend)} spent</span>
          {waiver > 0 && (
            <span style={s.progressTarget}>
              {pct >= 100 ? "Fee waived ✓" : `${formatRupee(waiver - spend)} to go`}
            </span>
          )}
        </div>
      </div>

      {/* Pills row */}
      <div style={s.infoRow}>
        {next ? (
          <div style={s.infoPill(`${GOLD}12`, GOLD_LIGHT)}>
            <span>🎯</span>
            <span>{formatRupee(next.spendTarget - spend)} more → {next.reward}</span>
          </div>
        ) : (
          <div style={s.infoPill("#4ade8012", "#4ade80")}>
            <span>✓</span>
            <span>All milestones unlocked</span>
          </div>
        )}

        {loungeTotal > 0 && (
          <div style={s.infoPill(`${accentColor}12`, accentColor === "#ffffff" ? GOLD : accentColor)}>
            <span>✈</span>
            <span>
              {card.loungeAccess.domestic > 0 && `${card.loungeAccess.domestic} domestic`}
              {card.loungeAccess.domestic > 0 && card.loungeAccess.international > 0 && " · "}
              {card.loungeAccess.international > 0 && `${card.loungeAccess.international} intl`}
              {" "}{loungeLabel}
            </span>
          </div>
        )}

        <div style={s.infoPill("#7a9bcc12", "#7a9bcc")}>
          <span>💳</span>
          <span>{card.annualFee === 0 ? "No annual fee" : `₹${card.annualFee}/yr fee`}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  return (
    <div style={s.container}>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerRow}>
          <div>
            <div style={s.headerTitle}>My Cards</div>
            <div style={s.headerSub}>
              {CARDS.length} cards · {formatRupee(totalSpend)} portfolio spend
            </div>
          </div>
          <div style={s.headerBadge}>
            <span style={s.headerBadgeLabel}>Total Spend</span>
            <span style={s.headerBadgeVal}>{formatRupee(totalSpend)}</span>
          </div>
        </div>
      </div>

      {/* Metric strip */}
      <div style={s.strip}>
        <MetricBox label="Saved/Mo" value={formatRupee(totalSavedMonth, 0)} sub="est. avg cashback" color="#4ade80" />
        <MetricBox label="Losses"   value={formatRupee(totalLosses, 0)}     sub="suboptimal use"   color="#f87171" />
        <MetricBox label="Rewards"  value={formatRupee(totalRewardsValue, 0)} sub="points → rupees" color={GOLD} />
      </div>

      {/* Portfolio health insight */}
      <PortfolioHealth />

      {/* Card list */}
      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>⚡ Card Portfolio</span>
        <span style={s.sectionCount}>{CARDS.length} cards</span>
      </div>

      <div style={s.cardList}>
        {CARDS.map((card) => (
          <CardTile key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
