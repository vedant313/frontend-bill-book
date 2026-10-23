import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Download, FileUp, Grip, LayoutTemplate, Plus, Save, ScanText, Trash2 } from "lucide-react";
import * as api from "../api";

const FIELD_OPTIONS = [
  ["businessName", "Company name"], ["logo", "Company logo"], ["businessAddress", "Company address"],
  ["gstin", "Company GSTIN"], ["partyName", "Bill to / Customer"], ["partyAddress", "Customer address"],
  ["invoiceNumber", "Invoice number"], ["date", "Invoice date"], ["dueDate", "Due date"],
  ["items", "Items table"], ["hsn", "HSN/SAC"], ["qty", "Quantity"], ["rate", "Rate"],
  ["discount", "Discount"], ["gst", "GST breakup"], ["subtotal", "Subtotal"], ["total", "Grand total"],
  ["amountWords", "Amount in words"], ["bank", "Bank details"], ["upi", "UPI QR placeholder"],
  ["signature", "Authorized signature"], ["terms", "Terms & conditions"]
];
const INITIAL_FIELDS = ["businessName","businessAddress","gstin","partyName","partyAddress","invoiceNumber","date","items","qty","rate","gst","subtotal","total","terms"];
const DEFAULT_LAYOUT = [
  { id:"businessName", label:"{{businessName}}", x:6, y:5, w:55, h:7, size:19, bold:true },
  { id:"businessAddress", label:"{{businessAddress}}", x:6, y:13, w:58, h:5, size:9 },
  { id:"invoiceNumber", label:"Invoice No: {{invoiceNumber}}", x:67, y:6, w:28, h:5, size:10, bold:true },
  { id:"date", label:"Date: {{date}}", x:67, y:12, w:28, h:5, size:10 },
  { id:"partyName", label:"Bill To: {{partyName}}", x:6, y:23, w:48, h:6, size:12, bold:true },
  { id:"items", label:"Items table", x:6, y:34, w:88, h:28, size:10 },
  { id:"subtotal", label:"Subtotal: {{subtotal}}", x:62, y:67, w:32, h:5, size:10 },
  { id:"gst", label:"GST: {{gst}}", x:62, y:73, w:32, h:5, size:10 },
  { id:"total", label:"Grand Total: {{total}}", x:62, y:80, w:32, h:7, size:14, bold:true },
  { id:"terms", label:"{{terms}}", x:6, y:91, w:70, h:5, size:8 }
];

function formatINR(value) {
  return "₹" + (Number(value) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CustomInvoiceStudio() {
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("My custom invoice");
  const [activeId, setActiveId] = useState("");
  const [enabledFields, setEnabledFields] = useState(INITIAL_FIELDS);
  const [elements, setElements] = useState(DEFAULT_LAYOUT);
  const [selectedId, setSelectedId] = useState("businessName");
  const [referenceName, setReferenceName] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [accent, setAccent] = useState("#202020");
  const [font, setFont] = useState("Arial");
  const fileInput = useRef(null);
  const canvasRef = useRef(null);
  const dragging = useRef(null);

  const load = async () => {
    setBusy(true); setError("");
    try {
      const result = await api.getCustomInvoiceTemplates();
      setTemplates(result.templates || []);
    } catch (e) { setError(e.message || "Could not load saved templates."); }
    finally { setBusy(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => () => { if (referenceUrl) URL.revokeObjectURL(referenceUrl); }, [referenceUrl]);

  const selectedElement = elements.find((el) => el.id === selectedId);
  const enabled = useMemo(() => new Set(enabledFields), [enabledFields]);
  const toggleField = (id, checked) => {
    setEnabledFields((old) => checked ? [...new Set([...old, id])] : old.filter((x) => x !== id));
    if (!checked) setElements((old) => old.filter((el) => el.id !== id));
    else if (!elements.some((el) => el.id === id)) {
      const meta = FIELD_OPTIONS.find(([key]) => key === id);
      setElements((old) => [...old, { id, label: meta?.[1] || id, x: 8, y: Math.min(88, 20 + old.length * 4), w: id === "items" ? 86 : 38, h: id === "items" ? 25 : 5, size: id === "total" ? 14 : 10, bold: id === "total" }]);
    }
  };
  const updateElement = (id, patch) => setElements((old) => old.map((el) => el.id === id ? { ...el, ...patch } : el));
  const addField = (id) => {
    if (enabled.has(id)) { setSelectedId(id); return; }
    toggleField(id, true); setSelectedId(id);
  };
  const handlePDF = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) { setError("Please upload a PDF file."); return; }
    if (file.size > 12 * 1024 * 1024) { setError("PDF must be smaller than 12 MB."); return; }
    setError(""); setNotice(""); setAnalysis("Reading the first page layout…");
    if (referenceUrl) URL.revokeObjectURL(referenceUrl);
    const url = URL.createObjectURL(file);
    setReferenceUrl(url); setReferenceName(file.name);
    try {
      const pdfjs = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
      const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      const textItems = content.items.filter((item) => item.str && item.str.trim()).slice(0, 35);
      const extracted = textItems.map((item, index) => {
        const transform = pdfjs.Util.transform(viewport.transform, item.transform);
        const x = Math.max(2, Math.min(88, (transform[4] / viewport.width) * 100));
        const y = Math.max(2, Math.min(94, ((viewport.height - transform[5]) / viewport.height) * 100));
        return { id: "pdf_" + index, label: item.str.trim().slice(0, 90), x, y, w: Math.max(12, Math.min(75, (item.width / viewport.width) * 100 + 2)), h: Math.max(2.5, Math.min(6, (item.height / viewport.height) * 100 + 1)), size: Math.max(7, Math.min(18, Math.round(item.height))), bold: false, referenceText: true };
      });
      if (extracted.length) {
        setElements(extracted);
        setEnabledFields(INITIAL_FIELDS);
        setSelectedId(extracted[0].id);
        setAnalysis("Extracted " + extracted.length + " text positions from page 1 of " + pdf.numPages + " page(s). This is a starting layout; recreate tables, logos and fields with the editor and verify the preview.");
      } else {
        setAnalysis("This PDF has no selectable text (it may be scanned). The PDF is loaded as a reference; use the field controls to build the layout manually.");
      }
    } catch (e) {
      setAnalysis("PDF reference loaded. Automatic text-position analysis could not run in this browser; you can still build the layout manually.");
    }
  };

  const startMove = (event, el) => {
    if (event.button !== 0) return;
    event.preventDefault();
    setSelectedId(el.id);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragging.current = { id: el.id, startX: event.clientX, startY: event.clientY, x: el.x, y: el.y, rect };
    const move = (e) => {
      if (!dragging.current) return;
      const d = dragging.current;
      updateElement(d.id, { x: Math.max(0, Math.min(94, d.x + (e.clientX - d.startX) / d.rect.width * 100)), y: Math.max(0, Math.min(96, d.y + (e.clientY - d.startY) / d.rect.height * 100)) });
    };
    const end = () => { dragging.current = null; window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", end); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", end);
  };

  const save = async () => {
    const name = templateName.trim();
    if (!name) { setError("Give this template a name first."); return; }
    setBusy(true); setError(""); setNotice("");
    const item = { id: activeId || "tpl_" + Date.now(), name, enabledFields, elements, accent, font, sourceFileName: referenceName, updatedAt: new Date().toISOString() };
    try {
      const result = await api.saveCustomInvoiceTemplate(item);
      setTemplates(result.templates || []);
      setActiveId(item.id);
      setNotice("Template saved to the admin account.");
    } catch (e) { setError(e.message || "Could not save template."); }
    finally { setBusy(false); }
  };
  const selectTemplate = (item) => {
    setActiveId(item.id); setTemplateName(item.name || "Custom invoice"); setEnabledFields(item.enabledFields || INITIAL_FIELDS);
    setElements(item.elements || DEFAULT_LAYOUT); setAccent(item.accent || "#202020"); setFont(item.font || "Arial");
    setReferenceName(item.sourceFileName || ""); setAnalysis("Loaded saved template.");
    setSelectedId((item.elements || DEFAULT_LAYOUT)[0]?.id || "");
  };
  const deleteTemplate = async (id) => {
    if (!window.confirm("Delete this saved template?")) return;
    setBusy(true); setError(""); setNotice("");
    try { const result = await api.deleteCustomInvoiceTemplate(id); setTemplates(result.templates || []); if (activeId === id) { setActiveId(""); setTemplateName("My custom invoice"); } setNotice("Template deleted."); }
    catch (e) { setError(e.message || "Could not delete template."); }
    finally { setBusy(false); }
  };
  const exportPDF = () => window.print();

  return <div style={{ padding: "22px 18px", color: "var(--ink)", maxWidth: 1500, margin: "0 auto" }}>
    <style>{`
      .cis-grid{display:grid;grid-template-columns:minmax(240px,300px) minmax(320px,1fr) minmax(220px,280px);gap:16px;align-items:start}
      .cis-card{background:var(--card,#fff);border:1px solid var(--border,#ddd);border-radius:14px;padding:14px;min-width:0}
      .cis-btn{border:1px solid var(--border,#ddd);background:var(--paper,#fff);color:var(--ink);padding:9px 11px;border-radius:8px;font-weight:650;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:7px}
      .cis-btn.primary{background:#202020;color:white;border-color:#202020}
      .cis-input{box-sizing:border-box;width:100%;padding:9px;border:1px solid var(--border,#ddd);border-radius:8px;background:var(--paper,#fff);color:var(--ink)}
      .cis-canvas{position:relative;width:100%;aspect-ratio:210/297;background:white;color:#202020;border:1px solid #d5d5d5;box-shadow:0 5px 24px #0000000d;overflow:hidden}
      .cis-el{position:absolute;box-sizing:border-box;cursor:move;overflow:hidden;padding:2px;white-space:pre-wrap;line-height:1.25;border:1px dashed transparent}
      .cis-el.selected{border-color:#555;background:#f7f7f7}
      .cis-check{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px}
      @media(max-width:1050px){.cis-grid{grid-template-columns:minmax(220px,1fr) minmax(320px,1.3fr)}.cis-side{grid-column:1/-1}}
      @media(max-width:680px){.cis-grid{grid-template-columns:1fr}.cis-side{grid-column:auto}}
      @media print{body *{visibility:hidden!important}.cis-print,.cis-print *{visibility:visible!important}.cis-print{position:absolute!important;left:0!important;top:0!important;width:100%!important;padding:0!important}.cis-print .cis-canvas{box-shadow:none;border:0}.cis-no-print{display:none!important}}
    `}</style>
    <div className="cis-no-print" style={{ display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:18 }}>
      <div><div style={{fontSize:24,fontWeight:850}}>Custom Invoice Studio <span style={{fontSize:11,verticalAlign:"middle",padding:"4px 7px",borderRadius:99,background:"#eee",color:"#222"}}>ADMIN PILOT</span></div><div style={{color:"var(--muted)",fontSize:13,marginTop:5}}>Test custom invoice layouts here before enabling them for everyone.</div></div>
      <button className="cis-btn" onClick={load} disabled={busy}>Refresh templates</button>
    </div>
    {error && <div role="alert" style={{padding:11,background:"#FCE8E6",color:"#B3261E",borderRadius:8,marginBottom:12}}>{error}</div>}
    {notice && <div role="status" style={{padding:11,background:"#E6F4EA",color:"#137333",borderRadius:8,marginBottom:12}}>{notice}</div>}
    <div className="cis-grid">
      <section className="cis-card cis-no-print">
        <h3 style={{margin:"0 0 10px",fontSize:16}}>1. Upload sample PDF</h3>
        <input ref={fileInput} type="file" accept="application/pdf,.pdf" hidden onChange={(e)=>handlePDF(e.target.files?.[0])}/>
        <button className="cis-btn" style={{width:"100%",minHeight:74,borderStyle:"dashed"}} onClick={()=>fileInput.current?.click()}><FileUp size={20}/> Choose PDF to analyze</button>
        <div style={{fontSize:12,color:"var(--muted)",marginTop:7}}>PDF only · up to 12 MB · first page text positions are analyzed in your browser.</div>
        {referenceName && <div style={{fontSize:12,marginTop:10,overflowWrap:"anywhere"}}><b>File:</b> {referenceName}</div>}
        {analysis && <div style={{marginTop:10,padding:10,borderRadius:8,background:"var(--paper,#f8f8f8)",fontSize:12,lineHeight:1.5}}><ScanText size={15} style={{verticalAlign:"middle",marginRight:5}}/>{analysis}</div>}
        {referenceUrl && <iframe title="Uploaded invoice PDF reference" src={referenceUrl} style={{width:"100%",height:240,border:"1px solid var(--border)",borderRadius:8,marginTop:12}}/>}
        <hr style={{border:0,borderTop:"1px solid var(--border)",margin:"18px 0"}}/>
        <h3 style={{margin:"0 0 10px",fontSize:16}}>2. Choose fields</h3>
        <div style={{maxHeight:390,overflowY:"auto"}}>
          {FIELD_OPTIONS.map(([id,label])=><label className="cis-check" key={id}><input type="checkbox" checked={enabled.has(id)} onChange={(e)=>toggleField(id,e.target.checked)}/>{label}</label>)}
        </div>
        <hr style={{border:0,borderTop:"1px solid var(--border)",margin:"16px 0"}}/>
        <h3 style={{margin:"0 0 10px",fontSize:16}}>Saved templates ({templates.length})</h3>
        {templates.length===0 && <div style={{fontSize:12,color:"var(--muted)"}}>No saved templates yet.</div>}
        {templates.map((item)=><div key={item.id} style={{display:"flex",gap:6,alignItems:"center",marginTop:7}}><button className="cis-btn" style={{flex:1,justifyContent:"flex-start",minWidth:0,overflow:"hidden",textOverflow:"ellipsis"}} onClick={()=>selectTemplate(item)}><LayoutTemplate size={14}/>{item.name}</button><button className="cis-btn" aria-label={"Delete "+item.name} onClick={()=>deleteTemplate(item.id)}><Trash2 size={14}/></button></div>)}
      </section>
      <section className="cis-card cis-print" style={{padding:14}}>
        <div className="cis-no-print" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}><h3 style={{margin:0,fontSize:16}}>Live invoice preview</h3><button className="cis-btn primary" onClick={exportPDF}><Download size={15}/> Export PDF</button></div>
        <div ref={canvasRef} className="cis-canvas">
          {elements.filter((el)=>el.referenceText || enabled.has(el.id)).map((el)=> {
            const textMap = {
              businessName:"NEXSA SAMPLE BUSINESS",businessAddress:"Business address · Phone · Email",gstin:"GSTIN: 27ABCDE1234F1Z5",
              partyName:"Bill To: Sample Customer",partyAddress:"Customer address",invoiceNumber:"Invoice No: INV-0001",date:"Date: 23/10/2026",dueDate:"Due date: 30/10/2026",
              items:"ITEM DESCRIPTION          QTY       RATE       GST       AMOUNT\nSample product                    2       ₹500       18%       ₹1,180\nService charge                    1       ₹250       18%         ₹295",
              hsn:"HSN/SAC",qty:"Qty",rate:"Rate",discount:"Discount",gst:"GST: ₹225.00",subtotal:"Subtotal: ₹1,250.00",total:"GRAND TOTAL: ₹1,475.00",
              amountWords:"Amount in words: One thousand four hundred seventy-five rupees only",bank:"Bank details: Account · IFSC",upi:"UPI QR placeholder",signature:"Authorized signature",terms:"Terms & conditions: Thank you for your business."
            };
            const label = el.referenceText ? el.label : (textMap[el.id] || el.label || el.id);
            return <div key={el.id} onPointerDown={(e)=>startMove(e,el)} onClick={()=>setSelectedId(el.id)} className={"cis-el"+(selectedId===el.id?" selected":"")} style={{left:el.x+"%",top:el.y+"%",width:el.w+"%",minHeight:el.h+"%",fontSize:(el.size||10)+"px",fontWeight:el.bold?750:400,color:el.id==="total"?accent:"#222",fontFamily:font,zIndex:selectedId===el.id?3:1}}>{label}</div>;
          })}
        </div>
        <div className="cis-no-print" style={{fontSize:11,color:"var(--muted)",marginTop:9}}>Drag items on the page to reposition them. Preview uses sample values; invoice data is not changed.</div>
      </section>
      <section className="cis-card cis-side cis-no-print">
        <h3 style={{margin:"0 0 12px",fontSize:16}}>3. Customize & save</h3>
        <label style={{display:"block",fontSize:12,fontWeight:700,marginBottom:5}}>Template name</label>
        <input className="cis-input" value={templateName} onChange={(e)=>setTemplateName(e.target.value)} maxLength={80}/>
        <label style={{display:"block",fontSize:12,fontWeight:700,margin:"13px 0 5px"}}>Accent color</label>
        <input className="cis-input" type="color" value={accent} onChange={(e)=>setAccent(e.target.value)} style={{height:40,padding:4}}/>
        <label style={{display:"block",fontSize:12,fontWeight:700,margin:"13px 0 5px"}}>Font</label>
        <select className="cis-input" value={font} onChange={(e)=>setFont(e.target.value)}><option>Arial</option><option>Georgia</option><option>Verdana</option><option>Tahoma</option></select>
        <hr style={{border:0,borderTop:"1px solid var(--border)",margin:"16px 0"}}/>
        <h4 style={{margin:"0 0 10px",fontSize:14}}>Selected element</h4>
        {!selectedElement ? <div style={{fontSize:12,color:"var(--muted)"}}>Select an element on the preview to edit it.</div> : <div style={{display:"grid",gap:9}}>
          <div style={{fontSize:12,overflowWrap:"anywhere"}}><b>{selectedElement.id}</b></div>
          <label style={{fontSize:12}}>Text / label<input className="cis-input" value={selectedElement.label} onChange={(e)=>updateElement(selectedElement.id,{label:e.target.value})} style={{marginTop:4}}/></label>
          <label style={{fontSize:12}}>Font size<input className="cis-input" type="number" min="7" max="32" value={selectedElement.size||10} onChange={(e)=>updateElement(selectedElement.id,{size:Math.max(7,Math.min(32,Number(e.target.value)||10))})} style={{marginTop:4}}/></label>
          <label className="cis-check"><input type="checkbox" checked={Boolean(selectedElement.bold)} onChange={(e)=>updateElement(selectedElement.id,{bold:e.target.checked})}/> Bold text</label>
          <button className="cis-btn" onClick={()=>{setElements((old)=>old.filter((el)=>el.id!==selectedElement.id));setEnabledFields((old)=>old.filter((id)=>id!==selectedElement.id));setSelectedId("");}}><Trash2 size={14}/> Remove element</button>
        </div>}
        <button className="cis-btn" style={{width:"100%",marginTop:14}} onClick={()=>{setElements((old)=>[...old,{id:"custom_"+Date.now(),label:"Custom text",x:12,y:50,w:35,h:6,size:10,bold:false}]);setSelectedId("custom_"+Date.now());}}><Plus size={14}/> Add text block</button>
        <button className="cis-btn primary" style={{width:"100%",marginTop:9}} onClick={save} disabled={busy}><Save size={15}/>{busy?"Saving…":"Save template"}</button>
      </section>
    </div>
  </div>;
}
