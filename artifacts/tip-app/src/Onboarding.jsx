import { useState, useRef, useEffect } from "react";
import { requestOtp, verifyOtp, setToken, setUser } from "./lib/apiClient";

const NAVY      = "#0D1A2E";
const NAVY_CARD = "#112240";
const NAVY_DARK = "#060d1a";
const NAVY_MID  = "#1a2f50";
const GOLD      = "#C9A84C";
const GOLD_LIGHT = "#e0c06a";
const GOLD_DIM  = "#8a6f32";

// ─── Styles ───────────────────────────────────────────────────────────────────

const BASE = {
  fontFamily: "'Inter', sans-serif",
  background: NAVY,
  minHeight: "100dvh",
  maxWidth: 430,
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "hidden",
};

const s = {
  // Full-screen slide container
  slide: {
    ...BASE,
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px 40px",
  },

  // ── Slide 1 – Hero
  hero: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    paddingTop: 60,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 28,
    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 0 0 12px ${GOLD}22, 0 0 0 24px ${GOLD}0a`,
    marginBottom: 36,
  },
  logoMark: {
    fontSize: 38,
    fontWeight: 900,
    color: NAVY,
    letterSpacing: -2,
  },
  heroTagline: {
    fontSize: 24,
    fontWeight: 800,
    color: "#fff",
    textAlign: "center",
    lineHeight: 1.35,
    letterSpacing: "-0.3px",
    marginBottom: 14,
  },
  goldWord: { color: GOLD },
  heroSub: {
    fontSize: 14,
    color: "#7a9bcc",
    textAlign: "center",
    lineHeight: 1.6,
    maxWidth: 260,
    fontWeight: 500,
  },

  // ── Slide 2 & 3 – Feature slides
  featureSlide: {
    ...BASE,
    justifyContent: "space-between",
    padding: "0 0 40px",
  },
  featureTop: {
    width: "100%",
    padding: "56px 28px 0",
    display: "flex",
    flexDirection: "column",
  },
  featureSlideLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: GOLD_DIM,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  featureHeading: {
    fontSize: 28,
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1.2,
    letterSpacing: "-0.5px",
    marginBottom: 36,
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: "0 28px",
    width: "100%",
  },
  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    background: NAVY_CARD,
    border: `1px solid ${NAVY_MID}`,
    borderRadius: 14,
    padding: "14px 16px",
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: `${GOLD}18`,
    border: `1px solid ${GOLD}33`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: 17,
  },
  featureText: {
    fontSize: 14,
    color: "#c8daf0",
    lineHeight: 1.5,
    fontWeight: 500,
    paddingTop: 2,
  },
  featureBold: { color: "#fff", fontWeight: 700 },

  // ── Progress dots
  dots: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    justifyContent: "center",
  },
  dot: (active) => ({
    width: active ? 24 : 7,
    height: 7,
    borderRadius: 99,
    background: active ? GOLD : "#1e3a6a",
    transition: "all 0.3s ease",
  }),

  // ── Bottom action area
  bottomArea: {
    width: "100%",
    padding: "0 28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
  },
  goldBtn: {
    width: "100%",
    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
    color: NAVY,
    border: "none",
    borderRadius: 14,
    padding: "16px",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
    letterSpacing: 0.3,
    boxShadow: `0 6px 24px ${GOLD}44`,
    transition: "transform 0.1s, box-shadow 0.1s",
  },
  skipLink: {
    fontSize: 13,
    color: "#4a6a9a",
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: 0.3,
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
  },

  // ── Login screen
  loginPage: {
    ...BASE,
    justifyContent: "space-between",
    padding: "0 28px 40px",
  },
  loginTop: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: 70,
  },
  loginLogoRing: {
    width: 64,
    height: 64,
    borderRadius: 18,
    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 4px 20px ${GOLD}44`,
    marginBottom: 24,
  },
  loginLogoText: { fontSize: 22, fontWeight: 900, color: NAVY, letterSpacing: -1 },
  loginHeading: {
    fontSize: 26,
    fontWeight: 900,
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: "-0.3px",
  },
  loginSub: {
    fontSize: 13,
    color: "#7a9bcc",
    textAlign: "center",
    marginBottom: 40,
    fontWeight: 500,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#7a9bcc",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  phoneRow: {
    display: "flex",
    width: "100%",
    background: NAVY_CARD,
    border: `1.5px solid #1e3a6a`,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  prefix: {
    padding: "14px 14px",
    fontSize: 16,
    fontWeight: 700,
    color: GOLD,
    borderRight: `1px solid #1e3a6a`,
    background: `${GOLD}08`,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
  },
  phoneInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: 18,
    fontWeight: 700,
    padding: "14px 14px",
    letterSpacing: 1,
    width: "100%",
  },
  legalText: {
    fontSize: 11,
    color: "#3a5a8a",
    textAlign: "center",
    lineHeight: 1.6,
    fontWeight: 500,
    marginTop: 12,
  },
  legalLink: { color: "#4a7aaa", textDecoration: "underline", cursor: "pointer" },

  // ── OTP screen
  otpHeading: {
    fontSize: 22,
    fontWeight: 900,
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: "-0.3px",
  },
  otpSub: {
    fontSize: 13,
    color: "#7a9bcc",
    textAlign: "center",
    marginBottom: 36,
    lineHeight: 1.5,
    fontWeight: 500,
  },
  otpRow: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
    marginBottom: 24,
    width: "100%",
  },
  otpBox: (filled, focused) => ({
    width: 48,
    height: 56,
    background: NAVY_CARD,
    border: `2px solid ${focused ? GOLD : filled ? GOLD_DIM : "#1e3a6a"}`,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 900,
    color: filled ? GOLD_LIGHT : "#4a6a9a",
    transition: "border-color 0.2s",
    cursor: "text",
    boxShadow: focused ? `0 0 0 3px ${GOLD}22` : "none",
  }),
  resendRow: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginBottom: 0,
  },
  resendLabel: { fontSize: 12, color: "#4a6a9a", fontWeight: 500 },
  resendLink: { fontSize: 12, color: GOLD, fontWeight: 700, cursor: "pointer", letterSpacing: 0.2 },
};

// ─── Slide 1: Hero ────────────────────────────────────────────────────────────

function HeroSlide({ onNext }) {
  const [pressing, setPressing] = useState(false);
  return (
    <div style={s.slide}>
      <div style={s.hero}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: 280, height: 280, borderRadius: "50%",
          background: `radial-gradient(circle, ${GOLD}14 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={s.logoRing}>
          <span style={s.logoMark}>TIP</span>
        </div>

        <h1 style={s.heroTagline}>
          Spending se pehle<br />
          <span style={s.goldWord}>TIP dekha kya?</span>
        </h1>

        <p style={s.heroSub}>
          Your Financial Mitra — always pay with the right card
        </p>
      </div>

      <div style={s.bottomArea}>
        <button
          style={{
            ...s.goldBtn,
            transform: pressing ? "scale(0.97)" : "scale(1)",
            boxShadow: pressing ? `0 2px 8px ${GOLD}33` : `0 6px 24px ${GOLD}44`,
          }}
          onMouseDown={() => setPressing(true)}
          onMouseUp={() => { setPressing(false); onNext(); }}
          onMouseLeave={() => setPressing(false)}
          onTouchStart={() => setPressing(true)}
          onTouchEnd={() => { setPressing(false); onNext(); }}
        >
          Get Started →
        </button>
      </div>
    </div>
  );
}

// ─── Slides 2 & 3: Feature ────────────────────────────────────────────────────

const FEATURE_SLIDES = [
  {
    label: "Step 1 of 2",
    heading: "Your Mitra knows every\ncard's superpower",
    items: [
      { icon: "★", bold: "Real-time recommendation", rest: " at every single payment" },
      { icon: "₹", bold: "Savings in actual rupees,", rest: " not vague percentages" },
      { icon: "⚡", bold: "Bank offers + milestones", rest: " combined into one score" },
    ],
  },
  {
    label: "Step 2 of 2",
    heading: "Your money, your Mitra,\nfully optimised",
    items: [
      { icon: "📊", bold: "Track savings and losses", rest: " across all your cards" },
      { icon: "🎯", bold: "Never miss a milestone", rest: " or an expiring reward" },
      { icon: "💳", bold: "8 major Indian cards", rest: " supported at launch" },
    ],
  },
];

function FeatureSlide({ slideIndex, totalSlides, onNext, onSkip }) {
  const [pressing, setPressing] = useState(false);
  const data = FEATURE_SLIDES[slideIndex];

  return (
    <div style={s.featureSlide}>
      <div style={s.featureTop}>
        <span style={s.featureSlideLabel}>{data.label}</span>
        <h2 style={s.featureHeading}>
          {data.heading.split("\n").map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </h2>
      </div>

      <div style={s.featureList}>
        {data.items.map((item, i) => (
          <div key={i} style={s.featureItem}>
            <div style={s.featureIconBox}>{item.icon}</div>
            <span style={s.featureText}>
              <span style={s.featureBold}>{item.bold}</span>
              {item.rest}
            </span>
          </div>
        ))}
      </div>

      {/* Progress dots */}
      <div style={s.dots}>
        {[0, 1].map((i) => (
          <div key={i} style={s.dot(i === slideIndex)} />
        ))}
      </div>

      <div style={s.bottomArea}>
        <button
          style={{
            ...s.goldBtn,
            transform: pressing ? "scale(0.97)" : "scale(1)",
            boxShadow: pressing ? `0 2px 8px ${GOLD}33` : `0 6px 24px ${GOLD}44`,
          }}
          onMouseDown={() => setPressing(true)}
          onMouseUp={() => { setPressing(false); onNext(); }}
          onMouseLeave={() => setPressing(false)}
          onTouchStart={() => setPressing(true)}
          onTouchEnd={() => { setPressing(false); onNext(); }}
        >
          {slideIndex === 1 ? "Continue →" : "Next →"}
        </button>
        <span style={s.skipLink} onClick={onSkip}>Skip</span>
      </div>
    </div>
  );
}

// ─── OTP digit boxes ──────────────────────────────────────────────────────────
// Single hidden real input captures mobile keyboard; visual boxes are overlays.

function OtpInputs({ value, onChange, shaking }) {
  const hiddenRef = useRef(null);
  const [focused, setFocused] = useState(false);

  // Which box is the "active" cursor position
  const cursorPos = Math.min(value.length, 5);

  function focusHidden() {
    hiddenRef.current?.focus();
  }

  function handleChange(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    onChange(raw);
  }

  return (
    <div
      style={{
        ...s.otpRow,
        animation: shaking ? "shake 0.4s ease" : "none",
        position: "relative",
      }}
      onClick={focusHidden}
    >
      {/* Hidden real input — mobile keyboards type here */}
      <input
        ref={hiddenRef}
        type="tel"
        inputMode="numeric"
        maxLength={6}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          position: "absolute",
          opacity: 0,
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          cursor: "default",
          zIndex: 1,
        }}
        autoComplete="one-time-code"
      />

      {/* Visual digit boxes */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={s.otpBox(!!value[i], focused && cursorPos === i)}
        >
          {value[i] || ""}
        </div>
      ))}
    </div>
  );
}

// ─── Login screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onVerified }) {
  const [phase, setPhase] = useState("phone"); // "phone" | "otp"
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [pressing, setPressing] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function shake() {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  }

  async function handleSendOtp() {
    if (loading) return;
    if (phone.replace(/\D/g, "").length < 10) { shake(); return; }
    setErrorMsg("");
    setLoading(true);
    try {
      const response = await requestOtp(phone);
      setPhase("otp");
      setOtp("");
      if (response?.dev_otp) {
        setDevOtp(response.dev_otp);
        setOtp(response.dev_otp); // auto-fill for smooth testing - person can still edit if needed
      } else {
        setDevOtp("");
      }
    } catch (err) {
      setErrorMsg(err?.message || "Could not send OTP. Please try again.");
      shake();
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (loading) return;
    if (otp.length < 6) { shake(); return; }
    setErrorMsg("");
    setLoading(true);
    try {
      const response = await verifyOtp(phone, otp);
      if (response?.token) {
        setToken(response.token);
      }
      if (response?.user) {
        setUser(response.user);
      }
      onVerified();
    } catch (err) {
      setErrorMsg(err?.message || "Incorrect OTP. Please try again.");
      shake();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.loginPage}>
      <div style={s.loginTop}>
        <div style={s.loginLogoRing}>
          <span style={s.loginLogoText}>TIP</span>
        </div>

        {phase === "phone" ? (
          <>
            <h2 style={s.loginHeading}>Welcome to TIP</h2>
            <p style={s.loginSub}>Enter your mobile number to get started</p>

            <span style={{ ...s.inputLabel, width: "100%" }}>Mobile number</span>
            <div
              style={{
                ...s.phoneRow,
                borderColor: shaking ? "#f87171" : "#1e3a6a",
                animation: shaking ? "shake 0.4s ease" : "none",
              }}
            >
              <span style={s.prefix}>+91</span>
              <input
                type="tel"
                maxLength={10}
                inputMode="numeric"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                style={s.phoneInput}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              />
            </div>
          </>
        ) : (
          <>
            <h2 style={s.otpHeading}>Enter OTP</h2>
            <p style={s.otpSub}>
              We sent a 6-digit code to<br />
              <strong style={{ color: "#fff" }}>+91 {phone}</strong>
            </p>

            {devOtp && (
              <div style={{
                background: "#f97316", color: "#1a0f00", fontSize: 11, fontWeight: 700,
                borderRadius: 8, padding: "6px 12px", textAlign: "center", marginBottom: 12,
              }}>
                TESTING MODE — code auto-filled below ({devOtp})
              </div>
            )}

            <OtpInputs value={otp} onChange={setOtp} shaking={shaking} />

            <div style={s.resendRow}>
              <span style={s.resendLabel}>Didn't receive it?</span>
              <span style={s.resendLink} onClick={() => { setOtp(""); handleSendOtp(); }}>Resend OTP</span>
            </div>
          </>
        )}

        {errorMsg && (
          <p style={{ color: "#f87171", fontSize: 12, textAlign: "center", marginTop: 14, fontWeight: 600 }}>
            {errorMsg}
          </p>
        )}
      </div>

      {/* Bottom action */}
      <div style={{ ...s.bottomArea, gap: 10 }}>
        <button
          disabled={loading}
          style={{
            ...s.goldBtn,
            opacity: loading ? 0.7 : 1,
            transform: pressing ? "scale(0.97)" : "scale(1)",
            boxShadow: pressing
              ? `0 2px 8px ${GOLD}33`
              : shaking
              ? `0 0 0 3px #f8717166, 0 6px 24px ${GOLD}44`
              : `0 6px 24px ${GOLD}44`,
          }}
          onMouseDown={() => setPressing(true)}
          onMouseUp={() => { setPressing(false); phase === "phone" ? handleSendOtp() : handleVerify(); }}
          onMouseLeave={() => setPressing(false)}
          onTouchStart={() => setPressing(true)}
          onTouchEnd={() => { setPressing(false); phase === "phone" ? handleSendOtp() : handleVerify(); }}
        >
          {loading ? "Please wait..." : phase === "phone" ? "Send OTP" : "Verify & Continue →"}
        </button>

        {phase === "phone" && (
          <p style={s.legalText}>
            By continuing you agree to our{" "}
            <span style={s.legalLink}>Terms</span>
            {" & "}
            <span style={s.legalLink}>Privacy Policy</span>
          </p>
        )}

        {phase === "otp" && (
          <span
            style={{ ...s.skipLink, color: "#3a5a8a" }}
            onClick={() => setPhase("phone")}
          >
            ← Change number
          </span>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

// ─── Onboarding orchestrator ──────────────────────────────────────────────────

// Screens: "hero" → "feat0" → "feat1" → "login"
const SCREENS = ["hero", "feat0", "feat1", "login"];

export default function Onboarding({ onComplete }) {
  const [screen, setScreen] = useState("hero");

  function advance() {
    const idx = SCREENS.indexOf(screen);
    if (idx < SCREENS.length - 1) setScreen(SCREENS[idx + 1]);
  }

  function skipToLogin() {
    setScreen("login");
  }

  if (screen === "hero")   return <HeroSlide onNext={advance} />;
  if (screen === "feat0")  return <FeatureSlide slideIndex={0} onNext={advance} onSkip={skipToLogin} />;
  if (screen === "feat1")  return <FeatureSlide slideIndex={1} onNext={advance} onSkip={skipToLogin} />;
  if (screen === "login")  return <LoginScreen onVerified={onComplete} />;
  return null;
}
