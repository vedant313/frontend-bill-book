import { useRef, useState } from "react";
import { FileText } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { firebaseAuth } from "../firebase";
import * as api from "../api";
import { firebasePhoneLogin, resetPhonePassword } from "../firebaseApi";

export default function Login({ onAuthed, onClose, onSupport }) {
  const [mode, setMode] = useState("phone");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [signupDetailsNeeded, setSignupDetailsNeeded] = useState(false);
  const [verifiedIdToken, setVerifiedIdToken] = useState("");
  const [resetMode, setResetMode] = useState(false);
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
    resetRecaptcha(); setMode(nextMode); setError(""); setNotice(""); setConfirmation(null);
    setOtp(""); setSignupDetailsNeeded(false); setVerifiedIdToken(""); setResetMode(false);
    setName(""); setEmail(""); setPassword(""); setPhone("");
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
      if (resetMode) {
        if (!confirmation) {
          const e164 = getE164Phone(phone); resetRecaptcha();
          verifierRef.current = new RecaptchaVerifier(firebaseAuth, recaptchaRef.current, { size: "invisible" });
          await verifierRef.current.render();
          setConfirmation(await signInWithPhoneNumber(firebaseAuth, e164, verifierRef.current));
          setNotice("Password reset OTP sent by SMS."); return;
        }
        if (!verifiedIdToken) {
          if (!/^\d{6}$/.test(otp)) throw new Error("Enter the 6-digit OTP.");
          const credential = await confirmation.confirm(otp);
          setVerifiedIdToken(await credential.user.getIdToken());
          setNotice("Phone verified. Enter your new password and submit again."); return;
        }
        if (password.length < 6) throw new Error("New password must be at least 6 characters.");
        await resetPhonePassword(verifiedIdToken, password);
        resetRecaptcha(); setConfirmation(null); setOtp(""); setVerifiedIdToken(""); setResetMode(false); setPassword("");
        setNotice("Password reset successfully. Log in using your phone or email and new password."); return;
      }
      if (mode === "phonePassword") {
        const result = await api.phonePasswordLogin(phone, password);
        api.setToken(result.token); onAuthed(result.user); return;
      }
      if (mode === "email") {
        const result = await api.login(email, password);
        api.setToken(result.token); onAuthed(result.user); return;
      }
      if (!confirmation) {
        const e164 = getE164Phone(phone); resetRecaptcha();
        verifierRef.current = new RecaptchaVerifier(firebaseAuth, recaptchaRef.current, { size: "invisible" });
        await verifierRef.current.render();
        setConfirmation(await signInWithPhoneNumber(firebaseAuth, e164, verifierRef.current));
        setNotice("OTP sent by SMS. Enter the 6-digit code."); return;
      }
      let idToken = verifiedIdToken;
      if (!idToken) {
        if (!/^\d{6}$/.test(otp)) throw new Error("Enter the 6-digit OTP.");
        const credential = await confirmation.confirm(otp);
        idToken = await credential.user.getIdToken(); setVerifiedIdToken(idToken);
      }
      const result = await firebasePhoneLogin(idToken, { name, email, password });
      if (result.requiresSignup) {
        setSignupDetailsNeeded(true);
        setNotice("Phone verified! Enter your name, email and password to complete sign-up."); return;
      }
      api.setToken(result.token); onAuthed(result.user);
    } catch (err) {
      const code = String(err?.code || "");
      if (code.includes("auth/invalid-phone-number")) setError("Enter a valid Indian mobile number.");
      else if (code.includes("auth/too-many-requests")) setError("Too many OTP attempts. Please wait and try again later.");
      else if (code.includes("auth/invalid-verification-code")) setError("Incorrect OTP. Check the code and try again.");
      else setError(err.message || "Something went wrong. Please try again.");
      if (!confirmation) resetRecaptcha();
    } finally { setBusy(false); }
  };

  const tabs = [{ value: "phone", label: "Phone OTP" }, { value: "phonePassword", label: "Phone + Password" }, { value: "email", label: "Email + Password" }];
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper)", padding: 20 }}>
      <div className="bb-card" style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        {onClose && <button type="button" onClick={onClose} className="bb-icon-btn" style={{ position: "absolute", right: 12, top: 12 }} aria-label="Close">×</button>}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, justifyContent: "center" }}>
          <div className="bb-brand-mark" style={{ background: "var(--teal)" }}><FileText size={16} color="#fff" /></div>
          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 20, color: "var(--ink)" }}>Nexsa Bill</div>
        </div>
        {!resetMode && <div style={{ display: "flex", borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 20 }}>
          {tabs.map((item) => <button key={item.value} type="button" onClick={() => switchMode(item.value)} className="bb-btn" style={{ flex: 1, borderRadius: 0, border: "none", padding: "9px 4px", fontSize: 11, background: mode === item.value ? "var(--navy)" : "transparent", color: mode === item.value ? "#fff" : "var(--ink)", justifyContent: "center" }}>{item.label}</button>)}
        </div>}
        <form onSubmit={submit}>
          {resetMode ? <>
            <div className="bb-field"><label>Registered Mobile Number</label><input className="bb-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="9876543210" disabled={!!confirmation} /></div>
            <div ref={recaptchaRef} style={{ marginBottom: 12 }} aria-hidden="true" />
            {confirmation && !verifiedIdToken && <div className="bb-field"><label>6-digit OTP</label><input className="bb-input" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} required placeholder="Enter OTP" /></div>}
            {verifiedIdToken && <div className="bb-field"><label>New Password</label><input className="bb-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required placeholder="At least 6 characters" /></div>}
          </> : mode === "phonePassword" ? <>
            <div className="bb-field"><label>Mobile Number</label><input className="bb-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="9876543210" /></div>
            <div className="bb-field"><label>Password</label><input className="bb-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Your password" /></div>
          </> : mode === "email" ? <>
            <div className="bb-field"><label>Email</label><input className="bb-input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@business.com" /></div>
            <div className="bb-field"><label>Password</label><input className="bb-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Your password" /></div>
          </> : <>
            <div className="bb-field"><label>Mobile Number</label><input className="bb-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="9876543210" disabled={!!confirmation} /></div>
            <div ref={recaptchaRef} style={{ marginBottom: 12 }} aria-hidden="true" />
            {confirmation && <div className="bb-field"><label>6-digit OTP</label><input className="bb-input" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} required placeholder="Enter OTP" /></div>}
            {signupDetailsNeeded && <>
              <div className="bb-field"><label>Your Name</label><input className="bb-input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" /></div>
              <div className="bb-field"><label>Email Address</label><input className="bb-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@business.com" /></div>
              <div className="bb-field"><label>Create Password</label><input className="bb-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required placeholder="At least 6 characters" /></div>
            </>}
          </>}
          {error && <div role="alert" style={{ background: "var(--red-bg)", color: "var(--red)", padding: "9px 12px", borderRadius: 8, fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
          {notice && <div role="status" style={{ background: "var(--paper)", color: "var(--ink)", padding: "9px 12px", borderRadius: 8, fontSize: 12.5, marginBottom: 12 }}>{notice}</div>}
          <button type="submit" className="bb-btn bb-btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={busy}>{busy ? "Please wait…" : resetMode ? (!confirmation ? "Send Reset OTP" : !verifiedIdToken ? "Verify OTP" : "Reset Password") : mode === "email" ? "Log In with Email" : mode === "phonePassword" ? "Log In with Phone" : signupDetailsNeeded ? "Complete Sign Up" : confirmation ? "Verify OTP & Continue" : "Send OTP"}</button>
          {confirmation && <button type="button" className="bb-btn bb-btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={busy} onClick={() => { resetRecaptcha(); setConfirmation(null); setOtp(""); setVerifiedIdToken(""); setSignupDetailsNeeded(false); setNotice(""); }}>Change number / retry</button>}
        </form>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12.5 }}>
          <button type="button" onClick={() => { resetRecaptcha(); setResetMode(!resetMode); setConfirmation(null); setVerifiedIdToken(""); setOtp(""); setPassword(""); setError(""); setNotice(!resetMode ? "Enter your registered phone number to reset your password by OTP." : ""); }} style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 12.5 }}>{resetMode ? "Back to login" : "Forgot password? Reset with phone OTP"}</button>
        </div>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11.5, color: "var(--muted)" }}>{resetMode ? "Only the verified phone number can reset this account's password." : mode === "phone" ? "OTP login and signup." : mode === "phonePassword" ? "Use your registered phone number and password." : "Use your email address and password."}</div>
      </div>
    </div>
  );
}
