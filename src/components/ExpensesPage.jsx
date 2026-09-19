import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { fmt, fmtDate } from "../utils/helpers";
import * as api from "../api";

const CATEGORIES=["Purchase","Rent","Salary","Transport","Utilities","Marketing","Office","Software","Other"];
const empty={date:new Date().toISOString().slice(0,10),category:"Other",description:"",amount:"",notes:""};

export default function ExpensesPage({expenses,setExpenses}){
  const [form,setForm]=useState(empty),[editing,setEditing]=useState(null),[open,setOpen]=useState(false),[search,setSearch]=useState("");
  const filtered=useMemo(()=>expenses.filter(e=>(e.description+" "+e.category).toLowerCase().includes(search.toLowerCase())),[expenses,search]);
  const total=expenses.reduce((s,e)=>s+Number(e.amount||0),0);
  const save=async()=>{if(!form.amount||Number(form.amount)<=0)return; const saved=editing?await api.updateExpense(editing,form):await api.createExpense(form);setExpenses(p=>editing?p.map(e=>e.id===saved.id?saved:e):[saved,...p]);setForm(empty);setEditing(null);setOpen(false)};
  const edit=e=>{setEditing(e.id);setForm({...e,amount:String(e.amount)});setOpen(true)};
  const del=async id=>{if(!confirm("Delete this expense?"))return;await api.deleteExpense(id);setExpenses(p=>p.filter(e=>e.id!==id))};
  return <div>
    <div className="bb-page-head"><div><h2>Expenses</h2><span>Track business spending and calculate profit.</span></div><button className="bb-btn bb-btn-primary" onClick={()=>{setForm(empty);setEditing(null);setOpen(true)}}><Plus size={14}/> Add Expense</button></div>
    <div className="bb-stat-grid"><div className="bb-stat-card"><div className="bb-stat-label">Total Expenses</div><div className="bb-stat-value">{fmt(total)}</div></div><div className="bb-stat-card"><div className="bb-stat-label">Entries</div><div className="bb-stat-value">{expenses.length}</div></div></div>
    <div className="bb-card"><input className="bb-input" placeholder="Search expenses..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:360,marginBottom:12}}/>
      {filtered.length?<div className="bb-table-wrap"><table className="bb-table"><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th></th></tr></thead><tbody>{filtered.map(e=><tr key={e.id}><td>{fmtDate(e.date)}</td><td>{e.category}</td><td>{e.description||"—"}</td><td className="bb-mono">{fmt(e.amount)}</td><td><button className="bb-icon-btn" onClick={()=>edit(e)}><Pencil size={14}/></button><button className="bb-icon-btn" onClick={()=>del(e.id)}><Trash2 size={14}/></button></td></tr>)}</tbody></table></div>:<div className="bb-empty">No expenses yet. Add your first business expense.</div>}
    </div>
    {open&&<div className="bb-modal-backdrop"><div className="bb-modal"><div className="bb-page-head"><h2>{editing?"Edit Expense":"Add Expense"}</h2><button className="bb-icon-btn" onClick={()=>setOpen(false)}><X size={17}/></button></div><div className="bb-form-grid"><label>Date<input className="bb-input" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label>Category<select className="bb-select" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{CATEGORIES.map(x=><option key={x}>{x}</option>)}</select></label><label>Description<input className="bb-input" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Amount (₹)<input className="bb-input" type="number" min="0" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></label><label style={{gridColumn:"1/-1"}}>Notes<textarea className="bb-input" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label></div><div className="bb-head-actions" style={{justifyContent:"flex-end"}}><button className="bb-btn bb-btn-ghost" onClick={()=>setOpen(false)}>Cancel</button><button className="bb-btn bb-btn-primary" onClick={save}>Save Expense</button></div></div></div>}
  </div>
}