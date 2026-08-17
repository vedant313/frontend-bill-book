export const DOCUMENT_DESIGNS = [
 {id:"classic",name:"Classic Professional",category:"All Business",accent:"#16233f",header:"classic",radius:0,density:"normal",font:"Inter",table:"grid"},
 {id:"modern",name:"Modern Clean",category:"Small Business",accent:"#0f9b8e",header:"modern",radius:10,density:"normal",font:"Inter",table:"soft"},
 {id:"minimal",name:"Minimal",category:"Small Business",accent:"#111827",header:"minimal",radius:0,density:"compact",font:"Inter",table:"line"},
 {id:"corporate",name:"Corporate Blue",category:"Large Business",accent:"#2563eb",header:"band",radius:2,density:"normal",font:"Inter",table:"grid"},
 {id:"emerald",name:"Emerald Business",category:"Mid Business",accent:"#047857",header:"band",radius:8,density:"normal",font:"Inter",table:"soft"},
 {id:"royal",name:"Royal Executive",category:"Large Business",accent:"#6d28d9",header:"band",radius:8,density:"normal",font:"Georgia",table:"grid"},
 {id:"premium",name:"Premium Gold",category:"Large Business",accent:"#a16207",header:"classic",radius:4,density:"normal",font:"Georgia",table:"line"},
 {id:"bold",name:"Bold Invoice",category:"Retail",accent:"#be123c",header:"band",radius:4,density:"normal",font:"Inter",table:"grid"},
 {id:"tech",name:"Tech Dark",category:"Technology",accent:"#0891b2",header:"modern",radius:6,density:"compact",font:"Inter",table:"soft"},
 {id:"soft",name:"Soft Business",category:"Services",accent:"#7c3aed",header:"minimal",radius:12,density:"normal",font:"Inter",table:"soft"},
 {id:"retail",name:"Retail Simple",category:"Retail",accent:"#ea580c",header:"band",radius:3,density:"compact",font:"Inter",table:"grid"},
 {id:"elegant",name:"Elegant Mono",category:"Professional",accent:"#334155",header:"classic",radius:0,density:"compact",font:"Georgia",table:"line"},
 {id:"startup",name:"Startup Fresh",category:"Startup",accent:"#16a34a",header:"modern",radius:14,density:"normal",font:"Inter",table:"soft"},
 {id:"creative",name:"Creative Studio",category:"Creative",accent:"#db2777",header:"modern",radius:16,density:"normal",font:"Inter",table:"line"},
 {id:"medical",name:"Clean Care",category:"Healthcare",accent:"#0284c7",header:"minimal",radius:8,density:"normal",font:"Inter",table:"line"},
 {id:"construction",name:"Build Pro",category:"Construction",accent:"#ca8a04",header:"band",radius:2,density:"compact",font:"Inter",table:"grid"},
 {id:"consulting",name:"Consulting Elite",category:"Consulting",accent:"#475569",header:"classic",radius:5,density:"normal",font:"Georgia",table:"line"},
 {id:"wholesale",name:"Wholesale Ledger",category:"Wholesale",accent:"#0369a1",header:"band",radius:0,density:"compact",font:"Inter",table:"grid"}
];
export function resolveDocumentDesign(style={}) {
 const base=DOCUMENT_DESIGNS.find(x=>x.id===style.preset)||DOCUMENT_DESIGNS[0];
 return {...base,...style};
}
export function documentStyleVars(style={}) {
 const d=resolveDocumentDesign(style);
 return {
  "--doc-accent":d.accent,
  "--doc-radius":`${d.radius ?? 0}px`,
  "--doc-density":d.density==="compact"?"4px":"7px",
  "--doc-font":d.font==="Georgia"?"Georgia, serif":"Inter, Arial, sans-serif",
  "--doc-paper":d.paperBg||"#ffffff",
  "--doc-line":d.lineColor||"#d8dde5"
 };
}
