import { useRef, useState } from "react";
import { X } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { firebaseAuth } from "../firebase";
import * as api from "../api";

export default function SettingsPage({ business, onSave, onCancel }) {
  const [name, setName] = useState(business.name || "");
  const [proprietor, setProprietor] = useState(business.proprietor || "");
  const [phone, setPhone] = useState(business.phone || "");
  const [email, setEmail] = useState(business.email || "");
  const [address, setAddress] = useState(business.address || "");
  const [gstin, setGstin] = useState(business.gstin || "");
  const [state, setState] = useState(business.state || "");
  const [bankName, setBankName] = useState(business.bankName || "");
  const [accountHolder, setAccountHolder] = useState(business.accountHolder || "");
  const [accountNo, setAccountNo] = useState(business.accountNo || "");
  const [ifsc, setIfsc] = useState(business.ifsc || "");
  const [terms, setTerms] = useState(business.terms || "");
  const [logoDataUrl, setLogoDataUrl] = useState(business.logoDataUrl || "");
  const [saving, setSaving] = useState(false);
  const [linkPhone, setLinkPhone] = useState("");
  const [linkOtp, setLinkOtp] = useState("");
  const [phoneConfirmation, setPhoneConfirmation] = useState(null);
  const [phoneBusy, setPhoneBusy] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [phoneNotice, setPhoneNotice] = useState("");
  const recaptchaRef = useRef(null);
  const verifierRef = useRef(null);

  const resetPhoneRecaptcha = () => {
    if (verifierRef.current) { try { verifierRef.current.clear(); } catch {} verifierRef.current = null; }
    if (recaptchaRef.current) recaptchaRef.current.innerHTML = "";
  };
  const sendOrVerifyPhone = async () => {
    setPhoneBusy(true); setPhoneError(""); setPhoneNotice("");
    try {
      if (!phoneConfirmation) {
        const cleaned = linkPhone.trim().replace(/[\s()-]/g, "");
        const e164 = /^\+91\d{10}$/.test(cleaned) ? cleaned : /^91\d{10}$/.test(cleaned) ? `+${cleaned}` : /^\d{10}$/.test(cleaned) ? `+91${cleaned}` : "";
        if (!e164) throw new Error("Enter a valid 10-digit Indian mobile number.");
        resetPhoneRecaptcha();
        verifierRef.current = new RecaptchaVerifier(firebaseAuth, recaptchaRef.current, { size: "invisible" });
        await verifierRef.current.render();
        const confirmation = await signInWithPhoneNumber(firebaseAuth, e164, verifierRef.current);
        setPhoneConfirmation(confirmation);
        setPhoneNotice("OTP sent. Enter the code to link this number to your existing account.");
      } else {
        if (!/^\d{6}$/.test(linkOtp)) throw new Error("Enter the 6-digit OTP.");
        const credential = await phoneConfirmation.confirm(linkOtp);
        const idToken = await credential.user.getIdToken();
        await api.linkFirebasePhone(idToken);
        setPhoneNotice("Phone number linked to this account. Your existing bills and data are unchanged.");
        setPhoneConfirmation(null); setLinkOtp(""); setLinkPhone(""); resetPhoneRecaptcha();
      }
    } catch (err) {
      setPhoneError(err.message || "Could not link phone number.");
      if (!phoneConfirmation) resetPhoneRecaptcha();
    } finally { setPhoneBusy(false); }
  };

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ name, proprietor, phone, email, address, gstin, state, bankName, accountHolder, accountNo, ifsc, terms, logoDataUrl });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="bb-card" style={{ maxWidth: 620 }}>
        <div className="bb-section-title">Business Settings</div>

        <div className="bb-field">
          <label>Business Logo</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {logoDataUrl ? (
              <img src={logoDataUrl} alt="logo" style={{ width: 56, height: 56, objectFit: "contain", border: "1px solid var(--border)", borderRadius: 8 }} />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: 8, background: "#F2F1EC", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 11 }}>
                Logo
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleLogo} style={{ fontSize: 12.5 }} />
            {logoDataUrl && (
              <button className="bb-icon-btn" onClick={() => setLogoDataUrl("")}>
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="bb-row2">
          <div className="bb-field">
            <label>Business Name</label>
            <input className="bb-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="bb-field">
            <label>Proprietor Name</label>
            <input className="bb-input" value={proprietor} onChange={(e) => setProprietor(e.target.value)} placeholder="Pro - Owner Name" />
          </div>
        </div>
        <div className="bb-field">
          <label>Address</label>
          <textarea className="bb-textarea" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="bb-row2">
          <div className="bb-field">
            <label>Phone</label>
            <input className="bb-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="bb-field">
            <label>Email</label>
            <input className="bb-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="bb-row2">
          <div className="bb-field">
            <label>GSTIN</label>
            <input className="bb-input" value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="27CWFPB1121A1ZI" />
          </div>
          <div className="bb-field">
            <label>State</label>
            <input className="bb-input" value={state} onChange={(e) => setState(e.target.value)} placeholder="27-Maharashtra" />
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", marginTop: 20, paddingTop: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Login &amp; Security</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 10 }}>Link your verified phone to this existing account so OTP login opens the same saved bills and invoices.</div>
          <div className="bb-field">
            <label>Mobile Number</label>
            <input className="bb-input" type="tel" inputMode="tel" value={linkPhone} onChange={(e) => setLinkPhone(e.target.value)} placeholder="10-digit Indian mobile number" disabled={!!phoneConfirmation} />
          </div>
          <div ref={recaptchaRef} aria-hidden="true" />
          {phoneConfirmation && <div className="bb-field"><label>6-digit OTP</label><input className="bb-input" inputMode="numeric" value={linkOtp} onChange={(e) => setLinkOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter OTP" /></div>}
          {phoneError && <div role="alert" style={{ color: "var(--red)", fontSize: 12.5, marginBottom: 8 }}>{phoneError}</div>}
          {phoneNotice && <div role="status" style={{ color: "var(--teal)", fontSize: 12.5, marginBottom: 8 }}>{phoneNotice}</div>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="bb-btn bb-btn-primary" onClick={sendOrVerifyPhone} disabled={phoneBusy}>{phoneBusy ? "Please wait…" : phoneConfirmation ? "Verify OTP & Link Phone" : "Send OTP to Link Phone"}</button>
            {phoneConfirmation && <button type="button" className="bb-btn bb-btn-ghost" onClick={() => { resetPhoneRecaptcha(); setPhoneConfirmation(null); setLinkOtp(""); setPhoneError(""); setPhoneNotice(""); }}>Change number</button>}
          </div>
        </div>

        <div style={{ fontWeight: 700, fontSize: 13.5, margin: "16px 0 8px" }}>Bank Details</div>
        <div className="bb-row2">
          <div className="bb-field">
            <label>Bank Name &amp; Branch</label>
            <input className="bb-input" value={bankName} onChange={(e) => setBankName(e.target.value)} />
          </div>
          <div className="bb-field">
            <label>Account Holder Name</label>
            <input className="bb-input" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} />
          </div>
        </div>
        <div className="bb-row2">
          <div className="bb-field">
            <label>Account Number</label>
            <input className="bb-input" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} />
          </div>
          <div className="bb-field">
            <label>IFSC Code</label>
            <input className="bb-input" value={ifsc} onChange={(e) => setIfsc(e.target.value)} />
          </div>
        </div>

        <div className="bb-field">
          <label>Default Terms &amp; Conditions</label>
          <textarea className="bb-textarea" rows={2} value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="Thanks for choosing us" />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button className="bb-btn bb-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button className="bb-btn bb-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
