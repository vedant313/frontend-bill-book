import { useEffect, useState } from "react";
import { Search, Users, CreditCard, UserCheck, Clock3, RefreshCw } from "lucide-react";
import * as api from "../api";

const cardStyle = { background: "var(--card, #fff)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 };
const buttonStyle = { border: "1px solid var(--border)", borderRadius: 8, padding: "7px 10px", background: "var(--paper)", cursor: "pointer", color: "var(--ink)", fontWeight: 600 };

export default function AdminPage() {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = async (q = query, p = page) => {
    setLoading(true); setError("");
    try {
      const [stats, result] = await Promise.all([api.adminOverview(), api.adminUsers(q, p)]);
      setOverview(stats); setUsers(result.users || []); setPages(result.pages || 1);
    } catch (e) { setError(e.message || "Admin data load failed."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load("", 1); }, []);

  const updateStatus = async (user, status) => {
    if (!window.confirm((status === "suspended" ? "Suspend " : "Restore ") + user.email + "?")) return;
    setBusyId(user.id); setError(""); setNotice("");
    try { await api.adminSetUserStatus(user.id, status); setNotice("Customer account updated."); await load(); }
    catch (e) { setError(e.message || "Could not update account."); }
    finally { setBusyId(""); }
  };
  const updatePlan = async (user, plan) => {
    const days = plan === "free" ? 30 : Number(window.prompt("Subscription duration in days:", "30"));
    if (plan !== "free" && (!Number.isInteger(days) || days < 1 || days > 3650)) return;
    if (!window.confirm("Set " + user.email + " to " + plan.toUpperCase() + (plan === "free" ? " plan?" : " for " + days + " days?"))) return;
    setBusyId(user.id); setError(""); setNotice("");
    try { await api.adminSetSubscription(user.id, plan, days); setNotice("Subscription updated."); await load(); }
    catch (e) { setError(e.message || "Could not update subscription."); }
    finally { setBusyId(""); }
  };

  const Stat = ({ icon: Icon, label, value }) => <div style={cardStyle}><div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--muted)", fontSize: 13 }}><Icon size={17}/>{label}</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{value ?? "—"}</div></div>;

  return <div style={{ padding: "24px 18px", maxWidth: 1400, margin: "0 auto", color: "var(--ink)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
      <div><div style={{ fontSize: 25, fontWeight: 800 }}>Admin Control Panel</div><div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Nexsa Bills · Customer and subscription management</div></div>
      <button style={buttonStyle} onClick={() => load()}><RefreshCw size={14} style={{ verticalAlign: "middle", marginRight: 6 }}/>Refresh</button>
    </div>
    {error && <div role="alert" style={{ padding: 12, borderRadius: 8, background: "#FCE8E6", color: "#B3261E", marginBottom: 14 }}>{error}</div>}
    {notice && <div role="status" style={{ padding: 12, borderRadius: 8, background: "#E6F4EA", color: "#137333", marginBottom: 14 }}>{notice}</div>}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 24 }}>
      <Stat icon={Users} label="Total customers" value={overview?.totalUsers}/>
      <Stat icon={UserCheck} label="New users · 30 days" value={overview?.newUsersLast30Days}/>
      <Stat icon={CreditCard} label="Paid subscriptions" value={overview?.activePaidSubscriptions}/>
      <Stat icon={Clock3} label="Pending payment requests" value={overview?.pendingPaymentRequests}/>
      <Stat icon={CreditCard} label="Paid Cashfree order value" value={overview ? "₹" + Number(overview.paidOrderValue || 0).toLocaleString("en-IN") : "—"}/>
    </div>
    <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
      <div style={{ padding: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 18, fontWeight: 750 }}>Customers</div>
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(query, 1); }} style={{ display: "flex", gap: 8, flex: "1 1 300px", maxWidth: 460 }}>
          <div style={{ position: "relative", flex: 1 }}><Search size={16} style={{ position: "absolute", left: 10, top: 11, color: "var(--muted)" }}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, email or phone" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px 9px 32px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--paper)", color: "var(--ink)" }}/></div>
          <button type="submit" style={buttonStyle}>Search</button>
        </form>
      </div>
      {loading ? <div style={{ padding: 28, textAlign: "center", color: "var(--muted)" }}>Loading customer data…</div> : users.length === 0 ? <div style={{ padding: 28, textAlign: "center", color: "var(--muted)" }}>No customers found.</div> : <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 960 }}>
          <thead><tr style={{ textAlign: "left", background: "var(--paper)" }}>{["Customer","Mobile","Registered","Plan","Account","Manage"].map(x => <th key={x} style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>{x}</th>)}</tr></thead>
          <tbody>{users.map(user => <tr key={user.id}>
            <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}><div style={{ fontWeight: 700 }}>{user.name || "—"}</div><div style={{ color: "var(--muted)", marginTop: 3 }}>{user.email}</div><div style={{ color: "var(--muted)", fontSize: 11, marginTop: 3 }}>{user.authProvider || "email"}{user.phoneVerifiedAt ? " · phone verified" : ""}</div></td>
            <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>{user.phone || "Not linked"}</td>
            <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "Unknown"}</td>
            <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}><div style={{ fontWeight: 700 }}>{user.subscription?.planName || "Free"}</div><div style={{ color: "var(--muted)", fontSize: 11 }}>{user.subscription?.expiresAt ? "Until " + new Date(user.subscription.expiresAt).toLocaleDateString("en-IN") : "No expiry set"}</div><select aria-label={"Plan for " + user.email} defaultValue={user.subscription?.plan || "free"} disabled={busyId === user.id} onChange={e => updatePlan(user, e.target.value)} style={{ marginTop: 6, maxWidth: 120, ...buttonStyle }}><option value="free">Free</option><option value="pro">Pro</option><option value="advanced">Advanced</option></select></td>
            <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}><span style={{ padding: "4px 8px", borderRadius: 20, background: user.status === "suspended" ? "#FCE8E6" : "#E6F4EA", color: user.status === "suspended" ? "#B3261E" : "#137333", fontWeight: 700, fontSize: 11 }}>{user.status || "active"}</span></td>
            <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}><button disabled={busyId === user.id} onClick={() => updateStatus(user, user.status === "suspended" ? "active" : "suspended")} style={buttonStyle}>{busyId === user.id ? "Saving…" : user.status === "suspended" ? "Restore" : "Suspend"}</button></td>
          </tr>)}</tbody>
        </table>
      </div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, borderTop: "1px solid var(--border)", fontSize: 13 }}><span>Page {page} of {pages}</span><div style={{ display: "flex", gap: 8 }}><button disabled={page <= 1} style={buttonStyle} onClick={() => { const p = page - 1; setPage(p); load(query, p); }}>Previous</button><button disabled={page >= pages} style={buttonStyle} onClick={() => { const p = page + 1; setPage(p); load(query, p); }}>Next</button></div></div>
    </div>
  </div>;
}
