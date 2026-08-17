import { useState } from "react";
import { ArrowLeft, Check, Palette, Plus } from "lucide-react";
import { DOCUMENT_DESIGNS } from "../utils/documentDesigns";

export default function DocumentDesigner({ business, onSave, onBack }) {
 const [style,setStyle]=useState(business.documentStyle||{preset:"classic",accent:"#16233f"});
 const choose=d=>setStyle({...style,preset:d.id,accent:style.customAccent||d.accent});
 const save=async()=>{await onSave({...style});onBack()};
 return <div>
  <button className="bb-back" onClick={onBack}><ArrowLeft size={15}/> Back</button>
  <div className="bb-card"><div className="bb-section-title"><Palette size={16}/> Invoice, Estimate & Payment Designs</div><p style={{color:"var(--muted)",fontSize:13}}>The selected document design is used for invoices, estimates and payment receipts.</p>
   <div className="bb-design-grid">{DOCUMENT_DESIGNS.map(d=><button key={d.id} className={`bb-design-card ${style.preset===d.id?"selected":""}`} onClick={()=>choose(d)}>
    <div className="bb-design-preview" style={{"--preview-accent":d.accent}}><div className={`bb-design-preview-head ${d.header}`}><i/><b>YOUR BUSINESS</b><span>INVOICE</span></div><div/><div className="bb-design-lines"><i/><i/><i/></div><strong>₹ 48,500</strong></div>
    <div className="bb-design-name">{d.name}{style.preset===d.id&&<Check size={14}/>}</div>
   </button>)}</div>
  </div>
  <div className="bb-card" style={{maxWidth:700}}><div className="bb-section-title">Create your own design</div><p style={{fontSize:12.5,color:"var(--muted)"}}>Choose any base layout and make it match your brand.</p>
   <div className="bb-row2"><div className="bb-field"><label>Brand / Accent color</label><div style={{display:"flex",gap:8}}><input type="color" value={style.customAccent||style.accent||"#16233f"} onChange={e=>setStyle({...style,customAccent:e.target.value,accent:e.target.value})}/><input className="bb-input" value={style.customAccent||style.accent||""} onChange={e=>setStyle({...style,customAccent:e.target.value,accent:e.target.value})}/></div></div>
   <div className="bb-field"><label>Header style</label><select className="bb-select" value={style.header||"classic"} onChange={e=>setStyle({...style,header:e.target.value})}><option value="classic">Classic</option><option value="modern">Modern</option><option value="minimal">Minimal</option><option value="band">Color band</option></select></div></div>
   <div className="bb-row2"><div className="bb-field"><label>Document density</label><select className="bb-select" value={style.density||"normal"} onChange={e=>setStyle({...style,density:e.target.value})}><option value="normal">Comfortable</option><option value="compact">Compact</option></select></div><div className="bb-field"><label>Corner radius</label><input className="bb-input" type="range" min="0" max="16" value={style.radius??4} onChange={e=>setStyle({...style,radius:Number(e.target.value)})}/></div></div>
   <button className="bb-btn bb-btn-primary" onClick={save}><Plus size={14}/> Save My Document Design</button>
  </div>
 </div>
}
