// src/pages/LoginPage.jsx
import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuthContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) {
      setError("ادخل اسم المستخدم وكلمة المرور");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(username, password);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <div style={styles.root}>
      {/* خلفية ديكورية */}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      <div style={styles.card}>
        {/* لوجو / اسم المحل */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>🏪</div>
          <h1 style={styles.storeName}>متجر الأجهزة</h1>
          <p style={styles.storeTagline}>لوحة التحكم</p>
        </div>

        <div style={styles.divider} />

        {/* حقل اليوزر */}
        <div style={styles.fieldWrap}>
          <label style={styles.label}>اسم المستخدم</label>
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon}>👤</span>
            <input
              style={styles.input}
              type="text"
              placeholder="ادخل اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKey}
              autoComplete="username"
              dir="ltr"
            />
          </div>
        </div>

        {/* حقل الباسورد */}
        <div style={styles.fieldWrap}>
          <label style={styles.label}>كلمة المرور</label>
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon}>🔒</span>
            <input
              style={styles.input}
              type={showPass ? "text" : "password"}
              placeholder="ادخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKey}
              autoComplete="current-password"
              dir="ltr"
            />
            <button
              style={styles.showPassBtn}
              onClick={() => setShowPass(!showPass)}
              tabIndex={-1}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <div style={styles.errorBox}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* زرار الدخول */}
        <button
          style={{
            ...styles.loginBtn,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <span style={styles.spinner}>⏳ جاري التحقق...</span>
          ) : (
            "تسجيل الدخول"
          )}
        </button>

        <p style={styles.hint}>للدخول الأول راجع مدير النظام</p>
      </div>
    </div>
  );
}

const GOLD = "#c9a84c";
const DARK = "#0f1923";
const CARD_BG = "#1a2535";
const INPUT_BG = "#111c2a";
const TEXT = "#e8dcc8";
const MUTED = "#7a8a9a";

const styles = {
  root: {
    minHeight: "100vh",
    background: `radial-gradient(ellipse at 30% 20%, #1a2a1a 0%, ${DARK} 60%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Cairo', 'Tajawal', sans-serif",
    direction: "rtl",
    position: "relative",
    overflow: "hidden",
    padding: "20px",
  },
  bgCircle1: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${GOLD}18 0%, transparent 70%)`,
    top: -100,
    right: -100,
    pointerEvents: "none",
  },
  bgCircle2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "radial-gradient(circle, #1a4a2a22 0%, transparent 70%)",
    bottom: -80,
    left: -80,
    pointerEvents: "none",
  },
  card: {
    background: CARD_BG,
    borderRadius: 20,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
    boxShadow: `0 24px 64px #00000060, 0 0 0 1px ${GOLD}22`,
    position: "relative",
    zIndex: 1,
  },
  logoWrap: {
    textAlign: "center",
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: 8,
    display: "block",
  },
  storeName: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    color: TEXT,
    letterSpacing: 1,
  },
  storeTagline: {
    margin: "4px 0 0",
    fontSize: 13,
    color: GOLD,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    background: `linear-gradient(to right, transparent, ${GOLD}44, transparent)`,
    marginBottom: 28,
  },
  fieldWrap: {
    marginBottom: 18,
  },
  label: {
    display: "block",
    fontSize: 13,
    color: MUTED,
    marginBottom: 7,
    fontWeight: 600,
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    background: INPUT_BG,
    borderRadius: 10,
    border: `1.5px solid #2a3a4a`,
    transition: "border-color 0.2s",
    overflow: "hidden",
  },
  inputIcon: {
    padding: "0 12px",
    fontSize: 16,
    userSelect: "none",
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: TEXT,
    fontSize: 15,
    padding: "13px 4px",
    fontFamily: "inherit",
  },
  showPassBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0 12px",
    fontSize: 16,
  },
  errorBox: {
    background: "#3a1515",
    border: "1px solid #6a2020",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#ff8888",
    fontSize: 13,
    marginBottom: 16,
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  loginBtn: {
    width: "100%",
    padding: "14px",
    background: `linear-gradient(135deg, ${GOLD}, #a07830)`,
    color: DARK,
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    marginTop: 8,
    transition: "opacity 0.2s, transform 0.1s",
    letterSpacing: 1,
  },
  spinner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  hint: {
    textAlign: "center",
    color: MUTED,
    fontSize: 12,
    marginTop: 16,
    marginBottom: 0,
  },
};
