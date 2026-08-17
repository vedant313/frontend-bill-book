import { useMemo, useState } from "react";
import { Plus, Printer, Pencil, Trash2, FileText, Download, Copy } from "lucide-react";
import { fmt, fmtDate, DOC_META } from "../utils/helpers";
import { exportInvoices, exportEstimates } from "../utils/exportExcel";
import StatusBadge from "./StatusBadge";
import { FilterBar, defaultFilters, filterRows } from "./DataFilters";

export default function DocList({ type, docs, goto, deleteDoc, duplicateDoc }) {
  const [filters, setFilters] = useState(defaultFilters());
  const meta = DOC_META[type];
  const filtered = useMemo(() => filterRows(docs, filters, "total").sort((a,b)=>new Date(b.date)-new Date(a.date)), [docs,filters]);
  const statuses = [...new Set(docs.map(d=>d.status).filter(Boolean))];
  const exportFiltered = () => type === "invoice" ? exportInvoices(filtered, "invoices-filtered") : exportEstimates(filtered, "estimates-filtered");
  return (
    <div>
      <div className="bb-page-head">
        <div><h2>{meta.short}s</h2><span>{filtered.length} of {docs.length} records</span></div>
        <div className="bb-head-actions">
          <button className="bb-btn bb-btn-ghost" onClick={exportFiltered}><Download size={14}/> Excel filtered</button>
          <button className="bb-btn bb-btn-primary" onClick={() => goto("form", { listType: type })}><Plus size={14}/> New {meta.short}</button>
        </div>
      </div>
      <FilterBar value={filters} onChange={setFilters} statuses={statuses}/>
      {filtered.length === 0 ? (
        <div className="bb-card bb-empty"><FileText size={30}/><div style={{fontWeight:600,marginBottom:4}}>No matching {meta.short.toLowerCase()}s</div><div style={{fontSize:13,marginBottom:14}}>Try changing the search or filters.</div><button className="bb-btn bb-btn-primary" onClick={()=>goto("form",{listType:type})}><Plus size={14}/> New {meta.short}</button></div>
      ) : (
        <div className="bb-card" style={{padding:0,overflow:"auto"}}>
          <table className="bb-table"><thead><tr><th>Number</th><th>Party</th><th>Date</th><th>Status</th><th style={{textAlign:"right"}}>Amount</th><th></th></tr></thead>
          <tbody>{filtered.map(d=><tr key={d.id}><td className="bb-mono">{d.number}</td><td>{d.partyName||"—"}</td><td>{fmtDate(d.date)}</td><td><StatusBadge status={d.status}/></td><td className="amt" style={{textAlign:"right"}}>{fmt(d.total)}</td><td><div style={{display:"flex",gap:2,justifyContent:"flex-end"}}>
            <button className="bb-icon-btn" title="View / Print" onClick={()=>goto("preview",{previewId:d.id,previewKind:"doc",listType:type})}><Printer size={15}/></button>
            <button className="bb-icon-btn" title="Edit" onClick={()=>goto("form",{listType:type,editingId:d.id})}><Pencil size={15}/></button>
            <button className="bb-icon-btn" title="Duplicate" onClick={async()=>{const saved=await duplicateDoc(d.id); if(saved) goto("preview",{previewId:saved.id,previewKind:"doc",listType:type})}}><Copy size={15}/></button>
            <button className="bb-icon-btn" title="Delete" onClick={()=>{if(confirm(`Delete ${d.number}?`))deleteDoc(d.id)}}><Trash2 size={15}/></button>
          </div></td></tr>)}</tbody></table>
        </div>
      )}
    </div>
  );
}
