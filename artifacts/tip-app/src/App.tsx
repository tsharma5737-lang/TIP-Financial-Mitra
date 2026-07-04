import { useState, useEffect, useRef } from "react";
// @ts-ignore
import { scoreCards } from "./engine/scoringEngine.js";
// @ts-ignore
import Dashboard from "./Dashboard.jsx";
// @ts-ignore
import Rewards from "./Rewards.jsx";
// @ts-ignore
import Onboarding from "./Onboarding.jsx";
// @ts-ignore
import PitchSummary from "./PitchSummary.jsx";

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
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

// ─── Mock transactions for QR scan demo ───────────────────────────────────────

const mockTransactions = [
  { amount: 850,   merchant: "Swiggy",          category: "swiggy"    },
  { amount: 12499, merchant: "Amazon",           category: "amazon"    },
  { amount: 8200,  merchant: "Air Asia",         category: "travel"    },
  { amount: 450,   merchant: "Zomato",           category: "zomato"    },
  { amount: 2300,  merchant: "BigBasket",        category: "grocery"   },
  { amount: 960,   merchant: "BookMyShow",       category: "other"     },
  { amount: 6750,  merchant: "MakeMyTrip",       category: "travel"    },
  { amount: 3000,  merchant: "Reliance Petrol",  category: "fuel"      },
  { amount: 4500,  merchant: "Myntra",           category: "other"     },
  { amount: 1199,  merchant: "Airtel",           category: "utilities" },
];

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

// ─── VPA category lookup ─────────────────────────────────────────────────────

const VPA_CATEGORY_MAP: Record<string, string> = {
  swiggy: "Food Delivery", zomato: "Food Delivery", eatsure: "Food Delivery",
  amazon: "Online Shopping", flipkart: "Online Shopping", myntra: "Online Shopping",
  ajio: "Online Shopping", nykaa: "Online Shopping", meesho: "Online Shopping",
  bigbasket: "Grocery", blinkit: "Grocery", zepto: "Grocery", grofers: "Grocery",
  jiomart: "Grocery", dunzo: "Grocery",
  bpcl: "Fuel", hpcl: "Fuel", iocl: "Fuel", indianoil: "Fuel", reliance: "Fuel",
  makemytrip: "Travel", goibibo: "Travel", cleartrip: "Travel", irctc: "Travel",
  yatra: "Travel", airasia: "Travel", indigo: "Travel",
  bookmyshow: "Entertainment", pvr: "Entertainment", inox: "Entertainment",
  hotstar: "Entertainment", netflix: "Entertainment",
  airtel: "Utilities", jio: "Utilities", vodafone: "Utilities", bsnl: "Utilities",
  tatapower: "Utilities", bescom: "Utilities", adani: "Utilities",
  apollopharmacy: "Pharmacy", medplus: "Pharmacy", netmeds: "Pharmacy", "1mg": "Pharmacy",
  "swiggy.dineout": "Dining", eazydiner: "Dining", "zomato.dining": "Dining",
};

const HUMAN_CATEGORIES = [
  "Food Delivery", "Online Shopping", "Grocery", "Fuel", "Travel",
  "Entertainment", "Utilities", "Pharmacy", "Dining", "Other",
];

function getVpaCategory(vpa: string): string | null {
  const v = vpa.toLowerCase();
  // Longer keys first so "swiggy.dineout" matches before "swiggy"
  const keys = Object.keys(VPA_CATEGORY_MAP).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (v.includes(key)) return VPA_CATEGORY_MAP[key];
  }
  return null;
}

function toEngineCategory(vpa: string, humanCat: string): string {
  const v = vpa.toLowerCase();
  if (v.includes("swiggy") && !v.includes("dineout")) return "swiggy";
  if (v.includes("zomato") && !v.includes("dining"))  return "zomato";
  if (v.includes("amazon"))   return "amazon";
  if (v.includes("flipkart")) return "flipkart";
  const map: Record<string, string> = {
    "Food Delivery": "dining", "Online Shopping": "amazon",
    "Grocery": "grocery",     "Fuel": "fuel",
    "Travel": "travel",       "Entertainment": "other",
    "Utilities": "utilities", "Pharmacy": "other",
    "Dining": "dining",       "Other": "other",
  };
  return map[humanCat] ?? "other";
}

function parseUpiQr(qrText: string) {
  try {
    const url = new URL(qrText);
    return {
      vpa:    url.searchParams.get("pa") ?? qrText,
      name:   url.searchParams.get("pn") ?? "",
      amount: url.searchParams.get("am") ?? "",
    };
  } catch {
    return { vpa: qrText, name: "", amount: "" };
  }
}

// ─── Real camera QR scanner ───────────────────────────────────────────────────

function QRScannerView({
  onScanned, onClose, onPermissionDenied,
}: {
  onScanned: (text: string) => void;
  onClose: () => void;
  onPermissionDenied: () => void;
}) {
  const scannerRef = useRef<any>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Html5Qrcode = (window as any).Html5Qrcode;
    if (!Html5Qrcode) { onPermissionDenied(); return; }

    const scanner = new Html5Qrcode("tip-qr-reader");
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
      (decoded: string) => {
        scanner.stop().catch(() => {}).finally(() => onScanned(decoded));
      },
      () => {}, // per-frame error — ignore
    ).then(() => setStarting(false))
     .catch((err: unknown) => {
       const msg = String(err).toLowerCase();
       if (
         msg.includes("permission") || msg.includes("denied") ||
         msg.includes("notallowed") || msg.includes("not found") ||
         msg.includes("overconstrained")
       ) {
         onPermissionDenied();
       } else {
         onPermissionDenied();
       }
     });

    return () => { scannerRef.current?.stop().catch(() => {}); };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
      <div style={{ color: GOLD, fontSize: 11, fontWeight: 700, textAlign: "center", letterSpacing: 1.2, textTransform: "uppercase" as const }}>
        Point camera at UPI QR code
      </div>

      {/* Viewfinder */}
      <div style={{ position: "relative" as const, borderRadius: 14, overflow: "hidden", background: "#000", border: `2px solid ${GOLD}44`, minHeight: 260 }}>
        <div id="tip-qr-reader" style={{ width: "100%" }} />

        {starting && (
          <div style={{ position: "absolute" as const, inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" as const, gap: 10, background: "#000a" }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${GOLD}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ color: GOLD, fontSize: 12, fontWeight: 600 }}>Starting camera…</span>
          </div>
        )}

        {/* Gold corner brackets */}
        <div style={{ position: "absolute" as const, inset: 0, pointerEvents: "none" as const, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative" as const, width: 200, height: 200 }}>
            {[
              { top: 0,    left: 0,    borderTop: `3px solid ${GOLD}`, borderLeft: `3px solid ${GOLD}`,  borderRadius: "4px 0 0 0" },
              { top: 0,    right: 0,   borderTop: `3px solid ${GOLD}`, borderRight: `3px solid ${GOLD}`, borderRadius: "0 4px 0 0" },
              { bottom: 0, left: 0,    borderBottom: `3px solid ${GOLD}`, borderLeft: `3px solid ${GOLD}`,  borderRadius: "0 0 0 4px" },
              { bottom: 0, right: 0,   borderBottom: `3px solid ${GOLD}`, borderRight: `3px solid ${GOLD}`, borderRadius: "0 0 4px 0" },
            ].map((style, i) => (
              <div key={i} style={{ position: "absolute" as const, width: 28, height: 28, ...style }} />
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        style={{ background: "transparent", border: `1px solid #1e3a6a`, borderRadius: 10, color: "#7a9bcc", fontSize: 13, fontWeight: 600, padding: "10px", cursor: "pointer", fontFamily: "inherit" }}
      >
        Cancel
      </button>
    </div>
  );
}

// ─── Pay Screen ───────────────────────────────────────────────────────────────

function QRIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={36} height={36}>
      {/* top-left corner */}
      <path d="M3 9V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
      {/* top-right corner */}
      <path d="M15 3h4a2 2 0 0 1 2 2v4" strokeLinecap="round" />
      {/* bottom-right corner */}
      <path d="M21 15v4a2 2 0 0 1-2 2h-4" strokeLinecap="round" />
      {/* bottom-left corner */}
      <path d="M9 21H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" />
      {/* inner QR dots */}
      <rect x="7" y="7" width="4" height="4" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="13" y="7" width="4" height="4" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="7" y="13" width="4" height="4" rx="0.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="17" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

type PaySuccess = {
  merchant: string;
  amount: number;
  cardName: string;
  saved: number;
};

type ScanState = "idle" | "camera" | "confirm" | "manual";

function PayScreen() {
  // Shared result state
  const [results, setResults]     = useState<ScoredCard[] | null>(null);
  const [paySuccess, setPaySuccess] = useState<PaySuccess | null>(null);
  const [pressing, setPressing]   = useState(false);

  // Scanner state machine
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [cameraError, setCameraError] = useState(false);

  // Confirm-step state (after QR scan)
  const [scannedVpa, setScannedVpa]           = useState("");
  const [scannedName, setScannedName]         = useState("");
  const [detectedCat, setDetectedCat]         = useState<string | null>(null);
  const [selectedHuman, setSelectedHuman]     = useState(HUMAN_CATEGORIES[0]);
  const [confirmAmount, setConfirmAmount]     = useState("");

  // Manual-entry state
  const [amount, setAmount]     = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("dining");

  function runScore(amt: number, merch: string, cat: string) {
    setResults(scoreCards({ amount: amt, merchant: merch || "Other", category: cat }) as ScoredCard[]);
  }

  // Called when html5-qrcode successfully reads a QR
  function handleQrScanned(raw: string) {
    const { vpa, name, amount: qrAmt } = parseUpiQr(raw);
    const cat = getVpaCategory(vpa);
    setScannedVpa(vpa);
    setScannedName(name);
    setDetectedCat(cat);
    setSelectedHuman(cat ?? HUMAN_CATEGORIES[0]);
    setConfirmAmount(qrAmt);
    setResults(null);
    setScanState("confirm");
  }

  // Confirm step → score
  function handleConfirmScore() {
    const amt = parseFloat(confirmAmount);
    if (!amt || amt <= 0) return;
    const humanCat = detectedCat ?? selectedHuman;
    const engCat   = toEngineCategory(scannedVpa, humanCat);
    const merch    = scannedName || scannedVpa.split("@")[0];
    setMerchant(merch);
    setAmount(String(amt));
    setCategory(engCat);
    runScore(amt, merch, engCat);
  }

  // Manual entry → score
  function handleScore() {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;
    runScore(parsed, merchant.trim(), category);
  }

  function handlePay() {
    const best = results?.[0];
    if (!best) return;
    setPaySuccess({
      merchant: merchant || scannedName || scannedVpa.split("@")[0],
      amount: parseFloat(amount || confirmAmount),
      cardName: best.card.name,
      saved: best.totalValue,
    });
  }

  function handleDone() {
    setPaySuccess(null);
    setResults(null);
    setAmount(""); setMerchant(""); setCategory("dining");
    setConfirmAmount(""); setScannedVpa(""); setScannedName("");
    setScanState("idle");
  }

  const best = results?.[0] ?? null;
  const rest = results?.slice(1) ?? [];

  // ── Shared header ──────────────────────────────────────────────────────────
  const Header = () => (
    <div style={s.header}>
      <div style={s.logoBox}><span style={s.logoText}>TIP</span></div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <span style={s.headerTitle}>TIP</span>
        <span style={s.headerSub}>Your Financial Mitra</span>
      </div>
      <div style={{ background: "#1e2d40", borderRadius: 8, padding: "4px 8px", border: "1px solid #2a3f58", alignSelf: "flex-start" as const, marginTop: 2 }}>
        <span style={{ fontSize: 9, fontWeight: 600, color: "#7a9bcc", letterSpacing: 0.5 }}>DEMO MODE</span>
      </div>
    </div>
  );

  // ── Payment success ────────────────────────────────────────────────────────
  if (paySuccess) {
    return (
      <>
        <Header />
        <div style={{ ...s.scrollArea, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "40px 24px", width: "100%" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 0 32px #22c55e55" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} width={40} height={40}>
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Payment Successful!</div>
            <div style={{ color: "#7a9bcc", fontSize: 14, marginBottom: 28 }}>Transaction complete</div>
            <div style={{ background: NAVY_CARD, borderRadius: 16, border: "1px solid #1e3a6a", padding: "20px 18px", textAlign: "left", marginBottom: 20 }}>
              {[["Merchant", paySuccess.merchant], ["Amount", formatRupee(paySuccess.amount)], ["Card Used", paySuccess.cardName]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ color: "#7a9bcc", fontSize: 13, fontWeight: 500 }}>{k}</span>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{v}</span>
                </div>
              ))}
              <div style={{ height: 1, background: "#1e3a6a", margin: "4px 0 14px" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#7a9bcc", fontSize: 13, fontWeight: 500 }}>You saved with TIP</span>
                <span style={{ color: GOLD, fontSize: 16, fontWeight: 800 }}>{formatRupee(paySuccess.saved)}</span>
              </div>
            </div>
            <button style={s.btn} onClick={handleDone}>Done</button>
          </div>
        </div>
      </>
    );
  }

  // ── Results block (shared) ─────────────────────────────────────────────────
  const ResultsBlock = () => results && best ? (
    <div style={s.resultsSection}>
      <div style={{ ...s.bestCardWrapper, boxShadow: `0 0 20px rgba(201,168,76,0.6),0 8px 32px ${GOLD}22` }}>
        <div style={s.bestCardGlow} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${GOLD}22`, borderRadius: 6, padding: "4px 10px", marginBottom: 12 }}>
          <span style={{ color: GOLD, fontSize: 10, fontWeight: 800, letterSpacing: 1.5 }}>★ BEST CARD FOR THIS PAYMENT</span>
        </div>
        <div style={s.bestCardBank}>{best.card.bank} · {best.card.network}</div>
        <div style={s.bestCardName}>{best.card.name}</div>
        <div style={s.savingsRow}>
          <span style={{ ...s.savingsLabel, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "#4ade80", fontSize: 16 }}>✓</span> You save
          </span>
          <span style={{ ...s.savingsAmount, fontSize: "2rem" }}>{formatRupee(best.totalValue)}</span>
        </div>
        <div style={s.breakdownBox}>
          <div style={s.breakdownRow}><span style={s.breakdownKey}>Base Cashback</span><span style={s.breakdownVal}>{formatRupee(best.baseCashback)}</span></div>
          {best.offerValue > 0 && (<><div style={s.breakdownDivider} /><div style={s.breakdownRow}><span style={s.breakdownKey}>Active Offer</span><span style={{ ...s.breakdownVal, color: GOLD }}>+{formatRupee(best.offerValue)}</span></div></>)}
          {best.milestoneValue > 0 && (<><div style={s.breakdownDivider} /><div style={s.breakdownRow}><span style={s.breakdownKey}>Milestone Progress</span><span style={{ ...s.breakdownVal, color: GOLD }}>+{formatRupee(best.milestoneValue)}</span></div></>)}
          <div style={s.breakdownDivider} />
          <div style={s.breakdownRow}><span style={{ ...s.breakdownKey, fontWeight: 700, color: "#fff" }}>Total Value</span><span style={{ ...s.breakdownVal, color: "#4ade80", fontSize: 14 }}>{formatRupee(best.totalValue)}</span></div>
        </div>
        <button style={{ ...s.btn, marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handlePay}>
          Pay with this Card →
        </button>
      </div>
      {rest.length > 0 && (
        <>
          <div style={s.otherCardsLabel}>Other Cards</div>
          {rest.map((r, i) => (
            <div key={r.card.id} style={s.otherCard}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={s.otherCardRank}>#{i + 2} · {r.card.bank}</span>
                <span style={s.otherCardName}>{r.card.name}</span>
                {r.lossVsBest > 0 && <span style={s.otherCardLoss}>{formatRupee(r.lossVsBest)} less than best</span>}
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
  ) : null;

  // ── Camera permission error ────────────────────────────────────────────────
  const CameraErrorBox = () => cameraError ? (
    <div style={{ background: "#1a0a0a", border: "1px solid #f8717155", borderRadius: 12, padding: "14px 16px", marginTop: 4 }}>
      <div style={{ color: "#f87171", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>📵 Camera access denied</div>
      <div style={{ color: "#a87a7a", fontSize: 12, lineHeight: 1.6 }}>
        To enable camera for QR scanning:<br />
        <strong style={{ color: "#c8a0a0" }}>Chrome Android:</strong> tap the lock icon in the address bar → Permissions → Camera → Allow<br />
        <strong style={{ color: "#c8a0a0" }}>iPhone Safari/Chrome:</strong> Settings → Privacy → Camera → enable for this site
      </div>
      <button onClick={() => setCameraError(false)} style={{ marginTop: 10, background: "transparent", border: "1px solid #f8717155", borderRadius: 8, color: "#f87171", fontSize: 11, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit" }}>
        Dismiss
      </button>
    </div>
  ) : null;

  // ── Idle: scan button + manual link ───────────────────────────────────────
  if (scanState === "idle") {
    return (
      <>
        <Header />
        <div style={s.scrollArea}>
          <div style={s.section}>
            <div style={s.sectionLabel}>📷 Scan &amp; Pay</div>
            <div style={s.formCard}>
              {/* Big QR scan button */}
              <div
                onClick={() => { setCameraError(false); setScanState("camera"); }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: `${GOLD}10`, border: `2px dashed ${GOLD_DIM}`, borderRadius: 14, padding: "28px 16px", cursor: "pointer", transition: "all 0.2s" }}
              >
                <div style={{ color: GOLD }}><QRIcon /></div>
                <span style={{ color: GOLD, fontSize: 14, fontWeight: 800 }}>Tap to Scan &amp; Pay</span>
                <span style={{ color: "#7a9bcc", fontSize: 11 }}>Opens rear camera · reads UPI QR codes</span>
              </div>

              <CameraErrorBox />

              {/* Manual fallback */}
              <button
                onClick={() => setScanState("manual")}
                style={{ background: "transparent", border: "none", color: "#7a9bcc", fontSize: 13, fontWeight: 600, padding: "4px 0", cursor: "pointer", textDecoration: "underline", textDecorationColor: "#3a5a8a", fontFamily: "inherit", alignSelf: "center" as const }}
              >
                Enter manually instead →
              </button>
            </div>
          </div>

          {!results && (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: `${GOLD}14`, border: `1px solid ${GOLD}33`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.5} width={28} height={28}>
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                </svg>
              </div>
              <div style={{ color: "#7a9bcc", fontSize: 14, fontWeight: 500 }}>Scan a QR code or enter a transaction manually</div>
            </div>
          )}
          <ResultsBlock />
        </div>
      </>
    );
  }

  // ── Camera: live viewfinder ────────────────────────────────────────────────
  if (scanState === "camera") {
    return (
      <>
        <Header />
        <div style={s.scrollArea}>
          <div style={s.section}>
            <div style={s.sectionLabel}>📷 Scan &amp; Pay</div>
            <div style={s.formCard}>
              <QRScannerView
                onScanned={handleQrScanned}
                onClose={() => setScanState("idle")}
                onPermissionDenied={() => { setCameraError(true); setScanState("idle"); }}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Confirm: show scanned data + amount input ─────────────────────────────
  if (scanState === "confirm") {
    const humanCat = detectedCat ?? selectedHuman;
    return (
      <>
        <Header />
        <div style={s.scrollArea}>
          <div style={s.section}>
            <div style={s.sectionLabel}>📷 Scan &amp; Pay</div>
            <div style={s.formCard}>

              {/* Scanned badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#0a2010", border: "1px solid #22c55e44", borderRadius: 10, padding: "10px 14px" }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ color: "#4ade80", fontSize: 12, fontWeight: 700 }}>QR Scanned Successfully</span>
                  <span style={{ color: "#7a9bcc", fontSize: 11 }}>{scannedName || scannedVpa}</span>
                  {scannedName && <span style={{ color: "#4a6a8a", fontSize: 10 }}>{scannedVpa}</span>}
                </div>
              </div>

              {/* Category row */}
              <div style={s.fieldWrapper}>
                <label style={s.fieldLabel}>
                  Category {detectedCat ? <span style={{ color: "#4ade80", fontWeight: 700 }}>✓ Auto-detected</span> : <span style={{ color: "#f97316" }}>— please select</span>}
                </label>
                {detectedCat ? (
                  <div style={{ background: "#0a2010", border: "1px solid #22c55e44", borderRadius: 10, padding: "11px 14px", color: "#4ade80", fontSize: 14, fontWeight: 700 }}>
                    {detectedCat}
                  </div>
                ) : (
                  <select value={selectedHuman} onChange={(e) => setSelectedHuman(e.target.value)} style={s.select}>
                    {HUMAN_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
              </div>

              {/* Amount */}
              <div style={s.fieldWrapper}>
                <label style={s.fieldLabel}>Amount{confirmAmount ? " (from QR)" : ""}</label>
                <div style={s.amountRow}>
                  <span style={s.rupeeSymbol}>₹</span>
                  <input
                    type="number" placeholder="Enter amount" value={confirmAmount}
                    onChange={(e) => setConfirmAmount(e.target.value)}
                    style={s.amountInput} min={0} autoFocus
                  />
                </div>
              </div>

              <button
                style={{ ...s.btn, transform: pressing ? "scale(0.97)" : "scale(1)" }}
                onMouseDown={() => setPressing(true)}
                onMouseUp={() => { setPressing(false); handleConfirmScore(); }}
                onMouseLeave={() => setPressing(false)}
                onTouchStart={() => setPressing(true)}
                onTouchEnd={() => { setPressing(false); handleConfirmScore(); }}
              >
                Find Best Card
              </button>

              {/* Secondary actions */}
              <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
                <button onClick={() => { setResults(null); setScanState("camera"); }} style={{ background: "transparent", border: "none", color: "#7a9bcc", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textDecorationColor: "#3a5a8a" }}>
                  Scan again
                </button>
                <button onClick={() => { setResults(null); setScanState("manual"); }} style={{ background: "transparent", border: "none", color: "#7a9bcc", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textDecorationColor: "#3a5a8a" }}>
                  Enter manually instead
                </button>
              </div>
            </div>
          </div>
          <ResultsBlock />
        </div>
      </>
    );
  }

  // ── Manual: full form ──────────────────────────────────────────────────────
  return (
    <>
      <Header />
      <div style={s.scrollArea}>
        <div style={s.section}>
          <div style={s.sectionLabel}>📷 Scan &amp; Pay</div>
          <div style={s.formCard}>

            <div style={s.fieldWrapper}>
              <label style={s.fieldLabel}>Amount</label>
              <div style={s.amountRow}>
                <span style={s.rupeeSymbol}>₹</span>
                <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} style={s.amountInput} min={0} />
              </div>
            </div>

            <div style={s.fieldWrapper}>
              <label style={s.fieldLabel}>Merchant Name</label>
              <input type="text" placeholder="e.g. Swiggy, Amazon, Zomato" value={merchant} onChange={(e) => setMerchant(e.target.value)} style={s.textInput} />
            </div>

            <div style={s.fieldWrapper}>
              <label style={s.fieldLabel}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={s.select}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>

            <button
              style={{ ...s.btn, transform: pressing ? "scale(0.97)" : "scale(1)", boxShadow: pressing ? `0 2px 8px ${GOLD}33` : `0 6px 20px ${GOLD}44` }}
              onMouseDown={() => setPressing(true)}
              onMouseUp={() => { setPressing(false); handleScore(); }}
              onMouseLeave={() => setPressing(false)}
              onTouchStart={() => setPressing(true)}
              onTouchEnd={() => { setPressing(false); handleScore(); }}
            >
              Find Best Card
            </button>

            <button onClick={() => { setResults(null); setScanState("idle"); }} style={{ background: "transparent", border: "none", color: "#7a9bcc", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textDecorationColor: "#3a5a8a", alignSelf: "center" as const }}>
              ← Back to scan
            </button>
          </div>
        </div>
        <ResultsBlock />
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
          <span style={s.headerSub}>Your Financial Mitra</span>
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
          <div style={s.scrollArea}>
            <PitchSummary />
          </div>
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
