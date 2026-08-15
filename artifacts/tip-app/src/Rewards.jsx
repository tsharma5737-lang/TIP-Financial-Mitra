import { useState, useEffect } from "react";
import { getInsightsDashboard } from "./lib/apiClient";

const NAVY      = "#0D1A2E";
const NAVY_CARD = "#112240";
const GOLD      = "#C9A84C";
const GOLD_LIGHT = "#e0c06a";
const GOLD_DIM  = "#8a6f32";

const CARD_ACCENTS = ["#C9A84C", "#f59e0b", "#4a90d9", "#e05a8a", "#5b9bd5", "#4ade80"];

function accentFor(index) {
  return CARD_ACCENTS[index % CARD_ACCENTS.length];
}

function fmt(v, d = 0) {
  const n = Number(v) || 0;
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });
}

const s = {
  page: { background: NAVY, minHeight: "100%", paddingBottom: 96, fontFamily: "'Inter', sans-serif" },
  header: { background: `linear-gradient(135deg, ${NAVY} 0%, #0a1628 100%)`, padding: "20px 20px 18px", borderBottom: `1px solid ${GOLD_DIM}33` },
  headerRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  headerTitle: { fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" },
  headerSub: { fontSize: 11, color: "#7a9bcc", marginTop: 2, letterSpacing: 0.3 },
  totalBadge: { background: `${GOLD}18`, border: `1px solid ${GOLD}44`, borderRadius: 10, padding: "6px 12px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 },
  totalLabel: { fontSize: 9, color: GOLD_DIM, letterSpacing: 1.2, textTransform: "uppercase" },
  totalValue: { fontSize: 18, fontWeight: 900, color: GOLD, letterSpacing: "-0.5px" },
  disclaimerLine: { padding: "6px 16px 0", fontSize: 9, color: "#4a6a9a", fontStyle: "italic" },
  noticeBox: {
    margin: "12px 16px 0", background: `${GOLD}0d`, border: `1px solid ${GOLD}33`,
    borderRadius: 12, padding: "10px 12px", display: "flex", gap: 8, alignItems: "flex-start",
  },
  noticeIcon: { fontSize: 14, flexShrink: 0, marginTop: 1 },
  noticeText: { fontSize: 11, color: "#b0c8e8", lineHeight: 1.5, fontWeight: 500 },

  sectionRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px" },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 2, textTransform: "uppercase" },
  sectionSub: { fontSize: 11, color: "#4a6a9a", fontWeight: 600 },

  tileList: { padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 },
  tile: (accent) => ({ background: NAVY_CARD, border: `1px solid ${accent}28`, borderRadius: 16, padding: "14px 14px 12px", position: "relative", overflow: "hidden" }),
  tileBar: (accent) => ({ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: accent, borderRadius: "16px 0 0 16px" }),
  tileTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, paddingLeft: 10 },
  tileBank: { fontSize: 9, fontWeight: 700, color: "#4a6a9a", letterSpacing: 1.2, textTransform: "uppercase" },
  tileName: { fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 2 },
  pointsValue: (accent) => ({ fontSize: 20, fontWeight: 900, color: accent, letterSpacing: "-0.5px", lineHeight: 1 }),
  pointsLabel: { fontSize: 10, color: "#4a6a9a", fontWeight: 500, textAlign: "right" },

  tipBox: (accent) => ({ background: `${accent}0d`, border: `1px solid ${accent}22`, borderRadius: 9, padding: "8px 10px", marginLeft: 10, marginBottom: 10, display: "flex", gap: 6, alignItems: "flex-start" }),
  tipIcon: { fontSize: 13, flexShrink: 0, marginTop: 1 },
  tipText: { fontSize: 11, color: "#b0c8e8", lineHeight: 1.5, fontWeight: 500 },

  tileBottom: { paddingLeft: 10, display: "flex", alignItems: "center", gap: 8 },
  redeemBtn: {
    background: "#1a2f50", color: "#5a7a9a", border: "1px solid #2a4a7a",
    borderRadius: 9, padding: "8px 14px", fontSize: 12, fontWeight: 700,
    cursor: "not-allowed", letterSpacing: 0.3, whiteSpace: "nowrap", flexShrink: 0,
  },
  redeemNote: { fontSize: 10, color: "#4a6a9a", flex: 1 },

  insightWrap: { padding: "16px 16px 0" },
  insightBox: { background: `${GOLD}0d`, border: `1.5px solid ${GOLD}55`, borderRadius: 16, padding: "16px 16px", display: "flex", flexDirection: "column", gap: 6 },
  insightHeader: { fontSize: 11, fontWeight: 800, color: GOLD, letterSpacing: 1.5, textTransform: "uppercase" },
  insightText: { fontSize: 13, color: "#c8daf0", lineHeight: 1.6, fontWeight: 500 },

  stateWrap: { padding: "60px 20px", textAlign: "center" },
  stateText: { color: "#7a9bcc", fontSize: 14, fontWeight: 500 },
  errorText: { color: "#f87171", fontSize: 13, fontWeight: 600 },
};

function RewardTile({ card, index }) {
  const accent = accentFor(index);
  const earned = Number(card.total_earned) || 0;
  const isCashback = card.earning_model === "flat_cashback";

  return (
    <div style={s.tile(accent)}>
      <div style={s.tileBar(accent)} />

      <div style={s.tileTop}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={s.tileBank}>{card.bank_name}</span>
          <span style={s.tileName}>{card.card_name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
          <span style={s.pointsValue(accent)}>{fmt(earned)}</span>
          <span style={s.pointsLabel}>estimated value</span>
        </div>
      </div>

      <div style={s.tileBottom}>
        <span style={{ ...s.redeemNote, color: isCashback ? "#4ade80" : "#7a9bcc" }}>
          {isCashback ? "Automatic cashback" : "Points-based rewards"}
        </span>
        {!isCashback && <button style={s.redeemBtn} disabled>Redeem</button>}
      </div>
    </div>
  );
}

export default function Rewards() {
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
        if (!cancelled) setError(err?.message || "Could not load your rewards. Please check your connection and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div style={s.page}><div style={s.stateWrap}><span style={s.stateText}>Loading your rewards…</span></div></div>;
  }
  if (error) {
    return <div style={s.page}><div style={s.stateWrap}><span style={s.errorText}>{error}</span></div></div>;
  }
  if (!data) return null;

  const cards = data.section2_portfolio_health?.cards ?? [];
  const disclaimer = data.disclaimers?.rewards_points || "Values shown are estimates based on tracked spending, not a live bank balance.";

  const sortedCards = [...cards].sort((a, b) => (Number(b.total_earned) || 0) - (Number(a.total_earned) || 0));
  const totalValue = cards.reduce((sum, c) => sum + (Number(c.total_earned) || 0), 0);
  const bestCard = sortedCards[0];

  if (cards.length === 0) {
    return (
      <div style={s.page}>
        <div style={s.header}><div style={s.headerTitle}>My Rewards</div></div>
        <div style={s.stateWrap}><span style={s.stateText}>No cards added yet. Add a card to see your rewards here.</span></div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerRow}>
          <div>
            <div style={s.headerTitle}>My Rewards</div>
            <div style={s.headerSub}>{cards.length} cards</div>
            {fetchedAt && (
              <div style={{ fontSize: 9, color: "#3a5a8a", marginTop: 2 }}>
                Last updated: {fetchedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            )}
          </div>
          <div style={s.totalBadge}>
            <span style={s.totalLabel}>Estimated Value</span>
            <span style={s.totalValue}>{fmt(totalValue)}</span>
          </div>
        </div>
      </div>
      <div style={s.disclaimerLine}>{disclaimer}</div>

      <div style={s.noticeBox}>
        <span style={s.noticeIcon}>💡</span>
        <span style={s.noticeText}>
          Values shown are estimated from your tracked spending using each card's published rates —
          not a live bank balance. Points value is approximate. Redemption rates vary by method
          and may change. Once bank-linking is live, we'll show your exact balance and best
          redemption option for each card.
        </span>
      </div>

      <div style={s.sectionRow}>
        <span style={s.sectionTitle}>⚡ Card Rewards</span>
        <span style={s.sectionSub}>{cards.length} cards</span>
      </div>

      <div style={s.tileList}>
        {sortedCards.map((card, i) => (
          <RewardTile key={card.card_id} card={card} index={i} />
        ))}
      </div>

      {bestCard && (
        <div style={s.insightWrap}>
          <div style={s.insightBox}>
            <span style={s.insightHeader}>💡 TIP Insight</span>
            <p style={{ ...s.insightText, margin: 0 }}>
              Your <strong style={{ color: GOLD_LIGHT }}>{bestCard.card_name}</strong> is earning the most so
              far — <strong style={{ color: GOLD_LIGHT }}>{fmt(bestCard.total_earned)}</strong> from tracked
              transactions. Once bank-linking is live, we'll show your exact redemption options for maximum value.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
