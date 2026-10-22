import { useEffect, useState } from "react";
import * as api from "../api";

const field = { display: "block", width: "100%", boxSizing: "border-box", padding: 10, margin: "6px 0 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--paper)", color: "var(--ink)" };

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState("");
  const [draft, setDraft] = useState({ name: "", proprietor: "", phone: "", email: "", address: "", gstin: "", state: "" });
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = async () => {
    try { const r = await api.getCompanies(); setCompanies(r.companies || []); if (!selected && r.companies?.length) { setSelected(r.companies[0].id); setDraft({ ...r.companies[0] }); } }
    catch (e) { setError(e.message || "Could not load companies."); }
  };
  useEffect(() => { load(); }, []);
  const edit = c => { setSelected(c.id); setDraft({ name:c.name||"", proprietor:c.proprietor||"", phone:c.phone||"", email:c.email||"", address:c.address||"", gstin:c.gstin||"", state:c.state||"" }); setCreating(false); setMessage(""); };
  const save = async e => {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      if (creating) { const r = await api.createCompany(draft); await load(); edit(r.company); setMessage("Company profile created."); }
      else { const r = await api.updateCompany(selected, draft); setCompanies(old => old.map(c => c.id === selected ? r.company : c)); setMessage("Company profile saved."); }
    } catch (e) { setError(e.message || "Save failed."); } finally { setBusy(false); }
  };
  return <div style={{padding:24,maxWidth:1100,margin:"0 auto",color:"var(--ink)"}}>
    <h2>Companies & Firms</h2>
    <p style={{color:"var(--muted)"}}>Create and manage up to five company profiles.</p>
    {error && <p role="alert" style={{color:"#b42318"}}>{error}</p>}{message && <p role="status" style={{color:"#137333"}}>{message}</p>}
    <div style={{display:"grid",gridTemplateColumns:"minmax(220px,1fr) minmax(280px,2fr)",gap:18}}>
      <section style={{border:"1px solid var(--border)",borderRadius:12,padding:16}}>
        <h3>Your companies</h3>
        {companies.map(c=><button key={c.id} onClick={()=>edit(c)} style={{...field,textAlign:"left",cursor:"pointer",fontWeight:700}}>{c.name}<small style={{display:"block",fontWeight:400}}>{c.gstin||"GSTIN not added"}</small></button>)}
        <button style={field} disabled={busy||companies.length>=5} onClick={()=>{setCreating(true);setSelected("");setDraft({name:"",proprietor:"",phone:"",email:"",address:"",gstin:"",state:""});setMessage("");}}>+ Add company</button>
      </section>
      <form onSubmit={save} style={{border:"1px solid var(--border)",borderRadius:12,padding:16}}>
        <h3>{creating?"Create company":"Company details"}</h3>
        {["name","proprietor","phone","email","address","gstin","state"].map(k=><label key={k} style={{display:"block",fontSize:13,fontWeight:600,textTransform:"capitalize"}}>{k==="gstin"?"GSTIN":k==="name"?"Company name":k}<input style={field} required={k==="name"} value={draft[k]||""} onChange={e=>setDraft(d=>({...d,[k]:e.target.value}))}/></label>)}
        <button style={field} disabled={busy||(!creating&&!selected)}>{busy?"Saving…":creating?"Create company":"Save changes"}</button>
      </form>
    </div>
    <p style={{fontSize:12,color:"var(--muted)",marginTop:16}}>Important: company profiles are managed separately, but invoices, stock and accounting records are not yet isolated by company. Do not use this as a company-switching accounting system until that migration is complete.</p>
  </div>;
}
