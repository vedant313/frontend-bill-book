import { useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { uid, fmt, todayISO, DOC_META, calcTotals, nextNumber } from "../utils/helpers";
import { DOCUMENT_DESIGNS, resolveDocumentDesign } from "../utils/documentDesigns";

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
  const [customFields, setCustomFields] = useState(existing?.customFields || []);
  const [customSections, setCustomSections] = useState(existing?.customSections || []);
  const [items, setItems] = useState(existing?.items || [{ id: uid(), name: "", hsn: "", qty: 1, rate: 0, gstPct: 18 }]);
  const [saving, setSaving] = useState(false);
  const [documentStyle, setDocumentStyle] = useState(existing?.documentStyle || business.documentStyle || {});

  const totals = calcTotals(items, discount);

  const updateItem = (id, patch) => setItems(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const addItem = () => setItems([...items, { id: uid(), name: "", hsn: "", qty: 1, rate: 0, gstPct: 18 }]);
  const removeItem = (id) => setItems(items.length > 1 ? items.filter((it) => it.id !== id) : items);
  const addCustomField = () => setCustomFields([...customFields, { label: "", value: "" }]);
  const updateCustomField = (i, patch) => setCustomFields(customFields.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  const removeCustomField = (i) => setCustomFields(customFields.filter((_, idx) => idx !== i));
  const addCustomSection = () => setCustomSections([...customSections, { title:"Additional Information", body:"" }]);
  const updateCustomSection = (i, patch) => setCustomSections(customSections.map((x,idx)=>idx===i?{...x,...patch}:x));
  const removeCustomSection = (i) => setCustomSections(customSections.filter((_,idx)=>idx!==i));

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
      documentStyle,
      customFields: customFields.filter(x => String(x.label || "").trim() || String(x.value || "").trim()),
      customSections: customSections.filter(x => String(x.title||"").trim() || String(x.body||"").trim()),
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

        <div className="bb-card" style={{ marginTop: 14, padding: 14, background: "var(--paper)" }}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:10}}>
            <div><div style={{fontWeight:700,fontSize:13.5}}>Document Template & Design</div><div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>Choose a ready template or your saved custom template. You can fine-tune it in Document Designs.</div></div>
            <button type="button" className="bb-btn bb-btn-ghost" onClick={()=>setDocumentStyle({...documentStyle, preset:"custom"})}>Custom</button>
          </div>
          <div className="template-picker-grid">
            {DOCUMENT_DESIGNS.map(d=>{ const active=(documentStyle.preset||business.documentStyle?.preset||"classic")===d.id; return <button type="button" key={d.id} className={`template-picker-card ${active?"selected":""}`} onClick={()=>setDocumentStyle({...resolveDocumentDesign(d)})}>
              <span className="template-swatch" style={{background:d.accent}}></span><span><b>{d.name}</b><small>{d.category}</small></span>
            </button>})}
            {(business.documentTemplates||[]).map(t=>{ const active=documentStyle.preset===t.id || documentStyle.templateId===t.id; return <button type="button" key={t.id} className={`template-picker-card ${active?"selected":""}`} onClick={()=>setDocumentStyle({...t.style,templateId:t.id,preset:"custom"})}>
              <span className="template-swatch" style={{background:t.style?.accent||"#334155"}}></span><span><b>{t.name}</b><small>My Template</small></span>
            </button>})}
          </div>
          <div className="template-inline-controls">
            <label>Accent <input type="color" value={documentStyle.accent||"#16233f"} onChange={e=>setDocumentStyle({...documentStyle,accent:e.target.value,preset:"custom"})}/></label>
            <label>Header <select className="bb-select" value={documentStyle.header||"classic"} onChange={e=>setDocumentStyle({...documentStyle,header:e.target.value,preset:"custom"})}><option>classic</option><option>modern</option><option>minimal</option><option>band</option></select></label>
            <label>Table <select className="bb-select" value={documentStyle.table||"grid"} onChange={e=>setDocumentStyle({...documentStyle,table:e.target.value,preset:"custom"})}><option value="grid">Grid</option><option value="line">Lines</option><option value="soft">Soft</option></select></label>
          </div>
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
          <label>Additional Custom Fields</label>
          {customFields.map((field, i) => (
            <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1.6fr auto",gap:7,marginBottom:7}}>
              <input className="bb-input" placeholder="Field name (e.g. PO No.)" value={field.label} onChange={e=>updateCustomField(i,{label:e.target.value})}/>
              <input className="bb-input" placeholder="Value" value={field.value} onChange={e=>updateCustomField(i,{value:e.target.value})}/>
              <button className="bb-icon-btn" onClick={()=>removeCustomField(i)}><X size={15}/></button>
            </div>
          ))}
          <button type="button" className="bb-btn bb-btn-ghost" onClick={addCustomField}><Plus size={14}/> Add Custom Field</button>
        </div>

        <div className="bb-field" style={{ marginTop: 18 }}>
          <label>Custom Sections</label>
          {customSections.map((section,i)=><div key={i} style={{display:"grid",gridTemplateColumns:".7fr 1.5fr auto",gap:7,marginBottom:7}}>
            <input className="bb-input" placeholder="Section title" value={section.title} onChange={e=>updateCustomSection(i,{title:e.target.value})}/>
            <textarea className="bb-textarea" rows={2} placeholder="Anything you want on the document" value={section.body} onChange={e=>updateCustomSection(i,{body:e.target.value})}/>
            <button className="bb-icon-btn" onClick={()=>removeCustomSection(i)}><X size={15}/></button>
          </div>)}
          <button type="button" className="bb-btn bb-btn-ghost" onClick={addCustomSection}><Plus size={14}/> Add Custom Section</button>
        </div>

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
