import { LayoutDashboard, FileText, FilePlus2, Wallet, Settings as SettingsIcon, Palette, LogOut } from "lucide-react";

export default function Sidebar({ page, listType, goto, sidebarOpen, setSidebarOpen, user, onLogout }) {
  const isActive = (p, lt) => page === p && (!lt || listType === lt);
  return (
    <>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 40 }}
        />
      )}
      <div className={`bb-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="bb-brand">
          <div className="bb-brand-mark">B</div>
          <div className="bb-brand-name">BillBook</div>
        </div>
        <div className="bb-nav">
          <button className={`bb-nav-item ${isActive("dashboard") ? "active" : ""}`} onClick={() => goto("dashboard")}>
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button className={`bb-nav-item ${isActive("list", "invoice") ? "active" : ""}`} onClick={() => goto("list", { listType: "invoice" })}>
            <FileText size={16} /> Invoices
          </button>
          <button className={`bb-nav-item ${isActive("list", "estimate") ? "active" : ""}`} onClick={() => goto("list", { listType: "estimate" })}>
            <FilePlus2 size={16} /> Estimates
          </button>
          <button className={`bb-nav-item ${isActive("list", "payment") ? "active" : ""}`} onClick={() => goto("list", { listType: "payment" })}>
            <Wallet size={16} /> Payment In
          </button>
        </div>
        <div className="bb-nav-spacer" />
        <div className="bb-nav-foot">
          <button className={`bb-nav-item ${isActive("theme") ? "active" : ""}`} onClick={() => goto("theme")}>
            <Palette size={16} /> Appearance
          </button>
          <button className={`bb-nav-item ${isActive("settings") ? "active" : ""}`} onClick={() => goto("settings")}>
            <SettingsIcon size={16} /> Business Settings
          </button>
          {user && (
            <div style={{ padding: "10px 10px 0", fontSize: 11.5, color: "#8a91a3", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 6 }}>
              Signed in as
              <div style={{ color: "#edeff4", fontWeight: 600, fontSize: 12.5, marginBottom: 6 }}>{user.name || user.email}</div>
            </div>
          )}
          <button className="bb-nav-item" onClick={onLogout}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </div>
    </>
  );
}
