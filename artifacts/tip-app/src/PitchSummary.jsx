const NAVY      = "#0D1A2E";
const NAVY_CARD = "#112240";
const NAVY_DARK = "#060d1a";
const NAVY_MID  = "#1a2f50";
const GOLD      = "#C9A84C";
const GOLD_LIGHT = "#e0c06a";
const GOLD_DIM  = "#8a6f32";

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  // Typography
  label:   { fontSize: 9,  fontWeight: 800, letterSpacing: 2,   textTransform: "uppercase", color: GOLD_DIM },
  cap:     { fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" },
  body:    { fontSize: 14, fontWeight: 400, lineHeight: 1.7, color: "#a8c4e0" },
  strong:  { fontWeight: 700, color: "#c8daf0" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Section({ children, style }) {
  return <div style={{ padding: "0 20px", ...style }}>{children}</div>;
}

function Divider() {
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(90deg, transparent, ${NAVY_MID}, transparent)`,
      margin: "4px 20px",
    }} />
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      ...T.label,
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}>
      <span style={{
        display: "inline-block", width: 18, height: 1.5,
        background: GOLD_DIM, borderRadius: 99,
      }} />
      {children}
      <span style={{
        display: "inline-block", flex: 1, height: 1,
        background: `linear-gradient(90deg, ${GOLD_DIM}44, transparent)`,
        borderRadius: 99,
      }} />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  page: {
    background: NAVY,
    minHeight: "100%",
    paddingBottom: 100,
    fontFamily: "'Inter', sans-serif",
  },

  // ── Header
  header: {
    padding: "28px 20px 22px",
    borderBottom: `1px solid ${NAVY_MID}`,
    background: `linear-gradient(180deg, ${NAVY_DARK} 0%, ${NAVY} 100%)`,
    position: "relative",
    overflow: "hidden",
  },
  headerGlow: {
    position: "absolute",
    top: -60, right: -60,
    width: 200, height: 200,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${GOLD}14 0%, transparent 65%)`,
    pointerEvents: "none",
  },
  headerEyebrow: {
    ...T.label,
    color: GOLD_DIM,
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  eyebrowDot: {
    width: 5, height: 5, borderRadius: "50%",
    background: GOLD, flexShrink: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "-0.5px",
    lineHeight: 1.15,
    marginBottom: 6,
  },
  titleGold: { color: GOLD },
  headerTagline: {
    fontSize: 13,
    color: "#7a9bcc",
    fontWeight: 500,
    fontStyle: "italic",
    marginBottom: 14,
  },
  headerBadgeRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  badge: (bg, col) => ({
    background: bg,
    border: `1px solid ${col}44`,
    borderRadius: 6,
    padding: "3px 9px",
    fontSize: 10,
    fontWeight: 700,
    color: col,
    letterSpacing: 0.4,
  }),

  // ── Problem card
  problemCard: {
    background: "#1a0a0a",
    border: `1.5px solid #f8717144`,
    borderRadius: 14,
    padding: "16px 18px",
    position: "relative",
    overflow: "hidden",
  },
  problemAccent: {
    position: "absolute",
    top: 0, left: 0,
    width: "100%", height: 3,
    background: "linear-gradient(90deg, #f87171, #ef4444)",
    borderRadius: "14px 14px 0 0",
  },
  problemHeading: {
    fontSize: 11,
    fontWeight: 800,
    color: "#f87171",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  problemText: {
    fontSize: 14,
    color: "#e8baba",
    lineHeight: 1.7,
    fontWeight: 400,
  },
  problemHighlight: {
    fontWeight: 800,
    color: "#fca5a5",
  },

  // ── Solution card
  solutionCard: {
    background: `${GOLD}08`,
    border: `1.5px solid ${GOLD}55`,
    borderRadius: 14,
    padding: "16px 18px",
    position: "relative",
    overflow: "hidden",
  },
  solutionAccent: {
    position: "absolute",
    top: 0, left: 0,
    width: "100%", height: 3,
    background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`,
    borderRadius: "14px 14px 0 0",
  },
  solutionHeading: {
    fontSize: 11,
    fontWeight: 800,
    color: GOLD,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  solutionText: {
    fontSize: 14,
    color: "#c8d8a0",
    lineHeight: 1.7,
    fontWeight: 400,
  },
  solutionHighlight: {
    fontWeight: 700,
    color: GOLD_LIGHT,
  },

  // ── Traction
  tractionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  tractionBox: {
    background: NAVY_CARD,
    border: `1px solid ${GOLD}2a`,
    borderRadius: 12,
    padding: "14px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
    position: "relative",
    overflow: "hidden",
  },
  tractionAccentLine: {
    position: "absolute",
    bottom: 0, left: 0,
    width: "100%", height: 2,
    background: `linear-gradient(90deg, ${GOLD}88, transparent)`,
  },
  tractionValue: {
    fontSize: 26,
    fontWeight: 900,
    color: GOLD,
    letterSpacing: "-0.5px",
    lineHeight: 1,
  },
  tractionLabel: {
    fontSize: 11,
    color: "#7a9bcc",
    fontWeight: 500,
    lineHeight: 1.3,
  },

  // ── Market
  marketText: {
    fontSize: 14,
    color: "#a8c4e0",
    lineHeight: 1.75,
    fontWeight: 400,
  },
  marketHighlight: {
    fontWeight: 700,
    color: "#c8daf0",
  },
  marketGold: {
    fontWeight: 700,
    color: GOLD_LIGHT,
  },

  // ── Revenue bullets
  bulletList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  bullet: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  },
  bulletDot: {
    width: 7, height: 7,
    borderRadius: "50%",
    background: GOLD,
    flexShrink: 0,
    marginTop: 6,
    boxShadow: `0 0 6px ${GOLD}88`,
  },
  bulletText: {
    fontSize: 14,
    color: "#a8c4e0",
    lineHeight: 1.6,
    fontWeight: 400,
  },
  bulletStrong: {
    fontWeight: 700,
    color: "#c8daf0",
  },

  // ── The Ask
  askBox: {
    background: `${GOLD}0c`,
    border: `2px solid ${GOLD}77`,
    borderRadius: 16,
    padding: "18px 18px",
    position: "relative",
    overflow: "hidden",
  },
  askGlow: {
    position: "absolute",
    top: -30, right: -30,
    width: 120, height: 120,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${GOLD}1a 0%, transparent 65%)`,
    pointerEvents: "none",
  },
  askEyebrow: {
    fontSize: 10,
    fontWeight: 800,
    color: GOLD_DIM,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  askAmount: {
    fontSize: 32,
    fontWeight: 900,
    color: GOLD,
    letterSpacing: "-1px",
    lineHeight: 1,
    marginBottom: 10,
  },
  askAmountSub: {
    fontSize: 13,
    fontWeight: 600,
    color: GOLD_DIM,
    marginLeft: 4,
    letterSpacing: 0,
  },
  askText: {
    fontSize: 13,
    color: "#b0c8a0",
    lineHeight: 1.65,
    fontWeight: 400,
  },
  askMilestones: {
    marginTop: 14,
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  askMilestone: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  askCheck: {
    width: 18, height: 18,
    borderRadius: 5,
    background: `${GOLD}22`,
    border: `1px solid ${GOLD}55`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    flexShrink: 0,
  },
  askMilestoneText: {
    fontSize: 12,
    color: "#a8c0a0",
    fontWeight: 500,
  },

  // ── Footer
  footer: {
    padding: "20px 20px 0",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  footerDivider: {
    height: 1,
    background: `linear-gradient(90deg, transparent, ${NAVY_MID}, transparent)`,
    marginBottom: 4,
  },
  footerBuiltBy: {
    fontSize: 12,
    color: "#4a6a9a",
    fontWeight: 500,
    textAlign: "center",
    lineHeight: 1.6,
  },
  footerEmail: {
    color: GOLD_DIM,
    fontWeight: 700,
  },
  pitchBtn: {
    width: "100%",
    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
    color: NAVY,
    border: "none",
    borderRadius: 14,
    padding: "16px",
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
    letterSpacing: 0.4,
    boxShadow: `0 6px 24px ${GOLD}44`,
  },
  footerNote: {
    fontSize: 10,
    color: "#2a4a6a",
    textAlign: "center",
    letterSpacing: 0.3,
    fontWeight: 500,
  },
};

// ─── PitchSummary ─────────────────────────────────────────────────────────────

const TRACTION = [
  { value: "8",     label: "Cards supported\nat launch" },
  { value: "₹409",  label: "Avg saving per\ntransaction" },
  { value: "₹1,800", label: "Avg monthly saving\nper user" },
  { value: "80M+",  label: "Target market\nsize" },
];

const BULLETS = [
  {
    bold: "Affiliate commissions",
    rest: " from partner merchant transactions at point of recommendation",
  },
  {
    bold: "Premium subscription",
    rest: " for power users — unlimited cards, custom milestones, alerts",
  },
  {
    bold: "Anonymised spend analytics",
    rest: " licensed to banks and card issuers for portfolio intelligence",
  },
];

const ASK_MILESTONES = [
  "Live bank API integrations for real-time offer data",
  "Grow to 50,000 active users in 12 months",
  "Prove the ₹1,800/month saving metric at scale",
];

export default function PitchSummary() {
  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div style={s.headerGlow} />
        <div style={s.headerEyebrow}>
          <span style={s.eyebrowDot} />
          <span>Investor Summary · Seed Round · Confidential</span>
        </div>
        <div style={s.headerTitle}>
          <span style={s.titleGold}>TIP</span> — Your Financial Mitra
        </div>
        <div style={s.headerTagline}>"Spending se pehle TIP dekha kya?"</div>
        <div style={s.headerBadgeRow}>
          <span style={s.badge(`${GOLD}14`, GOLD)}>FinTech · India</span>
          <span style={s.badge("#14200a", "#86c060")}>Pre-Revenue</span>
          <span style={s.badge("#1a0a24", "#b08cdc")}>Raising ₹2Cr Seed</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 20 }}>

        {/* Problem */}
        <Section>
          <SectionLabel>The Problem</SectionLabel>
          <div style={s.problemCard}>
            <div style={s.problemAccent} />
            <div style={s.problemHeading}>
              <span>⚠</span> A ₹40,000 mistake. Every year.
            </div>
            <p style={{ ...s.problemText, margin: 0 }}>
              <span style={s.problemHighlight}>80 million</span> Indian credit card holders
              lose <span style={s.problemHighlight}>₹15,000–₹40,000 annually</span> using
              the wrong card at the wrong moment — missing cashback windows, ignoring
              active offers, and letting milestone rewards expire.{" "}
              <span style={s.problemHighlight}>No app solves this today.</span>
            </p>
          </div>
        </Section>

        <Divider />

        {/* Solution */}
        <Section>
          <SectionLabel>The Solution</SectionLabel>
          <div style={s.solutionCard}>
            <div style={s.solutionAccent} />
            <div style={s.solutionHeading}>
              <span>⚡</span> Real-time payment intelligence
            </div>
            <p style={{ ...s.solutionText, margin: 0 }}>
              TIP's <span style={s.solutionHighlight}>AI recommendation engine</span> analyses
              every payment in real time — combining cashback rates, active bank offers,
              milestone progress and reward point value — to surface the{" "}
              <span style={s.solutionHighlight}>single best card</span> for that exact
              transaction, with the saving quantified in rupees.
            </p>
          </div>
        </Section>

        <Divider />

        {/* Traction */}
        <Section>
          <SectionLabel>Traction &amp; Metrics</SectionLabel>
          <div style={s.tractionGrid}>
            {TRACTION.map(({ value, label }) => (
              <div key={value} style={s.tractionBox}>
                <div style={s.tractionAccentLine} />
                <span style={s.tractionValue}>{value}</span>
                <span style={s.tractionLabel}>{label}</span>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* Market */}
        <Section>
          <SectionLabel>The Market</SectionLabel>
          <p style={{ ...s.marketText, margin: 0 }}>
            India's credit card base is growing at{" "}
            <span style={s.marketHighlight}>25% YoY</span>, crossing 100M cards in 2024.
            CRED — the closest comparable — is valued at{" "}
            <span style={s.marketGold}>$6 billion</span> with 13M users and zero
            payment-time intelligence. TIP targets{" "}
            <span style={s.marketHighlight}>the recommendation layer no one has built</span>:
            the moment between intent and tap.
          </p>
        </Section>

        <Divider />

        {/* Revenue model */}
        <Section>
          <SectionLabel>Revenue Model</SectionLabel>
          <div style={s.bulletList}>
            {BULLETS.map(({ bold, rest }, i) => (
              <div key={i} style={s.bullet}>
                <div style={s.bulletDot} />
                <span style={s.bulletText}>
                  <span style={s.bulletStrong}>{bold}</span>{rest}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* The Ask */}
        <Section>
          <SectionLabel>The Ask</SectionLabel>
          <div style={s.askBox}>
            <div style={s.askGlow} />
            <div style={s.askEyebrow}>
              <span>💰</span> Seed Round
            </div>
            <div style={s.askAmount}>
              ₹2 Cr
              <span style={s.askAmountSub}>seed</span>
            </div>
            <p style={{ ...s.askText, margin: 0 }}>
              Capital will be deployed to build live bank API integrations for real-time
              offer ingestion, grow the user base to 50,000 active users, and validate the
              savings metric at scale — setting up a Series A on proven retention and revenue.
            </p>
            <div style={s.askMilestones}>
              {ASK_MILESTONES.map((m, i) => (
                <div key={i} style={s.askMilestone}>
                  <div style={s.askCheck}>✓</div>
                  <span style={s.askMilestoneText}>{m}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div style={s.footer}>
          <div style={s.footerDivider} />
          <p style={{ ...s.footerBuiltBy, margin: 0 }}>
            Built by <strong style={{ color: "#c8daf0" }}>Tarun</strong>
            {" · "}
            <span style={s.footerEmail}>tarun@tipapp.in</span>
          </p>
          <button style={s.pitchBtn}>
            📩 Request Full Pitch Deck
          </button>
          <p style={{ ...s.footerNote, margin: 0 }}>
            This document is confidential and intended for accredited investors only.
          </p>
        </div>

      </div>
    </div>
  );
}
