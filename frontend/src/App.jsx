import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "./supabaseClient";
import AuthPage from "./AuthPage";

const API = import.meta.env.VITE_BACKEND_URL;

const templates = [
  { label: "💼 Job Interview", text: "Hi,\n\nWe are pleased to inform you that you have been shortlisted for the Software Engineer position. Could you please confirm your availability for an interview on Monday at 11:00 AM?\n\nRegards,\nHR Team" },
  { label: "📋 Follow Up", text: "Hi,\n\nI wanted to follow up on the project proposal we discussed last week. Could you please share the updated timeline and budget breakdown?\n\nThanks,\nJohn" },
  { label: "📅 Meeting Request", text: "Hi,\n\nI would like to schedule a meeting to discuss the upcoming project. Are you available this week for a 30-minute call?\n\nBest regards,\nSarah" },
  { label: "💰 Payment Due", text: "Dear Team,\n\nThis is a reminder that invoice #1042 for Rs. 25,000 is due for payment by 10th May. Kindly process the payment at the earliest.\n\nRegards,\nAccounts Team" },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [tone, setTone] = useState("formal");
  const [language, setLanguage] = useState("English");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setReply("");
    setEmail("");
    setHistory([]);
  };

  const generateReply = async () => {
    if (!email.trim()) return alert("Please paste an email first!");
    setLoading(true);
    setReply("");
    try {
      const res = await axios.post(`${API}/generate-reply`, {
        email_text: email,
        tone: tone,
        language: language,
        user_id: session.user.id,
      });
      setReply(res.data.reply);
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || "Server error"));
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API}/history/${session.user.id}`);
      setHistory(res.data.history);
      setShowHistory(true);
    } catch {
      alert("Could not load history");
    }
  };

  const copyReply = () => {
    navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading) return <div style={loadingStyle}>Loading...</div>;
  if (!session) return <AuthPage />;

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>✉</span>
          <span style={styles.logoText}>ReplyAI</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.userEmail}>👤 {session.user.email}</span>
          <button style={styles.histBtn} onClick={loadHistory}>📋 History</button>
          <button style={styles.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.hero}>
          <h1 style={styles.title}>Generate Smart<br />Email Replies</h1>
          <p style={styles.subtitle}>Powered by Groq AI · Formal or Casual · Multilingual</p>
        </div>

        <div style={styles.card}>

          {/* Templates */}
          <div style={styles.section}>
            <label style={styles.label}>📋 Quick Templates</label>
            <div style={styles.templateRow}>
              {templates.map((t) => (
                <button
                  key={t.label}
                  style={styles.templateBtn}
                  onClick={() => setEmail(t.text)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div style={styles.section}>
            <label style={styles.label}>📨 Paste Received Email</label>
            <textarea
              style={styles.textarea}
              placeholder="Paste the email you received here or click a template above..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              rows={7}
            />
            {email && (
              <span style={styles.charCount}>{email.length} characters</span>
            )}
          </div>

          {/* Tone */}
          <div style={styles.section}>
            <label style={styles.label}>🎭 Select Tone</label>
            <div style={styles.toneRow}>
              {["formal", "casual"].map((t) => (
                <button
                  key={t}
                  style={{ ...styles.toneBtn, ...(tone === t ? styles.toneBtnActive : {}) }}
                  onClick={() => setTone(t)}
                >
                  {t === "formal" ? "👔 Formal" : "😊 Casual"}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div style={styles.section}>
            <label style={styles.label}>🌐 Reply Language</label>
            <select
              style={styles.select}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Marathi</option>
              <option>Gujarati</option>
              <option>Tamil</option>
            </select>
          </div>

          {/* Generate Button */}
          <button
            style={{ ...styles.genBtn, opacity: loading ? 0.7 : 1 }}
            onClick={generateReply}
            disabled={loading}
          >
            {loading ? "⏳ Generating..." : "⚡ Generate Reply"}
          </button>

          {/* Output */}
          {reply && (
            <div style={styles.outputBox}>
              <div style={styles.outputHeader}>
                <span style={styles.label}>✅ Generated Reply</span>
                <button style={styles.copyBtn} onClick={copyReply}>
                  {copied ? "✔ Copied!" : "📋 Copy"}
                </button>
              </div>
              <p style={styles.replyText}>{reply}</p>
            </div>
          )}
        </div>

        {/* History Modal */}
        {showHistory && (
          <div style={styles.modal} onClick={() => setShowHistory(false)}>
            <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={{ fontFamily: "'DM Serif Display', serif" }}>Recent Replies</h2>
                <button style={styles.closeBtn} onClick={() => setShowHistory(false)}>✕</button>
              </div>
              {history.length === 0 ? (
                <p style={{ color: "#8b87a0" }}>No history yet.</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} style={styles.histItem}>
                    <div style={styles.histMeta}>
                      <span style={styles.tonePill}>{item.tone}</span>
                      {item.language && (
                        <span style={styles.langPill}>{item.language}</span>
                      )}
                      <span style={{ color: "#8b87a0", fontSize: 12 }}>
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p style={styles.histOriginal}><b>Original:</b> {item.original_email.slice(0, 80)}...</p>
                    <p style={styles.histReply}><b>Reply:</b> {item.generated_reply.slice(0, 120)}...</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const loadingStyle = {
  minHeight: "100vh", background: "#0f0e11", color: "#8b87a0",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 18, fontFamily: "'DM Sans', sans-serif",
};

const styles = {
  page: { minHeight: "100vh", background: "#0f0e11", color: "#f0eeff" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "18px 40px", borderBottom: "1px solid #2e2b38", flexWrap: "wrap", gap: 12,
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { fontSize: 24 },
  logoText: { fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: 1 },
  headerRight: { display: "flex", alignItems: "center", gap: 10 },
  userEmail: { color: "#8b87a0", fontSize: 13, fontWeight: 500 },
  histBtn: {
    background: "#2e2b38", border: "none", color: "#f0eeff",
    padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13,
  },
  logoutBtn: {
    background: "#ff4d4d18", border: "1px solid #ff4d4d40", color: "#ff7070",
    padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500,
  },
  main: { maxWidth: 720, margin: "0 auto", padding: "40px 20px" },
  hero: { textAlign: "center", marginBottom: 40 },
  title: {
    fontFamily: "'DM Serif Display', serif", fontSize: 48, lineHeight: 1.15,
    background: "linear-gradient(135deg, #f0eeff, #7c6af7)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 12,
  },
  subtitle: { color: "#8b87a0", fontSize: 15 },
  card: {
    background: "#1a1820", border: "1px solid #2e2b38",
    borderRadius: 16, padding: 32, display: "flex", flexDirection: "column", gap: 24,
  },
  section: { display: "flex", flexDirection: "column", gap: 10 },
  label: { fontSize: 13, fontWeight: 600, color: "#8b87a0", letterSpacing: 0.5, textTransform: "uppercase" },
  templateRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  templateBtn: {
    background: "#0f0e11", border: "1px solid #2e2b38",
    color: "#d4d0ee", padding: "6px 14px", borderRadius: 20,
    cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
  },
  textarea: {
    background: "#0f0e11", border: "1px solid #2e2b38", borderRadius: 10,
    color: "#f0eeff", padding: 16, fontSize: 15, resize: "vertical",
    fontFamily: "'DM Sans', sans-serif", outline: "none", lineHeight: 1.6,
  },
  charCount: { fontSize: 11, color: "#8b87a0", textAlign: "right" },
  toneRow: { display: "flex", gap: 12 },
  toneBtn: {
    flex: 1, padding: "12px 0", borderRadius: 10, border: "1px solid #2e2b38",
    background: "#0f0e11", color: "#8b87a0", cursor: "pointer", fontSize: 15, fontWeight: 500,
  },
  toneBtnActive: { background: "#7c6af720", border: "1px solid #7c6af7", color: "#f0eeff" },
  select: {
    background: "#0f0e11", border: "1px solid #2e2b38", borderRadius: 8,
    color: "#f0eeff", padding: "10px 14px", fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", outline: "none", width: "100%",
  },
  genBtn: {
    background: "linear-gradient(135deg, #7c6af7, #5b4de8)",
    border: "none", color: "#fff", padding: "16px 0", borderRadius: 12,
    fontSize: 16, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5,
  },
  outputBox: {
    background: "#0f0e11", border: "1px solid #3a3750",
    borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12,
  },
  outputHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  copyBtn: {
    background: "#2e2b38", border: "none", color: "#f0eeff",
    padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13,
  },
  replyText: { color: "#d4d0ee", lineHeight: 1.7, fontSize: 15, whiteSpace: "pre-wrap" },
  modal: {
    position: "fixed", inset: 0, background: "#000000aa",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
  },
  modalBox: {
    background: "#1a1820", border: "1px solid #2e2b38",
    borderRadius: 16, padding: 28, maxWidth: 640, width: "90%",
    maxHeight: "80vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16,
  },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  closeBtn: { background: "none", border: "none", color: "#8b87a0", fontSize: 18, cursor: "pointer" },
  histItem: {
    background: "#0f0e11", border: "1px solid #2e2b38",
    borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 6,
  },
  histMeta: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  tonePill: {
    background: "#7c6af730", color: "#7c6af7",
    padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
  },
  langPill: {
    background: "#f7a26a20", color: "#f7a26a",
    padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
  },
  histOriginal: { fontSize: 13, color: "#8b87a0" },
  histReply: { fontSize: 13, color: "#d4d0ee" },
};