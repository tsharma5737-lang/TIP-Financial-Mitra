import { useState } from "react";
// @ts-ignore
import { scoreCards } from "./engine/scoringEngine.js";
// @ts-ignore
import Dashboard from "./Dashboard.jsx";
// @ts-ignore
import Rewards from "./Rewards.jsx";
// @ts-ignore
import Onboarding from "./Onboarding.jsx";

const NAVY = "#0D1A2E";
const NAVY_CARD = "#112240";
const NAVY_LIGHT = "#1a2f50";
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#e0c06a";
const GOLD_DIM = "#8a6f32";

const CATEGORIES = [
  "dining", "grocery", "amazon", "flipkart", "swiggy",
  "zomato", "travel", "fuel", "utilities", "other",
];

type Tab = "pay" | "cards" | "rewards" | "profile";

type ScoredCard = {
  card: {
    id: string;
    name: string;
    bank: string;
    network: string;
    annualFee: number;
    color: string;
    accentColor: string;
  };
  baseCashback: number;
  offerValue: number;
  milestoneValue: number;
  totalValue: number;
  breakdown: string;
  lossVsBest: number;
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const s = {
  app: {
    background: NAVY,
    minHeight: "100dvh",
    maxWidth: 430,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column" as const,
    fontFamily: "'Inter', sans-serif",
    position: "relative" as const,
    overflowX: "hidden" as const,
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto" as const,
    paddingBottom: 90,
  },

  // Header
  header: {
    background: `linear-gradient(135deg, ${NAVY} 0%, #0a1628 100%)`,
    padding: "20px 20px 16px",
    borderBottom: `1px solid ${GOLD_DIM}33`,
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: `0 4px 12px ${GOLD}55`,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 800,
    color: NAVY,
    letterSpacing: "-0.5px",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: GOLD,
    letterSpacing: "-0.5px",
    lineHeight: 1.1,
  },
  headerSub: {
    fontSize: 11,
    color: "#7a9bcc",
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    marginTop: 2,
  },

  // Form section
  section: { padding: "20px 16px 0" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: GOLD,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    marginBottom: 12,
  },
  formCard: {
    background: NAVY_CARD,
    borderRadius: 16,
    border: `1px solid ${NAVY_LIGHT}`,
    padding: "16px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  fieldWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 5,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#7a9bcc",
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
  },
  amountRow: {
    display: "flex",
    alignItems: "center",
    background: NAVY_LIGHT,
    borderRadius: 10,
    border: `1px solid #1e3a6a`,
    overflow: "hidden",
  },
  rupeeSymbol: {
    padding: "0 10px 0 14px",
    fontSize: 18,
    fontWeight: 700,
    color: GOLD,
  },
  amountInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: 20,
    fontWeight: 700,
    padding: "12px 14px 12px 0",
    width: "100%",
  },
  textInput: {
    background: NAVY_LIGHT,
    border: `1px solid #1e3a6a`,
    borderRadius: 10,
    color: "#fff",
    fontSize: 15,
    fontWeight: 500,
    padding: "12px 14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  },
  select: {
    background: NAVY_LIGHT,
    border: `1px solid #1e3a6a`,
    borderRadius: 10,
    color: "#fff",
    fontSize: 15,
    fontWeight: 500,
    padding: "12px 14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
    appearance: "none" as const,
    cursor: "pointer",
  },
  btn: {
    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
    color: NAVY,
    border: "none",
    borderRadius: 12,
    padding: "15px",
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: 0.5,
    cursor: "pointer",
    width: "100%",
    marginTop: 4,
    boxShadow: `0 6px 20px ${GOLD}44`,
    transition: "transform 0.1s, box-shadow 0.1s",
  },

  // Results
  resultsSection: { padding: "20px 16px 0" },
  bestLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: GOLD,
    letterSpacing: 2.5,
    textTransform: "uppercase" as const,
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  bestCardWrapper: {
    background: `linear-gradient(135deg, ${NAVY_CARD} 0%, #0e1e38 100%)`,
    border: `2px solid ${GOLD}`,
    borderRadius: 18,
    padding: "18px 16px",
    marginBottom: 12,
    boxShadow: `0 8px 32px ${GOLD}22`,
    position: "relative" as const,
    overflow: "hidden",
  },
  bestCardGlow: {
    position: "absolute" as const,
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${GOLD}18 0%, transparent 70%)`,
    pointerEvents: "none" as const,
  },
  bestCardBank: {
    fontSize: 10,
    fontWeight: 700,
    color: GOLD_DIM,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    marginBottom: 2,
  },
  bestCardName: {
    fontSize: 20,
    fontWeight: 800,
    color: "#fff",
    marginBottom: 12,
    letterSpacing: "-0.3px",
  },
  savingsRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 14,
  },
  savingsLabel: { fontSize: 12, color: "#7a9bcc", fontWeight: 500 },
  savingsAmount: { fontSize: 30, fontWeight: 900, color: "#4ade80", letterSpacing: "-1px" },
  breakdownBox: {
    background: "#0a1628",
    borderRadius: 10,
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },
  breakdownRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownKey: { fontSize: 12, color: "#7a9bcc", fontWeight: 500 },
  breakdownVal: { fontSize: 12, fontWeight: 700, color: "#fff" },
  breakdownDivider: { height: 1, background: "#1e3a6a", margin: "2px 0" },
  otherCardsLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#7a9bcc",
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    marginBottom: 8,
    marginTop: 4,
  },
  otherCard: {
    background: NAVY_CARD,
    border: `1px solid #1e3a6a`,
    borderRadius: 13,
    padding: "13px 14px",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  otherCardRank: { fontSize: 10, fontWeight: 700, color: GOLD_DIM, letterSpacing: 1 },
  otherCardName: { fontSize: 14, fontWeight: 700, color: "#fff" },
  otherCardLoss: { fontSize: 11, fontWeight: 600, color: "#f87171", marginTop: 1 },
  otherCardTotal: { fontSize: 16, fontWeight: 800, color: "#4ade80" },
  otherCardTotalLabel: { fontSize: 10, color: "#7a9bcc" },

  // Bottom nav
  bottomNav: {
    position: "fixed" as const,
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 430,
    background: "#080f1e",
    borderTop: `1px solid ${GOLD_DIM}44`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    padding: "10px 0 16px",
    zIndex: 100,
  },
  navItem: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 4,
    cursor: "pointer",
    flex: 1,
    userSelect: "none" as const,
    WebkitTapHighlightColor: "transparent",
  },
  navLabel: { fontSize: 10, fontWeight: 600, letterSpacing: 0.5 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupee(val: number) {
  return `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "pay",
    label: "Pay",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    id: "cards",
    label: "Cards",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <path d="M1 10h22" />
        <circle cx="6" cy="15" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "rewards",
    label: "Rewards",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={22} height={22}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

function BottomNav({ active, onTabChange }: { active: Tab; onTabChange: (t: Tab) => void }) {
  return (
    <div style={s.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        return (
          <div key={item.id} style={s.navItem} onClick={() => onTabChange(item.id)}>
            <div style={{ color: isActive ? GOLD : "#3a5a8a", display: "flex" }}>
              {item.icon}
            </div>
            <span style={{ ...s.navLabel, color: isActive ? GOLD : "#3a5a8a" }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Pay Screen ───────────────────────────────────────────────────────────────

function PayScreen() {
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("dining");
  const [results, setResults] = useState<ScoredCard[] | null>(null);
  const [pressing, setPressing] = useState(false);

  function handleScore() {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;
    const scored = scoreCards({
      amount: parsed,
      merchant: merchant.trim() || "Other",
      category,
    }) as ScoredCard[];
    setResults(scored);
  }

  const best = results?.[0] ?? null;
  const rest = results?.slice(1) ?? [];

  return (
    <>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logoBox}>
          <span style={s.logoText}>TIP</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={s.headerTitle}>TIP</span>
          <span style={s.headerSub}>The Intelligent Payment</span>
        </div>
      </div>

      <div style={s.scrollArea}>
        {/* Form */}
        <div style={s.section}>
          <div style={s.sectionLabel}>⚡ Smart Pay</div>
          <div style={s.formCard}>
            <div style={s.fieldWrapper}>
              <label style={s.fieldLabel}>Amount</label>
              <div style={s.amountRow}>
                <span style={s.rupeeSymbol}>₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={s.amountInput}
                  min={0}
                />
              </div>
            </div>

            <div style={s.fieldWrapper}>
              <label style={s.fieldLabel}>Merchant Name</label>
              <input
                type="text"
                placeholder="e.g. Swiggy, Amazon, Zomato"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                style={s.textInput}
              />
            </div>

            <div style={s.fieldWrapper}>
              <label style={s.fieldLabel}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={s.select}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button
              style={{
                ...s.btn,
                transform: pressing ? "scale(0.97)" : "scale(1)",
                boxShadow: pressing ? `0 2px 8px ${GOLD}33` : `0 6px 20px ${GOLD}44`,
              }}
              onMouseDown={() => setPressing(true)}
              onMouseUp={() => { setPressing(false); handleScore(); }}
              onMouseLeave={() => setPressing(false)}
              onTouchStart={() => setPressing(true)}
              onTouchEnd={() => { setPressing(false); handleScore(); }}
            >
              Find Best Card
            </button>
          </div>
        </div>

        {/* Results */}
        {results && best && (
          <div style={s.resultsSection}>
            <div style={s.bestLabel}>
              <span>★</span>
              <span>Best Card For This Payment</span>
            </div>

            <div style={s.bestCardWrapper}>
              <div style={s.bestCardGlow} />
              <div style={s.bestCardBank}>{best.card.bank} · {best.card.network}</div>
              <div style={s.bestCardName}>{best.card.name}</div>
              <div style={s.savingsRow}>
                <span style={s.savingsLabel}>You save</span>
                <span style={s.savingsAmount}>{formatRupee(best.totalValue)}</span>
              </div>
              <div style={s.breakdownBox}>
                <div style={s.breakdownRow}>
                  <span style={s.breakdownKey}>Base Cashback</span>
                  <span style={s.breakdownVal}>{formatRupee(best.baseCashback)}</span>
                </div>
                {best.offerValue > 0 && (
                  <>
                    <div style={s.breakdownDivider} />
                    <div style={s.breakdownRow}>
                      <span style={s.breakdownKey}>Active Offer</span>
                      <span style={{ ...s.breakdownVal, color: GOLD }}>+{formatRupee(best.offerValue)}</span>
                    </div>
                  </>
                )}
                {best.milestoneValue > 0 && (
                  <>
                    <div style={s.breakdownDivider} />
                    <div style={s.breakdownRow}>
                      <span style={s.breakdownKey}>Milestone Progress</span>
                      <span style={{ ...s.breakdownVal, color: GOLD }}>+{formatRupee(best.milestoneValue)}</span>
                    </div>
                  </>
                )}
                <div style={s.breakdownDivider} />
                <div style={s.breakdownRow}>
                  <span style={{ ...s.breakdownKey, fontWeight: 700, color: "#fff" }}>Total Value</span>
                  <span style={{ ...s.breakdownVal, color: "#4ade80", fontSize: 14 }}>{formatRupee(best.totalValue)}</span>
                </div>
              </div>
            </div>

            {rest.length > 0 && (
              <>
                <div style={s.otherCardsLabel}>Other Cards</div>
                {rest.map((r, i) => (
                  <div key={r.card.id} style={s.otherCard}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={s.otherCardRank}>#{i + 2} · {r.card.bank}</span>
                      <span style={s.otherCardName}>{r.card.name}</span>
                      {r.lossVsBest > 0 && (
                        <span style={s.otherCardLoss}>{formatRupee(r.lossVsBest)} less than best</span>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                      <span style={s.otherCardTotal}>{formatRupee(r.totalValue)}</span>
                      <span style={s.otherCardTotalLabel}>total value</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {!results && (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: `${GOLD}14`,
              border: `1px solid ${GOLD}33`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.5} width={28} height={28}>
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
              </svg>
            </div>
            <div style={{ color: "#7a9bcc", fontSize: 14, fontWeight: 500 }}>
              Enter a transaction above to find your best card
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Placeholder screens ──────────────────────────────────────────────────────

function PlaceholderScreen({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <>
      <div style={s.header}>
        <div style={s.logoBox}>
          <span style={s.logoText}>TIP</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={s.headerTitle}>TIP</span>
          <span style={s.headerSub}>The Intelligent Payment</span>
        </div>
      </div>
      <div style={{ ...s.scrollArea, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: `${GOLD}14`, border: `1px solid ${GOLD}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            {icon}
          </div>
          <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{title}</div>
          <div style={{ color: "#7a9bcc", fontSize: 13 }}>{sub}</div>
        </div>
      </div>
    </>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [onboarded, setOnboarded] = useState<boolean>(
    () => typeof window !== "undefined" && localStorage.getItem("tip_onboarded") === "1"
  );
  const [activeTab, setActiveTab] = useState<Tab>("pay");

  function completeOnboarding() {
    localStorage.setItem("tip_onboarded", "1");
    setOnboarded(true);
  }

  if (!onboarded) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  function renderScreen() {
    switch (activeTab) {
      case "pay":
        return <PayScreen />;
      case "cards":
        return (
          <div style={s.scrollArea}>
            <Dashboard />
          </div>
        );
      case "rewards":
        return (
          <div style={s.scrollArea}>
            <Rewards />
          </div>
        );
      case "profile":
        return (
          <PlaceholderScreen
            icon={<svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.5} width={28} height={28}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>}
            title="Profile"
            sub="Your profile settings are coming soon"
          />
        );
    }
  }

  return (
    <div style={s.app}>
      {renderScreen()}
      <BottomNav active={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
