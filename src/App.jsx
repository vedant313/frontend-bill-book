import { useState, useEffect, useMemo } from "react";
import * as api from "./api";
import { monthLabel } from "./utils/helpers";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Dashboard from "./components/Dashboard";
import DocList from "./components/DocList";
import DocForm from "./components/DocForm";
import DocPreview from "./components/DocPreview";
import PaymentList from "./components/PaymentList";
import PaymentForm from "./components/PaymentForm";
import PaymentPreview from "./components/PaymentPreview";
import SettingsPage from "./components/SettingsPage";

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [business, setBusiness] = useState({ name: "My Business" });
  const [docs, setDocs] = useState([]); // invoices + estimates
  const [payments, setPayments] = useState([]);

  const [page, setPage] = useState("dashboard"); // dashboard | list | form | preview | settings
  const [listType, setListType] = useState("invoice"); // invoice | estimate | payment
  const [editingId, setEditingId] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [previewKind, setPreviewKind] = useState("doc");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [b, d, p] = await Promise.all([api.getBusiness(), api.getDocuments(), api.getPayments()]);
        setBusiness(b);
        setDocs(d);
        setPayments(p);
      } catch (e) {
        console.error(e);
        setError("Could not reach the backend. Make sure it's running (see README) on the expected port.");
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const goto = (p, opts = {}) => {
    setPage(p);
    setSidebarOpen(false);
    if (opts.listType) setListType(opts.listType);
    setEditingId(opts.editingId ?? null);
    if (opts.previewId !== undefined) setPreviewId(opts.previewId);
    if (opts.previewKind) setPreviewKind(opts.previewKind);
  };

  // ---- Documents (invoices/estimates) ----
  const upsertDoc = async (doc) => {
    if (doc.id) {
      const saved = await api.updateDocument(doc.id, doc);
      setDocs((prev) => prev.map((d) => (d.id === saved.id ? saved : d)));
      return saved;
    }
    const saved = await api.createDocument(doc);
    setDocs((prev) => [...prev, saved]);
    return saved;
  };
  const deleteDoc = async (id) => {
    await api.deleteDocument(id);
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  // ---- Payments ----
  const upsertPayment = async (p) => {
    if (p.id) {
      const saved = await api.updatePayment(p.id, p);
      setPayments((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
      return saved;
    }
    const saved = await api.createPayment(p);
    setPayments((prev) => [...prev, saved]);
    return saved;
  };
  const deletePayment = async (id) => {
    await api.deletePayment(id);
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  // ---- Business ----
  const saveBusiness = async (b) => {
    const saved = await api.saveBusiness(b);
    setBusiness(saved);
    return saved;
  };

  const stats = useMemo(() => {
    const invoices = docs.filter((d) => d.type === "invoice");
    const estimates = docs.filter((d) => d.type === "estimate");
    const totalInvoiced = invoices.reduce((s, d) => s + d.total, 0);
    const totalReceived = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const pending = Math.max(totalInvoiced - totalReceived, 0);
    return { invoices, estimates, totalInvoiced, totalReceived, pending };
  }, [docs, payments]);

  const chartData = useMemo(() => {
    const map = {};
    const pushInto = (dateStr, key, amt) => {
      const dt = new Date(dateStr);
      const mk = `${dt.getFullYear()}-${dt.getMonth()}`;
      if (!map[mk]) map[mk] = { label: monthLabel(dateStr), invoiced: 0, received: 0, order: dt.getFullYear() * 12 + dt.getMonth() };
      map[mk][key] += amt;
    };
    docs.filter((d) => d.type === "invoice").forEach((d) => pushInto(d.date, "invoiced", d.total));
    payments.forEach((p) => pushInto(p.date, "received", Number(p.amount) || 0));
    return Object.values(map)
      .sort((a, b) => a.order - b.order)
      .slice(-6);
  }, [docs, payments]);

  if (!loaded) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--muted)" }}>
        Loading your books…
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div style={{ background: "#FBEBE8", color: "#B94A3F", padding: "10px 16px", fontSize: 13, textAlign: "center" }}>{error}</div>
      )}
      <div className="bb-shell no-print">
        <Sidebar page={page} listType={listType} goto={goto} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="bb-main">
          <TopBar business={business} goto={goto} setSidebarOpen={setSidebarOpen} />
          <div className="bb-content">
            {page === "dashboard" && <Dashboard stats={stats} chartData={chartData} docs={docs} payments={payments} goto={goto} />}

            {page === "list" && listType !== "payment" && (
              <DocList type={listType} docs={docs.filter((d) => d.type === listType)} goto={goto} deleteDoc={deleteDoc} />
            )}
            {page === "list" && listType === "payment" && <PaymentList payments={payments} goto={goto} deletePayment={deletePayment} />}

            {page === "form" && listType !== "payment" && (
              <DocForm
                type={listType}
                docs={docs}
                business={business}
                existing={docs.find((d) => d.id === editingId) || null}
                onSave={async (doc) => {
                  const saved = await upsertDoc(doc);
                  goto("preview", { previewId: saved.id, previewKind: "doc", listType: saved.type });
                }}
                onCancel={() => goto("list", { listType })}
              />
            )}
            {page === "form" && listType === "payment" && (
              <PaymentForm
                docs={docs}
                payments={payments}
                business={business}
                existing={payments.find((p) => p.id === editingId) || null}
                onSave={async (p) => {
                  const saved = await upsertPayment(p);
                  goto("preview", { previewId: saved.id, previewKind: "payment", listType: "payment" });
                }}
                onCancel={() => goto("list", { listType: "payment" })}
              />
            )}

            {page === "settings" && (
              <SettingsPage business={business} onSave={async (b) => { await saveBusiness(b); goto("dashboard"); }} onCancel={() => goto("dashboard")} />
            )}
          </div>
        </div>
      </div>

      {page === "preview" && previewKind === "doc" && (
        <DocPreview
          doc={docs.find((d) => d.id === previewId)}
          business={business}
          payments={payments}
          onBack={() => goto("list", { listType })}
          onEdit={() => goto("form", { listType, editingId: previewId })}
        />
      )}

      {page === "preview" && previewKind === "payment" && (
        <PaymentPreview
          payment={payments.find((p) => p.id === previewId)}
          business={business}
          docs={docs}
          onBack={() => goto("list", { listType: "payment" })}
          onEdit={() => goto("form", { listType: "payment", editingId: previewId })}
        />
      )}
    </div>
  );
}
