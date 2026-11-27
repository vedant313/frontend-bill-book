import { useEffect,useState } from "react";
import * as api from "../api";
import { WebsitePreview } from "./WebsiteStudio";
import { Send, Globe2 } from "lucide-react";

export default function PublicBusinessWebsite({slug}) {
  const [site,setSite]=useState(null);
  const [error,setError]=useState("");
  const [form,setForm]=useState({name:"",phone:"",email:"",message:""});
  const [sent,setSent]=useState(false);
  const [busy,setBusy]=useState(false);
  useEffect(()=>{let active=true;api.getPublicWebsite(slug).then(s=>{if(active)setSite(s)}).catch(e=>{if(active)setError(e.message||"Website not found.")});return()=>{active=false}},[slug]);
  useEffect(()=>{if(!site)return;document.title=site.seoTitle||site.businessName||"Business Website";let meta=document.querySelector("meta[name=description]");if(!meta){meta=document.createElement("meta");meta.name="description";document.head.appendChild(meta)}meta.content=site.seoDescription||site.description||""},[site]);
  const submit=async(e)=>{e.preventDefault();setBusy(true);setError("");try{await api.sendWebsiteEnquiry(slug,form);setSent(true);setForm({name:"",phone:"",email:"",message:""})}catch(e){setError(e.message||"Could not send enquiry.")}finally{setBusy(false)}};
  if(error)return <main className="ws-public-error"><Globe2 size={34}/><h1>Website unavailable</h1><p>{error}</p><small>Powered by Nexsa Website Studio</small></main>;
  if(!site)return <main className="ws-public-loading">Loading website…</main>;
  const template={primaryColor:site.primaryColor,accentColor:site.accentColor};
  return <><WebsitePreview site={site} template={template}/><section className="ws-public-contact"><div><span>GET IN TOUCH</span><h2>Let's talk about your needs.</h2><p>Send a message to {site.businessName}.</p></div><form onSubmit={submit}><input required placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input placeholder="Phone number" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><input type="email" placeholder="Email address" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><textarea required rows="4" placeholder="How can we help?" value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/><button disabled={busy}><Send size={15}/>{busy?"Sending…":"Send enquiry"}</button>{sent&&<p role="status">Your enquiry has been sent successfully.</p>}{error&&<p role="alert">{error}</p>}</form></section></>;
}
