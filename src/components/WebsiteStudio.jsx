import { useEffect, useMemo, useState } from "react";
import { Globe2, LayoutTemplate, ExternalLink, Save, Eye, Plus, Check, LockKeyhole, Smartphone, Monitor, Palette, MessageSquare, RefreshCw } from "lucide-react";
import * as api from "../api";

const fallbackTemplates = [
  ["modern-business","Modern Business","General","#17243b","#0f9b8e"],["corporate-pro","Corporate Pro","Corporate","#17243b","#b68a52"],
  ["retail-store","Retail Store","Retail","#202020","#c46b42"],["fashion-boutique","Fashion Boutique","Fashion","#292323","#b77c82"],
  ["electronics-hub","Electronics Hub","Retail","#172b3a","#16a3a3"],["solar-energy","Solar Energy","Energy","#263a2e","#9aaf55"],
  ["professional-services","Professional Services","Services","#24324a","#9b835e"],["restaurant-cafe","Restaurant & Cafe","Food","#3a2922","#c47d45"],
  ["health-wellness","Health & Wellness","Wellness","#24423d","#86a99b"],["real-estate","Real Estate","Property","#26344a","#c39a62"],
  ["creative-studio","Creative Studio","Creative","#28263d","#9b8bd1"],["local-business","Local Business","General","#27343c","#d18a4c"],
].map(([id,name,category,primaryColor,accentColor])=>({id,name,category,primaryColor,accentColor,description:"A responsive business website template."}));

const sectionNames = { hero:"Hero banner",about:"About business",services:"Services",products:"Products",gallery:"Gallery",testimonials:"Testimonials",contact:"Contact form",map:"Location map" };
const slugify = (s) => String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,48);

export default function WebsiteStudio({ subscriptionStatus, goto }) {
  const [templates,setTemplates] = useState(fallbackTemplates);
  const [site,setSite] = useState(null);
  const [selectedTemplate,setSelectedTemplate] = useState("modern-business");
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [preview,setPreview] = useState(false);
  const [enquiries,setEnquiries] = useState([]);
  const isAllowed = subscriptionStatus?.mode === "owner" || (subscriptionStatus?.mode === "paid" && subscriptionStatus?.plan === "advanced");

  const load = async () => {
    setLoading(true);
    try {
      const [t,s] = await Promise.all([api.getWebsiteTemplates(),api.getMyWebsite()]);
      if (t?.templates?.length) setTemplates(t.templates);
      setSite(s);
      if (s?.templateId) setSelectedTemplate(s.templateId);
      if (s?.id) api.getWebsiteEnquiries(s.id).then(setEnquiries).catch(()=>{});
    } catch (e) { setMessage(e.message || "Website Studio could not load."); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ if(isAllowed) load(); else setLoading(false); },[isAllowed]);

  const update = (key,value) => setSite(current => ({...current,[key]:value}));
  const updateSection = (index,key,value) => setSite(current => ({...current,sections:current.sections.map((s,i)=>i===index?{...s,[key]:value}:s)}));
  const create = async () => {
    const template = templates.find(t=>t.id===selectedTemplate) || templates[0];
    setBusy(true); setMessage("");
    try {
      const created = await api.createWebsite({businessName:"My Business",slug:"my-business",templateId:template.id,primaryColor:template.primaryColor,accentColor:template.accentColor,tagline:"A better way to serve our customers.",description:"Tell customers what makes your business special."});
      setSite(created); setMessage("Your website draft is ready. Add your business details and save.");
    } catch(e) { setMessage(e.message || "Could not create website."); }
    finally { setBusy(false); }
  };
  const save = async () => {
    if (!site?.id) return;
    setBusy(true); setMessage("");
    try { const saved = await api.updateWebsite(site.id,site); setSite(saved); setMessage("Changes saved successfully."); }
    catch(e) { setMessage(e.message || "Could not save changes."); }
    finally { setBusy(false); }
  };
  const publish = async () => {
    if (!site?.id) return;
    setBusy(true); setMessage("");
    try { await save(); const result = await api.publishWebsite(site.id); setSite(current=>({...current,status:"published",publishedAt:result.publishedAt})); setMessage("Website published: "+result.url); }
    catch(e) { setMessage(e.message || "Could not publish website."); }
    finally { setBusy(false); }
  };
  const publicUrl = site?.slug ? "https://"+site.slug+".nexsatechnologies.com" : "";
  const currentTemplate = templates.find(t=>t.id===(site?.templateId||selectedTemplate)) || templates[0];

  if (!isAllowed) return <div className="ws-upgrade"><div className="ws-upgrade-icon"><LockKeyhole size={25}/></div><span className="ws-eyebrow">NEXSA WEBSITE STUDIO</span><h1>Build your business website</h1><p>Create, customize and publish a professional website on your own business subdomain. Website Studio is included with the Advanced Plan.</p><div className="ws-upgrade-features"><span><Check size={16}/> 12 professional templates</span><span><Check size={16}/> Visual editing and live preview</span><span><Check size={16}/> Your own business subdomain</span><span><Check size={16}/> Contact enquiries dashboard</span></div><button className="bb-btn bb-btn-primary" onClick={()=>goto("subscription")}>Explore Advanced Plan</button></div>;
  if (loading) return <div className="ws-loading"><RefreshCw className="ws-spin"/> Loading Website Studio…</div>;

  if (!site) return <div className="ws-page"><div className="ws-page-head"><div><span className="ws-eyebrow">NEXSA WEBSITE STUDIO</span><h1>Create your business website</h1><p>Choose a starting design. You can edit all the details before publishing.</p></div><span className="ws-plan-pill">ADVANCED PLAN</span></div><div className="ws-template-grid">{templates.map((t,i)=><button key={t.id} className={"ws-template-card "+(selectedTemplate===t.id?"selected":"")} onClick={()=>setSelectedTemplate(t.id)}><div className="ws-template-preview" style={{"--template-primary":t.primaryColor,"--template-accent":t.accentColor}}><div className="ws-template-top"><i/><i/><i/></div><div className="ws-template-hero"><b>{t.name}</b><span/><span/></div><div className="ws-template-blocks"><i/><i/><i/></div><div className="ws-template-foot"/></div><div className="ws-template-info"><div><strong>{String(i+1).padStart(2,"0")} · {t.name}</strong><small>{t.category}</small></div>{selectedTemplate===t.id?<Check size={18}/>:<LayoutTemplate size={18}/>}</div></button>)}</div><div className="ws-create-bar"><div><strong>Selected: {currentTemplate.name}</strong><small>Responsive layout · customizable colors and content</small></div><button className="bb-btn bb-btn-primary" disabled={busy} onClick={create}><Plus size={15}/> {busy?"Creating…":"Create website"}</button></div>{message&&<p className="ws-message">{message}</p>}</div>;

  return <div className="ws-page">
    <div className="ws-page-head"><div><span className="ws-eyebrow">NEXSA WEBSITE STUDIO</span><h1>{preview?"Website preview":"My business website"}</h1><p>{preview?"Review the content and layout before publishing.":"Customize your business details, design and website sections."}</p></div><div className="ws-head-actions"><span className={"ws-status "+(site.status==="published"?"published":"")}>{site.status==="published"?"Published":"Draft"}</span><button className="bb-btn bb-btn-ghost" onClick={()=>setPreview(!preview)}><Eye size={15}/>{preview?"Edit website":"Preview"}</button></div></div>
    {preview ? <div className="ws-preview-wrap"><WebsitePreview site={site} template={currentTemplate}/></div> : <div className="ws-editor-layout">
      <div className="ws-editor-main">
        <section className="ws-panel"><div className="ws-panel-title"><Globe2 size={18}/><div><strong>Business information</strong><small>These details appear on your public website.</small></div></div>
          <div className="ws-form-grid">
            <label>Business name<input value={site.businessName||""} onChange={e=>update("businessName",e.target.value)} placeholder="Your business name"/></label>
            <label>Website address<div className="ws-domain-input"><input value={site.slug||""} onChange={e=>update("slug",slugify(e.target.value))}/><span>.nexsatechnologies.com</span></div></label>
            <label className="wide">Tagline<input value={site.tagline||""} onChange={e=>update("tagline",e.target.value)} placeholder="What does your business do?"/></label>
            <label className="wide">About your business<textarea rows="4" value={site.description||""} onChange={e=>update("description",e.target.value)} placeholder="Describe your business and what customers can expect."/></label>
            <label>Phone<input value={site.phone||""} onChange={e=>update("phone",e.target.value)} placeholder="+91…"/></label>
            <label>WhatsApp number<input value={site.whatsapp||""} onChange={e=>update("whatsapp",e.target.value)} placeholder="91…"/></label>
            <label>Email<input type="email" value={site.email||""} onChange={e=>update("email",e.target.value)} placeholder="hello@example.com"/></label>
            <label>Address<input value={site.address||""} onChange={e=>update("address",e.target.value)} placeholder="Business address"/></label>
            <label className="wide">Hero image URL<input value={site.heroImageUrl||""} onChange={e=>update("heroImageUrl",e.target.value)} placeholder="https://… (image upload can be connected in the next release)"/></label>
          </div>
        </section>
        <section className="ws-panel"><div className="ws-panel-title"><Palette size={18}/><div><strong>Brand appearance</strong><small>Choose colors that match your business.</small></div></div><div className="ws-colors"><label>Primary color<input type="color" value={site.primaryColor||currentTemplate.primaryColor} onChange={e=>update("primaryColor",e.target.value)}/></label><label>Accent color<input type="color" value={site.accentColor||currentTemplate.accentColor} onChange={e=>update("accentColor",e.target.value)}/></label><label>Template<select value={site.templateId} onChange={e=>{const t=templates.find(x=>x.id===e.target.value);update("templateId",e.target.value);if(t){update("primaryColor",t.primaryColor);update("accentColor",t.accentColor);}}}>{templates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label></div></section>
        <section className="ws-panel"><div className="ws-panel-title"><LayoutTemplate size={18}/><div><strong>Website sections</strong><small>Choose which sections visitors can see.</small></div></div><div className="ws-sections">{(site.sections||[]).map((s,i)=><div className="ws-section-row" key={s.type}><label className="ws-toggle"><input type="checkbox" checked={s.enabled!==false} onChange={e=>updateSection(i,"enabled",e.target.checked)}/><span/></label><div className="ws-section-fields"><strong>{sectionNames[s.type]||s.type}</strong><input value={s.title||""} onChange={e=>updateSection(i,"title",e.target.value)} placeholder="Section heading"/>{["hero","about","contact"].includes(s.type)&&<textarea rows="2" value={s.body||""} onChange={e=>updateSection(i,"body",e.target.value)} placeholder="Section text"/>}</div></div>)}</div></section>
      </div>
      <aside className="ws-editor-aside"><div className="ws-panel ws-publish-panel"><span className="ws-eyebrow">PUBLISHING</span><div className="ws-publish-icon"><Globe2 size={22}/></div><strong>{site.status==="published"?"Your website is live":"Your website is not live yet"}</strong><p>{site.status==="published"?"Your customers can visit your website using this address.":"Save your changes and publish when you're ready."}</p>{site.status==="published"&&<a href={publicUrl} target="_blank" rel="noreferrer">{publicUrl} <ExternalLink size={13}/></a>}<button className="bb-btn bb-btn-primary" disabled={busy} onClick={save}><Save size={15}/>{busy?"Saving…":"Save changes"}</button><button className="bb-btn bb-btn-ghost" disabled={busy} onClick={publish}><Globe2 size={15}/>Publish website</button></div>
      <div className="ws-panel"><div className="ws-panel-title"><MessageSquare size={18}/><div><strong>Customer enquiries</strong><small>Messages sent from your website.</small></div></div>{enquiries.length?<div className="ws-enquiries">{enquiries.slice(0,8).map(e=><div key={e.id}><strong>{e.name}</strong><small>{e.phone||e.email}</small><p>{e.message}</p></div>)}</div>:<div className="ws-empty">No enquiries yet. They will appear here when customers contact you.</div>}</div>
      <div className="ws-panel ws-domain-card"><Smartphone size={18}/><strong>Mobile-ready website</strong><p>Your published website is designed to work on phones, tablets and desktops.</p><div><Monitor size={15}/> Desktop <Smartphone size={15}/> Mobile</div></div></aside>
    </div>}
    {message&&<p className="ws-message" role="status">{message}</p>}
  </div>;
}

export function WebsitePreview({site,template}) {
  const sections=(site.sections||[]).filter(s=>s.enabled!==false);
  return <div className="ws-live-preview" style={{"--site-primary":site.primaryColor||template?.primaryColor||"#17243b","--site-accent":site.accentColor||template?.accentColor||"#0f9b8e"}}>
    <header><b>{site.businessName||"Your Business"}</b><nav>Home　 About　 Services　 Contact</nav></header>
    <section className="ws-live-hero" style={site.heroImageUrl?{backgroundImage:"linear-gradient(90deg,rgba(0,0,0,.72),rgba(0,0,0,.12)),url("+site.heroImageUrl+")"}:{}}><span>WELCOME TO {site.businessName?.toUpperCase()}</span><h1>{sections.find(s=>s.type==="hero")?.title||site.businessName}</h1><p>{site.tagline||sections.find(s=>s.type==="hero")?.body||"A professional business website"}</p><a>Contact us</a></section>
    {sections.filter(s=>s.type!=="hero").map(s=><section className="ws-live-section" key={s.type}><span>{s.type.toUpperCase()}</span><h2>{s.title||sectionNames[s.type]||s.type}</h2><p>{s.body||(s.type==="about"?site.description:"Discover how we can help your business.")}</p>{s.type==="services"||s.type==="products"?<div className="ws-live-items">{(s.items?.length?s.items:[{title:"Quality service",description:"Professional support for your needs."},{title:"Trusted solutions",description:"Designed around your business."}]).map((item,i)=><article key={i}><b>{item.title}</b><p>{item.description}</p></article>)}</div>:null}{s.type==="contact"?<div className="ws-live-contact">{site.phone&&<span>Phone: {site.phone}</span>}{site.email&&<span>Email: {site.email}</span>}{site.address&&<span>{site.address}</span>}</div>:null}</section>)}
    <footer>© {new Date().getFullYear()} {site.businessName}. All rights reserved.</footer>
  </div>;
}
