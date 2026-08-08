import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { todayISO, fmt, nextPaymentNumber } from "../utils/helpers";

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
  const [saving, setSaving] = useState(false);

  const needsBank = mode === "Bank Transfer" || mode === "Cheque";

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

