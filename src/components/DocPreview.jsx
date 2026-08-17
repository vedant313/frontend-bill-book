import { ArrowLeft, Pencil, Printer, Copy } from "lucide-react";
import { fmt, fmtDate, DOC_META, taxSummary, amountInWords } from "../utils/helpers";

export default function DocPreview({ doc, business, payments = [], onBack, onEdit, onDuplicate }) {
  if (!doc) return null;
  const meta = DOC_META[doc.type];
  const summary = taxSummary(doc.items);
  const totalQty = doc.items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
  const totalTaxable = summary.reduce((s, g) => s + g.taxable, 0);
  const totalCgst = summary.reduce((s, g) => s + g.cgstAmt, 0);
  const totalSgst = summary.reduce((s, g) => s + g.sgstAmt, 0);
  const totalTax = summary.reduce((s, g) => s + g.totalTax, 0);
  const hasBank = business.bankName || business.accountNo || business.ifsc;
  const design = doc.documentStyle || business.documentStyle || {};
  const show = (key, fallback=true) => design[key] === undefined ? fallback : design[key];

  const linkedPayments = doc.type === "invoice" ? payments.filter((p) => p.againstInvoice === doc.number) : [];
  const received = linkedPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const balance = Math.max(doc.total - received, 0);
  const paymentModeLines = [...new Set(linkedPayments.map((p) => (p.bankName ? `${p.mode} — ${p.bankName}` : p.mode)).filter(Boolean))];

  return (
    <div className="bb-paper-wrap" style={{ padding: "20px 16px" }}>
      <div className="bb-preview-toolbar no-print">
        <button className="bb-back" style={{ margin: 0 }} onClick={onBack}>
          <ArrowLeft size={15} />
          Back
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="bb-btn bb-btn-ghost" onClick={onEdit}><Pencil size={14} /> Edit</button>
          {onDuplicate && <button className="bb-btn bb-btn-ghost" onClick={onDuplicate}><Copy size={14} /> Duplicate</button>}
          <button className="bb-btn bb-btn-primary" onClick={() => window.print()}>
            <Printer size={14} />
            Download / Print PDF
          </button>
        </div>
      </div>

      <div className="inv-title">{design.documentTitle || meta.label}</div>
      <div className={`inv-doc doc-design-${design.header || "classic"} doc-table-${design.table || "grid"}`} style={{"--doc-accent":design.accent || "#16233f","--doc-radius":`${design.radius ?? 0}px`,"--doc-font":design.font === "Georgia" ? "Georgia, serif" : "Inter, Arial, sans-serif","--doc-paper":design.paperBg || "#fff","--doc-line":design.lineColor || "#d8dde5"}}>
        <CustomCanvas elements={design.canvasElements} doc={doc} business={business} />
        {/* Header: logo + business + contact grid */}
        <div className="inv-block inv-header">
          <div className="inv-header-top" style={{justifyContent: design.logoPosition === "center" ? "center" : design.logoPosition === "right" ? "flex-end" : "flex-start"}}>
            {show("showLogo") && business.logoDataUrl ? (
              <img src={business.logoDataUrl} alt="logo" className="inv-logo" />
            ) : show("showLogo") ? (
              <div className="inv-logo inv-logo-fallback">{(business.name || "B")[0]}</div>
            ) : null}
            <div className="inv-biz-name">
              <div className="inv-biz-title">{business.name || "My Business"}</div>
              {design.headerSubtitle && <div className="inv-biz-addr">{design.headerSubtitle}</div>}
              <div className="inv-biz-addr">{business.address}</div>
              {business.proprietor && <div className="inv-biz-addr">Pro - {business.proprietor}</div>}
            </div>
          </div>
          <div className="inv-contact-grid">
            <div><span className="inv-label-strong">Phone:</span> {business.phone || "—"}</div>
            <div style={{ textAlign: "right" }}><span className="inv-label-strong">Email:</span> {business.email || "—"}</div>
            <div><span className="inv-label-strong">GSTIN:</span> {business.gstin || "—"}</div>
            <div style={{ textAlign: "right" }}><span className="inv-label-strong">State:</span> {business.state || "—"}</div>
          </div>
        </div>

        {/* Party + doc details */}
        <div className="inv-two-col">
          <div className="inv-box">
            <div className="inv-box-head">{doc.type === "invoice" ? "Bill To:" : "Estimate For:"}</div>
            <div className="inv-box-body">
              <div className="inv-party-name">{(doc.partyName || "").toUpperCase()}</div>
              {doc.partyAddress && <div style={{ marginBottom: 4 }}>{doc.partyAddress}</div>}
              {doc.partyPhone && <div><span className="inv-label-strong">Contact No:</span> {doc.partyPhone}</div>}
              {doc.partyState && <div><span className="inv-label-strong">State:</span> {doc.partyState}</div>}
            </div>
          </div>
          <div className="inv-box">
            <div className="inv-box-head">{meta.label} Details:</div>
            <div className="inv-box-body">
              <div><span className="inv-label-strong">{meta.short} No.:</span> {doc.number}</div>
              <div><span className="inv-label-strong">Date:</span> {fmtDate(doc.date)}</div>
              {doc.dueDate && (
                <div><span className="inv-label-strong">{doc.type === "invoice" ? "Due Date" : "Valid Until"}:</span> {fmtDate(doc.dueDate)}</div>
              )}
              {doc.placeOfSupply && <div><span className="inv-label-strong">Place Of Supply:</span> {doc.placeOfSupply}</div>}
            </div>
          </div>
        </div>

        {doc.customFields?.length > 0 && (
          <div className="inv-two-col" style={{gridTemplateColumns:"repeat(2,1fr)"}}>
            {doc.customFields.map((field,i)=>(
              <div className="inv-box" key={i}><div className="inv-box-head">{field.label || "Additional"}</div><div className="inv-box-body">{field.value || "—"}</div></div>
            ))}
          </div>
        )}

        {doc.customSections?.map((section,i)=>(section.title||section.body)?<div className="inv-box" key={i} style={{marginBottom:10}}><div className="inv-box-head">{section.title||"Additional Information"}</div><div className="inv-box-body" style={{whiteSpace:"pre-wrap",fontWeight:400}}>{section.body}</div></div>:null)}

        {/* Items table */}
        <table className="inv-items">
          <thead>
            <tr>
              <th style={{ width: 28 }}>#</th>
              <th>Item name</th>
              <th style={{display:design.showHsn===false?"none":undefined}}>HSN/ SAC</th>
              <th className="r" style={{display:design.showQty===false?"none":undefined}}>Quantity</th>
              <th className="r" style={{display:design.showRate===false?"none":undefined}}>Price/ Unit(₹)</th>
              <th className="r" style={{display:design.showGst===false?"none":undefined}}>GST(₹)</th>
              <th className="r">Amount(₹)</th>
            </tr>
          </thead>
          <tbody>
            {doc.items.map((it, i) => {
              const amt = (Number(it.qty) || 0) * (Number(it.rate) || 0);
              const gstAmt = (amt * (Number(it.gstPct) || 0)) / 100;
              return (
                <tr key={it.id}>
                  <td>{i + 1}</td>
                  <td>{it.name}</td>
                  <td style={{display:design.showHsn===false?"none":undefined}}>{it.hsn || "—"}</td>
                  <td className="r" style={{display:design.showQty===false?"none":undefined}}>{it.qty}</td>
                  <td className="r" style={{display:design.showRate===false?"none":undefined}}>{fmt(it.rate)}</td>
                  <td className="r" style={{display:design.showGst===false?"none":undefined}}>{fmt(gstAmt)} {it.gstPct ? `(${it.gstPct}%)` : ""}</td>
                  <td className="r">{fmt(amt)}</td>
                </tr>
              );
            })}
            <tr className="inv-items-total">
              <td colSpan={3}>Total</td>
              <td className="r">{totalQty}</td>
              <td></td>
              <td className="r">{fmt(totalTax)}</td>
              <td className="r">{fmt(doc.subtotal)}</td>
            </tr>
          </tbody>
        </table>

        {/* Tax summary + totals */}
        <div className="inv-two-col" style={{ alignItems: "stretch" }}>
          <div className="inv-box" style={{ padding: 0, display: show("showTaxSummary") ? undefined : "none" }}>
            <div className="inv-box-head">Tax Summary:</div>
            <table className="inv-tax-table">
              <thead>
                <tr>
                  <th rowSpan={2}>HSN/ SAC</th>
                  <th rowSpan={2}>Taxable amount (₹)</th>
                  <th colSpan={2}>CGST</th>
                  <th colSpan={2}>SGST</th>
                  <th rowSpan={2}>Total Tax (₹)</th>
                </tr>
                <tr>
                  <th>Rate</th><th>Amt (₹)</th><th>Rate</th><th>Amt (₹)</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((g) => (
                  <tr key={g.hsn}>
                    <td>{g.hsn}</td>
                    <td className="r">{fmt(g.taxable)}</td>
                    <td className="r">{(g.rate / 2).toFixed(1)}</td>
                    <td className="r">{fmt(g.cgstAmt)}</td>
                    <td className="r">{(g.rate / 2).toFixed(1)}</td>
                    <td className="r">{fmt(g.sgstAmt)}</td>
                    <td className="r">{fmt(g.totalTax)}</td>
                  </tr>
                ))}
                <tr className="inv-items-total">
                  <td>TOTAL</td>
                  <td className="r">{fmt(totalTaxable)}</td>
                  <td></td><td className="r">{fmt(totalCgst)}</td>
                  <td></td><td className="r">{fmt(totalSgst)}</td>
                  <td className="r">{fmt(totalTax)}</td>
                </tr>
              </tbody>
            </table>
            {doc.type === "invoice" && (
              <>
                <div className="inv-box-head">Payment Mode:</div>
                <div className="inv-box-body" style={{ fontWeight: 400 }}>
                  {paymentModeLines.length ? paymentModeLines.map((l) => <div key={l}>{l}</div>) : "Not received yet"}
                </div>
              </>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className="inv-box" style={{ marginBottom: 10 }}>
              <div className="inv-totals-row"><span>Sub Total</span><span>{fmt(doc.subtotal)}</span></div>
              {doc.discountAmt > 0 && <div className="inv-totals-row"><span>Discount</span><span>-{fmt(doc.discountAmt)}</span></div>}
              <div className="inv-totals-row grand"><span>Total</span><span>{fmt(doc.total)}</span></div>
            </div>
            <div className="inv-box" style={{ marginBottom: 10, display: show("showAmountWords") ? undefined : "none" }}>
              <div className="inv-box-head" style={{ marginBottom: 4 }}>{meta.short} Amount in Words:</div>
              <div style={{ fontSize: 12.5, padding: "0 10px 10px" }}>{amountInWords(doc.total)}</div>
            </div>
            {doc.type === "invoice" && (
              <div className="inv-box">
                <div className="inv-totals-row"><span>Received</span><span>{fmt(received)}</span></div>
                <div className="inv-totals-row grand" style={{ color: balance > 0 ? "var(--red)" : "var(--green)" }}>
                  <span>Balance</span><span>{fmt(balance)}</span>
                </div>
              </div>}
            )}
          </div>
        </div>

        {show("showTerms") && doc.notes && (
          <div className="inv-box" style={{ marginBottom: 12 }}>
            <div className="inv-box-head">Terms &amp; Conditions:</div>
            <div className="inv-box-body" style={{ fontWeight: 400 }}>{doc.notes}</div>
          </div>
        )}

        <div className="inv-two-col" style={{display: show("showBank") || show("showSignature") ? undefined : "none"}}>
          <div className="inv-box" style={{display: show("showBank") ? undefined : "none"}}>
            <div className="inv-box-head">Bank Details:</div>
            <div className="inv-box-body" style={{ fontWeight: 400, lineHeight: 1.7 }}>
              {hasBank ? (
                <>
                  {business.bankName && <>Name: {business.bankName}<br /></>}
                  {business.accountNo && <>Account No.: {business.accountNo}<br /></>}
                  {business.ifsc && <>IFSC code: {business.ifsc}<br /></>}
                  {business.accountHolder && <>Account holder's name: {business.accountHolder}</>}
                </>
              ) : "—"}
            </div>
          </div>
          <div className="inv-box" style={{ display: show("showSignature") ? "flex" : "none", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="inv-box-head">For {business.name || "My Business"}:</div>
            <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginTop: 30, paddingBottom: 10 }}>Authorized Signatory</div>
          </div>
        </div>
        {design.footerText && <div className="inv-custom-footer">{design.watermarkText && <span className="inv-watermark">{design.watermarkText}</span>}{design.footerText}</div>}
      </div>
    </div>
  );
}

function CustomCanvas({elements=[],doc,business}){
 const value=(e)=>{const m={"{{businessName}}":business.name,"{{partyName}}":doc.partyName,"{{partyPhone}}":doc.partyPhone,"{{invoiceNumber}}":doc.number,"{{date}}":doc.date,"{{total}}":`₹ ${Number(doc.total||0).toLocaleString("en-IN")}`,"{{balance}}":`₹ ${Number(doc.total||0).toLocaleString("en-IN")}`,"{{gstin}}":business.gstin,"{{address}}":business.address,"{{notes}}":doc.notes};return String(e.text||"").replace(/\{\{[^}]+\}\}/g,k=>m[k]??k)};
 if(!elements?.length)return null; return <div className="inv-custom-canvas">{elements.map(e=><div key={e.id} className="inv-custom-element" style={{left:`${e.x}%`,top:`${e.y}%`,width:`${e.w}%`,height:`${e.h}%`,fontSize:e.fontSize,color:e.color,background:e.fill,borderColor:e.borderColor,textAlign:e.align,fontWeight:e.bold?700:400}}>{e.type==="logo"&&business.logoDataUrl?<img src={business.logoDataUrl} alt="logo"/>:e.type==="logo"?<b>LOGO</b>:e.type==="image"?<span>IMAGE</span>:e.type==="line"?<hr/>:e.type==="box"?<div className="custom-box"/>:e.type==="items"?<div className="custom-mini-table"><i/><i/><i/><i/></div>:e.type==="total"?<b>₹ {Number(doc.total||0).toLocaleString("en-IN")}</b>:e.type==="qr"?<div className="custom-qr">▦</div>:value(e)}</div>)}</div> }
