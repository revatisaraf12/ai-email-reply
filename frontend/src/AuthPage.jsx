import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handle = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    let result;
    if (mode === "login") {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({ email, password });
    }

    const { error: authError } = result;
    if (authError) {
      setError(authError.message);
    } else if (mode === "signup") {
      setMessage("✅ Account created! Check your email to confirm, then log in.");
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      {/* Animated background dots */}
      <div style={s.bgPattern} />

      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoRow}>
          <span style={s.logoIcon}>✉</span>
          <span style={s.logoText}>ReplyAI</span>
        </div>

        <h2 style={s.heading}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h2>
        <p style={s.sub}>
          {mode === "login"
            ? "Sign in to generate smart email replies"
            : "Join ReplyAI and reply smarter"}
        </p>

        {/* Tab Toggle */}
        <div style={s.tabs}>
          {["login", "signup"].map((m) => (
            <button
              key={m}
              style={{ ...s.tab, ...(mode === m ? s.tabActive : {}) }}
              onClick={() => { setMode(m); setError(""); setMessage(""); }}
            >
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handle()}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handle()}
            />
          </div>

          {error && <div style={s.error}>⚠ {error}</div>}
          {message && <div style={s.success}>{message}</div>}

          <button
            style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
            onClick={handle}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "⚡ Sign In"
              : "🚀 Create Account"}
          </button>
        </div>

        <p style={s.switchText}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span
            style={s.switchLink}
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setMessage(""); }}
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </span>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#0a090d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  bgPattern: {
    position: "absolute", inset: 0,
    backgroundImage: `radial-gradient(circle at 25% 20%, #7c6af715 0%, transparent 50%),
                      radial-gradient(circle at 75% 80%, #f7a26a10 0%, transparent 50%)`,
    pointerEvents: "none",
  },
  card: {
    background: "#16141e",
    border: "1px solid #2a2735",
    borderRadius: 20,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    position: "relative",
    zIndex: 1,
    boxShadow: "0 40px 80px #00000060",
  },
  logoRow: { display: "flex", alignItems: "center", gap: 10, justifyContent: "center" },
  logoIcon: { fontSize: 28 },
  logoText: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 26,
    color: "#f0eeff",
    letterSpacing: 1,
  },
  heading: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 28,
    color: "#f0eeff",
    textAlign: "center",
    lineHeight: 1.2,
  },
  sub: { color: "#8b87a0", fontSize: 14, textAlign: "center" },
  tabs: {
    display: "flex",
    background: "#0a090d",
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1, padding: "9px 0",
    background: "transparent",
    border: "none",
    color: "#8b87a0",
    borderRadius: 7,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
  tabActive: {
    background: "#7c6af7",
    color: "#fff",
  },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 7 },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#8b87a0",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  input: {
    background: "#0a090d",
    border: "1px solid #2a2735",
    borderRadius: 10,
    color: "#f0eeff",
    padding: "12px 14px",
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    transition: "border 0.2s",
  },
  error: {
    background: "#ff4d4d18",
    border: "1px solid #ff4d4d40",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#ff7070",
    fontSize: 13,
  },
  success: {
    background: "#4dff9118",
    border: "1px solid #4dff9140",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#4dffb4",
    fontSize: 13,
  },
  btn: {
    background: "linear-gradient(135deg, #7c6af7, #5b4de8)",
    border: "none",
    color: "#fff",
    padding: "14px 0",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: 0.4,
    marginTop: 4,
  },
  switchText: { color: "#8b87a0", fontSize: 13, textAlign: "center" },
  switchLink: {
    color: "#7c6af7",
    cursor: "pointer",
    fontWeight: 600,
    textDecoration: "underline",
  },
};