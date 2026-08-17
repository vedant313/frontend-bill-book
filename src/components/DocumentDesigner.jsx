import { useMemo, useState } from "react";
import { ArrowLeft, Check, Palette, Plus, Trash2, Save, Sparkles } from "lucide-react";
import { DOCUMENT_DESIGNS } from "../utils/documentDesigns";

const blank = { preset:"classic", accent:"#16233f", header:"classic", density:"normal", radius:4, font:"Inter", table:"grid", paperBg:"#ffffff", lineColor:"#d8dde5", logoPosition:"left", showLogo:true, showTaxSummary:true, showAmountWords:true, showBank:true, showSignature:true, showTerms:true, footerText:"Thank you for your business.", headerSubtitle:"Professional business document" };

export default function DocumentDesigner({ business, onSave, onBack }) {
 const savedTemplates = business.documentTemplates || [];
 const [style,setStyle]=useState({...blank,...(business.documentStyle||{})});
 const [filter,setFilter]=useState("All Business");
 const [templateName,setTemplateName]=useState("");
 const categories=["All Business",...new Set(DOCUMENT_DESIGNS.map(d=>d.category))];
 const designs=useMemo(()=>filter==="All Business"?DOCUMENT_DESIGNS:DOCUMENT_DESIGNS.filter(d=>d.category===filter),[filter]);
 const choose=d=>setStyle({...style,preset:d.id,accent:style.customAccent||d.accent,header:d.header,density:d.density,radius:d.radius,font:d.font,table:d.table});
 const save=async(next=style, templates=savedTemplates)=>{await onSave(next,templates);};
 const saveTemplate=async()=>{
   const name=templateName.trim(); if(!name){alert("Enter a template name");return;}
   const tpl={id:`tpl_${Date.now()}`,name,style:{...style,preset:"custom"}};
   await save(style,[...savedTemplates,tpl]); setTemplateName(""); alert("Template saved. It is now available under My Templates.");
 };
 const deleteTemplate=async(id)=>{if(!confirm("Delete this saved template?"))return; await save(style,savedTemplates.filter(t=>t.id!==id));};
 const applyTemplate=(t)=>setStyle({...t.style});
 return <div>
  <button className="bb-back" onClick={onBack}><ArrowLeft size={15}/> Back</button>
  <div className="bb-card designer-hero"><div><div className="bb-section-title"><Palette size={17}/> Document Studio</div><p>Design <b>Invoice, Estimate and Payment In</b> your way. Every setting below applies to all three document types.</p></div><div className="designer-hero-badge"><Sparkles size={15}/> Fully customizable</div></div>

  <div className="bb-card"><div className="bb-section-title">Ready-made templates</div><div className="designer-filter-row">{categories.map(c=><button key={c} className={`bb-chip ${filter===c?"active":""}`} onClick={()=>setFilter(c)}>{c}</button>)}</div>
   <div className="bb-design-grid">{designs.map(d=><button key={d.id} className={`bb-design-card ${style.preset===d.id?"selected":""}`} onClick={()=>choose(d)}>
    <div className="bb-design-preview" style={{"--preview-accent":d.accent}}><div className={`bb-design-preview-head ${d.header}`}><i/><b>YOUR BUSINESS</b><span>INVOICE</span></div><small>{d.category}</small><div className="bb-design-lines"><i/><i/><i/><i/></div><strong>₹ 48,500</strong></div>
    <div className="bb-design-name"><span>{d.name}</span>{style.preset===d.id&&<Check size={14}/>}</div><div className="bb-design-category">{d.category}</div>
   </button>)}</div>
  </div>

  {savedTemplates.length>0 && <div className="bb-card"><div className="bb-section-title">My Templates</div><div className="my-template-grid">{savedTemplates.map(t=><div className="my-template-card" key={t.id}><button onClick={()=>applyTemplate(t)}><span>{t.name}</span><small>Custom template</small></button><button className="bb-icon-btn" title="Delete" onClick={()=>deleteTemplate(t.id)}><Trash2 size={14}/></button></div>)}</div></div>}

  <div className="bb-card"><div className="bb-section-title">Customize everything</div><div className="designer-control-grid">
   <Field label="Accent color"><input type="color" value={style.accent||"#16233f"} onChange={e=>setStyle({...style,accent:e.target.value,customAccent:e.target.value})}/><input className="bb-input" value={style.accent||""} onChange={e=>setStyle({...style,accent:e.target.value,customAccent:e.target.value})}/></Field>
   <Field label="Paper background"><input type="color" value={style.paperBg||"#ffffff"} onChange={e=>setStyle({...style,paperBg:e.target.value})}/></Field>
   <Field label="Border / line color"><input type="color" value={style.lineColor||"#d8dde5"} onChange={e=>setStyle({...style,lineColor:e.target.value})}/></Field>
   <Field label="Header layout"><select className="bb-select" value={style.header||"classic"} onChange={e=>setStyle({...style,header:e.target.value})}><option value="classic">Classic</option><option value="modern">Modern</option><option value="minimal">Minimal</option><option value="band">Full color band</option></select></Field>
   <Field label="Font"><select className="bb-select" value={style.font||"Inter"} onChange={e=>setStyle({...style,font:e.target.value})}><option>Inter</option><option>Georgia</option></select></Field>
   <Field label="Table style"><select className="bb-select" value={style.table||"grid"} onChange={e=>setStyle({...style,table:e.target.value})}><option value="grid">Full grid</option><option value="line">Clean lines</option><option value="soft">Soft rows</option></select></Field>
   <Field label="Logo position"><select className="bb-select" value={style.logoPosition||"left"} onChange={e=>setStyle({...style,logoPosition:e.target.value})}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></Field>
   <Field label="Corner radius"><input className="bb-input" type="range" min="0" max="20" value={style.radius??4} onChange={e=>setStyle({...style,radius:Number(e.target.value)})}/></Field>
  </div>
  <div className="designer-checks">{[["showLogo","Show logo"],["showTaxSummary","Show tax summary"],["showAmountWords","Show amount in words"],["showBank","Show bank details"],["showSignature","Show signature box"],["showTerms","Show terms & conditions"]].map(([key,label])=><label key={key}><input type="checkbox" checked={style[key]!==false} onChange={e=>setStyle({...style,[key]:e.target.checked})}/>{label}</label>)}</div>
  <div className="bb-row2"><Field label="Header subtitle"><input className="bb-input" value={style.headerSubtitle||""} onChange={e=>setStyle({...style,headerSubtitle:e.target.value})}/></Field><Field label="Footer text"><input className="bb-input" value={style.footerText||""} onChange={e=>setStyle({...style,footerText:e.target.value})}/></Field></div>
  <div className="designer-save-row"><input className="bb-input" placeholder="My template name" value={templateName} onChange={e=>setTemplateName(e.target.value)}/><button className="bb-btn bb-btn-ghost" onClick={saveTemplate}><Save size={14}/> Save as My Template</button><button className="bb-btn bb-btn-primary" onClick={()=>save()}><Check size={14}/> Apply Design</button></div>
  </div>
 </div>
}
function Field({label,children}){return <div className="bb-field"><label>{label}</label><div style={{display:"flex",gap:8,alignItems:"center"}}>{children}</div></div>}
