import { useState } from "react";
import { Plus, Search, Printer, Pencil, Trash2, FileText, Download } from "lucide-react";
import { fmt, fmtDate, DOC_META } from "../utils/helpers";
import { exportInvoices, exportEstimates } from "../utils/exportExcel";
import StatusBadge from "./StatusBadge";

export default function DocList({ type, docs, goto, deleteDoc }) {
  const [q, setQ] = useState("");
  const meta = DOC_META[type];
  const filtered = docs
    .filter((d) => (d.partyName || "").toLowerCase().includes(q.toLowerCase()) || d.number.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 19 }}>{meta.short}s</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "var(--muted)" }} />
            <input className="bb-input" style={{ paddingLeft: 30, width: 200 }} placeholder="Search party or number" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button
            className="bb-btn bb-btn-ghost"
            onClick={() => (type === "invoice" ? exportInvoices(docs) : exportEstimates(docs))}
            title={`Download ${meta.short.toLowerCase()}s as an Excel file`}
          >
            <Download size={14} />
            Excel
          </button>
          <button className="bb-btn bb-btn-primary" onClick={() => goto("form", { listType: type })}>
            <Plus size={14} />
            New {meta.short}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bb-card bb-empty">
          <FileText size={30} />
          <div style={{ fontWeight: 600, marginBottom: 4 }}>No {meta.short.toLowerCase()}s yet</div>
          <div style={{ fontSize: 13, marginBottom: 14 }}>Create your first {meta.short.toLowerCase()} to get started.</div>
          <button className="bb-btn bb-btn-primary" style={{ margin: "0 auto" }} onClick={() => goto("form", { listType: type })}>
            <Plus size={14} />
            New {meta.short}
          </button>
        </div>
      ) : (
        <div className="bb-card" style={{ padding: 0, overflow: "auto" }}>
          <table className="bb-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Party</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td className="bb-mono">{d.number}</td>
                  <td>{d.partyName || "—"}</td>
                  <td>{fmtDate(d.date)}</td>
                  <td>
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="amt" style={{ textAlign: "right" }}>{fmt(d.total)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                      <button className="bb-icon-btn" title="View / Print" onClick={() => goto("preview", { previewId: d.id, previewKind: "doc", listType: type })}>
                        <Printer size={15} />
                      </button>
                      <button className="bb-icon-btn" title="Edit" onClick={() => goto("form", { listType: type, editingId: d.id })}>
                        <Pencil size={15} />
                      </button>
                      <button
                        className="bb-icon-btn"
                        title="Delete"
                        onClick={() => {
                          if (confirm(`Delete ${d.number}?`)) deleteDoc(d.id);
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
