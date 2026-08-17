export const DOCUMENT_DESIGNS = [
 {id:"classic",name:"Classic Professional",accent:"#16233f",header:"classic",radius:0,density:"normal"},
 {id:"modern",name:"Modern Clean",accent:"#0f9b8e",header:"modern",radius:10,density:"normal"},
 {id:"minimal",name:"Minimal",accent:"#111827",header:"minimal",radius:0,density:"compact"},
 {id:"corporate",name:"Corporate Blue",accent:"#2563eb",header:"band",radius:2,density:"normal"},
 {id:"emerald",name:"Emerald Business",accent:"#047857",header:"band",radius:8,density:"normal"},
 {id:"royal",name:"Royal",accent:"#6d28d9",header:"band",radius:8,density:"normal"},
 {id:"premium",name:"Premium Gold",accent:"#a16207",header:"classic",radius:4,density:"normal"},
 {id:"bold",name:"Bold Invoice",accent:"#be123c",header:"band",radius:4,density:"normal"},
 {id:"tech",name:"Tech Dark",accent:"#0891b2",header:"modern",radius:6,density:"compact"},
 {id:"soft",name:"Soft Business",accent:"#7c3aed",header:"minimal",radius:12,density:"normal"},
 {id:"retail",name:"Retail Simple",accent:"#ea580c",header:"band",radius:3,density:"compact"},
 {id:"elegant",name:"Elegant Mono",accent:"#334155",header:"classic",radius:0,density:"compact"}
];
export function resolveDocumentDesign(style={}) {
 const base=DOCUMENT_DESIGNS.find(x=>x.id===style.preset)||DOCUMENT_DESIGNS[0];
 return {...base,...style};
}
export function documentStyleVars(style={}) {
 const d=resolveDocumentDesign(style);
 return {"--doc-accent":d.accent,"--doc-radius":`${d.radius}px`,"--doc-density":d.density==="compact"?"4px":"7px"};
}
