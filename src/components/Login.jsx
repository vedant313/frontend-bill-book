import { useRef, useState } from "react";
import { FileText } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { firebaseAuth } from "../firebase";
import * as api from "../api";
import { firebasePhoneLogin, resetPhonePassword } from "../firebaseApi";

export default function Login({ onAuthed, mode: initialMode = "login", onClose, onSupport }) {
  const [mode, setMode] = useState("phone");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupDetailsNeeded, setSignupDetailsNeeded] = useState(false);
  const [verifiedIdToken, setVerifiedIdToken] = useState("");
  const [resetMode, setResetMode] = useState(false);
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
    resetRecaptcha(); setMode(nextMode); setError(""); setNotice(""); setConfirmation(null); setOtp(""); setSignupDetailsNeeded(false); setVerifiedIdToken(""); setResetMode(false); setName(""); setEmail(""); setPassword("");
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
          const e164 = getE164Phone(phone);
          resetRecaptcha();
          verifierRef.current = new RecaptchaVerifier(firebaseAuth, recaptchaRef.current, { size: "invisible" });
          await verifierRef.current.render();
          const result = await signInWithPhoneNumber(firebaseAuth, e164, verifierRef.current);
          setConfirmation(result);
          setNotice("Password reset OTP sent by SMS.");
          return;
        }
        if (!verifiedIdToken) {
          if (!/^\\d{6}$/.test(otp)) throw new Error("Enter the 6-digit OTP.");
          const credential = await confirmation.confirm(otp);
          setVerifiedIdToken(await credential.user.getIdToken());
          setNotice("Phone verified. Enter your new password and submit again.");
          return;
        }
        if (password.length < 6) throw new Error("New password must be at least 6 characters.");
        await resetPhonePassword(verifiedIdToken, password);
        resetRecaptcha(); setConfirmation(null); setOtp(""); setVerifiedIdToken(""); setResetMode(false); setPassword("");
        setNotice("Password reset successfully. Log in using your phone or email and new password.");
        return;
      }
      if (mode === "phonePassword") {
        const result = await api.phonePasswordLogin(phone, password);
        api.setToken(result.token); onAuthed(result.user); return;
      }
      if (mode === "phone") {
        if (!confirmation) {
          const e164 = getE164Phone(phone);
          resetRecaptcha();
          verifierRef.current = new RecaptchaVerifier(firebaseAuth, recaptchaRef.current, { size: "invisible" });
          await verifierRef.current.render();
          const result = await signInWithPhoneNumber(firebaseAuth, e164, verifierRef.current);
          setConfirmation(result);
          setNotice("Firebase OTP sent. Enter the 6-digit code from your SMS.");
          return;
        }
        let idToken = verifiedIdToken;
        if (!idToken) {
          if (!/^\\d{6}$/.test(otp)) throw new Error("Enter the 6-digit OTP.");
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
ed && <>
                <div className="bb-field"><label>Your Name</label><input className="bb-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" /></div>
                <div className="bb-field"><label>Email Address</label><input className="bb-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@business.com" /></div>
                <div className="bb-field"><label>Create Password</label><input className="bb-input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required placeholder="At least 6 characters" /></div>
              </>}
            </>}
          </>}
          {error && <div role="alert" style={{ background: "var(--red-bg)", color: "var(--red)", padding: "9px 12px", borderRadius: 8, fontSize: 12.5, marginBottom: 12 }}>{error}</div>}
          {notice && <div role="status" style={{ background: "var(--paper)", color: "var(--ink)", padding: "9px 12px", borderRadius: 8, fontSize: 12.5, marginBottom: 12 }}>{notice}</div>}
          <button type="submit" className="bb-btn bb-btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={busy}>{busy ? "Please wait…" : resetMode ? (!confirmation ? "Send Reset OTP" : !verifiedIdToken ? "Verify OTP" : "Reset Password") : mode === "email" ? "Log In with Email" : mode === "phonePassword" ? "Log In with Phone" : signupDetailsNeeded ? "Complete Sign Up" : confirmation ? "Verify OTP & Continue" : "Send OTP"}</button>
          {!resetMode && mode === "phone" && confirmation && <button type="button" className="bb-btn bb-btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={busy} onClick={() => { resetRecaptcha(); setConfirmation(null); setOtp(""); setNotice(""); setSignupDetailsNeeded(false); setVerifiedIdToken(""); setName(""); setEmail(""); setPassword(""); }}>Change number / retry</button>}
        </form>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12.5, color: "var(--muted)" }}><button type="button" onClick={() => { resetRecaptcha(); setResetMode(true); setConfirmation(null); setVerifiedIdToken(""); setOtp(""); setPassword(""); setError(""); setNotice("Enter your registered phone number to reset password by OTP."); }} style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 12.5 }}>Forgot password? Reset with phone OTP</button></div>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11.5, color: "var(--muted)" }}>{resetMode ? "Password reset is allowed only after verifying the registered phone number." : mode === "phone" ? "Use OTP to sign in or create an account." : mode === "phonePassword" ? "Sign in using your registered phone number and password." : "Sign in using your email and password."}</div>
      </div>
    </div>
  );
}
