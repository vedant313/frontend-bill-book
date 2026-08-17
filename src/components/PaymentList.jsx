import { Plus, Pencil, Trash2, Wallet, Printer, Download } from "lucide-react";
import { fmt, fmtDate } from "../utils/helpers";
import { exportPayments } from "../utils/exportExcel";

export default function PaymentList({ payments, goto, deletePayment }) {
  const sorted = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 19 }}>Payment In</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="bb-btn bb-btn-ghost" onClick={() => exportPayments(payments)} title="Download payments as an Excel file">
            <Download size={14} />
            Excel
          </button>
          <button className="bb-btn bb-btn-primary" onClick={() => goto("form", { listType: "payment" })}>
            <Plus size={14} />
            New Payment
          </button>
        </div>
      </div>
      {sorted.length === 0 ? (
        <div className="bb-card bb-empty">
          <Wallet size={30} />
          <div style={{ fontWeight: 600, marginBottom: 4 }}>No payments recorded</div>
          <div style={{ fontSize: 13, marginBottom: 14 }}>Log a payment you've received from a customer.</div>
          <button className="bb-btn bb-btn-primary" style={{ margin: "0 auto" }} onClick={() => goto("form", { listType: "payment" })}>
            <Plus size={14} />
            New Payment
          </button>
        </div>
      ) : (
        <div className="bb-card" style={{ padding: 0, overflow: "auto" }}>
          <table className="bb-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Party</th>
                <th>Date</th>
                <th>Mode / Bank</th>
                <th>Against</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p.id}>
                  <td className="bb-mono">{p.number || "—"}</td>
                  <td>{p.partyName}</td>
                  <td>{fmtDate(p.date)}</td>
                  <td>
                    {p.mode}
                    {p.bankName && <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.bankName}</div>}
                  </td>
                  <td className="bb-mono">{p.againstInvoice || "—"}</td>
                  <td className="amt" style={{ textAlign: "right" }}>{fmt(p.amount)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                      <button className="bb-icon-btn" title="View / Print" onClick={() => goto("preview", { previewId: p.id, previewKind: "payment", listType: "payment" })}>
                        <Printer size={15} />
                      </button>
                      <button className="bb-icon-btn" title="Edit" onClick={() => goto("form", { listType: "payment", editingId: p.id })}>
                        <Pencil size={15} />
                      </button>
                      <button
                        className="bb-icon-btn"
                        title="Delete"
                        onClick={() => {
                          if (confirm("Delete this payment?")) deletePayment(p.id);
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
