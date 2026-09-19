import { useMemo, useState } from "react";
import { ArrowLeft, Check, Palette, Save, Sparkles, Trash2, Type, Image as ImageIcon, Minus, Square, Hash, QrCode, Plus, Move, Search, FileText, ReceiptText, WalletCards, Printer, LayoutTemplate, Settings2, ChevronDown } from "lucide-react";
import { DOCUMENT_DESIGNS } from "../utils/documentDesigns";
import "./DocumentDesignLibrary.css";

const blank = { preset:"classic", accent:"#16233f", header:"classic", layout:"standard", density:"normal", radius:4, font:"Inter", table:"grid", paperBg:"#ffffff", lineColor:"#d8dde5", logoPosition:"left", showLogo:true, showTaxSummary:true, showAmountWords:true, showBank:true, showSignature:true, showTerms:true, footerText:"Thank you for your business.", headerSubtitle:"Professional business document", documentTitle:"", watermarkText:"", showHsn:true, showQty:true, showRate:true, showGst:true, canvasElements:[], printSettings:{paperSize:"A4",orientation:"Portrait",companyName:true,companyLogo:true,address:true,email:true,phone:true,gstin:true,repeatHeader:true,companyNameSize:"Large",invoiceTextSize:"Medium",itemTableRows:0,expandTable:true,totalQty:true,received:true,balance:true,currentBalance:false,taxDetails:true,youSaved:true,amountGrouping:true,amountWords:"Indian",description:true,terms:true,receivedBy:true,deliveredBy:true,signature:true,paymentMode:true,acknowledgement:false,thermalWidth:"80mm",thermalTextStyling:true,autoCut:false,cashDrawer:false,extraLines:0,copies:1}, colors:{accent:"#16233f",header:"#16233f",table:"#8b6b5b",text:"#1f2937"} };

const palette=[
 {type:"text",label:"Text",icon:Type,defaultText:"Custom text"},
 {type:"field",label:"Field",icon:Hash,defaultText:"{{partyName}}"},
 {type:"logo",label:"Logo",icon:ImageIcon,defaultText:""},
 {type:"image",label:"Image",icon:ImageIcon,defaultText:""},
 {type:"line",label:"Divider",icon:Minus,defaultText:""},
 {type:"box",label:"Box",icon:Square,defaultText:""},
 {type:"items",label:"Items Table",icon:Hash,defaultText:""},
 {type:"total",label:"Grand Total",icon:Hash,defaultText:""},
 {type:"qr",label:"QR / UPI",icon:QrCode,defaultText:""}
];

const fields=["{{businessName}}","{{partyName}}","{{partyPhone}}","{{invoiceNumber}}","{{date}}","{{total}}","{{balance}}","{{gstin}}","{{address}}","{{notes}}"];

function makeElement(type,i=0){
 const p=palette.find(x=>x.type===type);
 return {id:`el_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,type,x:8+(i%3)*28,y:8+Math.floor(i/3)*13,w:type==="items"?84:type==="text"?34:22,h:type==="items"?24:type==="line"?1:type==="box"?12:7,text:p?.defaultText||"",fontSize:type==="text"?14:10,bold:type==="total",align:"left",color:"#16233f",borderColor:"#d8dde5",fill:"transparent"};
}

const TYPE_META={
 invoice:{label:"Invoice",sub:"Tax invoice themes",icon:FileText},
 estimate:{label:"Estimate",sub:"Quotation & estimate themes",icon:ReceiptText},
 payment:{label:"Payment Receipt",sub:"Receipt & payment themes",icon:WalletCards}
};



function normalizeStyle(style,type){
 const title=type==="invoice"?"INVOICE":type==="estimate"?"ESTIMATE":"PAYMENT RECEIPT";
 return {...blank,...style,documentTitle:style?.documentTitle || title,canvasElements:(style?.canvasElements||[]).map(x=>({...x}))};
}

function previewRows(d){
 return d.layout==="thermal" ? 5 : d.density==="compact" ? 4 : 3;
}

export default function DocumentDesigner({ business, onSave, onBack }) {
 const initialStyles=business.documentStyles||{
   invoice:business.documentStyle||blank,
   estimate:business.documentStyle||blank,
   payment:business.documentStyle||blank
 };
 const [activeType,setActiveType]=useState("invoice");
 const [styles,setStyles]=useState({
   invoice:normalizeStyle(initialStyles.invoice,"invoice"),
   estimate:normalizeStyle(initialStyles.estimate,"estimate"),
   payment:normalizeStyle(initialStyles.payment,"payment")
 });
 const [filter,setFilter]=useState("All");
 const [search,setSearch]=useState("");
 const [templateName,setTemplateName]=useState("");
 const [selected,setSelected]=useState(null);
 const [zoom,setZoom]=useState(1);
 const [showCustomizer,setShowCustomizer]=useState(false);
 const [printerTab,setPrinterTab]=useState("regular");
 const [settingsOpen,setSettingsOpen]=useState(true);
 const [editorTab,setEditorTab]=useState("layout");
 const style=styles[activeType];
 const setStyle=patch=>setStyles(prev=>({...prev,[activeType]:{...prev[activeType],...patch}}));
 const ps=style.printSettings||blank.printSettings;
 const colors=style.colors||blank.colors;
 const setPrint=(patch)=>setStyle({printSettings:{...ps,...patch},preset:"custom"});
 const setColors=(patch)=>setStyle({colors:{...colors,...patch},accent:patch.accent||colors.accent,preset:"custom"});
 const [savedTemplates]=useState(business.documentTemplates||[]);
 const categories=useMemo(()=>["All",...new Set(DOCUMENT_DESIGNS.map(d=>d.category))],[/* static */]);
 const designs=useMemo(()=>{
   const q=search.trim().toLowerCase();
   return DOCUMENT_DESIGNS.filter(d=>{
     const categoryOk=filter==="All" || d.category===filter || (filter==="A4" && d.category==="Professional") || (filter==="GST" && d.category==="GST & Tax") || (filter==="Thermal" && d.category==="Quick Billing");
     const searchOk=!q || `${d.name} ${d.category}`.toLowerCase().includes(q);
     return categoryOk && searchOk;
   });
 },[filter,search]);

 const elements=style.canvasElements||[];
 const update=(id,patch)=>setStyle({canvasElements:elements.map(e=>e.id===id?{...e,...patch}:e)});
 const add=type=>{const e=makeElement(type,elements.length);setStyle({canvasElements:[...elements,e]});setSelected(e.id);setShowCustomizer(true)};
 const remove=()=>{if(!selected)return;setStyle({canvasElements:elements.filter(e=>e.id!==selected)});setSelected(null)};
 const choose=d=>{setStyle({...blank,...d,printSettings:{...blank.printSettings,...ps},colors:{...blank.colors,...colors,accent:d.accent,header:d.accent},canvasElements:elements,preset:d.id});setSelected(null);setShowCustomizer(false)};
 const applyAndSave=async()=>onSave(styles, savedTemplates);
 const saveTemplate=async()=>{
   const name=templateName.trim();
   if(!name)return alert("Enter a template name");
   const tpl={id:`tpl_${Date.now()}`,name,style:{...style,preset:"custom",templateId:`tpl_${Date.now()}`},documentType:activeType};
   await onSave(styles,[...savedTemplates,tpl]);
   setTemplateName("");
   alert("Template saved.");
 };
 const deleteTemplate=async id=>{
   if(confirm("Delete this saved template?")) await onSave(styles,savedTemplates.filter(t=>t.id!==id));
 };
 const onDragStart=(ev,type)=>ev.dataTransfer.setData("type",type);
 const drop=ev=>{
   ev.preventDefault();
   const type=ev.dataTransfer.getData("type"); if(!type)return;
   const r=ev.currentTarget.getBoundingClientRect();
   const e=makeElement(type,elements.length);
   e.x=Math.max(1,Math.min(92,((ev.clientX-r.left)/r.width)*100-6));
   e.y=Math.max(1,Math.min(92,((ev.clientY-r.top)/r.height)*100-3));
   setStyle({canvasElements:[...elements,e]});setSelected(e.id);setShowCustomizer(true);
 };
 const move=(ev,e)=>{
   if(ev.button!==0)return;
   ev.preventDefault();setSelected(e.id);
   const start={x:ev.clientX,y:ev.clientY},r=ev.currentTarget.parentElement.getBoundingClientRect(),ox=e.x,oy=e.y;
   const mm=m=>update(e.id,{x:Math.max(0,Math.min(94,ox+(m.clientX-start.x)/r.width*100)),y:Math.max(0,Math.min(96,oy+(m.clientY-start.y)/r.height*100))});
   const up=()=>{window.removeEventListener("mousemove",mm);window.removeEventListener("mouseup",up)};
   window.addEventListener("mousemove",mm);window.addEventListener("mouseup",up);
 };

 return <div className="design-library">
   <button className="bb-back" onClick={onBack}><ArrowLeft size={15}/> Back</button>

   <div className="design-hero bb-card">
     <div>
       <div className="design-kicker"><Sparkles size={14}/> BillBook Design Studio</div>
       <h1>Choose how your documents look</h1>
       <p>Pick a ready-made theme, preview it instantly, then customize your invoice, estimate or payment receipt.</p>
     </div>
     <div className="design-hero-actions"><span><LayoutTemplate size={15}/> {DOCUMENT_DESIGNS.length}+ templates</span><button className="bb-btn bb-btn-primary" onClick={applyAndSave}><Check size={14}/> Save Design</button></div>
   </div>

   <div className="design-type-tabs bb-card">
     {Object.entries(TYPE_META).map(([key,m])=>{const I=m.icon;return <button key={key} className={activeType===key?"active":""} onClick={()=>{setActiveType(key);setSelected(null)}}><I size={17}/><span><b>{m.label}</b><small>{m.sub}</small></span>{styles[key].preset&&<em>✓</em>}</button>})}
   </div>

   <div className="print-settings-card bb-card">
     <div className="printer-tabs">
       <button className={printerTab==="regular"?"active":""} onClick={()=>setPrinterTab("regular")}><Printer size={15}/> REGULAR PRINTER</button>
       <button className={printerTab==="thermal"?"active":""} onClick={()=>setPrinterTab("thermal")}><ReceiptText size={15}/> THERMAL PRINTER</button>
     </div>
     {printerTab==="regular" ? <div className="printer-settings-layout">
       <div className="printer-settings-panel">
         <div className="settings-subtabs"><button className={editorTab==="layout"?"active":""} onClick={()=>setEditorTab("layout")}>CHANGE LAYOUT</button><button className={editorTab==="colors"?"active":""} onClick={()=>setEditorTab("colors")}>CHANGE COLORS</button><button className={editorTab==="customize"?"active":""} onClick={()=>setEditorTab("customize")}>CUSTOMIZE</button></div>
         <div className="mini-layouts mini-layouts-expanded">{designs.slice(0,18).map(d=><button key={d.id} className={style.preset===d.id?"active":""} onClick={()=>choose(d)}><div className={`mini-layout-thumb mini-${d.layout}`} style={{"--accent":d.accent}}><i/><i/><i/><i/></div><span>{d.name}</span></button>)}</div>
         {editorTab==="colors" && <section className="settings-section inline-editor-section"><h3>Document Colors</h3><div className="color-editor-grid">{[["accent","Accent / Header"],["table","Table"],["text","Text"],["header","Header"]].map(([k,l])=><label key={k}>{l}<div className="color-control"><input type="color" value={colors[k]||"#16233f"} onChange={e=>setColors({[k]:e.target.value})}/><input className="bb-input" value={colors[k]||""} onChange={e=>setColors({[k]:e.target.value})}/></div></label>)}</div></section>}
         {editorTab==="customize" && <section className="settings-section inline-editor-section"><h3>Customize {TYPE_META[activeType].label}</h3><div className="setting-fields"><label>Document Title<input className="bb-input" value={style.documentTitle||""} onChange={e=>setStyle({documentTitle:e.target.value,preset:"custom"})}/></label><label>Font<select value={style.font} onChange={e=>setStyle({font:e.target.value,preset:"custom"})}><option>Inter</option><option>Georgia</option></select></label><label>Logo Position<select value={style.logoPosition} onChange={e=>setStyle({logoPosition:e.target.value,preset:"custom"})}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label><label>Header Style<select value={style.header} onChange={e=>setStyle({header:e.target.value,preset:"custom"})}><option value="classic">Classic</option><option value="minimal">Minimal</option><option value="modern">Modern</option><option value="band">Color Band</option></select></label></div><div className="customizer-checks inline-checks">{[["showLogo","Logo"],["showTaxSummary","Tax summary"],["showAmountWords","Amount in words"],["showBank","Bank details"],["showSignature","Signature"],["showTerms","Terms"],["showHsn","HSN/SAC"],["showQty","Quantity"],["showRate","Price"],["showGst","GST"]].map(([k,l])=><label key={k}><input type="checkbox" checked={style[k]!==false} onChange={e=>setStyle({[k]:e.target.checked,preset:"custom"})}/>{l}</label>)}</div><div className="save-inline"><input className="bb-input" placeholder="Save this design as template" value={templateName} onChange={e=>setTemplateName(e.target.value)}/><button className="bb-btn bb-btn-ghost" onClick={saveTemplate}><Save size={13}/> Save Template</button></div></section>}
         <section className="settings-section"><h3>Print Company Info / Header</h3>{[
           ["companyName","Company Name"],["companyLogo","Company Logo"],["address","Address"],["email","Email"],["phone","Phone Number"],["gstin","GSTIN on Sale"]
         ].map(([k,l])=><label className="setting-row" key={k}><input type="checkbox" checked={ps[k]!==false} onChange={e=>setPrint({[k]:e.target.checked})}/><span>{l}</span></label>)}
         <div className="setting-fields"><label>Paper Size<select value={ps.paperSize} onChange={e=>setPrint({paperSize:e.target.value})}><option>A4</option><option>A5</option><option>A3</option></select></label><label>Orientation<select value={ps.orientation} onChange={e=>setPrint({orientation:e.target.value})}><option>Portrait</option><option>Landscape</option></select></label><label>Company Name Text Size<select value={ps.companyNameSize} onChange={e=>setPrint({companyNameSize:e.target.value})}><option>Small</option><option>Medium</option><option>Large</option></select></label><label>Invoice Text Size<select value={ps.invoiceTextSize} onChange={e=>setPrint({invoiceTextSize:e.target.value})}><option>Small</option><option>Medium</option><option>Large</option></select></label></div></section>
         <section className="settings-section"><h3>Item Table</h3><label className="setting-row"><input type="checkbox" checked={ps.expandTable!==false} onChange={e=>setPrint({expandTable:e.target.checked})}/><span>Expand table to print on whole page</span></label><label className="setting-row"><input type="checkbox" checked={ps.repeatHeader!==false} onChange={e=>setPrint({repeatHeader:e.target.checked})}/><span>Print repeat header in all pages</span></label><label>Minimum No. of Rows <input className="small-number" type="number" min="0" max="100" value={ps.itemTableRows} onChange={e=>setPrint({itemTableRows:Number(e.target.value)})}/></label></section>
         <section className="settings-section"><h3>Totals & Taxes</h3>{[["totalQty","Total Item Quantity"],["received","Received Amount"],["balance","Balance Amount"],["currentBalance","Current Balance of Party"],["taxDetails","Tax Details"],["youSaved","You Saved"],["amountGrouping","Print Amount with Grouping"]].map(([k,l])=><label className="setting-row" key={k}><input type="checkbox" checked={!!ps[k]} onChange={e=>setPrint({[k]:e.target.checked})}/><span>{l}</span></label>)}<label>Amount in Words <select value={ps.amountWords} onChange={e=>setPrint({amountWords:e.target.value})}><option>Indian</option><option>International</option></select></label></section>
         <section className="settings-section"><h3>Footer</h3>{[["description","Print Description"],["terms","Print Terms and Conditions"],["receivedBy","Print Received by details"],["deliveredBy","Print Delivered by details"],["signature","Print Signature"],["paymentMode","Payment Mode"],["acknowledgement","Print Acknowledgement"]].map(([k,l])=><label className="setting-row" key={k}><input type="checkbox" checked={!!ps[k]} onChange={e=>setPrint({[k]:e.target.checked})}/><span>{l}</span></label>)}</section>
       </div>
       <div className="printer-live-preview"><div className="preview-toolbar"><span>Live Preview</span><span>{ps.paperSize} · {ps.orientation}</span></div><div className={`printer-paper ${ps.orientation==="Landscape"?"landscape":""} doc-preview-layout-${style.layout||"standard"}`} style={{"--accent":style.accent||colors.accent}}>
         <div className="paper-head">
           <div className="paper-logo">{ps.companyLogo && (business.logo||business.logoUrl)?<img src={business.logo||business.logoUrl} alt="Company logo"/>:<span>{ps.companyLogo?"N":" "}</span>}</div>
           <div><b>{business.name||"Nexsa Technologies"}</b><small>{business.address||"Dhule, Maharashtra"}<br/>{ps.phone?(business.phone||"8208581567"):""} {ps.email?(business.email||"nexsatechnologies@gmail.com"):""}<br/>{ps.gstin?(business.gstin||"GSTIN: SAMPLE GSTIN"):""}</small></div>
           <strong>{style.documentTitle||TYPE_META[activeType].label.toUpperCase()}</strong>
         </div>
         <div className="paper-info-grid">
           <div><b>{activeType==="payment"?"Received From":"Bill To"}</b><span>Rahul Enterprises</span><small>98765 43210<br/>Dhule, Maharashtra</small></div>
           <div><b>{activeType==="payment"?"Receipt No.":"Document No."}</b><span>{activeType==="payment"?"PAY-2026-001":"INV-2026-001"}</span><small>Date: 19 Sep 2026<br/>{activeType==="estimate"?"Valid Till: 29 Sep 2026":"Due: 29 Sep 2026"}</small></div>
         </div>
         <div className="paper-items">
           <div className="paper-item-head"><span>Item / Description</span><span>Qty</span><span>Rate</span><span>GST</span><span>Amount</span></div>
           {["Business Website","Billing Software Setup","WhatsApp Integration","Technical Support"].map((x,i)=><div className="paper-item-row" key={x}><span>{x}<small>HSN/SAC: 9983</small></span><span>{i+1}</span><span>₹ {(2500+i*750).toLocaleString("en-IN")}</span><span>18%</span><span>₹ {((2500+i*750)*(i+1)).toLocaleString("en-IN")}</span></div>)}
         </div>
         <div className="paper-summary"><div><b>Taxable Amount</b><span>₹ 12,500.00</span><b>CGST 9%</b><span>₹ 1,125.00</span><b>SGST 9%</b><span>₹ 1,125.00</span></div><div className="grand"><b>Grand Total</b><strong>₹ 14,750.00</strong><small>Amount in words: Fourteen Thousand Seven Hundred Fifty Rupees Only</small></div></div>
         <div className="paper-footer"><div><b>Terms & Conditions</b><span>Payment due within 10 days. Goods/services subject to applicable GST.</span></div><div><b>Bank / Payment</b><span>UPI: nexsatechnologies@upi<br/>Thank you for your business.</span></div><div className="signature"><span>Authorized Signature</span></div></div>
       </div></div>
     </div> : <div className="printer-settings-layout">
       <div className="printer-settings-panel"><div className="settings-subtabs"><button className="active">CHANGE LAYOUT</button></div><div className="mini-layouts">{DOCUMENT_DESIGNS.filter(d=>d.layout==="thermal").concat(DOCUMENT_DESIGNS.filter(d=>d.category==="Quick Billing"&&d.layout!=="thermal")).map(d=><button key={d.id} className={style.preset===d.id?"active":""} onClick={()=>choose(d)}><div className="mini-layout-thumb thermal-mini" style={{"--accent":d.accent}}><i/><i/><i/><i/><i/></div><span>{d.name}</span></button>)}</div><section className="settings-section"><h3>Thermal Printer</h3><div className="thermal-widths">{["58mm","80mm","Custom"].map(w=><button key={w} className={ps.thermalWidth===w?"active":""} onClick={()=>setPrint({thermalWidth:w})}>{w}</button>)}</div><label>Printing Type<select value={ps.printingType||"Text Printing"} onChange={e=>setPrint({printingType:e.target.value})}><option>Text Printing</option><option>Graphic Printing</option></select></label>{[["thermalTextStyling","Use Text Styling (Bold)"],["autoCut","Auto Cut Paper After Printing"],["cashDrawer","Open Cash Drawer After Printing"]].map(([k,l])=><label className="setting-row" key={k}><input type="checkbox" checked={!!ps[k]} onChange={e=>setPrint({[k]:e.target.checked})}/><span>{l}</span></label>)}<div className="setting-fields"><label>Extra lines <input type="number" value={ps.extraLines} onChange={e=>setPrint({extraLines:Number(e.target.value)})}/></label><label>Number of copies <input type="number" min="1" value={ps.copies} onChange={e=>setPrint({copies:Number(e.target.value)})}/></label></div></section></div><div className="printer-live-preview"><div className="preview-toolbar"><span>Thermal Preview</span><span>{ps.thermalWidth}</span></div><div className="thermal-paper"><b>{business.name||"My Company"}</b><small>{business.phone||""}</small><hr/><strong>{style.documentTitle||TYPE_META[activeType].label}</strong><hr/>{[1,2,3,4,5].map(i=><div key={i} className="thermal-row"><span>Item {i}</span><span>₹ 100.00</span></div>)}<hr/><div className="thermal-grand">Total <b>₹ 500.00</b></div><hr/><small>Thank you for your business.</small></div></div>
     </div>}
     <div className="color-strip"><b>Change Colors</b>{["#16233f","#2563eb","#0f766e","#dc2626","#7c3aed","#ea580c","#059669","#111827","#a16207","#db2777","#0891b2","#16a34a"].map(color=><button key={color} style={{background:color}} className={colors.accent===color?"selected":""} onClick={()=>setColors({accent:color})}/>)}</div>
   </div>



   <div className="design-library-head bb-card">
     <div><h2>Template library</h2><p>Every card below is a real selectable document theme.</p></div>
     <label className="design-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search templates..." /></label>
   </div>

   <div className="design-filter-row">
     {categories.map(c=><button key={c} className={filter===c?"active":""} onClick={()=>setFilter(c)}>{c}</button>)}
   </div>

   <div className="design-template-grid">
     {designs.map(d=><button key={d.id} className={`design-template-card ${style.preset===d.id?"selected":""}`} onClick={()=>choose(d)}>
       <div className={`design-thumb thumb-${d.layout}`} style={{"--accent":d.accent}}>
         <div className="thumb-top"><div className="thumb-logo">B</div><div><b>{business.name||"YOUR BUSINESS"}</b><small>{activeType==="invoice"?"TAX INVOICE":activeType==="estimate"?"ESTIMATE":"PAYMENT RECEIPT"}</small></div><strong>₹48,500</strong></div>
         <div className="thumb-meta"><i/><i/><i/></div>
         <div className="thumb-table">{Array.from({length:previewRows(d)},(_,i)=><span key={i}><i/><i/><i/><i/></span>)}</div>
         <div className="thumb-total"><span>TOTAL</span><b>₹48,500</b></div>
         {d.layout==="thermal"&&<div className="thumb-qr">▦</div>}
       </div>
       <div className="design-template-info"><span>{d.name}</span>{style.preset===d.id&&<Check size={15}/>}</div>
       <small>{d.category} · {d.layout}</small>
     </button>)}
   </div>

 </div>
}
