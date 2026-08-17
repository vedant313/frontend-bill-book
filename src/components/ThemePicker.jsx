import { useState } from "react";
import { Check, Palette } from "lucide-react";
import { PRESET_THEMES, buildCustomTheme, applyThemeVars } from "../utils/themes.js";

export default function ThemePicker({ theme, onSaveTheme }) {
  const activePresetId = !theme?.custom ? theme?.preset || "ocean" : null;
  const [custom, setCustom] = useState(
    theme?.custom || { navy: "#16233f", teal: "#0f9b8e", paper: "#faf9f5", ink: "#1a1d24" }
  );
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const choosePreset = async (id) => {
    const preset = PRESET_THEMES.find((t) => t.id === id);
    applyThemeVars(preset.vars); // instant preview
    setSaving(true);
    try {
      await onSaveTheme({ preset: id, custom: null });
      flashSaved();
    } finally {
      setSaving(false);
    }
  };

  const previewCustom = (next) => {
    setCustom(next);
    applyThemeVars(buildCustomTheme(next));
  };

  const applyCustomTheme = async () => {
    setSaving(true);
    try {
      await onSaveTheme({ preset: theme?.preset || "ocean", custom });
      flashSaved();
    } finally {
      setSaving(false);
    }
  };

  const flashSaved = () => {
    setSavedMsg("Theme saved ✓");
    setTimeout(() => setSavedMsg(""), 2000);
  };

  return (
    <div>
      <div className="bb-card" style={{ maxWidth: 680, marginBottom: 16 }}>
        <div className="bb-section-title">
          <span>Choose a Design</span>
          {savedMsg && <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 600 }}>{savedMsg}</span>}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
          Pick a look for your invoices, dashboard and printed documents. Changes apply instantly.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          {PRESET_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => choosePreset(t.id)}
              disabled={saving}
              style={{
                border: activePresetId === t.id ? `2px solid ${t.vars["--teal"]}` : "1px solid var(--border)",
                borderRadius: 12,
                padding: 10,
                cursor: "pointer",
                background: t.vars["--card"],
                textAlign: "left",
                position: "relative",
              }}
            >
              {activePresetId === t.id && (
                <div style={{ position: "absolute", top: 8, right: 8, background: t.vars["--teal"], borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={12} color="#fff" />
                </div>
              )}
              <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: t.vars["--navy"], display: "inline-block" }} />
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: t.vars["--teal"], display: "inline-block" }} />
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: t.vars["--paper"], border: "1px solid var(--border)", display: "inline-block" }} />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: t.vars["--ink"] }}>{t.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bb-card" style={{ maxWidth: 680 }}>
        <div className="bb-section-title">
          <Palette size={16} style={{ marginRight: 6, verticalAlign: "-3px" }} />
          Create Your Own Theme
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14 }}>
          Pick your own colors — handy if you want BillBook to match your brand or logo.
        </div>
        <div className="bb-row2">
          <ColorField label="Primary (sidebar / headings)" value={custom.navy} onChange={(v) => previewCustom({ ...custom, navy: v })} />
          <ColorField label="Accent (buttons / highlights)" value={custom.teal} onChange={(v) => previewCustom({ ...custom, teal: v })} />
        </div>
        <div className="bb-row2">
          <ColorField label="Background" value={custom.paper} onChange={(v) => previewCustom({ ...custom, paper: v })} />
          <ColorField label="Text Color" value={custom.ink} onChange={(v) => previewCustom({ ...custom, ink: v })} />
        </div>
        <button className="bb-btn bb-btn-teal" onClick={applyCustomTheme} disabled={saving}>
          {saving ? "Saving…" : "Save Custom Theme"}
        </button>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div className="bb-field">
      <label>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 40, height: 34, border: "1px solid var(--border)", borderRadius: 8, padding: 2, background: "#fff" }} />
        <input className="bb-input" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
