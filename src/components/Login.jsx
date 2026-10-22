import { useRef, useState } from "react";
import { FileText } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { firebaseAuth } from "../firebase";
import * as api from "../api";
import { firebasePhoneLogin } from "../firebaseApi";

export default function Login({ onAuthed, mode: initialMode = "login", onClose, onSupport }) {
  const [mode, setMode] = useState("phone");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupDetailsNeeded, setSignupDetailsNeeded] = useState(false);
  const [verifiedIdToken, setVerifiedIdToken] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const recaptchaRef = useRef(null);
  const verifierRef = useRef(null);

  const resetRecaptcha = () => {
    if (verifierRef.current) { try { verifierRef.current.clear(); } catch {} verifierRef.current = null; }
    if (recaptchaRef.current) recaptchaRef.current.innerHTML = "";
  };
  const switchMode = (nextMode) => {
    resetRecaptcha(); setMode(nextMode); setError(""); setNotice(""); setConfirmation(null); setOtp(""); setSignupDetailsNeeded(false); setVerifiedIdToken(""); setName(""); setEmail(""); setPassword("");
  };
  const getE164Phone = (value) => {
    const cleaned = String(value || "").trim().replace(/[\s()-]/g, "");
    if (/^\+91\d{10}$/.test(cleaned)) return cleaned;
    if (/^91\d{10}$/.test(cleaned)) return `+${cleaned}`;
    if (/^\d{10}$/.test(cleaned)) return `+91${cleaned}`;
    throw new Error("Enter a valid 10-digit Indian mobile number.");
  };
  const submit = async (e) => {
    e.preventDefault(); setError(""); setNotice(""); setBusy(true);
    try {
      if (mode === "phone") {
        if (!confirmation) {
          const e164 = getE164Phone(phone);
          resetRecaptcha();
          // Firebase Phone Auth requires app verification. Keep it invisible so
          // users do not see a checkbox/challenge unless Firebase needs one.
          verifierRef.current = new RecaptchaVerifier(firebaseAuth, recaptchaRef.current, { size: "invisible" });
          await verifierRef.current.render();
          const result = await signInWithPhoneNumber(firebaseAuth, e164, verifierRef.current);
          setConfirmation(result);
          setNotice("Firebase OTP sent. Enter the 6-digit code from your SMS.");
          return;
        }
        let idToken = verifiedIdToken;
        if (!idToken) {
          if (!/^\d{6}$/.test(otp)) throw new Error("Enter the 6-digit OTP.");
          const credential = await confirmation.confirm(otp);
          idToken = await credential.user.getIdToken();
          setVerifiedIdToken(idToken);
        }
        const result = await firebasePhoneLogin(idToken, { name, email, password });
        if (result.requiresSignup) {
          setSignupDetailsNeeded(true);
          setNotice("Phone verified! Enter your name, email and a password (at least 6 characters) to complete sign-up.");
          return;
        }
        api.setToken(result.token); onAuthed(result.user); return;
      }
      if (mode === "email") {
        const result = await api.login(email, password);
        api.setToken(result.token); onAuthed(result.user); return;
      }
    } catch (err) {
      const code = String(err?.code || "");
      if (code.includes("auth/invalid-phone-number")) setError("Enter a valid phone number with India country code.");
      else if (code.includes("auth/too-many-requests")) setError("Too many OTP attempts. Please wait and try again later.");
      else if (code.includes("auth/invalid-verification-code")) setError("Incorrect OTP. Check the code and try again.");
      else setError(err.message || "Something went wrong. Please try again.");
      if (mode === "phone" && !confirmation) resetRecaptcha();
    } finally { setBusy(false); }
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
          {[{ value: "phone", label: "Phone OTP" }, { value: "email", label: "Email + Password" }].map((item) => (
            <button key={item.value} type="button" onClick={() => switchMode(item.value)} className="bb-btn" style={{ flex: 1, borderRadius: 0, border: "none", padding: "9px 4px", fontSize: 12, background: mode === item.value ? "var(--navy)" : "transparent", color: mode === item.value ? "#fff" : "var(--ink)", justifyContent: "center" }}>{item.label}</button>
          ))}
        </div>
        <form onSubmit={submit}>
          {mode === "email" ? <>
            <div className="bb-field"><label>Email</label><input className="bb-input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@business.com" /></div>
            <div className="bb-field"><label>Password</label><input className="bb-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Your password" /></div>
          </> : <>
            <div className="bb-field"><label>Mobile Number</label><input className="bb-input" type="tel" inputMode="tel" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="9876543210" disabled={!!confirmation} /></div>
            <div ref={recaptchaRef} style={{ marginBottom: 12 }} aria-hidden="true" />
            {confirmation && <>
              <div className="bb-field"><label>6-digit OTP</label><input className="bb-input" type="text" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} required pattern="[0-9]{6}" maxLength={6} placeholder="Enter OTP" /></div>
              {!signupDetailsNeeded && <div style={{ background: "var(--paper)", borderRadius: 8, padding: 10, fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>Verify your phone. If this is a new account, you'll then set your name, email and password.</div>}
              {signupDetailsNeeded && <>
                <div className="bb-field"><label>Your Name</label><input className="bb-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" /></div>
                <div className="bb-field"><label>Email Address</label><input className="bb-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@business.com" /></div>
                <div className="bb-field"><label>Create Password</label><input className="bb-input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required placeholder="At least 6 characters" /></div>
              </>}
            </>}
          </>}
          {error && <div role="alert" style={{ background: "var(--red-bg)", color: "var(--red)", padding: "9px 12px", borderRadius: 8, fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
          {notice && <div role="status" style={{ background: "var(--paper)", color: "var(--ink)", padding: "9px 12px", borderRadius: 8, fontSize: 12.5, marginBottom: 12 }}>{notice}</div>}
          <button type="submit" className="bb-btn bb-btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={busy}>{busy ? "Please wait…" : mode === "email" ? "Log In with Email" : signupDetailsNeeded ? "Complete Sign Up" : confirmation ? "Verify OTP & Continue" : "Send OTP"}</button>
          {mode === "phone" && confirmation && <button type="button" className="bb-btn bb-btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={busy} onClick={() => { resetRecaptcha(); setConfirmation(null); setOtp(""); setNotice(""); setSignupDetailsNeeded(false); setVerifiedIdToken(""); setName(""); setEmail(""); setPassword(""); }}>Change number / retry</button>}
        </form>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12.5, color: "var(--muted)" }}>{onSupport && <button type="button" onClick={onSupport} style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 12.5 }}>Forgot password or need help?</button>}</div>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11.5, color: "var(--muted)" }}>{mode === "phone" ? "Use your verified mobile number for OTP login. New accounts need a name." : "Emergency fallback: sign in with your existing email and password."}</div>
      </div>
    </div>
  );
}
