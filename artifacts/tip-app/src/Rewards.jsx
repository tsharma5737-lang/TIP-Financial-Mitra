import CARDS from "./data/cardData.js";

const NAVY      = "#0D1A2E";
const NAVY_CARD = "#112240";
const NAVY_DARK = "#080f1e";
const NAVY_MID  = "#1a2f50";
const GOLD      = "#C9A84C";
const GOLD_LIGHT = "#e0c06a";
const GOLD_DIM  = "#8a6f32";

// ─── Static mock data ─────────────────────────────────────────────────────────

const POINTS_BALANCE = {
  hdfc_millennia:  4500,
  hdfc_regalia:   12000,
  icici_amazon:    2300,
  axis_flipkart:   8900,
  hdfc_swiggy:     3200,
  sbi_simplyclick: 5600,
  amex_mrcc:      28000,
  axis_ace:        6700,
};

// Best redemption blurb per card id
const REDEMPTION_TIP = {
  hdfc_millennia:  "Redeem for Amazon or Flipkart vouchers — 1 pt = ₹0.30",
  hdfc_regalia:    "Use HDFC SmartBuy for flights/hotels — max value per point",
  icici_amazon:    "Direct Amazon Pay cashback at 1 pt = ₹1.00 (no devaluation)",
  axis_flipkart:   "Redeem on Flipkart or Myntra at full 1:1 face value",
  hdfc_swiggy:     "Convert to Swiggy credits for best food delivery value",
  sbi_simplyclick: "Redeem against card statement for instant cashback",
  amex_mrcc:       "Transfer to Marriott Bonvoy or airline miles — up to 40% more value",
  axis_ace:        "Flat cashback against statement at ₹0.20 per point",
};

// Mock expiry: which cards have points expiring within 30 days
const EXPIRING = [
  { cardId: "hdfc_millennia",  pts: 1200, daysLeft: 15 },
  { cardId: "axis_ace",        pts: 2000, daysLeft: 28 },
];

// Card accentColor overrides for white-accented cards
const COLOR_OVERRIDE = {
  axis_flipkart:   "#f59e0b",
  hdfc_swiggy:     "#fc8019",
  sbi_simplyclick: "#4a90d9",
  amex_mrcc:       "#5b9bd5",
  axis_ace:        "#e05a8a",
};

// ─── Derived values ───────────────────────────────────────────────────────────

function cardRupeeValue(card) {
  return (POINTS_BALANCE[card.id] || 0) * card.rewardPointValue;
}

const totalRupeeValue = CARDS.reduce((s, c) => s + cardRupeeValue(c), 0);

const expiringRupeeValue = EXPIRING.reduce((s, e) => {
  const card = CARDS.find((c) => c.id === e.cardId);
  return s + (card ? e.pts * card.rewardPointValue : 0);
}, 0);

function accentFor(card) {
  if (COLOR_OVERRIDE[card.id]) return COLOR_OVERRIDE[card.id];
  if (card.accentColor === "#ffffff" || card.accentColor === "#c9a84c") return GOLD;
  return card.accentColor;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v, d = 0) {
  return "₹" + v.toLocaleString("en-IN", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

function fmtPts(v) {
  return v.toLocaleString("en-IN") + " pts";
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  page: {
    background: NAVY,
    minHeight: "100%",
    paddingBottom: 96,
    fontFamily: "'Inter', sans-serif",
  },

  // ── Header
  header: {
    background: `linear-gradient(135deg, ${NAVY} 0%, #0a1628 100%)`,
    padding: "20px 20px 18px",
    borderBottom: `1px solid ${GOLD_DIM}33`,
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.5px",
  },
  headerSub: {
    fontSize: 11,
    color: "#7a9bcc",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  totalBadge: {
    background: `${GOLD}18`,
    border: `1px solid ${GOLD}44`,
    borderRadius: 10,
    padding: "6px 12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 1,
  },
  totalLabel: { fontSize: 9, color: GOLD_DIM, letterSpacing: 1.2, textTransform: "uppercase" },
  totalValue: { fontSize: 18, fontWeight: 900, color: GOLD, letterSpacing: "-0.5px" },

  // ── Summary row
  summaryRow: {
    display: "flex",
    gap: 10,
    padding: "14px 16px",
  },
  summaryBox: (border) => ({
    flex: 1,
    background: NAVY_CARD,
    border: `1px solid ${border}33`,
    borderRadius: 14,
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  }),
  summaryIcon: { fontSize: 18, lineHeight: 1 },
  summaryLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: "#7a9bcc",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  summaryValue: (color) => ({
    fontSize: 20,
    fontWeight: 900,
    color,
    letterSpacing: "-0.5px",
    lineHeight: 1,
  }),
  summarySub: {
    fontSize: 10,
    color: "#4a6a9a",
    marginTop: 1,
  },

  // ── Section header
  sectionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "2px 16px 10px",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: GOLD,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  sectionSub: { fontSize: 11, color: "#4a6a9a", fontWeight: 600 },

  // ── Card tiles
  tileList: {
    padding: "0 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  tile: (accent) => ({
    background: NAVY_CARD,
    border: `1px solid ${accent}28`,
    borderRadius: 16,
    padding: "14px 14px 12px",
    position: "relative",
    overflow: "hidden",
  }),
  tileBar: (accent) => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: 4,
    height: "100%",
    background: accent,
    borderRadius: "16px 0 0 16px",
  }),

  // tile top
  tileTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingLeft: 10,
  },
  tileBank: { fontSize: 9, fontWeight: 700, color: "#4a6a9a", letterSpacing: 1.2, textTransform: "uppercase" },
  tileName: { fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 2 },
  tilePoints: (accent) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 2,
  }),
  pointsValue: (accent) => ({
    fontSize: 20,
    fontWeight: 900,
    color: accent,
    letterSpacing: "-0.5px",
    lineHeight: 1,
  }),
  pointsLabel: { fontSize: 10, color: "#4a6a9a", fontWeight: 500, textAlign: "right" },

  // tile middle: redemption tip
  tipBox: (accent) => ({
    background: `${accent}0d`,
    border: `1px solid ${accent}22`,
    borderRadius: 9,
    padding: "8px 10px",
    marginLeft: 10,
    marginBottom: 10,
    display: "flex",
    gap: 6,
    alignItems: "flex-start",
  }),
  tipIcon: { fontSize: 13, flexShrink: 0, marginTop: 1 },
  tipText: {
    fontSize: 11,
    color: "#b0c8e8",
    lineHeight: 1.5,
    fontWeight: 500,
  },

  // tile bottom: points bar + redeem btn
  tileBottom: {
    paddingLeft: 10,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  barWrap: { flex: 1, display: "flex", flexDirection: "column", gap: 4 },
  barTrack: {
    height: 5,
    background: "#0a1628",
    borderRadius: 99,
    overflow: "hidden",
  },
  barFill: (pct, accent) => ({
    height: "100%",
    width: `${Math.min(pct, 100)}%`,
    background: `linear-gradient(90deg, ${accent}bb, ${accent})`,
    borderRadius: 99,
  }),
  barLabels: {
    display: "flex",
    justifyContent: "space-between",
  },
  barLeft: { fontSize: 10, color: "#7a9bcc", fontWeight: 500 },
  barRight: { fontSize: 10, color: "#4a6a9a" },

  // redeem btn
  redeemBtn: (accent) => ({
    background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
    color: accent === GOLD || accent === GOLD_LIGHT ? NAVY : "#fff",
    border: "none",
    borderRadius: 9,
    padding: "8px 14px",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
    letterSpacing: 0.3,
    whiteSpace: "nowrap",
    flexShrink: 0,
    boxShadow: `0 3px 10px ${accent}44`,
  }),

  // expiry warning badge (inside tile)
  expiryBadge: {
    position: "absolute",
    top: 10,
    right: 12,
    background: "#f8717118",
    border: "1px solid #f8717144",
    borderRadius: 6,
    padding: "3px 7px",
    fontSize: 9,
    fontWeight: 700,
    color: "#f87171",
    letterSpacing: 0.3,
    display: "flex",
    alignItems: "center",
    gap: 3,
  },

  // ── Insight box
  insightWrap: { padding: "16px 16px 0" },
  insightBox: {
    background: `${GOLD}0d`,
    border: `1.5px solid ${GOLD}55`,
    borderRadius: 16,
    padding: "16px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  insightHeader: {
    fontSize: 11,
    fontWeight: 800,
    color: GOLD,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  insightText: {
    fontSize: 13,
    color: "#c8daf0",
    lineHeight: 1.6,
    fontWeight: 500,
  },
  insightHighlight: {
    fontSize: 12,
    color: GOLD_LIGHT,
    fontWeight: 700,
    marginTop: 2,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
};

// ─── RewardTile ───────────────────────────────────────────────────────────────

function RewardTile({ card }) {
  const pts     = POINTS_BALANCE[card.id] || 0;
  const rupees  = pts * card.rewardPointValue;
  const accent  = accentFor(card);
  const tip     = REDEMPTION_TIP[card.id] || "Redeem via card portal for best value";
  const expiry  = EXPIRING.find((e) => e.cardId === card.id);

  // Bar shows relative to 50k pts as "max" for visual proportion
  const barPct = Math.min((pts / 50000) * 100, 100);

  return (
    <div style={s.tile(accent)}>
      <div style={s.tileBar(accent)} />

      {/* Expiry badge */}
      {expiry && (
        <div style={s.expiryBadge}>
          <span>⚠</span>
          <span>{fmtPts(expiry.pts)} expire in {expiry.daysLeft}d</span>
        </div>
      )}

      {/* Top row */}
      <div style={s.tileTop}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={s.tileBank}>{card.bank} · {card.network}</span>
          <span style={s.tileName}>{card.name}</span>
        </div>
        <div style={s.tilePoints(accent)}>
          <span style={s.pointsValue(accent)}>{fmt(rupees)}</span>
          <span style={s.pointsLabel}>{fmtPts(pts)}</span>
        </div>
      </div>

      {/* Redemption tip */}
      <div style={s.tipBox(accent)}>
        <span style={s.tipIcon}>💡</span>
        <span style={s.tipText}>{tip}</span>
      </div>

      {/* Bottom: bar + redeem btn */}
      <div style={s.tileBottom}>
        <div style={s.barWrap}>
          <div style={s.barTrack}>
            <div style={s.barFill(barPct, accent)} />
          </div>
          <div style={s.barLabels}>
            <span style={s.barLeft}>{fmtPts(pts)}</span>
            <span style={s.barRight}>1 pt = {fmt(card.rewardPointValue, 2)}</span>
          </div>
        </div>
        <button style={s.redeemBtn(accent)}>Redeem</button>
      </div>
    </div>
  );
}

// ─── Rewards screen ───────────────────────────────────────────────────────────

export default function Rewards() {
  const totalExpiringPts = EXPIRING.reduce((s, e) => s + e.pts, 0);

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerRow}>
          <div>
            <div style={s.headerTitle}>My Rewards</div>
            <div style={s.headerSub}>
              {CARDS.length} cards · {CARDS.reduce((s, c) => s + (POINTS_BALANCE[c.id] || 0), 0).toLocaleString("en-IN")} total pts
            </div>
          </div>
          <div style={s.totalBadge}>
            <span style={s.totalLabel}>Total Value</span>
            <span style={s.totalValue}>{fmt(totalRupeeValue)}</span>
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div style={s.summaryRow}>
        {/* Total value box */}
        <div style={s.summaryBox(GOLD)}>
          <span style={s.summaryIcon}>💰</span>
          <span style={s.summaryLabel}>Points Value</span>
          <span style={s.summaryValue(GOLD)}>{fmt(totalRupeeValue)}</span>
          <span style={s.summarySub}>across all cards</span>
        </div>

        {/* Expiring soon box */}
        <div style={s.summaryBox("#f87171")}>
          <span style={s.summaryIcon}>⏳</span>
          <span style={s.summaryLabel}>Expiring Soon</span>
          {expiringRupeeValue > 0 ? (
            <>
              <span style={s.summaryValue("#f87171")}>{fmt(expiringRupeeValue)}</span>
              <span style={{ ...s.summarySub, color: "#f8717188" }}>
                {fmtPts(totalExpiringPts)} · next 30 days
              </span>
            </>
          ) : (
            <>
              <span style={{ ...s.summaryValue("#4ade80"), fontSize: 15 }}>None</span>
              <span style={s.summarySub}>all points safe</span>
            </>
          )}
        </div>
      </div>

      {/* Tiles */}
      <div style={s.sectionRow}>
        <span style={s.sectionTitle}>⚡ Card Rewards</span>
        <span style={s.sectionSub}>{CARDS.length} cards</span>
      </div>

      <div style={s.tileList}>
        {/* Sort: highest rupee value first */}
        {[...CARDS]
          .sort((a, b) => cardRupeeValue(b) - cardRupeeValue(a))
          .map((card) => (
            <RewardTile key={card.id} card={card} />
          ))}
      </div>

      {/* TIP Insight box */}
      <div style={s.insightWrap}>
        <div style={s.insightBox}>
          <span style={s.insightHeader}>💡 TIP Insight</span>
          <p style={{ ...s.insightText, margin: 0 }}>
            Your <strong style={{ color: GOLD_LIGHT }}>Amex MRCC</strong> points are worth{" "}
            <strong style={{ color: GOLD_LIGHT }}>₹14,000</strong>. Redeeming for travel vouchers
            or airline miles gives up to{" "}
            <strong style={{ color: "#4ade80" }}>40% more value</strong> than a simple statement
            cashback — don't leave money on the table.
          </p>
          <span style={s.insightHighlight}>
            <span style={{
              background: "#4ade8022",
              border: "1px solid #4ade8044",
              borderRadius: 5,
              padding: "2px 7px",
              fontSize: 11,
            }}>
              ★ Best move: transfer to Marriott Bonvoy or IndiGo miles
            </span>
          </span>
        </div>
      </div>

    </div>
  );
}
