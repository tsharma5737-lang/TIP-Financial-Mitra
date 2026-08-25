import { useState, useEffect } from "react";
import { getInsightsDashboard, getTransactions, getBenefitSummary, selfReportBenefitUsage, confirmMilestoneChoice } from "./lib/apiClient";
import AddCard from "./AddCard.jsx";

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

function MetricBox({ label, value, sub, color, onClick }) {
  return (
    <div style={{ ...s.metricBox(color), cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <span style={s.metricLabel}>{label}</span>
      <span style={s.metricValue(color)}>{value}</span>
      {sub && <span style={s.metricSub}>{sub}</span>}
      {onClick && <span style={{ fontSize: 9, color: "#4a6a9a", marginTop: 2 }}>Tap to view →</span>}
    </div>
  );
}

function TransactionDrillDown({ mode, onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getTransactions(1);
        if (cancelled) return;
        const all = data.transactions ?? [];
        const filtered = mode === "earned"
          ? all.filter((t) => (parseFloat(t.actual_earning) || 0) > 0)
              .sort((a, b) => (parseFloat(b.actual_earning) || 0) - (parseFloat(a.actual_earning) || 0))
          : all.filter((t) => (parseFloat(t.potential_saving) || 0) > 0)
              .sort((a, b) => (parseFloat(b.potential_saving) || 0) - (parseFloat(a.potential_saving) || 0));
        setTransactions(filtered);
      } catch (err) {
        setError(err?.message || "Could not load your transactions.");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [mode]);

  const title = mode === "earned" ? "Transactions Where You Earned" : "Transactions Where You Missed Out";
  const accent = mode === "earned" ? "#4ade80" : "#f87171";

  return (
    <div style={s.container}>
      <div style={{ ...s.header, display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={onBack}
          style={{ background: "transparent", border: "none", color: "#7a9bcc", fontSize: 20, cursor: "pointer", padding: 0, lineHeight: 1 }}
        >
          ←
        </button>
        <div style={s.headerTitle}>{title}</div>
      </div>

      {loading && <div style={s.stateWrap}><span style={s.stateText}>Loading…</span></div>}
      {error && <div style={s.stateWrap}><span style={s.errorText}>{error}</span></div>}

      {!loading && !error && transactions.length === 0 && (
        <div style={s.stateWrap}><span style={s.stateText}>No transactions here yet.</span></div>
      )}

      {!loading && !error && transactions.length > 0 && (
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {transactions.map((t) => {
            const amountShown = mode === "earned" ? t.actual_earning : t.potential_saving;
            return (
              <div key={t.id} style={{
                background: NAVY_CARD, border: `1px solid ${accent}33`, borderRadius: 12,
                padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{t.merchant_name}</span>
                  <span style={{ fontSize: 10, color: "#7a9bcc" }}>{t.bank_name} {t.card_name}</span>
                  <span style={{ fontSize: 9, color: "#4a6a9a" }}>
                    {new Date(t.transaction_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}₹{Number(t.amount).toLocaleString("en-IN")} spent
                  </span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, color: accent }}>
                  {mode === "earned" ? "+" : "-"}₹{Number(amountShown).toLocaleString("en-IN")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const BENEFIT_TYPE_LABELS = {
  lounge_domestic: "Domestic Lounge Access", lounge_international: "International Lounge Access",
  lounge_railway: "Railway Lounge Access", golf_primary: "Golf Access", golf_secondary: "Golf Access (Secondary)",
  movie_primary: "Movie/Event Tickets", movie_secondary: "Movie/Event Tickets (Secondary)", milestone: "Annual Milestone",
};

// Ordered by real mass-market relevance, not just what's technically
// available - milestone/fee-waiver progress is money everyone cares
// about; golf is a real but genuinely niche perk, shown last rather
// than alongside lounge/movies as if equally broad.
const CATEGORY_ORDER = ["milestone", "lounge", "movie", "golf"];
const CATEGORY_LABELS = { milestone: "Fee-Waiver Progress", lounge: "Lounge Access", movie: "Movie & Event Tickets", golf: "Golf Access" };
const CATEGORY_ICONS = { milestone: "🎯", lounge: "🛋️", movie: "🎬", golf: "⛳" };

function getBenefitCategory(benefitType) {
  if (benefitType === "milestone") return "milestone";
  if (benefitType.startsWith("lounge_")) return "lounge";
  if (benefitType.startsWith("golf_")) return "golf";
  if (benefitType.startsWith("movie_")) return "movie";
  return "other";
}

function computeCategorySummaries(rows) {
  const byCategory = rows.reduce((acc, r) => {
    const cat = getBenefitCategory(r.benefit_type);
    (acc[cat] ??= []).push(r);
    return acc;
  }, {});
  return CATEGORY_ORDER.map((cat) => {
    const catRows = byCategory[cat] || [];
    if (catRows.length === 0) return null;
    const cardCount = new Set(catRows.map((r) => r.card_id)).size;
    let subtitle;
    if (cat === "milestone") {
      const avgPct = Math.round(catRows.reduce((sum, r) => sum + (r.pct_complete || 0), 0) / catRows.length);
      subtitle = `${cardCount} card${cardCount > 1 ? "s" : ""} tracked · ${avgPct}% average progress`;
    } else {
      const unlimitedCount = catRows.filter((r) => r.type === "unlimited").length;
      const countRows = catRows.filter((r) => r.type === "count");
      const totalUsed = countRows.reduce((sum, r) => sum + (r.used || 0), 0);
      const totalAllocated = countRows.reduce((sum, r) => sum + (r.allocated || 0), 0);
      const parts = [];
      if (unlimitedCount > 0) parts.push(`${unlimitedCount} unlimited`);
      if (countRows.length > 0) parts.push(`${totalUsed} of ${totalAllocated} used`);
      subtitle = `${cardCount} card${cardCount > 1 ? "s" : ""} · ${parts.join(", ")}`;
    }
    return { cat, subtitle, rows: catRows };
  }).filter(Boolean);
}

function BenefitsDrillDown({ initialRows, initialCategory, onBack, onChanged }) {
  const [rows, setRows] = useState(initialRows ?? []);
  const [activeCategory, setActiveCategory] = useState(initialCategory ?? null); // null = summary view
  const [reportingKey, setReportingKey] = useState(null);
  const [reportCount, setReportCount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function reload() {
    try {
      const data = await getBenefitSummary();
      setRows(data.summary ?? []);
      onChanged?.();
    } catch (err) {
      setError(err?.message || "Could not refresh - your last change may not be reflected yet.");
    }
  }

  async function submitSelfReport(row) {
    const count = parseInt(reportCount, 10);
    if (isNaN(count) || count < 0) return;
    setSaving(true);
    try {
      await selfReportBenefitUsage({
        card_id: row.card_id, benefit_type: row.benefit_type,
        period_start: row.period_start, count,
      });
      setReportingKey(null);
      setReportCount("");
      await reload();
    } catch (err) {
      setError(err?.message || "Could not save - please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function pickMilestoneChoice(row, choice) {
    setSaving(true);
    try {
      await confirmMilestoneChoice({ card_id: row.card_id, choice_id: choice });
      await reload();
    } catch (err) {
      setError(err?.message || "Could not save your choice - please try again.");
    } finally {
      setSaving(false);
    }
  }

  const byCategory = rows.reduce((acc, r) => {
    const cat = getBenefitCategory(r.benefit_type);
    (acc[cat] ??= []).push(r);
    return acc;
  }, {});

  // Always shows detail for one category - the Dashboard's own inline
  // tiles now serve as the summary view, so a separate one here would
  // just be a redundant extra screen between tapping a tile and seeing
  // the actual per-card detail.
  const detailRows = byCategory[activeCategory] || [];
  const grouped = detailRows.reduce((acc, r) => {
    (acc[r.card_name] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div style={s.container}>
      <div style={{ ...s.header, display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#7a9bcc", fontSize: 20, cursor: "pointer", padding: 0, lineHeight: 1 }}>←</button>
        <div style={s.headerTitle}>{CATEGORY_ICONS[activeCategory]} {CATEGORY_LABELS[activeCategory]}</div>
      </div>

      {error && <div style={s.stateWrap}><span style={s.errorText}>{error}</span></div>}

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {Object.entries(grouped).map(([cardName, cardRows]) => (
          <div key={cardName}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7a9bcc", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{cardName}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cardRows.map((row) => {
                const key = `${row.card_id}-${row.benefit_type}`;
                const label = BENEFIT_TYPE_LABELS[row.benefit_type] || row.benefit_type;

                if (row.benefit_type === "milestone") {
                  return (
                    <div key={key} style={{ background: NAVY_CARD, border: "1px solid #2a4a7a", borderRadius: 12, padding: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{label}</div>
                      <div style={{ background: "#0a1628", borderRadius: 8, height: 8, overflow: "hidden", marginBottom: 6 }}>
                        <div style={{ background: GOLD, height: "100%", width: `${row.pct_complete}%` }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#7a9bcc" }}>
                        ₹{Number(row.spend_progress).toLocaleString("en-IN")} of ₹{Number(row.spend_target).toLocaleString("en-IN")} ({row.pct_complete}%)
                      </div>
                      {row.reward_type === "choice" ? (
                        <div style={{ marginTop: 8 }}>
                          {row.confirmation_message && (
                            <div style={{ fontSize: 11, color: row.qualified ? "#4ade80" : "#7a9bcc", marginBottom: row.qualified && !row.selected_choice ? 8 : 0 }}>{row.confirmation_message}</div>
                          )}
                          {row.qualified && !row.selected_choice && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {(row.choices || []).map((c) => (
                                <button key={c} disabled={saving} onClick={() => pickMilestoneChoice(row, c)}
                                  style={{ background: "#1a2f50", border: "1px solid #C9A84C", color: GOLD, borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                                  {c}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        row.benefit_description && <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 6 }}>{row.benefit_description}{row.benefit_value_rupees ? ` (~₹${row.benefit_value_rupees})` : ""}</div>
                      )}
                    </div>
                  );
                }

                if (row.type === "unlimited") {
                  return (
                    <div key={key} style={{ background: NAVY_CARD, border: "1px solid #2a4a7a", borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{label}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80" }}>Unlimited</span>
                    </div>
                  );
                }

                return (
                  <div key={key} style={{ background: NAVY_CARD, border: "1px solid #2a4a7a", borderRadius: 12, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: GOLD }}>{row.used} of {row.allocated} used</span>
                    </div>
                    {row.pending_confirmation > 0 && (
                      <div style={{ fontSize: 10, color: "#f0b429", marginTop: 4 }}>{row.pending_confirmation} visit(s) awaiting your confirmation</div>
                    )}
                    {row.spend_threshold && (
                      <div style={{ fontSize: 10, color: "#7a9bcc", marginTop: 4 }}>Requires ₹{Number(row.spend_threshold).toLocaleString("en-IN")} spend to unlock</div>
                    )}
                    {reportingKey === key ? (
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <input
                          type="number" min="0" autoFocus placeholder="Times used"
                          value={reportCount} onChange={(e) => setReportCount(e.target.value)}
                          style={{ flex: 1, background: "#0a1628", border: "1px solid #1e3a6a", borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }}
                        />
                        <button disabled={saving} onClick={() => submitSelfReport(row)} style={{ background: GOLD, color: "#0a1628", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
                          {saving ? "..." : "Save"}
                        </button>
                        <button disabled={saving} onClick={() => { setReportingKey(null); setReportCount(""); }} style={{ background: "transparent", border: "1px solid #2a4a7a", color: "#7a9bcc", borderRadius: 8, padding: "8px 12px", fontSize: 12, cursor: "pointer" }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span onClick={() => { setReportingKey(key); setReportCount(String(row.used)); }} style={{ display: "inline-block", marginTop: 8, fontSize: 10, color: "#7a9bcc", textDecoration: "underline", cursor: "pointer" }}>
                        Update how many you've used
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
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

function CardTile({ card, daysElapsed, onClick }) {
  const appear = scoreAppearance(card.score_label);
  const insight = cardInsightText(card);
  const accentColor = card.is_best ? "#4ade80" : card.is_worst ? "#f87171" : GOLD;
  const projectedAnnual = Math.round(projectAnnual(card.total_earned, daysElapsed));
  const ratio = card.annual_fee > 0 ? projectedAnnual / card.annual_fee : null;

  return (
    <div style={{ ...s.tile, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
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

function CardDetailView({ card, daysElapsed, benefitRows, onBack, onBenefitsChanged }) {
  const [reportingKey, setReportingKey] = useState(null);
  const [reportCount, setReportCount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!card) {
    return (
      <div style={s.container}>
        <div style={{ ...s.header, display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#7a9bcc", fontSize: 20, cursor: "pointer", padding: 0, lineHeight: 1 }}>←</button>
          <div style={s.headerTitle}>Card</div>
        </div>
        <div style={s.stateWrap}><span style={s.stateText}>Could not find this card.</span></div>
      </div>
    );
  }

  async function submitSelfReport(row) {
    const count = parseInt(reportCount, 10);
    if (isNaN(count) || count < 0) return;
    setSaving(true);
    try {
      await selfReportBenefitUsage({ card_id: row.card_id, benefit_type: row.benefit_type, period_start: row.period_start, count });
      setReportingKey(null);
      setReportCount("");
      onBenefitsChanged?.();
    } catch (err) {
      setError(err?.message || "Could not save - please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function pickMilestoneChoice(row, choice) {
    setSaving(true);
    try {
      await confirmMilestoneChoice({ card_id: row.card_id, choice_id: choice });
      onBenefitsChanged?.();
    } catch (err) {
      setError(err?.message || "Could not save your choice - please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={s.container}>
      <div style={{ ...s.header, display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#7a9bcc", fontSize: 20, cursor: "pointer", padding: 0, lineHeight: 1 }}>←</button>
        <div style={s.headerTitle}>Card Details</div>
      </div>

      <div style={{ padding: "16px 16px 4px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#7a9bcc", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{card.bank_name}</div>
        <div style={{ fontSize: 22, color: "#fff", fontWeight: 900, letterSpacing: 0.3 }}>{card.card_name}</div>
      </div>

      <div style={{ padding: "12px 16px" }}>
        <CardTile card={card} daysElapsed={daysElapsed} />
      </div>

      {error && <div style={s.stateWrap}><span style={s.errorText}>{error}</span></div>}

      {benefitRows.length > 0 && (
        <div style={{ padding: "4px 16px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7a9bcc", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>🎁 Benefits</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...benefitRows].sort((a, b) => CATEGORY_ORDER.indexOf(getBenefitCategory(a.benefit_type)) - CATEGORY_ORDER.indexOf(getBenefitCategory(b.benefit_type))).map((row) => {
              const key = row.benefit_type;
              const label = BENEFIT_TYPE_LABELS[row.benefit_type] || row.benefit_type;

              if (row.benefit_type === "milestone") {
                return (
                  <div key={key} style={{ background: NAVY_CARD, border: "1px solid #2a4a7a", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{label}</div>
                    <div style={{ background: "#0a1628", borderRadius: 8, height: 8, overflow: "hidden", marginBottom: 6 }}>
                      <div style={{ background: GOLD, height: "100%", width: `${row.pct_complete}%` }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#7a9bcc" }}>
                      ₹{Number(row.spend_progress).toLocaleString("en-IN")} of ₹{Number(row.spend_target).toLocaleString("en-IN")} ({row.pct_complete}%)
                    </div>
                    {row.reward_type === "choice" ? (
                      <div style={{ marginTop: 8 }}>
                        {row.confirmation_message && (
                          <div style={{ fontSize: 11, color: row.qualified ? "#4ade80" : "#7a9bcc", marginBottom: row.qualified && !row.selected_choice ? 8 : 0 }}>{row.confirmation_message}</div>
                        )}
                        {row.qualified && !row.selected_choice && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {(row.choices || []).map((c) => (
                              <button key={c} disabled={saving} onClick={() => pickMilestoneChoice(row, c)}
                                style={{ background: "#1a2f50", border: "1px solid #C9A84C", color: GOLD, borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                                {c}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      row.benefit_description && <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 6 }}>{row.benefit_description}{row.benefit_value_rupees ? ` (~₹${row.benefit_value_rupees})` : ""}</div>
                    )}
                  </div>
                );
              }

              if (row.type === "unlimited") {
                return (
                  <div key={key} style={{ background: NAVY_CARD, border: "1px solid #2a4a7a", borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80" }}>Unlimited</span>
                  </div>
                );
              }

              return (
                <div key={key} style={{ background: NAVY_CARD, border: "1px solid #2a4a7a", borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: GOLD }}>{row.used} of {row.allocated} used</span>
                  </div>
                  {row.pending_confirmation > 0 && (
                    <div style={{ fontSize: 10, color: "#f0b429", marginTop: 4 }}>{row.pending_confirmation} visit(s) awaiting your confirmation</div>
                  )}
                  {row.spend_threshold && (
                    <div style={{ fontSize: 10, color: "#7a9bcc", marginTop: 4 }}>Requires ₹{Number(row.spend_threshold).toLocaleString("en-IN")} spend to unlock</div>
                  )}
                  {reportingKey === key ? (
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <input
                        type="number" min="0" autoFocus placeholder="Times used"
                        value={reportCount} onChange={(e) => setReportCount(e.target.value)}
                        style={{ flex: 1, background: "#0a1628", border: "1px solid #1e3a6a", borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }}
                      />
                      <button disabled={saving} onClick={() => submitSelfReport(row)} style={{ background: GOLD, color: "#0a1628", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
                        {saving ? "..." : "Save"}
                      </button>
                      <button disabled={saving} onClick={() => { setReportingKey(null); setReportCount(""); }} style={{ background: "transparent", border: "1px solid #2a4a7a", color: "#7a9bcc", borderRadius: 8, padding: "8px 12px", fontSize: 12, cursor: "pointer" }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span onClick={() => { setReportingKey(key); setReportCount(String(row.used)); }} style={{ display: "inline-block", marginTop: 8, fontSize: 10, color: "#7a9bcc", textDecoration: "underline", cursor: "pointer" }}>
                      Update how many you've used
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddCard, setShowAddCard] = useState(false);
  const [drillDown, setDrillDown] = useState(null); // null | "earned" | "missed"
  const [benefitRows, setBenefitRows] = useState([]);
  const [viewingCardId, setViewingCardId] = useState(null);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const dashboard = await getInsightsDashboard();
      setData(dashboard);
      setFetchedAt(new Date());
    } catch (err) {
      setError(err?.message || "Could not load your dashboard. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function loadBenefits() {
    try {
      const result = await getBenefitSummary();
      setBenefitRows(result.summary ?? []);
    } catch {
      setBenefitRows([]); // non-critical - dashboard still works without this section
    }
  }

  useEffect(() => {
    loadDashboard();
    loadBenefits();
  }, []);

  if (viewingCardId) {
    const cardsList = data?.section2_portfolio_health?.cards ?? [];
    const card = cardsList.find((c) => c.card_id === viewingCardId);
    const viewDaysElapsed = data?.period_start
      ? Math.max(1, Math.round((Date.now() - new Date(data.period_start).getTime()) / 86400000))
      : 90;
    return (
      <CardDetailView
        card={card}
        daysElapsed={viewDaysElapsed}
        benefitRows={benefitRows.filter((r) => r.card_id === viewingCardId)}
        onBack={() => setViewingCardId(null)}
        onBenefitsChanged={loadBenefits}
      />
    );
  }

  if (CATEGORY_ORDER.includes(drillDown)) {
    return <BenefitsDrillDown initialRows={benefitRows} initialCategory={drillDown} onBack={() => setDrillDown(null)} onChanged={loadBenefits} />;
  }

  if (drillDown) {
    return <TransactionDrillDown mode={drillDown} onBack={() => setDrillDown(null)} />;
  }

  if (showAddCard) {
    return (
      <AddCard
        onBack={() => { setShowAddCard(false); loadDashboard(); }}
        onCardAdded={() => {}}
      />
    );
  }

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
          <button
            onClick={() => setShowAddCard(true)}
            style={{
              marginTop: 18, background: GOLD, color: "#0a1628", border: "none",
              borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            + Add Your First Card
          </button>
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
        <MetricBox label="Earned" value={formatRupee(financial.total_earned)} sub={disclaimers.financial_summary ? undefined : "so far"} color="#4ade80" onClick={() => setDrillDown("earned")} />
        <MetricBox label="Missed" value={formatRupee(financial.total_missed)} sub="suboptimal use" color="#f87171" onClick={() => setDrillDown("missed")} />
        <MetricBox label="Net Impact" value={formatRupee(financial.net_impact)} sub="earned − missed" color={GOLD} />
      </div>
      <div style={{ padding: "0 16px 4px", fontSize: 9, color: "#4a6a9a", fontStyle: "italic" }}>
        {disclaimers.financial_summary || DEFAULT_FINANCIAL_DISCLAIMER}
      </div>

      {benefitRows.length > 0 && (
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7a9bcc", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>🎁 Your Benefits</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {computeCategorySummaries(benefitRows).map(({ cat, subtitle }) => (
              <div
                key={cat}
                onClick={() => setDrillDown(cat)}
                style={{
                  background: `linear-gradient(135deg, ${NAVY_CARD}, ${NAVY_LIGHT})`, border: `1px solid ${GOLD}44`,
                  borderRadius: 12, padding: "14px 12px", cursor: "pointer",
                  display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 92,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20 }}>{CATEGORY_ICONS[cat]}</span>
                  <span style={{ color: GOLD, fontSize: 14, fontWeight: 800 }}>→</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{CATEGORY_LABELS[cat]}</div>
                  <div style={{ fontSize: 10, color: "#7a9bcc", lineHeight: 1.3 }}>{subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <PortfolioHealth cards={cards} bestCard={bestCard} worstCard={worstCard} disclaimer={disclaimers.portfolio_health} />

      <div style={s.sectionHeader}>
        <span style={s.sectionTitle}>⚡ Card Portfolio</span>
        <button
          onClick={() => setShowAddCard(true)}
          style={{
            background: `${GOLD}18`, border: `1px solid ${GOLD}44`, borderRadius: 8,
            padding: "4px 10px", fontSize: 11, fontWeight: 700, color: GOLD,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          + Add Card
        </button>
      </div>

      <div style={s.cardList}>
        {cards.map((card) => (
          <CardTile key={card.card_id} card={card} daysElapsed={daysElapsed} onClick={() => setViewingCardId(card.card_id)} />
        ))}
      </div>

      <AnnualisedSection cards={cards} daysElapsed={daysElapsed} disclaimer={disclaimers.portfolio_health} />
    </div>
  );
}
