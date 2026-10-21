import { useState } from "react";
import { FileText } from "lucide-react";
import * as api from "../api";

export default function Login({ onAuthed, mode: initialMode = "login", onClose, onSupport }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const switchMode = (nextMode) => {
    setMode(nextMode); setError(""); setNotice(""); setOtpSent(false); setOtp("");
  };
  const submit = async (e) => {
    e.preventDefault(); setError(""); setNotice(""); setBusy(true);
    try {
      if (mode === "phone") {
        if (!otpSent) {
          await api.sendPhoneOtp(phone);
          setOtpSent(true);
          setNotice("OTP sent if the number is eligible. It expires in 5 minutes.");
          return;
        }
        const result = await api.verifyPhoneOtp(phone, otp, { name, email });
        api.setToken(result.token); onAuthed(result.user); return;
      }
      const result = mode === "signup" ? await api.signup(name, email, password) : await api.login(email, password);
      api.setToken(result.token); onAuthed(result.user);
    } catch (err) { setError(err.message || "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper)", padding: 20 }}>
      <div className="bb-card" style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        {onClose && <button type="button" onClick={onClose} className="bb-icon-btn" style={{position:"absolute",right:12,top:12}} aria-label="Close">×</button>}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, justifyContent: "center" }}>
          <div className="bb-brand-mark" style={{ background: "var(--teal)" }}><FileText size={16} color="#fff" /></div>
          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 20, color: "var(--ink)" }}>Nexsa Bill</div>
        </div>
        <div style={{ display: "flex", borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 20 }}>
          {[{ value: "login", label: "Email Login" }, { value: "signup", label: "Sign Up" }, { value: "phone", label: "Phone OTP" }].map((item) => (
            <button key={item.value} type="button" onClick={() => switchMode(item.value)} className="bb-btn"
              style={{ flex: 1, borderRadius: 0, border: "none", padding: "9px 4px", fontSize: 12, background: mode === item.value ? "var(--navy)" : "transparent", color: mode === item.value ? "#fff" : "var(--ink)", justifyContent: "center" }}>
              {item.label}
            </button>
          ))}
        </div>
        <form onSubmit={submit}>
          {mode === "phone" ? <>
            <div className="bb-field"><label>Mobile Number</label>
              <input className="bb-input" type="tel" inputMode="numeric" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value)} required pattern="[+0-9 ()-]{10,16}" placeholder="9876543210" disabled={otpSent} />
            </div>
            {otpSent && <>
              <div className="bb-field"><label>6-digit OTP</label>
                <input className="bb-input" type="text" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} required pattern="[0-9]{6}" maxLength={6} placeholder="Enter OTP" />
              </div>
              <div style={{ background: "var(--paper)", borderRadius: 8, padding: 10, fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>New account? Enter your name and email below. If your phone is already linked to an account, leave these blank.</div>
              <div className="bb-field"><label>Name (new accounts only)</label><input className="bb-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></div>
              <div className="bb-field"><label>Email (new accounts only)</label><input className="bb-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" /></div>
            </>}
          </> : <>
            {mode === "signup" && <div className="bb-field"><label>Your Name</label><input className="bb-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Rohit Sharma" /></div>}
            <div className="bb-field"><label>Email</label><input className="bb-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@business.com" /></div>
            <div className="bb-field"><label>Password</label><input className="bb-input" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" /></div>
          </>}
          {error && <div role="alert" style={{ background: "var(--red-bg)", color: "var(--red)", padding: "9px 12px", borderRadius: 8, fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
          {notice && <div role="status" style={{ background: "var(--paper)", color: "var(--ink)", padding: "9px 12px", borderRadius: 8, fontSize: 12.5, marginBottom: 12 }}>{notice}</div>}
          <button type="submit" className="bb-btn bb-btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={busy}>
            {busy ? "Please wait…" : mode === "phone" ? (otpSent ? "Verify OTP & Continue" : "Send OTP") : mode === "signup" ? "Create Account" : "Log In"}
          </button>
          {mode === "phone" && otpSent && <button type="button" className="bb-btn bb-btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={busy} onClick={async () => {
            setError(""); setNotice(""); setBusy(true);
            try { await api.sendPhoneOtp(phone); setNotice("A new OTP has been requested. Check your messages."); setOtp(""); }
            catch (err) { setError(err.message || "Could not resend OTP."); }
            finally { setBusy(false); }
          }}>Resend OTP</button>}
        </form>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12.5, color: "var(--muted)" }}>
          {onSupport && <button type="button" onClick={onSupport} style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 12.5 }}>Forgot password or need help?</button>}
        </div>
        {mode !== "phone" ? <div style={{ textAlign: "center", marginTop: 10, fontSize: 12.5, color: "var(--muted)" }}>
          {mode === "signup" ? "Already have an account?" : "New to Nexsa Bill?"}{" "}
          <button type="button" onClick={() => switchMode(mode === "signup" ? "login" : "signup")} style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 600, cursor: "pointer", padding: 0, fontSize: 12.5 }}>
            {mode === "signup" ? "Log in" : "Sign up"}
          </button>
        </div> : <div style={{ textAlign: "center", marginTop: 10, fontSize: 11.5, color: "var(--muted)" }}>Existing email accounts and saved data remain unchanged.</div>}
      </div>
    </div>
  );
}
