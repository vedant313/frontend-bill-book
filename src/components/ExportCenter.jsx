import { useMemo, useState } from "react";
import { ArrowLeft, CalendarRange, Download, FileSpreadsheet, DatabaseBackup } from "lucide-react";
import { exportFilteredData } from "../utils/exportExcel";

export default function ExportCenter({ docs, payments, expenses=[], business, goto }) {
  const [from,setFrom]=useState("");
  const [to,setTo]=useState("");
  const [preset,setPreset]=useState("");
  const applyPreset=(v)=>{
    setPreset(v); const now=new Date(); const iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
    if(v==="today"){const d=iso(now);setFrom(d);setTo(d)}
    if(v==="month"){setFrom(iso(new Date(now.getFullYear(),now.getMonth(),1)));setTo(iso(now))}
    if(v==="year"){setFrom(iso(new Date(now.getFullYear(),0,1)));setTo(iso(now))}
    if(v==="all"){setFrom("");setTo("")}
  };
  const inRange=d=>{const date=String(d.date||"");return (!from||date>=from)&&(!to||date<=to)};
  const fd=useMemo(()=>docs.filter(inRange),[docs,from,to]);
  const fp=useMemo(()=>payments.filter(inRange),[payments,from,to]);
  const total=fd.length+fp.length;
  const downloadBackup=()=>{const payload={version:1,exportedAt:new Date().toISOString(),business,documents:docs,payments,expenses};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="nexsa-bill-backup-"+new Date().toISOString().slice(0,10)+".json";a.click();URL.revokeObjectURL(url)};
  return <div>
    <button className="bb-back" onClick={()=>goto("dashboard")}><ArrowLeft size={15}/> Back to Dashboard</button>
    <div className="bb-card export-hero"><div className="bb-feature-icon"><FileSpreadsheet/></div><div><h2 style={{margin:"0 0 5px"}}>Excel Data Export</h2><p>Choose a date range and download invoices, estimates and payment-in data together.</p></div></div>
    <div className="bb-card" style={{maxWidth:850}}>
      <div className="bb-section-title"><CalendarRange size={16}/> Select period</div>
      <div className="bb-export-presets"><button className={`bb-chip ${preset==="all"?"active":""}`} onClick={()=>applyPreset("all")}>All time</button><button className={`bb-chip ${preset==="today"?"active":""}`} onClick={()=>applyPreset("today")}>Today</button><button className={`bb-chip ${preset==="month"?"active":""}`} onClick={()=>applyPreset("month")}>This month</button><button className={`bb-chip ${preset==="year"?"active":""}`} onClick={()=>applyPreset("year")}>This year</button></div>
      <div className="bb-row2"><div className="bb-field"><label>From date</label><input type="date" className="bb-input" value={from} onChange={e=>{setFrom(e.target.value);setPreset("")}}/></div><div className="bb-field"><label>To date</label><input type="date" className="bb-input" value={to} onChange={e=>{setTo(e.target.value);setPreset("")}}/></div></div>
      <div className="bb-export-summary"><div><b>{fd.filter(d=>d.type==="invoice").length}</b><span>Invoices</span></div><div><b>{fd.filter(d=>d.type==="estimate").length}</b><span>Estimates</span></div><div><b>{fp.length}</b><span>Payments</span></div><div><b>{total}</b><span>Total records</span></div></div>
      <div className="bb-head-actions"><button className="bb-btn bb-btn-primary" onClick={()=>exportFilteredData(fd,fp,"billbook-export")}><Download size={15}/> Download selected data in Excel</button><button className="bb-btn bb-btn-ghost" onClick={downloadBackup}><DatabaseBackup size={15}/> Backup BillBook</button></div>
    </div>
  </div>;
}
