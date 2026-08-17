import { ArrowLeft, Pencil, Printer, Copy } from "lucide-react";
import { fmt, fmtDate, amountInWords } from "../utils/helpers";
import { documentStyleVars, resolveDocumentDesign } from "../utils/documentDesigns";

export default function PaymentPreview({ payment, business, docs, onBack, onEdit, onDuplicate }) {
  if (!payment) return null;
  const docDesign = resolveDocumentDesign(payment.documentStyle || business.documentStyle);
  const linkedDoc = docs.find((d) => d.type === "invoice" && d.number === payment.againstInvoice);
  const hasBank = business.bankName || business.accountNo || business.ifsc;
  const design = payment.documentStyle || business.documentStyle || {};
  const show = (key, fallback=true) => design[key] === undefined ? fallback : design[key];

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

      <div className="inv-title">{docDesign.documentTitle || "Payment Receipt"}</div>
      <div className={`inv-doc doc-design-${docDesign.header} doc-table-${docDesign.table || "grid"}`} style={documentStyleVars(docDesign)}><CustomCanvas elements={design.canvasElements} payment={payment} business={business}/><style>{`:root{--doc-font:${docDesign.font === "Georgia" ? "Georgia, serif" : "Inter, Arial, sans-serif"}}`}</style>
        {/* Header: logo + business + contact grid */}
        <div className="inv-block inv-header">
          <div className="inv-header-top" style={{justifyContent: docDesign.logoPosition === "center" ? "center" : docDesign.logoPosition === "right" ? "flex-end" : "flex-start"}}>
            {show("showLogo") && business.logoDataUrl ? (
              <img src={business.logoDataUrl} alt="logo" className="inv-logo" />
            ) : (
              <div className="inv-logo inv-logo-fallback">{(business.name || "B")[0]}</div>
            )}
            <div className="inv-biz-name">
              <div className="inv-biz-title">{business.name || "My Business"}</div>{docDesign.headerSubtitle && <div className="inv-biz-addr">{docDesign.headerSubtitle}</div>}
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

        {/* Party + receipt details */}
        <div className="inv-two-col">
          <div className="inv-box">
            <div className="inv-box-head">Received From:</div>
            <div className="inv-box-body">
              <div className="inv-party-name">{(payment.partyName || "").toUpperCase()}</div>
            </div>
          </div>
          <div className="inv-box">
            <div className="inv-box-head">Receipt Details:</div>
            <div className="inv-box-body">
              <div><span className="inv-label-strong">Receipt No.:</span> {payment.number || "—"}</div>
              <div><span className="inv-label-strong">Date:</span> {fmtDate(payment.date)}</div>
              {payment.againstInvoice && <div><span className="inv-label-strong">Against Invoice:</span> {payment.againstInvoice}</div>}
            </div>
          </div>
        </div>

        {/* Amount block */}
        <div className="inv-box" style={{ borderRight: "none" }}>
          <div className="inv-totals-row grand" style={{ fontSize: 18, justifyContent: "center", gap: 14 }}>
            <span>Amount Received</span><span>{fmt(payment.amount)}</span>
          </div>
        </div>
        <div className="inv-box" style={{ borderRight: "none" }}>
          <div className="inv-box-body">
            <span className="inv-label-strong">In Words: </span>{amountInWords(payment.amount)}
          </div>
        </div>

        {/* Mode / Bank */}
        <div className="inv-two-col">
          <div className="inv-box">
            <div className="inv-box-head">Payment Mode:</div>
            <div className="inv-box-body" style={{ fontWeight: 400 }}>
              {payment.mode}
              {payment.bankName && <div style={{ marginTop: 3 }}>{payment.bankName}</div>}
            </div>
          </div>
          <div className="inv-box">
            <div className="inv-box-head">Linked Invoice:</div>
            <div className="inv-box-body" style={{ fontWeight: 400 }}>
              {linkedDoc ? `${linkedDoc.number} — ${fmt(linkedDoc.total)} total` : "Not linked to any invoice"}
            </div>
          </div>
        </div>

        {payment.customFields?.length>0 && <div className="inv-two-col">{payment.customFields.map((f,i)=><div className="inv-box" key={i}><div className="inv-box-head">{f.label||"Additional"}</div><div className="inv-box-body">{f.value||"—"}</div></div>)}</div>}
        {payment.customSections?.map((section,i)=>(section.title||section.body)?<div className="inv-box" key={i} style={{marginBottom:12}}><div className="inv-box-head">{section.title||"Additional Information"}</div><div className="inv-box-body" style={{whiteSpace:"pre-wrap",fontWeight:400}}>{section.body}</div></div>:null)}

        {payment.notes && (
          <div className="inv-box" style={{ marginBottom: 12 }}>
            <div className="inv-box-head">Notes:</div>
            <div className="inv-box-body" style={{ fontWeight: 400 }}>{payment.notes}</div>
          </div>
        )}

        <div className="inv-two-col">
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

function CustomCanvas({elements=[],payment,business}){if(!elements?.length)return null;const val=e=>String(e.text||"").replace(/\{\{partyName\}\}/g,payment.partyName||"").replace(/\{\{date\}\}/g,payment.date||"").replace(/\{\{total\}\}/g,`₹ ${Number(payment.amount||0).toLocaleString("en-IN")}`).replace(/\{\{businessName\}\}/g,business.name||"");return <div className="inv-custom-canvas">{elements.map(e=><div key={e.id} className="inv-custom-element" style={{left:`${e.x}%`,top:`${e.y}%`,width:`${e.w}%`,height:`${e.h}%`,fontSize:e.fontSize,color:e.color,background:e.fill,borderColor:e.borderColor,textAlign:e.align,fontWeight:e.bold?700:400}}>{e.type==="logo"&&business.logoDataUrl?<img src={business.logoDataUrl} alt="logo"/>:e.type==="line"?<hr/>:e.type==="box"?<div className="custom-box"/>:e.type==="qr"?<div className="custom-qr">▦</div>:e.type==="total"?<b>₹ {Number(payment.amount||0).toLocaleString("en-IN")}</b>:val(e)}</div>)}</div>}
