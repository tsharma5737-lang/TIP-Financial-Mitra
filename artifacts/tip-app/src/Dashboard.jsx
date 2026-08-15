import { useState, useEffect } from "react";
import { getInsightsDashboard } from "./lib/apiClient";

const NAVY      = "#0D1A2E";
const NAVY_CARD = "#112240";
const NAVY_LIGHT = "#1a2f50";
const GOLD      = "#C9A84C";
const GOLD_LIGHT = "#e0c06a";
const GOLD_DIM  = "#8a6f32";

const DEFAULT_PORTFOLIO_DISCLAIMER = "Annualised figures are estimates based on your spend pattern. Actual benefits may differ.";
const DEFAULT_FINANCIAL_DISCLAIMER = "Earnings are estimates based on published card rates. Verify with your bank.";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupee(val, decimals = 0) {
  const n = Number(val) || 0;
  return "₹" + n.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function scoreAppearance(label) {
  if (label === "Outstanding") return { bg: "#4ade80", textColor: "#052010" };
  if (label === "Good")        return { bg: GOLD,      textColor: "#0a1628" };
  if (label === "Average")     return { bg: "#f97316", textColor: "#fff" };
  return                            { bg: "#f87171",    textColor: "#fff" }; // Poor / Very Poor
}

function cardInsightText(card) {
  const earned = Number(card.total_earned) || 0;
  const missed = Number(card.total_missed) || 0;
  if (card.is_best)  return "🏆 Your best-performing card so far";
  if (card.is_worst && missed > earned) return "⚠️ You're missing more than you're earning on this card";
  if (missed > 0)    return `📈 ${formatRupee(missed)} left on the table — a different card would've earned more`;
  return "✅ Earning well on this card";
}

// Simple real-data annualised projection: extrapolates real earned-so-far
// over the actual number of days covered, rather than a fabricated figure.
function projectAnnual(totalEarned, daysElapsed) {
  const days = Math.max(daysElapsed, 7); // guard against wild projections on very new accounts
  return (Number(totalEarned) || 0) * (365 / days);
}

// ─── Styles (unchanged from original design) ────────────────────────────────

const s = {
  container: { background: NAVY, minHeight: "100%", paddingBottom: 90, fontFamily: "'Inter', sans-serif" },
  header: {
    background: `linear-gradient(135deg, ${NAVY} 0%, #0a1628 100%)`,
    padding: "20px 20px 16px", borderBottom: `1px solid ${GOLD_DIM}33`,
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

  strip: { display: "flex", gap: 8, padding: "14px 16px" },
  metricBox: (color) => ({
    flex: 1, background: NAVY_CARD, borderRadius: 12, padding: "10px",
    display: "flex", flexDirection: "column", gap: 3, border: `1px solid ${color}22`,
  }),
  metricLabel: { fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#7a9bcc" },
  metricValue: (color) => ({ fontSize: 15, fontWeight: 800, color, letterSpacing: "-0.3px", lineHeight: 1 }),
  metricSub:   { fontSize: 9, color: "#4a6a9a", marginTop: 1 },

  healthBox: {
    margin: "0 16px 4px", background: `${GOLD}0a`, border: `1.5px solid ${GOLD}55`,
    borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8,
  },
  healthTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  healthLabel: { fontSize: 10, fontWeight: 800, color: GOLD_DIM, letterSpacing: 1.8, textTransform: "uppercase" },
  healthScoreRow: { display: "flex", alignItems: "baseline", gap: 4 },
  healthNumber: { fontSize: 28, fontWeight: 900, color: GOLD, letterSpacing: "-1px", lineHeight: 1 },
  healthDenom:  { fontSize: 14, fontWeight: 600, color: GOLD_DIM },
  healthBar: { height: 5, background: "#0a1628", borderRadius: 99, overflow: "hidden" },
  healthBarFill: (pct) => ({
    height: "100%", width: `${pct}%`,
    background: pct >= 75 ? "#4ade80" : pct >= 50 ? GOLD : "#f97316",
    borderRadius: 99, transition: "width 0.5s ease",
  }),
  healthInsight: { fontSize: 12, color: "#8aaac8", lineHeight: 1.5, fontWeight: 400 },
  healthInsightBold: { fontWeight: 700, color: "#b0c8e0" },
  healthDisclaimer: { fontSize: 9, color: "#4a6a9a", fontStyle: "italic", marginTop: 2 },

  sectionHeader: { padding: "12px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 2, textTransform: "uppercase" },
  sectionCount: { fontSize: 11, color: "#4a6a9a", fontWeight: 600 },

  cardList: { padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 },
  tile: { background: NAVY_CARD, border: `1px solid #1e3a6a`, borderRadius: 16, padding: "14px 14px 12px", position: "relative", overflow: "hidden" },
  tileAccent: (color) => ({ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: color, borderRadius: "16px 0 0 16px" }),

  tileTopRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8, paddingLeft: 8 },
  tileLeft: { display: "flex", flexDirection: "column", gap: 4, flex: 1, paddingRight: 10 },
  tileBank: { fontSize: 9, fontWeight: 700, color: "#4a6a9a", letterSpacing: 1.2, textTransform: "uppercase" },
  tileName: { fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.2px" },
  bestBadge: (color) => ({
    background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 6,
    padding: "3px 8px", fontSize: 10, fontWeight: 700, color,
    letterSpacing: 0.3, whiteSpace: "nowrap", alignSelf: "flex-start",
  }),

  scoreCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 },
  scoreCircle: (bg) => ({ width: 48, height: 48, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 10px ${bg}66`, flexShrink: 0 }),
  scoreNumber: (textColor) => ({ fontSize: 16, fontWeight: 900, color: textColor, letterSpacing: "-0.5px" }),
  scoreLabel: (color) => ({ fontSize: 9, fontWeight: 700, color, letterSpacing: 0.5, textTransform: "uppercase", textAlign: "center" }),

  insightText: { paddingLeft: 8, marginTop: 0, marginBottom: 10, fontSize: 11, color: "#5a7a9a", fontWeight: 500, lineHeight: 1.4 },

  infoRow: { display: "flex", gap: 6, paddingLeft: 8, flexWrap: "wrap" },
  infoPill: (bg, col) => ({ background: bg, border: `1px solid ${col}33`, borderRadius: 7, padding: "4px 8px", fontSize: 10, fontWeight: 600, color: col, display: "flex", alignItems: "center", gap: 4, letterSpacing: 0.1 }),

  annualRow: { paddingLeft: 8, marginTop: 8, display: "flex", flexDirection: "column", gap: 3 },
  annualNet: { fontSize: 11, fontWeight: 700, color: GOLD },
  annualRecovery: { fontSize: 11, fontWeight: 600, color: "#4ade80" },
  annualWarning: { fontSize: 11, fontWeight: 600, color: "#f87171" },

  analysisBox: { margin: "0 16px 4px", background: "#0a1628", border: `1px solid #1e3a6a`, borderRadius: 14, padding: "14px 14px 10px", display: "flex", flexDirection: "column", gap: 10 },
  analysisTitle: { fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: "-0.2px" },
  analysisSub:   { fontSize: 10, color: "#4a6a9a", marginTop: 2, fontWeight: 500 },
  barRow: { display: "flex", flexDirection: "column", gap: 4 },
  barLabel: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  barCardName: { fontSize: 11, fontWeight: 700, color: "#c8daf0", maxWidth: "55%" },
  barAmount:   { fontSize: 11, fontWeight: 800, color: GOLD },
  barTrack:    { height: 8, background: "#0D1A2E", borderRadius: 99, overflow: "hidden" },
  barFill: (pct) => ({ height: "100%", width: `${Math.max(pct, 2)}%`, background: `linear-gradient(90deg, ${GOLD_DIM}, ${GOLD})`, borderRadius: 99, transition: "width 0.5s ease" }),
  barSub: { fontSize: 9, color: "#4a6a9a", fontWeight: 500, marginTop: 1 },

  stateWrap: { padding: "60px 20px", textAlign: "center" },
  stateText: { color: "#7a9bcc", fontSize: 14, fontWeight: 500 },
  errorText: { color: "#f87171", fontSize: 13, fontWeight: 600 },
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

function PortfolioHealth({ cards, bestCard, worstCard, disclaimer }) {
  const avgScore = cards.length
    ? Math.round(cards.reduce((sum, c) => sum + (Number(c.efficiency_score) || 0), 0) / cards.length)
    : 0;

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

      {worstCard && (
        <span style={s.healthInsight}>
          Your weakest card is{" "}
          <span style={s.healthInsightBold}>{worstCard.card_name}</span>
          {" "}at{" "}
          <span style={s.healthInsightBold}>{worstCard.efficiency_score}/100</span>
          {worstCard.annual_fee > 0 ? (
            <>
              {" — it costs "}
              <span style={s.healthInsightBold}>{formatRupee(worstCard.annual_fee)}/yr</span>
              {" but has earned only "}
              <span style={s.healthInsightBold}>{formatRupee(worstCard.total_earned)}</span>
              {" so far"}
            </>
          ) : (
            " — review your spend pattern on this card"
          )}
        </span>
      )}

      {bestCard && (
        <span style={s.healthInsight}>
          <span style={{ color: "#4ade80", fontWeight: 700 }}>★ Best performer: </span>
          <span style={s.healthInsightBold}>{bestCard.card_name}</span>
          {" — "}
          <span style={{ color: "#4ade80", fontWeight: 700 }}>{formatRupee(bestCard.total_earned)} earned so far</span>
        </span>
      )}

      <span style={s.healthDisclaimer}>{disclaimer || DEFAULT_PORTFOLIO_DISCLAIMER}</span>
    </div>
  );
}

function AnnualisedSection({ cards, daysElapsed, disclaimer }) {
  const projected = cards.map((c) => ({
    ...c,
    projectedAnnual: projectAnnual(c.total_earned, daysElapsed),
  })).sort((a, b) => b.projectedAnnual - a.projectedAnnual);

  const scaleMax = Math.max(1, ...projected.map((c) => c.projectedAnnual));

  return (
    <div style={{ padding: "0 0 4px" }}>
      <div style={{ padding: "12px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={s.sectionTitle}>📊 Annualised Benefit Estimate</span>
      </div>

      <div style={s.analysisBox}>
        <div>
          <div style={s.analysisTitle}>Projected 12-Month Earning</div>
          <div style={s.analysisSub}>Based on your real spend so far, projected forward · not a guarantee</div>
        </div>

        {projected.map((card) => {
          const proj = Math.round(card.projectedAnnual);
          const barPct = (card.projectedAnnual / scaleMax) * 100;
          return (
            <div key={card.card_id} style={s.barRow}>
              <div style={s.barLabel}>
                <span style={s.barCardName}>{card.card_name}</span>
                <span style={s.barAmount}>{formatRupee(proj)}</span>
              </div>
              <div style={s.barTrack}>
                <div style={s.barFill(barPct)} />
              </div>
              <div style={s.barSub}>
                {formatRupee(card.total_earned)} earned in the period so far, projected to a full year
              </div>
            </div>
          );
        })}
        <span style={{ fontSize: 9, color: "#4a6a9a", fontStyle: "italic" }}>{disclaimer || DEFAULT_PORTFOLIO_DISCLAIMER}</span>
      </div>
    </div>
  );
}

function CardTile({ card, daysElapsed }) {
  const appear = scoreAppearance(card.score_label);
  const insight = cardInsightText(card);
  const accentColor = card.is_best ? "#4ade80" : card.is_worst ? "#f87171" : GOLD;
  const projectedAnnual = Math.round(projectAnnual(card.total_earned, daysElapsed));
  const ratio = card.annual_fee > 0 ? projectedAnnual / card.annual_fee : null;

  return (
    <div style={s.tile}>
      <div style={s.tileAccent(accentColor)} />

      <div style={s.tileTopRow}>
        <div style={s.tileLeft}>
          <span style={s.tileBank}>{card.bank_name}</span>
          <span style={s.tileName}>{card.card_name}</span>
          {card.is_best && (
            <div style={s.bestBadge("#4ade80")}>★ Portfolio Best</div>
          )}
          {card.is_worst && !card.is_best && (
            <div style={s.bestBadge("#f87171")}>⚠ Needs Review</div>
          )}
        </div>

        <div style={s.scoreCol}>
          <div style={s.scoreCircle(appear.bg)}>
            <span style={s.scoreNumber(appear.textColor)}>{card.efficiency_score}</span>
          </div>
          <span style={s.scoreLabel(appear.bg)}>{card.score_label}</span>
        </div>
      </div>

      <div style={s.insightText}>{insight}</div>

      <div style={s.infoRow}>
        <div style={s.infoPill("#7a9bcc12", "#7a9bcc")}>
          <span>💳</span>
          <span>{!card.annual_fee ? "No annual fee" : `₹${card.annual_fee}/yr fee`}</span>
        </div>
        {card.card_last4 && (
          <div style={s.infoPill(`${GOLD}12`, GOLD_LIGHT)}>
            <span>•••• {card.card_last4}</span>
          </div>
        )}
      </div>

      <div style={s.annualRow}>
        <span style={s.annualNet}>Earned so far: {formatRupee(card.total_earned)}</span>
        {card.total_missed > 0 && (
          <span style={s.annualWarning}>{formatRupee(card.total_missed)} missed by using this card on suboptimal transactions</span>
        )}
        {ratio !== null ? (
          <span style={s.annualRecovery}>Projected annual: {formatRupee(projectedAnnual)} ({ratio.toFixed(1)}× your annual fee)</span>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 600, color: "#4ade80" }}>No annual fee — pure benefit</span>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const dashboard = await getInsightsDashboard();
        if (!cancelled) { setData(dashboard); setFetchedAt(new Date()); }
      } catch (err) {
        if (!cancelled) setError(err?.message || "Could not load your dashboard. Please check your connection and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div style={s.container}>
        <div style={s.stateWrap}><span style={s.stateText}>Loading your dashboard…</span></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={s.container}>
        <div style={s.stateWrap}><span style={s.errorText}>{error}</span></div>
      </div>
    );
  }

  if (!data) return null;

  const cards = data.section2_portfolio_health?.cards ?? [];
  const bestCard = data.section2_portfolio_health?.best_card ?? null;
  const worstCard = data.section2_portfolio_health?.worst_card ?? null;
  const financial = data.section1_financial_summary ?? { total_earned: 0, total_missed: 0, net_impact: 0 };
  const disclaimers = data.disclaimers ?? {};

  const daysElapsed = data.period_start
    ? Math.max(1, Math.round((Date.now() - new Date(data.period_start).getTime()) / 86400000))
    : 90; // fallback assumption if the server doesn't return a period start

  if (cards.length === 0) {
    return (
      <div style={s.container}>
        <div style={s.header}>
          <div style={s.headerTitle}>My Cards</div>
        </div>
        <div style={s.stateWrap}>
          <span style={s.stateText}>No cards added yet. Add a card to see your portfolio here.</span>
        </div>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div style={s.headerRow}>
          <div>
            <div style={s.headerTitle}>My Cards</div>
            <div style={s.headerSub}>{cards.length} cards linked</div>
            {fetchedAt && (
              <div style={{ fontSize: 9, color: "#3a5a8a", marginTop: 2 }}>
                Last updated: {fetchedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            )}
          </div>
          <div style={s.headerBadge}>
            <span style={s.headerBadgeLabel}>Net Impact</span>
            <span style={s.headerBadgeVal}>{formatRupee(financial.net_impact)}</span>
          </div>
        </div>
      </div>

      <div style={s.strip}>
        <MetricBox label="Earned" value={formatRupee(financial.total_earned)} sub={disclaimers.financial_summary ? undefined : "so far"} color="#4ade80" />
        <MetricBox label="Missed" value={formatRupee(financial.total_missed)} sub="suboptimal use" color="#f87171" />
        <MetricBox label="Net Impact" value={formatRupee(financial.net_impact)} sub="earned − missed" color={GOLD} />
      </div>
      <div style={{ padding: "0 16px 4px", fontSize: 9, color: "#4a6a9a", fontStyle: "italic" }}>
        {disclaimers.financial_summary || DEFAULT_FINANCIAL_DISCLAIMER}
      </div>

      <PortfolioHealth cards={cards} bestCard={bestCard} worstCard={worstCard} disclaimer={disclaimers.portfolio_health} />

      <AnnualisedSection cards={cards} daysElapsed={daysElapsed} disclaimer={disclaimers.portfolio_health} />

      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>⚡ Card Portfolio</span>
        <span style={s.sectionCount}>{cards.length} cards</span>
      </div>

      <div style={s.cardList}>
        {cards.map((card) => (
          <CardTile key={card.card_id} card={card} daysElapsed={daysElapsed} />
        ))}
      </div>
    </div>
  );
}
