import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { todayISO, fmt, nextPaymentNumber } from "../utils/helpers";
import { DOCUMENT_DESIGNS } from "../utils/documentDesigns";

export default function PaymentForm({ docs, payments, business, existing, onSave, onCancel }) {
  const invoices = docs.filter((d) => d.type === "invoice");
  const [number] = useState(existing?.number || nextPaymentNumber(payments));
  const [partyName, setPartyName] = useState(existing?.partyName || "");
  const [amount, setAmount] = useState(existing?.amount ?? "");
  const [date, setDate] = useState(existing?.date || todayISO());
  const [mode, setMode] = useState(existing?.mode || "Cash");
  const [bankName, setBankName] = useState(existing?.bankName || "");
  const [againstInvoice, setAgainstInvoice] = useState(existing?.againstInvoice || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [customFields, setCustomFields] = useState(existing?.customFields || []);
  const [customSections, setCustomSections] = useState(existing?.customSections || []);
  const [saving, setSaving] = useState(false);
  const [documentStyle, setDocumentStyle] = useState(existing?.documentStyle || business?.documentStyle || {});

  const needsBank = mode === "Bank Transfer" || mode === "Cheque";
  const addField=()=>setCustomFields([...customFields,{label:"",value:""}]);
  const addSection=()=>setCustomSections([...customSections,{title:"Additional Information",body:""}]);

  const handleSubmit = async () => {
    if (!partyName.trim()) {
      alert("Please enter party name");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        id: existing?.id,
        number,
        partyName,
        amount: Number(amount),
        date,
        mode,
        bankName: needsBank ? bankName : "",
        againstInvoice,
        notes,
        documentStyle,
        customFields: customFields.filter(x=>String(x.label||"").trim()||String(x.value||"").trim()),
        customSections: customSections.filter(x=>String(x.title||"").trim()||String(x.body||"").trim()),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button className="bb-back" onClick={onCancel}>
        <ArrowLeft size={15} />
        Back to Payments
      </button>
      <div className="bb-card" style={{ maxWidth: 520 }}>
        <div className="bb-section-title">
          {existing ? "Edit" : "New"} Payment In{" "}
          <span className="bb-mono" style={{ color: "var(--muted)", fontWeight: 500, fontSize: 13 }}>
            No. {number}
          </span>
        </div>
        <div className="bb-field">
          <label>Party / Customer Name *</label>
          <input className="bb-input" value={partyName} onChange={(e) => setPartyName(e.target.value)} />
        </div>
        <div className="bb-row2">
          <div className="bb-field">
            <label>Amount Received (₹) *</label>
            <input type="number" className="bb-input" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="bb-field">
            <label>Date</label>
            <input type="date" className="bb-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className="bb-row2">
          <div className="bb-field">
            <label>Payment Mode</label>
            <select
              className="bb-select"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                if ((e.target.value === "Bank Transfer" || e.target.value === "Cheque") && !bankName) {
                  setBankName(business?.bankName || "");
                }
              }}
            >
              {["Cash", "UPI", "Bank Transfer", "Cheque", "Card", "Other"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="bb-field">
            <label>Against Invoice</label>
            <select className="bb-select" value={againstInvoice} onChange={(e) => setAgainstInvoice(e.target.value)}>
              <option value="">Not linked</option>
              {invoices.map((d) => (
                <option key={d.id} value={d.number}>
                  {d.number} — {d.partyName} ({fmt(d.total)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {needsBank && (
          <div className="bb-field">
            <label>{mode === "Cheque" ? "Bank Name (Cheque drawn on / deposited in)" : "Received in Bank"}</label>
            <input
              className="bb-input"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Bassein Catholic Cooperative Bank Ltd"
              list="bank-suggestions"
            />
            <datalist id="bank-suggestions">
              {business?.bankName && <option value={business.bankName} />}
            </datalist>
          </div>
        )}

        <div className="bb-field">
          <label>Notes</label>
          <textarea className="bb-textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="bb-field" style={{marginTop:10}}><label>Custom Fields</label>{customFields.map((f,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1.5fr auto",gap:7,marginBottom:7}}><input className="bb-input" placeholder="Field name" value={f.label} onChange={e=>setCustomFields(customFields.map((x,j)=>j===i?{...x,label:e.target.value}:x))}/><input className="bb-input" placeholder="Value" value={f.value} onChange={e=>setCustomFields(customFields.map((x,j)=>j===i?{...x,value:e.target.value}:x))}/><button className="bb-icon-btn" onClick={()=>setCustomFields(customFields.filter((_,j)=>j!==i))}>×</button></div>)}<button type="button" className="bb-btn bb-btn-ghost" onClick={addField}>+ Add Custom Field</button></div>
        <div className="bb-field" style={{marginTop:10}}><label>Custom Sections</label>{customSections.map((x,i)=><div key={i} style={{display:"grid",gridTemplateColumns:".8fr 1.4fr auto",gap:7,marginBottom:7}}><input className="bb-input" placeholder="Section title" value={x.title} onChange={e=>setCustomSections(customSections.map((v,j)=>j===i?{...v,title:e.target.value}:v))}/><textarea className="bb-textarea" rows={2} placeholder="Section content" value={x.body} onChange={e=>setCustomSections(customSections.map((v,j)=>j===i?{...v,body:e.target.value}:v))}/><button className="bb-icon-btn" onClick={()=>setCustomSections(customSections.filter((_,j)=>j!==i))}>×</button></div>)}<button type="button" className="bb-btn bb-btn-ghost" onClick={addSection}>+ Add Custom Section</button></div>
        <div className="bb-card" style={{marginTop:12,padding:14,background:"var(--paper)"}}>
          <div style={{fontWeight:700,fontSize:13.5,marginBottom:8}}>Receipt Template</div>
          <div className="template-picker-grid">{DOCUMENT_DESIGNS.map(d=>{const active=(documentStyle.preset||business?.documentStyle?.preset||"classic")===d.id; return <button type="button" key={d.id} className={`template-picker-card ${active?"selected":""}`} onClick={()=>setDocumentStyle({...d})}><span className="template-swatch" style={{background:d.accent}}></span><span><b>{d.name}</b><small>{d.category}</small></span></button>})}{(business?.documentTemplates||[]).map(t=><button type="button" key={t.id} className={`template-picker-card ${documentStyle.templateId===t.id?"selected":""}`} onClick={()=>setDocumentStyle({...t.style,templateId:t.id,preset:"custom"})}><span className="template-swatch" style={{background:t.style?.accent||"#334155"}}></span><span><b>{t.name}</b><small>My Template</small></span></button>)}</div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button className="bb-btn bb-btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : existing ? "Save Changes" : "Save Payment"}
          </button>
          <button className="bb-btn bb-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

