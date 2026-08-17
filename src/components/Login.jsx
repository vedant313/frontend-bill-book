import { useState } from "react";
import { FileText } from "lucide-react";
import * as api from "../api";

export default function Login({ onAuthed }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = mode === "signup" ? await api.signup(name, email, password) : await api.login(email, password);
      api.setToken(result.token);
      onAuthed(result.user);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--paper)",
        padding: 20,
      }}
    >
      <div className="bb-card" style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, justifyContent: "center" }}>
          <div className="bb-brand-mark" style={{ background: "var(--teal)" }}>
            <FileText size={16} color="#fff" />
          </div>
          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 20, color: "var(--ink)" }}>BillBook</div>
        </div>

        <div style={{ display: "flex", borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setMode("login")}
            className="bb-btn"
            style={{
              flex: 1, borderRadius: 0, border: "none",
              background: mode === "login" ? "var(--navy)" : "transparent",
              color: mode === "login" ? "#fff" : "var(--ink)", justifyContent: "center",
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className="bb-btn"
            style={{
              flex: 1, borderRadius: 0, border: "none",
              background: mode === "signup" ? "var(--navy)" : "transparent",
              color: mode === "signup" ? "#fff" : "var(--ink)", justifyContent: "center",
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === "signup" && (
            <div className="bb-field">
              <label>Your Name</label>
              <input className="bb-input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Rohit Sharma" />
            </div>
          )}
          <div className="bb-field">
            <label>Email</label>
            <input className="bb-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@business.com" />
          </div>
          <div className="bb-field">
            <label>Password</label>
            <input className="bb-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" />
          </div>

          {error && (
            <div style={{ background: "var(--red-bg)", color: "var(--red)", padding: "9px 12px", borderRadius: 8, fontSize: 12.5, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <button type="submit" className="bb-btn bb-btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={busy}>
            {busy ? "Please wait…" : mode === "signup" ? "Create Account" : "Log In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12.5, color: "var(--muted)" }}>
          {mode === "signup" ? "Already have an account?" : "New to BillBook?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 600, cursor: "pointer", padding: 0, fontSize: 12.5 }}
          >
            {mode === "signup" ? "Log in" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
