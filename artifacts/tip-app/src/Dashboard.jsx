import CARDS from "./data/cardData.js";

const NAVY = "#0D1A2E";
const NAVY_CARD = "#112240";
const NAVY_LIGHT = "#1a2f50";
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#e0c06a";
const GOLD_DIM = "#8a6f32";

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

// Estimate monthly savings from each card: avg rate × (currentSpend / 12)
function estimateMonthlySavings(card) {
  const monthly = card.currentSpend / 12;
  const avg = calcAvgCashbackRate(card);
  return (monthly * avg) / 100;
}

const totalSpend = CARDS.reduce((s, c) => s + c.currentSpend, 0);
const totalSavedMonth = CARDS.reduce((s, c) => s + estimateMonthlySavings(c), 0);

// Total rewards value: sum of (currentSpend * best category rate / 100 * rewardPointValue)
const totalRewardsValue = CARDS.reduce((s, c) => {
  const best = getBestCategory(c);
  return s + (c.currentSpend * best.rate) / 100 * c.rewardPointValue;
}, 0);

// Simulated losses (cards used suboptimally — rough 20% of savings foregone)
const totalLosses = totalSavedMonth * 0.22;

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
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  headerBadge: {
    background: `${GOLD}18`,
    border: `1px solid ${GOLD}44`,
    borderRadius: 8,
    padding: "4px 10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 1,
  },
  headerBadgeLabel: {
    fontSize: 9,
    color: GOLD_DIM,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerBadgeVal: {
    fontSize: 15,
    fontWeight: 800,
    color: GOLD,
  },

  // Summary strip
  strip: {
    display: "flex",
    gap: 8,
    padding: "14px 16px",
  },
  metricBox: (color) => ({
    flex: 1,
    background: NAVY_CARD,
    borderRadius: 12,
    padding: "10px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
    border: `1px solid ${color}22`,
  }),
  metricLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#7a9bcc",
  },
  metricValue: (color) => ({
    fontSize: 15,
    fontWeight: 800,
    color,
    letterSpacing: "-0.3px",
    lineHeight: 1,
  }),
  metricSub: {
    fontSize: 9,
    color: "#4a6a9a",
    marginTop: 1,
  },

  // Section
  sectionHeader: {
    padding: "4px 16px 10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: GOLD,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  sectionCount: {
    fontSize: 11,
    color: "#4a6a9a",
    fontWeight: 600,
  },

  // Card tile
  cardList: {
    padding: "0 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  tile: {
    background: NAVY_CARD,
    border: `1px solid #1e3a6a`,
    borderRadius: 16,
    padding: "14px 14px 12px",
    position: "relative",
    overflow: "hidden",
  },
  tileAccent: (color) => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: 4,
    height: "100%",
    background: color,
    borderRadius: "16px 0 0 16px",
  }),
  tileTopRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingLeft: 8,
  },
  tileLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  tileBank: {
    fontSize: 9,
    fontWeight: 700,
    color: "#4a6a9a",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  tileName: {
    fontSize: 15,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-0.2px",
  },
  bestBadge: (color) => ({
    background: `${color}18`,
    border: `1px solid ${color}44`,
    borderRadius: 6,
    padding: "3px 8px",
    fontSize: 10,
    fontWeight: 700,
    color: color,
    letterSpacing: 0.3,
    whiteSpace: "nowrap",
  }),

  // Progress bar area
  progressArea: {
    paddingLeft: 8,
    marginBottom: 10,
  },
  progressLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 10,
    color: "#7a9bcc",
    fontWeight: 500,
  },
  progressPct: {
    fontSize: 10,
    fontWeight: 700,
    color: "#fff",
  },
  progressTrack: {
    height: 5,
    background: "#0a1628",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: (pct, color) => ({
    height: "100%",
    width: `${Math.min(pct, 100)}%`,
    background: pct >= 100
      ? "#4ade80"
      : pct >= 70
      ? GOLD
      : color,
    borderRadius: 99,
    transition: "width 0.4s ease",
  }),
  progressSubRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 4,
  },
  progressSpend: {
    fontSize: 10,
    color: "#7a9bcc",
  },
  progressTarget: {
    fontSize: 10,
    color: "#4a6a9a",
  },

  // Info row (milestone, lounge)
  infoRow: {
    display: "flex",
    gap: 6,
    paddingLeft: 8,
    flexWrap: "wrap",
  },
  infoPill: (bg, col) => ({
    background: bg,
    border: `1px solid ${col}33`,
    borderRadius: 7,
    padding: "4px 8px",
    fontSize: 10,
    fontWeight: 600,
    color: col,
    display: "flex",
    alignItems: "center",
    gap: 4,
    letterSpacing: 0.1,
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

function CardTile({ card }) {
  const best = getBestCategory(card);
  const next = getNextMilestone(card);
  const waiver = card.annualFeeWaiverSpend;
  const spend = card.currentSpend;
  const pct = waiver > 0 ? (spend / waiver) * 100 : 100;
  const accentColor = card.accentColor === "#ffffff" ? GOLD : card.accentColor;
  const loungeTotal = (card.loungeAccess?.domestic || 0) + (card.loungeAccess?.international || 0);
  const loungeLabel = card.loungeAccess?.perQuarter ? "/qtr" : "/yr";

  return (
    <div style={s.tile}>
      <div style={s.tileAccent(accentColor)} />

      {/* Top row: name + best-category badge */}
      <div style={s.tileTopRow}>
        <div style={s.tileLeft}>
          <span style={s.tileBank}>{card.bank} · {card.network}</span>
          <span style={s.tileName}>{card.name}</span>
        </div>
        <div style={s.bestBadge(accentColor === GOLD ? GOLD : GOLD_LIGHT)}>
          ★ Best: {capitalize(best.key)} ({best.rate}%)
        </div>
      </div>

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
              {pct >= 100
                ? "Fee waived ✓"
                : `${formatRupee(waiver - spend)} to go`}
            </span>
          )}
        </div>
      </div>

      {/* Pills row */}
      <div style={s.infoRow}>
        {/* Milestone */}
        {next ? (
          <div style={s.infoPill(`${GOLD}12`, GOLD_LIGHT)}>
            <span>🎯</span>
            <span>
              {formatRupee(next.spendTarget - spend)} more → {next.reward}
            </span>
          </div>
        ) : (
          <div style={s.infoPill("#4ade8012", "#4ade80")}>
            <span>✓</span>
            <span>All milestones unlocked</span>
          </div>
        )}

        {/* Lounge */}
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

        {/* Annual fee */}
        <div style={s.infoPill("#7a9bcc12", "#7a9bcc")}>
          <span>💳</span>
          <span>{card.annualFee === 0 ? "No annual fee" : `₹${card.annualFee}/yr fee`}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard component ────────────────────────────────────────────────

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

      {/* Summary strip */}
      <div style={s.strip}>
        <MetricBox
          label="Saved/Mo"
          value={formatRupee(totalSavedMonth, 0)}
          sub="est. avg cashback"
          color="#4ade80"
        />
        <MetricBox
          label="Losses"
          value={formatRupee(totalLosses, 0)}
          sub="suboptimal use"
          color="#f87171"
        />
        <MetricBox
          label="Rewards"
          value={formatRupee(totalRewardsValue, 0)}
          sub="points → rupees"
          color={GOLD}
        />
      </div>

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
