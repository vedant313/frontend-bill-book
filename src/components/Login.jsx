import { useRef, useState } from "react";
import { FileText } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { firebaseAuth } from "../firebase";
import * as api from "../api";
import { firebasePhoneLogin } from "../firebaseApi";

export default function Login({ onAuthed, mode: initialMode = "login", onClose, onSupport }) {
  const [mode, setMode] = useState("phone");
  const [name, setName] = useState("");
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
    resetRecaptcha(); setMode(nextMode); setError(""); setNotice(""); setConfirmation(null); setOtp("");
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
        if (!/^\d{6}$/.test(otp)) throw new Error("Enter the 6-digit OTP.");
        const credential = await confirmation.confirm(otp);
        const idToken = await credential.user.getIdToken();
        const result = await firebasePhoneLogin(idToken, { name });
        api.setToken(result.token); onAuthed(result.user); return;
      }
      const result = mode === "signup" ? await api.signup(name, email, password) : await api.login(email, password);
      api.setToken(result.token); onAuthed(result.user);
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
        <div style={{ textAlign: "center", marginBottom: 20, color: "var(--muted)", fontSize: 13 }}>Sign in or create an account using your mobile number</div>
        <form onSubmit={submit}>
          {mode === "phone" ? <>
            <div className="bb-field"><label>Mobile Number</label><input className="bb-input" type="tel" inputMode="tel" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="9876543210" disabled={!!confirmation} /></div>
            <div ref={recaptchaRef} style={{ marginBottom: 12 }} aria-hidden="true" />
            {confirmation && <>
              <div className="bb-field"><label>6-digit OTP</label><input className="bb-input" type="text" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} required pattern="[0-9]{6}" maxLength={6} placeholder="Enter OTP" /></div>
              <div style={{ background: "var(--paper)", borderRadius: 8, padding: 10, fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>If this number already belongs to your account, OTP will sign you in. For a new account, enter your name below.</div>
              <div className="bb-field"><label>Name (new accounts only)</label><input className="bb-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></div>
            </>}
          </> : null}
          {error && <div role="alert" style={{ background: "var(--red-bg)", color: "var(--red)", padding: "9px 12px", borderRadius: 8, fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
          {notice && <div role="status" style={{ background: "var(--paper)", color: "var(--ink)", padding: "9px 12px", borderRadius: 8, fontSize: 12.5, marginBottom: 12 }}>{notice}</div>}
          <button type="submit" className="bb-btn bb-btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={busy}>{busy ? "Please wait…" : confirmation ? "Verify OTP & Continue" : "Send OTP"}</button>
          {mode === "phone" && confirmation && <button type="button" className="bb-btn bb-btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={busy} onClick={() => { resetRecaptcha(); setConfirmation(null); setOtp(""); setNotice(""); }}>Change number / retry</button>}
        </form>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12.5, color: "var(--muted)" }}>{onSupport && <button type="button" onClick={onSupport} style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 12.5 }}>Forgot password or need help?</button>}</div>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11.5, color: "var(--muted)" }}>Phone verification is handled by Firebase. Use your verified mobile number for future logins.</div>
      </div>
    </div>
  );
}
