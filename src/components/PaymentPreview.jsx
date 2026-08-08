import { ArrowLeft, Pencil, Printer } from "lucide-react";
import { fmt, fmtDate, amountInWords } from "../utils/helpers";

export default function PaymentPreview({ payment, business, docs, onBack, onEdit }) {
  if (!payment) return null;
  const linkedDoc = docs.find((d) => d.type === "invoice" && d.number === payment.againstInvoice);
  const hasBank = business.bankName || business.accountNo || business.ifsc;

  return (
    <div className="bb-paper-wrap" style={{ padding: "20px 16px" }}>
      <div className="bb-preview-toolbar no-print">
        <button className="bb-back" style={{ margin: 0 }} onClick={onBack}>
          <ArrowLeft size={15} />
          Back
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="bb-btn bb-btn-ghost" onClick={onEdit}>
            <Pencil size={14} />
            Edit
          </button>
          <button className="bb-btn bb-btn-primary" onClick={() => window.print()}>
            <Printer size={14} />
            Download / Print PDF
          </button>
        </div>
      </div>

      <div className="inv-title">Payment Receipt</div>
      <div className="inv-doc">
        {/* Header: logo + business + contact grid */}
        <div className="inv-block inv-header">
          <div className="inv-header-top">
            {business.logoDataUrl ? (
              <img src={business.logoDataUrl} alt="logo" className="inv-logo" />
            ) : (
              <div className="inv-logo inv-logo-fallback">{(business.name || "B")[0]}</div>
            )}
            <div className="inv-biz-name">
              <div className="inv-biz-title">{business.name || "My Business"}</div>
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

        {payment.notes && (
          <div className="inv-box" style={{ marginBottom: 12 }}>
            <div className="inv-box-head">Notes:</div>
            <div className="inv-box-body" style={{ fontWeight: 400 }}>{payment.notes}</div>
          </div>
        )}

        <div className="inv-two-col">
          <div className="inv-box">
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
          <div className="inv-box" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="inv-box-head">For {business.name || "My Business"}:</div>
            <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginTop: 30, paddingBottom: 10 }}>Authorized Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
}
