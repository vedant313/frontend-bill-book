import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useMemo } from "react";

export function filterRows(rows, filters, amountKey = "total") {
  const q = filters.q.trim().toLowerCase();
  return rows.filter((r) => {
    const party = String(r.partyName || "").toLowerCase();
    const number = String(r.number || "").toLowerCase();
    const amount = Number(r[amountKey] || 0);
    const date = String(r.date || "");
    const textMatch = !q || party.includes(q) || number.includes(q) || String(amount).includes(q);
    const fromOk = !filters.from || date >= filters.from;
    const toOk = !filters.to || date <= filters.to;
    const amountFromOk = filters.amountFrom === "" || amount >= Number(filters.amountFrom);
    const amountToOk = filters.amountTo === "" || amount <= Number(filters.amountTo);
    const statusOk = !filters.status || String(r.status || "") === filters.status;
    const modeOk = !filters.mode || String(r.mode || "") === filters.mode;
    return textMatch && fromOk && toOk && amountFromOk && amountToOk && statusOk && modeOk;
  });
}

export function FilterBar({ value, onChange, statuses = [], modes = [], label = "Search name, number or amount" }) {
  const f = value;
  const set = (patch) => onChange({ ...f, ...patch });
  const quick = useMemo(() => {
    const today = new Date();
    const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,10);
    const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startYear = new Date(today.getFullYear(), 0, 1);
    return { today: iso(today), month: iso(startMonth), year: iso(startYear) };
  }, []);
  const reset = () => onChange({ q:"", from:"", to:"", amountFrom:"", amountTo:"", status:"", mode:"" });
  return (
    <div className="bb-filter-panel">
      <div className="bb-filter-main">
        <div className="bb-search-wrap"><SlidersHorizontal size={15}/><input className="bb-input" value={f.q} onChange={e=>set({q:e.target.value})} placeholder={label}/></div>
        <select className="bb-select" value={f.quick || ""} onChange={e=>{
          const v=e.target.value;
          if(!v) return set({quick:"",from:"",to:""});
          const now=new Date(); const iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
          if(v==="today") set({quick:v,from:iso(now),to:iso(now)});
          if(v==="month") set({quick:v,from:iso(new Date(now.getFullYear(),now.getMonth(),1)),to:iso(now)});
          if(v==="year") set({quick:v,from:iso(new Date(now.getFullYear(),0,1)),to:iso(now)});
        }}><option value="">All dates</option><option value="today">Today</option><option value="month">This month</option><option value="year">This year</option></select>
        <input type="date" className="bb-input" title="From date" value={f.from} onChange={e=>set({from:e.target.value,quick:""})}/>
        <input type="date" className="bb-input" title="To date" value={f.to} onChange={e=>set({to:e.target.value,quick:""})}/>
        <input type="number" className="bb-input" placeholder="Min ₹" value={f.amountFrom} onChange={e=>set({amountFrom:e.target.value})}/>
        <input type="number" className="bb-input" placeholder="Max ₹" value={f.amountTo} onChange={e=>set({amountTo:e.target.value})}/>
        {statuses.length > 0 && <select className="bb-select" value={f.status} onChange={e=>set({status:e.target.value})}><option value="">All status</option>{statuses.map(s=><option key={s}>{s}</option>)}</select>}
        {modes.length > 0 && <select className="bb-select" value={f.mode} onChange={e=>set({mode:e.target.value})}><option value="">All modes</option>{modes.map(s=><option key={s}>{s}</option>)}</select>}
        <button className="bb-btn bb-btn-ghost" onClick={reset} title="Reset filters"><RotateCcw size={14}/> Reset</button>
      </div>
    </div>
  );
}
export function defaultFilters(){ return {q:"",from:"",to:"",amountFrom:"",amountTo:"",status:"",mode:""}; }
