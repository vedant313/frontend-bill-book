import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { fmt, fmtDate, DOC_META } from "../utils/helpers";

export default function Dashboard({ stats, chartData, docs, payments, goto }) {
  const recent = useMemo(() => {
    const a = docs.map((d) => ({ id: d.id, kind: "doc", type: d.type, date: d.date, party: d.partyName, amount: d.total }));
    const b = payments.map((p) => ({ id: p.id, kind: "payment", date: p.date, party: p.partyName, amount: p.amount }));
    return [...a, ...b].sort((x, y) => new Date(y.date) - new Date(x.date)).slice(0, 6);
  }, [docs, payments]);

  return (
    <div>
      <div className="bb-stat-grid">
        <div className="bb-stat-card" style={{ "--accent": "var(--navy)" }}>
          <div className="bb-stat-label">Total Invoiced</div>
          <div className="bb-stat-value">{fmt(stats.totalInvoiced)}</div>
        </div>
        <div className="bb-stat-card" style={{ "--accent": "var(--green)" }}>
          <div className="bb-stat-label">Payment Received</div>
          <div className="bb-stat-value">{fmt(stats.totalReceived)}</div>
        </div>
        <div className="bb-stat-card" style={{ "--accent": "var(--amber)" }}>
          <div className="bb-stat-label">Pending Amount</div>
          <div className="bb-stat-value">{fmt(stats.pending)}</div>
        </div>
        <div className="bb-stat-card" style={{ "--accent": "var(--teal)" }}>
          <div className="bb-stat-label">Open Estimates</div>
          <div className="bb-stat-value">{stats.estimates.length}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <div className="bb-card">
          <div className="bb-section-title">Invoiced vs Received (last 6 months)</div>
          {chartData.length === 0 ? (
            <div className="bb-empty">No data yet — create your first invoice to see trends.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEE" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="invoiced" fill="#16233F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="received" fill="#0F9B8E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bb-card">
          <div className="bb-section-title">Recent Activity</div>
          {recent.length === 0 ? (
            <div className="bb-empty">Nothing yet. Start by creating an invoice.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recent.map((r) => (
                <div
                  key={r.kind + r.id}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: r.kind === "doc" ? "pointer" : "default" }}
                  onClick={() => r.kind === "doc" && goto("preview", { previewId: r.id, previewKind: "doc", listType: r.type })}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.party || "Unnamed party"}</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
                      {r.kind === "doc" ? DOC_META[r.type].short : "Payment In"} · {fmtDate(r.date)}
                    </div>
                  </div>
                  <div className="bb-mono" style={{ fontSize: 13, fontWeight: 600 }}>{fmt(r.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
