import { useState } from "react";
import { X } from "lucide-react";

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
