import { Menu, Plus } from "lucide-react";

export default function TopBar({ business, goto, setSidebarOpen }) {
  return (
    <div className="bb-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button className="bb-menu-btn" onClick={() => setSidebarOpen(true)}>
          <Menu size={20} />
        </button>
        <div>
          <div style={{ fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 15 }}>{business.name || "My Business"}</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{business.phone || "Add business details in Settings"}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="bb-btn bb-btn-ghost" onClick={() => goto("form", { listType: "estimate" })}>
          <Plus size={14} />
          Estimate
        </button>
        <button className="bb-btn bb-btn-primary" onClick={() => goto("form", { listType: "invoice" })}>
          <Plus size={14} />
          Invoice
        </button>
      </div>
    </div>
  );
}
