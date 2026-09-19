import { useEffect, useState } from "react";
import { Plus, Trash2, FilePlus2 } from "lucide-react";
import * as api from "../api";
import { calcTotals, nextNumber, todayISO } from "../utils/helpers";

function nextDate(date, frequency){
 const d=new Date(date+"T00:00:00");
 if(frequency==="weekly") d.setDate(d.getDate()+7);
 else if(frequency==="yearly") d.setFullYear(d.getFullYear()+1);
 else d.setMonth(d.getMonth()+1);
 return d.toISOString().slice(0,10);
}

export default function RecurringPage({docs=[], onGenerate}){
 const [items,setItems]=useState([]),[form,setForm]=useState({name:"",partyName:"",frequency:"monthly",nextDate:todayISO(),dueDays:7,amount:""});
 useEffect(()=>{api.getRecurring().then(setItems).catch(()=>{})},[]);
 const create=async()=>{
   if(!form.partyName||!form.amount)return;
   const x=await api.createRecurring({...form,items:[{id:"recurring",name:form.name||"Recurring service",qty:1,rate:Number(form.amount),gstPct:18}],discountAmt:0});
   setItems(v=>[x,...v]); setForm({name:"",partyName:"",frequency:"monthly",nextDate:todayISO(),dueDays:7,amount:""});
 };
 const del=async id=>{if(!confirm("Delete this recurring schedule?"))return;await api.deleteRecurring(id);setItems(v=>v.filter(x=>x.id!==id))};
 const generate=async x=>{
   const totals=calcTotals(x.items||[],x.discountAmt);
   const date=x.nextDate||todayISO();
   const doc={
     type:"invoice",number:nextNumber(docs,"invoice"),date,status:"Unpaid",
     partyName:x.partyName,partyPhone:x.partyPhone||"",partyAddress:x.partyAddress||"",
     items:(x.items||[]).map(it=>({...it,id:Math.random().toString(36).slice(2,10)})),
     discountAmt:Number(x.discountAmt||0),notes:x.notes||"",dueDate:new Date(new Date(date+"T00:00:00").getTime()+Number(x.dueDays||0)*86400000).toISOString().slice(0,10),
     subtotal:totals.subtotal,gstAmt:totals.gstAmt,total:totals.total
   };
   const saved=await onGenerate(doc);
   if(saved){
     const updated={...x,nextDate:nextDate(date,x.frequency)};
     await api.updateRecurring(x.id,updated);
     setItems(v=>v.map(r=>r.id===x.id?updated:r));
   }
 };
 return <div><div className="bb-page-head"><div><h2>Recurring Invoices</h2><span>Save repeat billing schedules and generate the next invoice in one click.</span></div></div>
 <div className="bb-card" style={{marginBottom:14}}><div className="bb-section-title"><Plus size={15}/> New Recurring Schedule</div><div className="bb-row3"><input className="bb-input" placeholder="Schedule name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input className="bb-input" placeholder="Customer name" value={form.partyName} onChange={e=>setForm({...form,partyName:e.target.value})}/><input className="bb-input" placeholder="Amount" type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/><select className="bb-select" value={form.frequency} onChange={e=>setForm({...form,frequency:e.target.value})}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select><input className="bb-input" type="date" value={form.nextDate} onChange={e=>setForm({...form,nextDate:e.target.value})}/><input className="bb-input" type="number" value={form.dueDays} onChange={e=>setForm({...form,dueDays:e.target.value})} placeholder="Due days"/></div><button className="bb-btn bb-btn-primary" style={{marginTop:10}} onClick={create}>Save Schedule</button></div>
 <div className="bb-card"><div className="bb-section-title">Schedules ({items.length})</div>{items.length?<table className="bb-table"><thead><tr><th>Schedule</th><th>Customer</th><th>Frequency</th><th>Next invoice</th><th>Amount</th><th>Actions</th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td><b>{x.name}</b></td><td>{x.partyName}</td><td>{x.frequency}</td><td>{x.nextDate}</td><td>₹{Number(x.amount||x.items?.[0]?.rate||0).toLocaleString("en-IN")}</td><td><button className="bb-btn bb-btn-ghost" onClick={()=>generate(x)}><FilePlus2 size={14}/> Generate Invoice</button> <button className="bb-icon-btn" onClick={()=>del(x.id)} title="Delete"><Trash2 size={14}/></button></td></tr>)}</tbody></table>:<div className="bb-empty">No recurring schedules yet.</div>}</div></div>
}
