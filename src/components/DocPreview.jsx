import { useMemo } from "react";

export default function DocPreview({ doc, business, payments = [], onBack, onEdit }) {
  const design = business?.documentStyle || {};
  const meta = { label: doc?.type === "estimate" ? "Estimate" : doc?.type === "payment" ? "Payment In" : "Invoice", short: doc?.type === "estimate" ? "Estimate" : doc?.type === "payment" ? "Payment" : "Invoice" };
  const fmt = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const show = (key) => design[key] !== false;
  const received = payments.filter(p => p.invoiceId === doc?.id || p.docId === doc?.id).reduce((s, p) => s + Number(p.amount || 0), 0);
  const balance = Math.max(0, Number(doc?.total || 0) - received);
  const paymentModeLines = payments.filter(p => p.invoiceId === doc?.id || p.docId === doc?.id).map(p => `${p.mode || "Payment"}: ${fmt(p.amount)}`);
  const amountInWords = (n) => `Rupees ${Number(n || 0).toLocaleString("en-IN")} only`;

  return (
    <div className="doc-preview-page">
      <button className="bb-back" onClick={onBack}>← Back</button>
      <div className="inv-title">{design.documentTitle || meta.label}</div>
      <div className={`inv-doc doc-design-${design.header || "classic"} doc-table-${design.table || "grid"}`} style={{ "--doc-accent": design.accent || "#16233f", "--doc-radius": `${design.radius ?? 0}px`, "--doc-font": design.font === "Georgia" ? "Georgia, serif" : "Inter, Arial, sans-serif", "--doc-paper": design.paperBg || "#fff", "--doc-line": design.lineColor || "#d8dde5" }}>
        <CustomCanvas elements={design.canvasElements} doc={doc} business={business} />
        <div className="inv-block inv-header">
          <div className="inv-header-top" style={{ justifyContent: design.logoPosition === "center" ? "center" : design.logoPosition === "right" ? "flex-end" : "flex-start" }}>
            {show("showLogo") && business?.logoDataUrl ? <img className="inv-logo" src={business.logoDataUrl} alt="Business logo" /> : null}
            <div className="inv-business">
              <h2>{business?.name || "Your Business"}</h2>
              <div>{business?.address}</div><div>{business?.phone}</div><div>{business?.email}</div>
              {business?.gstin && <div>GSTIN: {business.gstin}</div>}
            </div>
          </div>
          <div className="inv-header-meta"><b>{meta.label.toUpperCase()}</b><div>No: {doc?.number}</div><div>Date: {doc?.date}</div></div>
        </div>

        <div className="inv-two-col">
          <div className="inv-box"><div className="inv-box-head">Bill To</div><div className="inv-box-body"><b>{doc?.partyName || "Customer"}</b><br />{doc?.partyPhone || ""}<br />{doc?.partyAddress || ""}</div></div>
          <div className="inv-box"><div className="inv-box-head">Payment</div><div className="inv-box-body">{paymentModeLines.length ? paymentModeLines.map((l) => <div key={l}>{l}</div>) : "Not received yet"}</div></div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div className="inv-box" style={{ marginBottom: 10 }}>
            <div className="inv-totals-row"><span>Sub Total</span><span>{fmt(doc?.subtotal)}</span></div>
            {doc?.discountAmt > 0 && <div className="inv-totals-row"><span>Discount</span><span>-{fmt(doc.discountAmt)}</span></div>}
            <div className="inv-totals-row grand"><span>Total</span><span>{fmt(doc?.total)}</span></div>
          </div>
          <div className="inv-box" style={{ marginBottom: 10, display: show("showAmountWords") ? undefined : "none" }}>
            <div className="inv-box-head" style={{ marginBottom: 4 }}>{meta.short} Amount in Words:</div>
            <div style={{ fontSize: 12.5, padding: "0 10px 10px" }}>{amountInWords(doc?.total)}</div>
          </div>
          {doc?.type === "invoice" && (
            <div className="inv-box">
              <div className="inv-totals-row"><span>Received</span><span>{fmt(received)}</span></div>
              <div className="inv-totals-row grand" style={{ color: balance > 0 ? "var(--red)" : "var(--green)" }}><span>Balance</span><span>{fmt(balance)}</span></div>
            </div>
          )}
        </div>

        {show("showTerms") && doc?.notes && (
          <div className="inv-box" style={{ marginBottom: 12 }}><div className="inv-box-head">Terms &amp; Conditions:</div><div className="inv-box-body" style={{ fontWeight: 400 }}>{doc.notes}</div></div>
        )}

        <div className="inv-two-col" style={{ display: show("showBank") || show("showSignature") ? undefined : "none" }}>
          <div className="inv-box" style={{ display: show("showBank") ? undefined : "none" }}><div className="inv-box-head">Bank Details</div><div className="inv-box-body">{business?.bankDetails || ""}</div></div>
          <div className="inv-box" style={{ display: show("showSignature") ? undefined : "none" }}><div className="inv-box-head">Authorized Signature</div><div style={{ height: 60 }} /></div>
        </div>

        <div className="inv-footer">{design.footerText || "Thank you for your business."}</div>
      </div>
    </div>
  );
}

function CustomCanvas({ elements = [], doc = {}, business = {} }) {
  const value = (e) => {
    const m = { "{{businessName}}": business.name, "{{partyName}}": doc.partyName, "{{partyPhone}}": doc.partyPhone, "{{invoiceNumber}}": doc.number, "{{date}}": doc.date, "{{total}}": `₹ ${Number(doc.total || 0).toLocaleString("en-IN")}`, "{{balance}}": `₹ ${Number(doc.total || 0).toLocaleString("en-IN")}`, "{{gstin}}": business.gstin, "{{address}}": business.address, "{{notes}}": doc.notes };
    return String(e.text || "").replace(/\{\{[^}]+\}\}/g, k => m[k] ?? k);
  };
  if (!elements?.length) return null;
  return <div className="inv-custom-canvas">{elements.map(e => <div key={e.id} className="inv-custom-element" style={{ left: `${e.x}%`, top: `${e.y}%`, width: `${e.w}%`, height: `${e.h}%`, fontSize: e.fontSize, color: e.color, background: e.fill, borderColor: e.borderColor, textAlign: e.align, fontWeight: e.bold ? 700 : 400 }}>{e.type === "logo" && business.logoDataUrl ? <img src={business.logoDataUrl} alt="logo" /> : e.type === "logo" ? <b>LOGO</b> : e.type === "image" ? <span>IMAGE</span> : e.type === "line" ? <hr /> : e.type === "box" ? <div className="custom-box" /> : e.type === "items" ? <div className="custom-mini-table"><i /><i /><i /><i /></div> : e.type === "total" ? <b>₹ {Number(doc.total || 0).toLocaleString("en-IN")}</b> : e.type === "qr" ? <div className="custom-qr">▦</div> : value(e)}</div>)}</div>;
}
