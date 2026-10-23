import { useState } from "react";
import { ArrowLeft, FileUp, Sparkles, Download, LoaderCircle } from "lucide-react";
import { getToken } from "../api";

const BASE = import.meta.env.VITE_API_BASE || "https://backend1-tx8q.onrender.com/api";
async function uploadRequest(path, file, values) {
  const form = new FormData();
  form.append("pdf", file);
  if (values) form.append("values", JSON.stringify(values));
  const response = await fetch(BASE + path, { method: "POST", headers: { ...(getToken() ? { Authorization: "Bearer " + getToken() } : {}) }, body: form });
  if (!response.ok) {
    let message = "Request failed (" + response.status + ")";
    try { const body = await response.json(); if (body.error) message = body.error; } catch {}
    throw new Error(message);
  }
  return response;
}
const card = { border: "1px solid var(--border)", background: "var(--card)", borderRadius: 12, padding: 16 };
const input = { width: "100%", boxSizing: "border-box", padding: "10px 11px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--paper)", color: "var(--ink)" };
const button = { border: "1px solid var(--border)", background: "var(--paper)", color: "var(--ink)", borderRadius: 8, padding: "9px 12px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 };
export default function AIQuotationGenerator({ onBack }) {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [values, setValues] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const chooseFile = (next) => { setFile(next); setAnalysis(null); setValues({}); setError(""); setNotice(""); };
  const analyze = async () => {
    if (!file) { setError("Pehle quotation PDF select kar bhai."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await uploadRequest("/admin/custom-quotation/analyze", file);
      const result = await response.json();
      setAnalysis(result);
      setValues(Object.fromEntries((result.fields || []).filter((f) => f.editable).map((f) => [f.key, f.currentValue || ""])));
      setNotice("AI ne fields suggest kiye hain. Download se pehle har value verify karna.");
    } catch (e) { setError(e.message || "PDF analyze nahi ho paya."); }
    finally { setBusy(false); }
  };
  const download = async () => {
    if (!file || !analysis) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await uploadRequest("/admin/custom-quotation/render", file, values);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "nexsa-custom-quotation-review.pdf"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      setNotice("Review PDF download ho gaya. Original layout mein values overlay abhi supported nahi hai.");
    } catch (e) { setError(e.message || "PDF generate nahi ho paya."); }
    finally { setBusy(false); }
  };
  return <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20, color: "var(--ink)" }}>
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 18 }}>
      <button style={button} onClick={onBack}><ArrowLeft size={15}/> Admin panel</button>
      <div><div style={{ fontSize: 24, fontWeight: 850 }}>AI Custom Quotation Generator</div><div style={{ fontSize: 13, color: "var(--muted)" }}>Admin-only pilot · Gemini PDF analysis</div></div>
    </div>
    {error && <div role="alert" style={{ padding: 12, marginBottom: 12, borderRadius: 8, background: "#FCE8E6", color: "#B3261E" }}>{error}</div>}
    {notice && <div role="status" style={{ padding: 12, marginBottom: 12, borderRadius: 8, background: "var(--paper)", border: "1px solid var(--border)" }}>{notice}</div>}
    <section style={{ ...card, marginBottom: 14 }}>
      <h3 style={{ marginTop: 0 }}>1. Upload customer quotation PDF</h3>
      <input type="file" accept=".pdf,application/pdf" onChange={(e) => chooseFile(e.target.files?.[0] || null)} />
      <div style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0 14px" }}>PDF only · maximum 12 MB. Analysis sends the PDF to Google Gemini. Avoid uploading sensitive customer details unless you have permission.</div>
      {file && <div style={{ marginBottom: 12, fontSize: 13 }}>Selected: <b>{file.name}</b> ({(file.size / 1024 / 1024).toFixed(2)} MB)</div>}
      <button style={{ ...button, background: "#171717", color: "#fff" }} disabled={busy || !file} onClick={analyze}>{busy ? <LoaderCircle size={16}/> : <Sparkles size={16}/>} {busy ? "Analyzing…" : "Analyze PDF with AI"}</button>
    </section>
    {analysis && <section style={{ ...card, marginBottom: 14 }}>
      <h3 style={{ marginTop: 0 }}>2. Review detected fields</h3>
      <div style={{ fontSize: 13, marginBottom: 12 }}>{analysis.summary || "AI ne PDF ke editable fields identify kiye."} · {analysis.pageCount} page(s)</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
        {(analysis.fields || []).filter((f) => f.editable).map((field) => <label key={field.key} style={{ fontSize: 13, display: "block" }}>
          <span style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 5 }}><b>{field.label}</b><span style={{ color: "var(--muted)", fontSize: 11 }}>Page {field.page} · {Math.round((field.confidence || 0) * 100)}%</span></span>
          {field.type === "address" || (field.currentValue || "").length > 100
            ? <textarea rows={3} style={input} value={values[field.key] ?? ""} onChange={(e) => setValues((old) => ({ ...old, [field.key]: e.target.value }))}/>
            : <input style={input} value={values[field.key] ?? ""} onChange={(e) => setValues((old) => ({ ...old, [field.key]: e.target.value }))}/>}
          {field.reason && <span style={{ display: "block", color: "var(--muted)", fontSize: 11, marginTop: 4 }}>{field.reason}</span>}
        </label>)}
      </div>
      <div style={{ marginTop: 18, padding: 12, borderRadius: 8, background: "var(--paper)", fontSize: 12 }}>Important: this pilot detects fields using AI but does not yet know exact editable text coordinates. The generated review PDF preserves the original pages and appends a filled-values sheet; it does not replace text in-place in the original layout.</div>
      <button style={{ ...button, marginTop: 14, background: "#171717", color: "#fff" }} disabled={busy} onClick={download}><Download size={16}/> {busy ? "Generating…" : "Download review PDF"}</button>
    </section>}
  </div>;
}
