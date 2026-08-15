import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
// @ts-ignore
import Dashboard from "./Dashboard.jsx";
// @ts-ignore
import Rewards from "./Rewards.jsx";
// @ts-ignore
import Onboarding from "./Onboarding.jsx";
import { getToken, getRecommendation } from "./lib/apiClient";
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
  "zomato", "travel", "fuel", "utilities", "other", "personal",
];

type Tab = "pay" | "cards" | "rewards" | "profile";

type ScoredCard = {
  card_id: string;
  bank_name: string;
  card_name: string;
  rupee_value: number;
  base_rupee_value: number;
  applied_offer?: {
    discount_type: string;
    offer_value: number;
    conditions?: string;
  } | null;
  value_comparison?: {
    direct_value: number;
    combined_value: number;
    extra_from_offer: number;
    message: string;
  } | null;
  rank: number;
  is_best: boolean;
  rupee_loss_vs_best: number;
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
  // Food Delivery
  swiggy: "Food Delivery", zomato: "Food Delivery", eatsure: "Food Delivery",
  // Online Shopping
  amazon: "Online Shopping", flipkart: "Online Shopping", myntra: "Online Shopping",
  ajio: "Online Shopping", nykaa: "Online Shopping",
  // Grocery
  bigbasket: "Grocery", blinkit: "Grocery", zepto: "Grocery", grofers: "Grocery",
  jiomart: "Grocery",
  // Fuel
  bpcl: "Fuel", hpcl: "Fuel", iocl: "Fuel", indianoil: "Fuel", petrol: "Fuel",
  // Travel
  makemytrip: "Travel", goibibo: "Travel", irctc: "Travel", cleartrip: "Travel",
  yatra: "Travel",
  // Entertainment
  bookmyshow: "Entertainment", pvr: "Entertainment", inox: "Entertainment",
  // Utilities
  airtel: "Utilities", jio: "Utilities", vodafone: "Utilities", bsnl: "Utilities",
  // Pharmacy
  apollopharmacy: "Pharmacy", medplus: "Pharmacy", netmeds: "Pharmacy", "1mg": "Pharmacy",
  medico: "Pharmacy", pharma: "Pharmacy", medical: "Pharmacy", medicine: "Pharmacy",
  chemist: "Pharmacy", drugs: "Pharmacy",
  // Dining
  restaurant: "Dining", hotel: "Dining", cafe: "Dining",
  dineout: "Dining", eazydiner: "Dining",
};

const HUMAN_CATEGORIES = [
  "Food Delivery", "Online Shopping", "Grocery", "Fuel", "Travel",
  "Entertainment", "Utilities", "Pharmacy", "Dining", "Personal Transfer", "Other",
];

// Check VPA first, then merchant name — longer keys first to avoid prefix collisions.
// Skip keyword matching entirely for personal transfers.
function getCategory(parsed: { vpa: string; merchantName: string; isPersonal?: boolean }): string | null {
  if (parsed.isPersonal) return "Personal Transfer";
  const keys = Object.keys(VPA_CATEGORY_MAP).sort((a, b) => b.length - a.length);
  if (parsed.vpa) {
    const v = parsed.vpa.toLowerCase();
    for (const key of keys) { if (v.includes(key)) return VPA_CATEGORY_MAP[key]; }
  }
  if (parsed.merchantName) {
    const n = parsed.merchantName.toLowerCase();
    for (const key of keys) { if (n.includes(key)) return VPA_CATEGORY_MAP[key]; }
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
    "Food Delivery": "dining",     "Online Shopping": "amazon",
    "Grocery": "grocery",          "Fuel": "fuel",
    "Travel": "travel",            "Entertainment": "other",
    "Utilities": "utilities",      "Pharmacy": "other",
    "Dining": "dining",            "Personal Transfer": "other",
    "Other": "other",
  };
  return map[humanCat] ?? "other";
}

// ─── Merchant name cleaner ────────────────────────────────────────────────────

function cleanMerchantName(raw: string): string {
  if (!raw) return "Merchant";
  return raw
    .replace(/[^a-zA-Z0-9\s&.'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Comprehensive Indian QR parser ──────────────────────────────────────────

type ParsedQR = {
  type: "UPI" | "PAYTM" | "PHONEPE" | "EMV" | "BHARATQR" | "URL" | "VPA" | "UNKNOWN";
  vpa: string;
  merchantName: string;
  amount: string;
  note?: string;
  city?: string;
  postal?: string;
  isURL?: boolean;
  isPersonal?: boolean;
  bank?: string;
  valid: boolean;
};

// ─── Personal UPI detection ───────────────────────────────────────────────────

const PERSONAL_UPI_PATTERNS = [
  /@okaxis$/i, /@okhdfcbank$/i, /@okicici$/i, /@oksbi$/i,
  /@ybl$/i, /@ibl$/i, /@axl$/i, /@rapl$/i,
  /@paytm$/i, /@apl$/i, /^\d{10}@/,
];

const MERCHANT_UPI_PATTERNS = [
  /^[a-z]+\.rzp@/i, /^[a-z]+\.paytm@/i,
  /merchant/i, /store/i, /shop/i, /mart/i,
];

function isPersonalUPI(vpa: string): boolean {
  if (!vpa) return false;
  if (/^\d{10}@/.test(vpa)) return true;           // 10-digit mobile VPAs are always personal
  for (const p of MERCHANT_UPI_PATTERNS) { if (p.test(vpa)) return false; } // merchant beats personal
  for (const p of PERSONAL_UPI_PATTERNS)  { if (p.test(vpa)) return true;  }
  return false;
}

function getBankFromVPA(vpa: string): string {
  if (!vpa) return "";
  const suffix = (vpa.split("@")[1] ?? "").toLowerCase();
  const bankMap: Record<string, string> = {
    okaxis: "Axis Bank", okhdfcbank: "HDFC Bank", okicici: "ICICI Bank",
    oksbi: "State Bank of India", ybl: "Yes Bank", ibl: "IndusInd Bank",
    axl: "Axis Bank", rapl: "Axis Bank", paytm: "Paytm Payments Bank",
    apl: "Amazon Pay", axisbank: "Axis Bank", hdfcbank: "HDFC Bank",
    icici: "ICICI Bank", sbi: "State Bank of India", kotak: "Kotak Bank",
    indus: "IndusInd Bank", fbl: "Federal Bank", upi: "UPI",
    jupiteraxis: "Jupiter (Axis Bank)", fifederal: "Fi (Federal Bank)",
    sliceaxis: "Slice (Axis Bank)",
  };
  return bankMap[suffix] || suffix.toUpperCase();
}

// Sequential EMV TLV walker — reads tag→length→value in order, never skips ahead
// This correctly handles merchant names with digits/symbols because it uses the
// declared byte-length rather than character-class regexes to bound each value.
function emvParseTags(data: string): Record<string, string> {
  const tags: Record<string, string> = {};
  let i = 0;
  while (i + 4 <= data.length) {
    const tag    = data.substring(i, i + 2);
    const lenStr = data.substring(i + 2, i + 4);
    const len    = parseInt(lenStr, 10);
    if (isNaN(len) || len < 0 || i + 4 + len > data.length) break;
    tags[tag] = data.substring(i + 4, i + 4 + len);
    i += 4 + len;
  }
  return tags;
}

function parseQRCode(qrText: string): ParsedQR {
  const text  = qrText.trim();
  const lower = text.toLowerCase();

  // ── Standard UPI ─────────────────────────────────────────────────────────
  if (/^upi:\/\//i.test(text) ||
      (lower.includes("pa=") && !text.startsWith("000201"))) {
    try {
      const url      = new URL(text.replace(/^upi:\/\//i, "https://upi/"));
      const params   = url.searchParams;
      const vpa      = params.get("pa") || "";
      const personal = isPersonalUPI(vpa);
      return {
        type: "UPI", vpa,
        merchantName: cleanMerchantName(params.get("pn") || vpa.split("@")[0] || "Merchant"),
        amount: params.get("am") || "",
        isPersonal: personal,
        bank: getBankFromVPA(vpa),
        valid: true,
      };
    } catch {
      return { type: "UNKNOWN", vpa: "", merchantName: "Merchant", amount: "", valid: false };
    }
  }

  // ── Paytm ─────────────────────────────────────────────────────────────────
  if (/^paytmqr:\/\//i.test(text) || lower.includes("paytm.com")) {
    return { type: "PAYTM", vpa: "", merchantName: "Paytm Merchant", amount: "", valid: true };
  }

  // ── PhonePe ───────────────────────────────────────────────────────────────
  if (/^phonepe:\/\//i.test(text) || lower.includes("phon.pe")) {
    return { type: "PHONEPE", vpa: "", merchantName: "PhonePe Merchant", amount: "", valid: true };
  }

  // ── EMV / BharatQR ────────────────────────────────────────────────────────
  // Walk tags sequentially so declared length bounds each value correctly.
  // Tag 59 = merchant name, tag 60 = city, tag 61 = postal code.
  if (text.startsWith("000201") || /^\d{20,}/.test(text)) {
    const tags = emvParseTags(text);

    const merchantName = (tags["59"] || "").trim();
    const city         = (tags["60"] || "").trim();
    const postal       = (tags["61"] || "").trim();

    // VPA may be embedded inside a sub-TLV (tag 26/51 area) — extract if present
    const vpaMatch = text.match(/([A-Za-z0-9._-]+@[A-Za-z]+)/);
    const vpa = vpaMatch ? vpaMatch[1] : "";

    return {
      type: "EMV", vpa,
      merchantName: cleanMerchantName(merchantName || "Local Merchant"),
      city, postal, amount: "", valid: true,
    };
  }

  // ── HTTPS URL ─────────────────────────────────────────────────────────────
  if (/^https?:\/\//i.test(text)) {
    const domain = (text.split("/")[2] || "").replace(/^www\./i, "");
    return {
      type: "URL", vpa: "",
      merchantName: cleanMerchantName(domain.split(".")[0]) || "Online Merchant",
      amount: "", isURL: true, valid: true,
    };
  }

  // ── Plain VPA ─────────────────────────────────────────────────────────────
  if (lower.includes("@")) {
    const vpa = text.split(/\s/)[0];
    return {
      type: "VPA", vpa,
      merchantName: cleanMerchantName(vpa.split("@")[0]),
      amount: "", valid: true,
    };
  }

  // ── Unknown ───────────────────────────────────────────────────────────────
  return { type: "UNKNOWN", vpa: "", merchantName: "Merchant", amount: "", valid: true };
}

// ─── Real camera QR scanner (npm-based, no CDN dependency) ───────────────────

function QRScannerView({
  onScanned, onClose,
}: {
  onScanned: (text: string) => void;
  onClose: () => void;
}) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "tip-qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
      },
      /* verbose= */ false,
    );

    scanner.render(
      (decodedText: string) => {
        scanner.clear().catch(() => {});
        onScanned(decodedText);
      },
      () => {}, // per-frame errors are normal — ignore
    );

    scannerRef.current = scanner;

    return () => { scannerRef.current?.clear().catch(() => {}); };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
      <div style={{ color: GOLD, fontSize: 11, fontWeight: 700, textAlign: "center", letterSpacing: 1.2, textTransform: "uppercase" as const }}>
        Point camera at UPI QR code
      </div>
      <div style={{ borderRadius: 14, overflow: "hidden", border: `2px solid ${GOLD}44` }}>
        <div id="tip-qr-reader" style={{ width: "100%" }} />
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
  const [scoring, setScoring]     = useState(false);
  const [scoreError, setScoreError] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  // Scanner state machine
  const [scanState, setScanState] = useState<ScanState>("idle");

  // Confirm-step state (after QR scan)
  const [scannedVpa, setScannedVpa]       = useState("");
  const [scannedName, setScannedName]     = useState("");
  const [scannedType, setScannedType]     = useState<ParsedQR["type"]>("UPI");
  const [scannedCity, setScannedCity]         = useState("");
  const [scannedIsUrl, setScannedIsUrl]       = useState(false);
  const [scannedIsPersonal, setScannedIsPersonal] = useState(false);
  const [scannedBank, setScannedBank]         = useState("");
  const [detectedCat, setDetectedCat]         = useState<string | null>(null);
  const [selectedHuman, setSelectedHuman] = useState(HUMAN_CATEGORIES[0]);
  const [confirmAmount, setConfirmAmount] = useState("");

  // Manual-entry state
  const [amount, setAmount]     = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("dining");

  const DEFAULT_DISCLAIMER = "Benefits shown are based on published rates and may vary. Verify with your bank before paying.";
  // ⚠️ PENDING LEGAL REVIEW (flagged 15-Aug-2026): wording changed from the original
  // required text at the founder's request. Not yet confirmed by legal counsel/CA -
  // revert to the original wording if review doesn't approve this version.
  const INFO_DISCLAIMER = "*TIP provides benefits recommendation basis the bank disclosures, which may change anytime at bank's discretion. Kindly verify with bank & your statement.";

  async function runScore(amt: number, merch: string, vpa?: string) {
    setScoring(true);
    setScoreError("");
    setResults(null);
    try {
      const data = await getRecommendation({
        merchant_name: merch || undefined,
        vpa: vpa || undefined,
        amount: amt,
      });
      setResults((data.recommendations ?? []) as ScoredCard[]);
      setDisclaimer(data.disclaimer || DEFAULT_DISCLAIMER);
      setLastUpdated(data.last_updated || "");
    } catch (err: any) {
      setScoreError(err?.message || "Could not get a recommendation. Please check your connection and try again.");
    } finally {
      setScoring(false);
    }
  }

  // Called when html5-qrcode successfully reads a QR
  function handleQrScanned(raw: string) {
    const parsed = parseQRCode(raw);
    const cat    = getCategory(parsed);
    setScannedVpa(parsed.vpa);
    setScannedName(parsed.merchantName);
    setScannedType(parsed.type);
    setScannedCity(parsed.city ?? "");
    setScannedIsUrl(parsed.isURL ?? false);
    setScannedIsPersonal(parsed.isPersonal ?? false);
    setScannedBank(parsed.bank ?? "");
    setDetectedCat(cat);
    setSelectedHuman(cat ?? HUMAN_CATEGORIES[0]);
    setConfirmAmount(parsed.amount);
    setResults(null);
    setScanState("confirm");
  }

  // Confirm step → score
  function handleConfirmScore() {
    const amt = parseFloat(confirmAmount);
    if (!amt || amt <= 0) return;
    const merch = scannedName || scannedVpa.split("@")[0];
    setMerchant(merch);
    setAmount(String(amt));
    runScore(amt, merch, scannedVpa);
  }

  // Manual entry → score (treated as an online/card payment — no vpa)
  function handleScore() {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;
    runScore(parsed, merchant.trim());
  }

  function handlePay() {
    const bestCard = results?.[0];
    if (!bestCard) return;
    setPaySuccess({
      merchant: merchant || scannedName || scannedVpa.split("@")[0],
      amount: parseFloat(amount || confirmAmount),
      cardName: bestCard.card_name,
      saved: bestCard.rupee_value,
    });
  }

  function handleDone() {
    setPaySuccess(null);
    setResults(null);
    setAmount(""); setMerchant(""); setCategory("dining");
    setConfirmAmount(""); setScannedVpa(""); setScannedName("");
    setScannedType("UPI"); setScannedCity(""); setScannedIsUrl(false);
    setScannedIsPersonal(false); setScannedBank("");
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
  const ResultsBlock = () => {
    if (scoring) {
      return (
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <div style={{ color: "#7a9bcc", fontSize: 14, fontWeight: 500 }}>Getting your recommendation…</div>
        </div>
      );
    }
    if (scoreError) {
      return (
        <div style={{ padding: "24px 20px", textAlign: "center" }}>
          <div style={{ color: "#f87171", fontSize: 13, fontWeight: 600 }}>{scoreError}</div>
        </div>
      );
    }
    if (!results || !best) return null;

    return (
      <div style={s.resultsSection}>
        <div style={{ ...s.bestCardWrapper, boxShadow: `0 0 20px rgba(201,168,76,0.6),0 8px 32px ${GOLD}22` }}>
          <div style={s.bestCardGlow} />
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${GOLD}22`, borderRadius: 6, padding: "4px 10px", marginBottom: 12 }}>
            <span style={{ color: GOLD, fontSize: 10, fontWeight: 800, letterSpacing: 1.5 }}>★ BEST CARD FOR THIS PAYMENT</span>
          </div>
          <div style={s.bestCardBank}>{best.bank_name}</div>
          <div style={s.bestCardName}>{best.card_name}</div>
          <div style={s.savingsRow}>
            <span style={{ ...s.savingsLabel, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: "#4ade80", fontSize: 16 }}>✓</span> You save
            </span>
            <span style={{ ...s.savingsAmount, fontSize: "2rem" }}>{formatRupee(best.rupee_value)}</span>
          </div>
          <div style={s.breakdownBox}>
            <div style={s.breakdownRow}><span style={s.breakdownKey}>Base Reward</span><span style={s.breakdownVal}>{formatRupee(best.base_rupee_value)}</span></div>
            {best.applied_offer && (
              <>
                <div style={s.breakdownDivider} />
                <div style={s.breakdownRow}><span style={s.breakdownKey}>Active Offer</span><span style={{ ...s.breakdownVal, color: GOLD }}>+{formatRupee(best.applied_offer.offer_value)}</span></div>
              </>
            )}
            <div style={s.breakdownDivider} />
            <div style={s.breakdownRow}><span style={{ ...s.breakdownKey, fontWeight: 700, color: "#fff" }}>Total Value</span><span style={{ ...s.breakdownVal, color: "#4ade80", fontSize: 14 }}>{formatRupee(best.rupee_value)}</span></div>
          </div>
          {best.value_comparison?.message && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#7a9bcc", lineHeight: 1.5 }}>{best.value_comparison.message}</div>
          )}
          {best.applied_offer && (
            <div style={{ marginTop: 6, fontSize: 10, color: "#4a6a9a", fontStyle: "italic" }}>
              Offers subject to change. Confirm availability with merchant or bank at time of payment.
            </div>
          )}
          <button style={{ ...s.btn, marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handlePay}>
            Pay with this Card →
          </button>
        </div>
        {rest.length > 0 && (
          <>
            <div style={s.otherCardsLabel}>Other Cards</div>
            {rest.map((r) => (
              <div key={r.card_id} style={s.otherCard}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={s.otherCardRank}>#{r.rank} · {r.bank_name}</span>
                  <span style={s.otherCardName}>{r.card_name}</span>
                  {r.rupee_loss_vs_best > 0 && <span style={s.otherCardLoss}>{formatRupee(r.rupee_loss_vs_best)} less than best</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                  <span style={s.otherCardTotal}>{formatRupee(r.rupee_value)}</span>
                  <span style={s.otherCardTotalLabel}>total value</span>
                </div>
              </div>
            ))}
          </>
        )}
        <div style={{ marginTop: 14, fontSize: 11, color: "#4a6a9a", textAlign: "center", lineHeight: 1.5 }}>
          {disclaimer || DEFAULT_DISCLAIMER}
        </div>
        {lastUpdated && (
          <div style={{ marginTop: 4, fontSize: 9, color: "#3a5a8a", textAlign: "center" }}>
            Last updated: {new Date(lastUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        )}
      </div>
    );
  };

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
                onClick={() => setScanState("camera")}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: `${GOLD}10`, border: `2px dashed ${GOLD_DIM}`, borderRadius: 14, padding: "28px 16px", cursor: "pointer", transition: "all 0.2s" }}
              >
                <div style={{ color: GOLD }}><QRIcon /></div>
                <span style={{ color: GOLD, fontSize: 14, fontWeight: 800 }}>Tap to Scan &amp; Pay</span>
                <span style={{ color: "#7a9bcc", fontSize: 11 }}>Opens rear camera · reads UPI QR codes</span>
              </div>

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

    // ── Personal UPI transfer screen ────────────────────────────────────────
    if (scannedIsPersonal) {
      return (
        <>
          <Header />
          <div style={s.scrollArea}>
            <div style={s.section}>
              <div style={s.sectionLabel}>📷 Scan &amp; Pay</div>
              <div style={s.formCard}>

                {/* Personal summary card */}
                <div style={{ background: "#0d1f10", border: "1px solid #4ade8044", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  <span style={{ color: "#4ade80", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>✓ Personal UPI Detected</span>
                  <div>
                    <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, lineHeight: 1.2, marginBottom: 4 }}>{scannedName}</div>
                    <div style={{ color: "#7a9bcc", fontSize: 11, fontFamily: "monospace", letterSpacing: 0.3 }}>{scannedVpa}</div>
                  </div>
                  {scannedBank && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 10, color: "#7a9bcc", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 1 }}>Bank</span>
                      <span style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 600 }}>{scannedBank}</span>
                    </div>
                  )}
                </div>

                {/* Warning note */}
                <div style={{ background: "#1f1200", border: "1px solid #f59e0b44", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                  <div style={{ color: "#fbbf24", fontSize: 12, lineHeight: 1.7 }}>
                    <strong>This is a personal transfer, not a merchant payment.</strong><br />
                    Most credit cards do <em>not</em> earn rewards on UPI person-to-person transfers.<br />
                    You can still check which card to use if your bank supports UPI credit card payments.
                  </div>
                </div>

                {/* Category — locked to Personal Transfer */}
                <div style={s.fieldWrapper}>
                  <label style={s.fieldLabel}>Category</label>
                  <div style={{ background: "#1a1f2e", border: "1px solid #2a3f58", borderRadius: 10, padding: "11px 14px", color: "#7a9bcc", fontSize: 14, fontWeight: 600 }}>
                    Personal Transfer
                  </div>
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
                  style={{ ...s.btn, background: "linear-gradient(135deg,#1e3a5f,#2563eb)", boxShadow: "0 6px 20px #2563eb44", transform: pressing ? "scale(0.97)" : "scale(1)" }}
                  onMouseDown={() => setPressing(true)}
                  onMouseUp={() => { setPressing(false); handleConfirmScore(); }}
                  onMouseLeave={() => setPressing(false)}
                  onTouchStart={() => setPressing(true)}
                  onTouchEnd={() => { setPressing(false); handleConfirmScore(); }}
                >
                  Check Best Card Anyway →
                </button>
                <div style={{ fontSize: 10, color: "#4a6a9a", fontStyle: "italic", textAlign: "center", lineHeight: 1.5, padding: "0 8px" }}>
                  {INFO_DISCLAIMER}
                </div>

                <button
                  onClick={handleDone}
                  style={{ background: "transparent", border: "none", color: "#7a9bcc", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textDecorationColor: "#3a5a8a", alignSelf: "center" as const }}
                >
                  Cancel
                </button>
              </div>
            </div>
            <ResultsBlock />
          </div>
        </>
      );
    }

    // ── Merchant QR confirm screen ───────────────────────────────────────────

    // Type badge colours
    const typeBadgeColour: Record<string, string> = {
      UPI: "#3b82f6", PAYTM: "#06b6d4", PHONEPE: "#8b5cf6",
      BHARATQR: "#f59e0b", EMV: "#64748b", URL: "#10b981", VPA: "#3b82f6", UNKNOWN: "#64748b",
    };
    const typeBadgeBg = (typeBadgeColour[scannedType] ?? "#64748b") + "22";
    const typeBadgeFg =  typeBadgeColour[scannedType] ?? "#64748b";

    return (
      <>
        <Header />
        <div style={s.scrollArea}>
          <div style={s.section}>
            <div style={s.sectionLabel}>📷 Scan &amp; Pay</div>
            <div style={s.formCard}>

              {/* Scanned summary card */}
              <div style={{ background: "#0a2010", border: "1px solid #22c55e44", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column" as const, gap: 6 }}>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "#4ade80", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>✓ QR Scanned Successfully</span>
                  <span style={{ background: typeBadgeBg, color: typeBadgeFg, fontSize: 9, fontWeight: 800, letterSpacing: 1, padding: "3px 8px", borderRadius: 20, border: `1px solid ${typeBadgeFg}44` }}>
                    {scannedType}
                  </span>
                </div>

                {/* Merchant name — large, clean */}
                <div style={{ color: "#ffffff", fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
                  {scannedName}
                </div>

                {/* City — only if present */}
                {scannedCity ? (
                  <div style={{ color: "#7a9bcc", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 11 }}>📍</span> {scannedCity}
                  </div>
                ) : null}
              </div>

              {/* URL payment link note */}
              {scannedIsUrl && (
                <div style={{ background: "#0f1f35", border: "1px solid #10b98144", borderRadius: 10, padding: "10px 14px", color: "#7dd3c8", fontSize: 12, lineHeight: 1.6 }}>
                  💳 This is a payment link. Select your spending category and enter the amount to get your card recommendation.
                </div>
              )}

              {/* Category */}
              <div style={s.fieldWrapper}>
                <label style={s.fieldLabel}>
                  Category{" "}
                  {detectedCat
                    ? <span style={{ color: "#4ade80", fontWeight: 700 }}>✓ Auto-detected</span>
                    : <span style={{ color: "#f97316" }}>— please select</span>
                  }
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
                Find Best Card →
              </button>
              <div style={{ fontSize: 10, color: "#4a6a9a", fontStyle: "italic", textAlign: "center", lineHeight: 1.5, padding: "0 8px" }}>
                {INFO_DISCLAIMER}
              </div>

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
            <div style={{ fontSize: 10, color: "#4a6a9a", fontStyle: "italic", textAlign: "center", lineHeight: 1.5, padding: "0 8px" }}>
              {INFO_DISCLAIMER}
            </div>

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

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [onboarded, setOnboarded] = useState<boolean>(
    () => typeof window !== "undefined" && !!getToken()
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
