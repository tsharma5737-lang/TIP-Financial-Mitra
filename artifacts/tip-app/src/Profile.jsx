import { useState, useEffect } from "react";
import { getUser, clearToken, clearUser } from "./lib/apiClient";
import PitchSummary from "./PitchSummary.jsx";

const NAVY      = "#0D1A2E";
const NAVY_CARD = "#112240";
const GOLD      = "#C9A84C";
const GOLD_LIGHT = "#e0c06a";
const GOLD_DIM  = "#8a6f32";
const RED       = "#C0392B";

const WEBSITE_URL = "https://creafintech.com";
const TAP_THRESHOLD = 5;
const TAP_WINDOW_MS = 2500;

const TIER_LABELS = {
  free: "Free",
  standard: "Standard",
  premium: "Premium",
};

const s = {
  page: { background: NAVY, minHeight: "100%", paddingBottom: 96, fontFamily: "'Inter', sans-serif" },
  header: {
    background: `linear-gradient(135deg, ${NAVY} 0%, #0a1628 100%)`,
    padding: "28px 20px 24px", borderBottom: `1px solid ${GOLD_DIM}33`,
    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
  },
  avatarRing: {
    width: 64, height: 64, borderRadius: "50%",
    background: `${GOLD}18`, border: `1.5px solid ${GOLD}55`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 24, fontWeight: 900, color: GOLD, marginBottom: 12,
    cursor: "pointer", userSelect: "none",
  },
  name: { fontSize: 18, fontWeight: 800, color: "#fff" },
  mobile: { fontSize: 12, color: "#7a9bcc", marginTop: 3 },
  tierBadge: {
    marginTop: 10, background: `${GOLD}18`, border: `1px solid ${GOLD}44`,
    borderRadius: 99, padding: "3px 12px", fontSize: 10, fontWeight: 700,
    color: GOLD, letterSpacing: 0.5, textTransform: "uppercase",
  },

  section: { padding: "16px 16px 0" },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },

  infoCard: { background: NAVY_CARD, border: "1px solid #1e3a6a", borderRadius: 14, overflow: "hidden" },
  infoRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 16px", borderBottom: "1px solid #1a2f50",
  },
  infoRowLast: { borderBottom: "none" },
  infoLabel: { fontSize: 12, color: "#7a9bcc", fontWeight: 500 },
  infoValue: { fontSize: 13, color: "#fff", fontWeight: 600, textAlign: "right" },
  infoValueMuted: { fontSize: 12, color: "#4a6a9a", fontWeight: 500, fontStyle: "italic" },

  referralCard: {
    background: `${GOLD}0a`, border: `1px solid ${GOLD}33`, borderRadius: 14,
    padding: "14px 16px", display: "flex", gap: 10, alignItems: "flex-start",
  },
  referralIcon: { fontSize: 18, flexShrink: 0 },
  referralText: { fontSize: 12, color: "#b0c8e8", lineHeight: 1.5, fontWeight: 500 },

  aboutLink: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: NAVY_CARD, border: "1px solid #1e3a6a", borderRadius: 14,
    padding: "14px 16px", textDecoration: "none", cursor: "pointer",
  },
  aboutLinkText: { fontSize: 13, color: "#c8daf0", fontWeight: 600 },
  aboutLinkArrow: { fontSize: 14, color: GOLD_DIM },

  logoutBtn: {
    width: "100%", background: "transparent", border: `1.5px solid ${RED}55`,
    borderRadius: 12, padding: "13px", color: RED, fontSize: 14, fontWeight: 700,
    cursor: "pointer", letterSpacing: 0.3, fontFamily: "inherit",
  },

  statusCard: { background: NAVY_CARD, border: "1px solid #1e3a6a", borderRadius: 14, overflow: "hidden" },
  statusRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 16px", borderBottom: "1px solid #1a2f50",
  },
  statusLeft: { display: "flex", flexDirection: "column", gap: 2 },
  statusLabel: { fontSize: 13, color: "#fff", fontWeight: 600 },
  statusSub: { fontSize: 11, color: "#4a6a9a", fontWeight: 500 },
  statusPillActive: { fontSize: 10, fontWeight: 700, color: "#4ade80", background: "#4ade8018", border: "1px solid #4ade8044", borderRadius: 99, padding: "4px 10px", letterSpacing: 0.3 },
  statusPillSoon: { fontSize: 10, fontWeight: 700, color: GOLD, background: `${GOLD}18`, border: `1px solid ${GOLD}44`, borderRadius: 99, padding: "4px 10px", letterSpacing: 0.3, whiteSpace: "nowrap" },

  footerNote: { fontSize: 10, color: "#3a5a8a", textAlign: "center", padding: "18px 24px 0", lineHeight: 1.6 },
};

export default function Profile({ onLogout }) {
  const [user, setUserState] = useState(null);
  const [tapCount, setTapCount] = useState(0);
  const [showPitch, setShowPitch] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    setUserState(getUser());
  }, []);

  useEffect(() => {
    if (tapCount === 0) return;
    const timer = setTimeout(() => setTapCount(0), TAP_WINDOW_MS);
    if (tapCount >= TAP_THRESHOLD) {
      setShowPitch(true);
      setTapCount(0);
    }
    return () => clearTimeout(timer);
  }, [tapCount]);

  function handleLogoutClick() {
    if (!confirmLogout) {
      setConfirmLogout(true);
      return;
    }
    clearToken();
    clearUser();
    onLogout();
  }

  if (showPitch) {
    return (
      <div style={s.page}>
        <div style={{ padding: "16px 16px 0" }}>
          <button
            onClick={() => setShowPitch(false)}
            style={{ background: "transparent", border: "none", color: "#7a9bcc", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}
          >
            ← Back to profile
          </button>
        </div>
        <PitchSummary />
      </div>
    );
  }

  const name = user?.name;
  const mobile = user?.mobile;
  const email = user?.email;
  const tier = TIER_LABELS[user?.subscription_tier] || "Free";

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.avatarRing} onClick={() => setTapCount((c) => c + 1)}>
          {name ? name.charAt(0).toUpperCase() : "👤"}
        </div>
        <div style={s.name}>{name || "Welcome"}</div>
        <div style={s.mobile}>+91 {mobile || "—"}</div>
        <div style={s.tierBadge}>{tier} Plan</div>
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>Account Details</div>
        <div style={s.infoCard}>
          <div style={s.infoRow}>
            <span style={s.infoLabel}>Name</span>
            {name ? <span style={s.infoValue}>{name}</span> : <span style={s.infoValueMuted}>Not added yet</span>}
          </div>
          <div style={s.infoRow}>
            <span style={s.infoLabel}>Phone</span>
            <span style={s.infoValue}>+91 {mobile || "—"}</span>
          </div>
          <div style={{ ...s.infoRow, ...s.infoRowLast }}>
            <span style={s.infoLabel}>Email</span>
            {email ? <span style={s.infoValue}>{email}</span> : <span style={s.infoValueMuted}>Not added yet</span>}
          </div>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>Subscription</div>
        <div style={s.statusCard}>
          <div style={s.statusRow}>
            <div style={s.statusLeft}>
              <span style={s.statusLabel}>{tier} Plan</span>
              <span style={s.statusSub}>
                {user?.subscription_tier === "premium" || user?.subscription_tier === "standard"
                  ? "Active subscription"
                  : "Up to 2 cards, all features included"}
              </span>
            </div>
            <span style={s.statusPillSoon}>Upgrade — Coming Soon</span>
          </div>
          <div style={{ ...s.statusRow, borderBottom: "none" }}>
            <div style={s.statusLeft}>
              <span style={s.statusLabel}>Payments</span>
              <span style={s.statusSub}>Razorpay</span>
            </div>
            <span style={s.statusPillActive}>Active</span>
          </div>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>Bank Linking</div>
        <div style={s.statusCard}>
          <div style={{ ...s.statusRow, borderBottom: "none" }}>
            <div style={s.statusLeft}>
              <span style={s.statusLabel}>Account Aggregator</span>
              <span style={s.statusSub}>Auto-import cards, live point balances</span>
            </div>
            <span style={s.statusPillSoon}>Coming Soon</span>
          </div>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>Referral Program</div>
        <div style={s.referralCard}>
          <span style={s.referralIcon}>🎁</span>
          <span style={s.referralText}>
            Referral codes and rewards are coming soon — invite friends and earn benefits once this launches.
          </span>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.sectionTitle}>More</div>
        <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" style={s.aboutLink}>
          <span style={s.aboutLinkText}>About TIP</span>
          <span style={s.aboutLinkArrow}>↗</span>
        </a>
      </div>

      <div style={{ ...s.section, marginTop: 8 }}>
        <button style={s.logoutBtn} onClick={handleLogoutClick}>
          {confirmLogout ? "Tap again to confirm log out" : "Log Out"}
        </button>
      </div>

      <div style={s.footerNote}>
        Creafin Tech Private Limited · CIN: U62099DL2025PTC446652
      </div>
    </div>
  );
}
