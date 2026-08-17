import { useState, useEffect, useMemo } from "react";
import * as api from "./api";
import { monthLabel } from "./utils/helpers";
import { resolveThemeVars, applyThemeVars } from "./utils/themes";
import { exportAllData } from "./utils/exportExcel";

import Login from "./components/Login";
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
import ThemePicker from "./components/ThemePicker";
import Landing from "./components/Landing";
import ExportCenter from "./components/ExportCenter";
import DocumentDesigner from "./components/DocumentDesigner";

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [waking, setWaking] = useState(false);
  const [business, setBusiness] = useState({ name: "My Business" });
  const [docs, setDocs] = useState([]); // invoices + estimates
  const [payments, setPayments] = useState([]);

  const [page, setPage] = useState("dashboard"); // dashboard | list | form | preview | settings | theme
  const [listType, setListType] = useState("invoice"); // invoice | estimate | payment
  const [editingId, setEditingId] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [previewKind, setPreviewKind] = useState("doc");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ---- Auth bootstrap: check for a stored token on first load ----
  useEffect(() => {
    let cancelled = false;
    const token = api.getToken();
    if (!token) {
      setAuthChecked(true);
      return;
    }
    api
      .me()
      .then(({ user: u }) => {
        if (cancelled) return;
        setUser(u);
      })
      .catch(() => {
        if (cancelled) return;
        api.clearToken();
      })
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });
    return () => { cancelled = true; };
  }, []);

  // ---- Data load, once signed in ----
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Free hosting plans put the backend to sleep after inactivity — the first
    // request after that can take 30-60s to wake it up. Retry several times
    // with growing delays instead of giving up immediately.
    const loadData = async () => {
      const maxAttempts = 6;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const [b, d, p] = await Promise.all([api.getBusiness(), api.getDocuments(), api.getPayments()]);
          if (cancelled) return;
          setBusiness(b);
          setDocs(d);
          setPayments(p);
          setError("");
          setWaking(false);
          setLoaded(true);
          return;
        } catch (e) {
          console.error(e);
          if (cancelled) return;
          if (attempt === 1) setWaking(true);
          if (attempt < maxAttempts) {
            await sleep(Math.min(5000 * attempt, 15000));
          } else {
            setError("Could not reach the backend after several tries. Please check your connection and refresh the page.");
            setWaking(false);
            setLoaded(true);
          }
        }
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [user]);

  // ---- Theme: apply whenever the business profile's theme changes ----
  useEffect(() => {
    applyThemeVars(resolveThemeVars(business.theme));
  }, [business.theme]);

  const goto = (p, opts = {}) => {
    setPage(p);
    setSidebarOpen(false);
    if (opts.listType) setListType(opts.listType);
    setEditingId(opts.editingId ?? null);
    if (opts.previewId !== undefined) setPreviewId(opts.previewId);
    if (opts.previewKind) setPreviewKind(opts.previewKind);
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    setLoaded(false);
    setBusiness({ name: "My Business" });
    setDocs([]);
    setPayments([]);
    setPage("dashboard");
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
  const saveTheme = async (theme) => saveBusiness({ ...business, theme });

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

  if (!authChecked) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--muted)" }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Landing onAuthed={setUser} />;
  }

  if (!loaded) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--muted)", gap: 10, textAlign: "center", padding: 20 }}>
        <div>{waking ? "Waking up the server… this can take up to a minute on first load." : "Loading your books…"}</div>
        {waking && <div style={{ fontSize: 12.5, maxWidth: 320 }}>Your data is safe — the free server just needs a moment to start after being idle.</div>}
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div style={{ background: "#FBEBE8", color: "#B94A3F", padding: "10px 16px", fontSize: 13, textAlign: "center" }}>{error}</div>
      )}
      <div className="bb-shell no-print">
        <Sidebar page={page} listType={listType} goto={goto} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} onLogout={logout} />
        <div className="bb-main">
          <TopBar business={business} goto={goto} setSidebarOpen={setSidebarOpen} onExportAll={() => goto("export")} />
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
              <SettingsPage business={business} onSave={async (b) => { await saveBusiness({ ...business, ...b }); goto("dashboard"); }} onCancel={() => goto("dashboard")} />
            )}

            {page === "theme" && <ThemePicker theme={business.theme} onSaveTheme={saveTheme} />}
            {page === "export" && <ExportCenter docs={docs} payments={payments} goto={goto} />}
            {page === "designer" && <DocumentDesigner business={business} onSave={async (documentStyle) => saveBusiness({ ...business, documentStyle })} onBack={() => goto("dashboard")} />}
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
