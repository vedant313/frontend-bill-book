import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Wallet, Printer, Download } from "lucide-react";
import { fmt, fmtDate } from "../utils/helpers";
import { exportPayments } from "../utils/exportExcel";
import { FilterBar, defaultFilters, filterRows } from "./DataFilters";

export default function PaymentList({ payments, goto, deletePayment }) {
  const [filters,setFilters]=useState(defaultFilters());
  const filtered=useMemo(()=>filterRows(payments,filters,"amount").sort((a,b)=>new Date(b.date)-new Date(a.date)),[payments,filters]);
  const modes=[...new Set(payments.map(p=>p.mode).filter(Boolean))];
  return <div>
    <div className="bb-page-head"><div><h2>Payment In</h2><span>{filtered.length} of {payments.length} records</span></div><div className="bb-head-actions">
      <button className="bb-btn bb-btn-ghost" onClick={()=>exportPayments(filtered,"payments-filtered")}><Download size={14}/> Excel filtered</button>
      <button className="bb-btn bb-btn-primary" onClick={()=>goto("form",{listType:"payment"})}><Plus size={14}/> New Payment</button>
    </div></div>
    <FilterBar value={filters} onChange={setFilters} modes={modes}/>
    {filtered.length===0 ? <div className="bb-card bb-empty"><Wallet size={30}/><div style={{fontWeight:600,marginBottom:4}}>No matching payments</div><div style={{fontSize:13,marginBottom:14}}>Try changing the search or filters.</div><button className="bb-btn bb-btn-primary" onClick={()=>goto("form",{listType:"payment"})}><Plus size={14}/> New Payment</button></div> :
    <div className="bb-card" style={{padding:0,overflow:"auto"}}><table className="bb-table"><thead><tr><th>No.</th><th>Party</th><th>Date</th><th>Mode / Bank</th><th>Against</th><th style={{textAlign:"right"}}>Amount</th><th></th></tr></thead><tbody>
      {filtered.map(p=><tr key={p.id}><td className="bb-mono">{p.number||"—"}</td><td>{p.partyName}</td><td>{fmtDate(p.date)}</td><td>{p.mode}{p.bankName&&<div style={{fontSize:11,color:"var(--muted)"}}>{p.bankName}</div>}</td><td className="bb-mono">{p.againstInvoice||"—"}</td><td className="amt" style={{textAlign:"right"}}>{fmt(p.amount)}</td><td><div style={{display:"flex",gap:2,justifyContent:"flex-end"}}>
        <button className="bb-icon-btn" title="View / Print" onClick={()=>goto("preview",{previewId:p.id,previewKind:"payment",listType:"payment"})}><Printer size={15}/></button>
        <button className="bb-icon-btn" title="Edit" onClick={()=>goto("form",{listType:"payment",editingId:p.id})}><Pencil size={15}/></button>
        <button className="bb-icon-btn" title="Delete" onClick={()=>{if(confirm("Delete this payment?"))deletePayment(p.id)}}><Trash2 size={15}/></button>
      </div></td></tr>)}
    </tbody></table></div>}
  </div>;
}
