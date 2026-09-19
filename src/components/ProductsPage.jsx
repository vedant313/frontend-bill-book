import { useEffect, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import * as api from "../api";
export default function ProductsPage(){
 const [items,setItems]=useState([]),[q,setQ]=useState(""),[form,setForm]=useState({name:"",hsn:"",unit:"pcs",rate:"",gstPct:"",stock:""});
 const load=()=>api.getProducts().then(setItems);
 useEffect(()=>{ load().catch(()=>{}); },[]);
 const save=async()=>{if(!form.name.trim())return;const x=await api.createProduct(form);setItems(v=>[...v,x]);setForm({name:"",hsn:"",unit:"pcs",rate:"",gstPct:"",stock:""});};
 const del=async id=>{await api.deleteProduct(id);setItems(v=>v.filter(x=>x.id!==id));};
 return <div><div className="bb-page-head"><div><h2>Product Master</h2><span>Save items once and reuse them instantly in invoices.</span></div></div>
 <div className="bb-card" style={{marginBottom:14}}><div className="bb-section-title">Add Product</div><div className="bb-row3">
 {["name","hsn","unit","rate","gstPct","stock"].map(k=><input key={k} className="bb-input" placeholder={{name:"Product / service",hsn:"HSN/SAC",unit:"Unit",rate:"Price",gstPct:"GST %",stock:"Opening stock"}[k]} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}</div><button className="bb-btn bb-btn-primary" style={{marginTop:10}} onClick={save}><Plus size={14}/> Save Product</button></div>
 <div className="bb-card"><div className="bb-section-title"><span>Saved Items ({items.length})</span><div className="bb-search-wrap" style={{maxWidth:260}}><Search size={14}/><input className="bb-input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products"/></div></div><table className="bb-table"><thead><tr><th>Product</th><th>HSN</th><th>Price</th><th>GST</th><th>Stock</th><th></th></tr></thead><tbody>{items.filter(x=>x.name.toLowerCase().includes(q.toLowerCase())).map(x=><tr key={x.id}><td><b>{x.name}</b><div style={{fontSize:11,color:"var(--muted)"}}>{x.unit}</div></td><td>{x.hsn||"—"}</td><td>₹{x.rate}</td><td>{x.gstPct}%</td><td>{x.stock}</td><td><button className="bb-icon-btn" onClick={()=>del(x.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table>{!items.length&&<div className="bb-empty">No saved products yet.</div>}</div></div>;
}