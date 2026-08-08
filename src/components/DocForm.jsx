import { useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { uid, fmt, todayISO, DOC_META, calcTotals, nextNumber } from "../utils/helpers";

export default function DocForm({ type, docs, business, existing, onSave, onCancel }) {
  const meta = DOC_META[type];
  const [number] = useState(existing?.number || nextNumber(docs, type));
  const [partyName, setPartyName] = useState(existing?.partyName || "");
  const [partyPhone, setPartyPhone] = useState(existing?.partyPhone || "");
  const [partyAddress, setPartyAddress] = useState(existing?.partyAddress || "");
  const [partyState, setPartyState] = useState(existing?.partyState || "");
  const [placeOfSupply, setPlaceOfSupply] = useState(existing?.placeOfSupply || business.state || "");
  const [date, setDate] = useState(existing?.date || todayISO());
  const [dueDate, setDueDate] = useState(existing?.dueDate || "");
  const [status, setStatus] = useState(existing?.status || meta.statuses[0]);
  const [discount, setDiscount] = useState(existing?.discountAmt ?? 0);
  const [terms, setTerms] = useState(existing?.notes ?? business.terms ?? "");
  const [items, setItems] = useState(existing?.items || [{ id: uid(), name: "", hsn: "", qty: 1, rate: 0, gstPct: 18 }]);
  const [saving, setSaving] = useState(false);

  const totals = calcTotals(items, discount);

  const updateItem = (id, patch) => setItems(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const addItem = () => setItems([...items, { id: uid(), name: "", hsn: "", qty: 1, rate: 0, gstPct: 18 }]);
  const removeItem = (id) => setItems(items.length > 1 ? items.filter((it) => it.id !== id) : items);

  const handleSubmit = async () => {
    if (!partyName.trim()) {
      alert("Please enter party / customer name");
      return;
    }
    const cleanItems = items.filter((it) => it.name.trim() !== "");
    if (cleanItems.length === 0) {
      alert("Add at least one item");
      return;
    }
    const doc = {
      id: existing?.id,
      type,
      number,
      partyName,
      partyPhone,
      partyAddress,
      partyState,
      placeOfSupply,
      date,
      dueDate,
      status,
      notes: terms,
      items: cleanItems,
      ...calcTotals(cleanItems, discount),
    };
    setSaving(true);
    try {
      await onSave(doc);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button className="bb-back" onClick={onCancel}>
        <ArrowLeft size={15} />
        Back to {meta.short}s
      </button>
      <div className="bb-card" style={{ maxWidth: 900 }}>
        <div className="bb-section-title">
          {existing ? "Edit" : "New"} {meta.short}{" "}
          <span className="bb-mono" style={{ color: "var(--muted)", fontWeight: 500, fontSize: 13 }}>
            No. {number}
          </span>
        </div>

        <div className="bb-row3">
          <div className="bb-field">
            <label>Party / Customer Name *</label>
            <input className="bb-input" value={partyName} onChange={(e) => setPartyName(e.target.value)} placeholder="e.g. Nayan Bhaskar Khainar" />
          </div>
          <div className="bb-field">
            <label>Phone</label>
            <input className="bb-input" value={partyPhone} onChange={(e) => setPartyPhone(e.target.value)} placeholder="10-digit number" />
          </div>
          <div className="bb-field">
            <label>Status</label>
            <select className="bb-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {meta.statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="bb-row2">
          <div className="bb-field">
            <label>Billing Address</label>
            <textarea className="bb-textarea" rows={2} value={partyAddress} onChange={(e) => setPartyAddress(e.target.value)} />
          </div>
          <div className="bb-field">
            <label>Party State</label>
            <input className="bb-input" value={partyState} onChange={(e) => setPartyState(e.target.value)} placeholder="27-Maharashtra" />
          </div>
        </div>

        <div className="bb-row3">
          <div className="bb-field">
            <label>{meta.short} Date</label>
            <input type="date" className="bb-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="bb-field">
            <label>{type === "invoice" ? "Due Date" : "Valid Until"}</label>
            <input type="date" className="bb-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="bb-field">
            <label>Place Of Supply</label>
            <input className="bb-input" value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} placeholder="27-Maharashtra" />
          </div>
        </div>
        <div className="bb-field">
          <label>Flat Discount (₹)</label>
          <input type="number" className="bb-input" style={{ maxWidth: 200 }} value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </div>

        <div style={{ marginTop: 6, marginBottom: 8, fontWeight: 700, fontSize: 13.5 }}>Items</div>
        <div style={{ overflowX: "auto" }}>
          <table className="bb-table" style={{ minWidth: 680 }}>
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Item name</th>
                <th>HSN/SAC</th>
                <th>Qty</th>
                <th>Price/Unit</th>
                <th>GST %</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>
                    <input className="bb-input" value={it.name} onChange={(e) => updateItem(it.id, { name: e.target.value })} placeholder="Item / service name" />
                  </td>
                  <td>
                    <input className="bb-input" style={{ width: 90 }} value={it.hsn} onChange={(e) => updateItem(it.id, { hsn: e.target.value })} placeholder="8541" />
                  </td>
                  <td>
                    <input type="number" className="bb-input" style={{ width: 65 }} value={it.qty} onChange={(e) => updateItem(it.id, { qty: e.target.value })} />
                  </td>
                  <td>
                    <input type="number" className="bb-input" style={{ width: 100 }} value={it.rate} onChange={(e) => updateItem(it.id, { rate: e.target.value })} />
                  </td>
                  <td>
                    <input type="number" className="bb-input" style={{ width: 70 }} value={it.gstPct} onChange={(e) => updateItem(it.id, { gstPct: e.target.value })} />
                  </td>
                  <td className="amt" style={{ textAlign: "right" }}>
                    {fmt((Number(it.qty) || 0) * (Number(it.rate) || 0))}
                  </td>
                  <td>
                    <button className="bb-icon-btn" onClick={() => removeItem(it.id)}>
                      <X size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="bb-btn bb-btn-ghost" style={{ marginTop: 10 }} onClick={addItem}>
          <Plus size={14} />
          Add Item
        </button>

        <div className="bb-field" style={{ marginTop: 18 }}>
          <label>Terms &amp; Conditions</label>
          <textarea className="bb-textarea" rows={2} value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="Thanks for choosing us" />
        </div>

        <div style={{ background: "#F8F7F2", borderRadius: 10, padding: 14, marginTop: 6, marginLeft: "auto", width: 260 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
            <span>Sub Total</span>
            <span className="bb-mono">{fmt(totals.subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
            <span>GST</span>
            <span className="bb-mono">+{fmt(totals.gstAmt)}</span>
          </div>
          {totals.discountAmt > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
              <span>Discount</span>
              <span className="bb-mono">-{fmt(totals.discountAmt)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
            <span>Total</span>
            <span className="bb-mono">{fmt(totals.total)}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button className="bb-btn bb-btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : existing ? "Save Changes" : `Create ${meta.short}`}
          </button>
          <button className="bb-btn bb-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
