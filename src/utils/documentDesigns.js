export const DOCUMENT_DESIGNS = [
 {id:"classic",name:"Classic GST",category:"GST & Tax",accent:"#16233f",header:"classic",layout:"standard",radius:0,density:"normal",font:"Inter",table:"grid"},
 {id:"gst-boxed",name:"GST Boxed",category:"GST & Tax",accent:"#1e3a5f",header:"classic",layout:"boxed",radius:2,density:"normal",font:"Inter",table:"grid"},
 {id:"gst-clean",name:"GST Clean",category:"GST & Tax",accent:"#0f766e",header:"minimal",layout:"clean",radius:0,density:"normal",font:"Inter",table:"line"},
 {id:"tax-modern",name:"Tax Modern",category:"GST & Tax",accent:"#2563eb",header:"modern",layout:"split",radius:6,density:"normal",font:"Inter",table:"soft"},
 {id:"retail-bill",name:"Retail Bill",category:"Retail",accent:"#ea580c",header:"band",layout:"retail",radius:3,density:"compact",font:"Inter",table:"grid"},
 {id:"retail-pos",name:"Retail POS",category:"Retail",accent:"#b45309",header:"minimal",layout:"pos",radius:0,density:"compact",font:"Inter",table:"line"},
 {id:"retail-bold",name:"Retail Bold",category:"Retail",accent:"#be123c",header:"band",layout:"bold",radius:4,density:"normal",font:"Inter",table:"grid"},
 {id:"wholesale",name:"Wholesale Ledger",category:"Wholesale",accent:"#0369a1",header:"band",layout:"ledger",radius:0,density:"compact",font:"Inter",table:"grid"},
 {id:"wholesale-blue",name:"Wholesale Blue",category:"Wholesale",accent:"#1d4ed8",header:"classic",layout:"boxed",radius:2,density:"normal",font:"Inter",table:"grid"},
 {id:"wholesale-green",name:"Wholesale Green",category:"Wholesale",accent:"#15803d",header:"modern",layout:"clean",radius:5,density:"compact",font:"Inter",table:"soft"},
 {id:"modern",name:"Modern Clean",category:"Modern",accent:"#0f9b8e",header:"modern",layout:"split",radius:10,density:"normal",font:"Inter",table:"soft"},
 {id:"modern-blue",name:"Modern Blue",category:"Modern",accent:"#2563eb",header:"modern",layout:"split",radius:12,density:"normal",font:"Inter",table:"soft"},
 {id:"modern-dark",name:"Modern Dark",category:"Modern",accent:"#0f172a",header:"band",layout:"bold",radius:8,density:"normal",font:"Inter",table:"grid"},
 {id:"minimal",name:"Minimal",category:"Minimal",accent:"#111827",header:"minimal",layout:"clean",radius:0,density:"compact",font:"Inter",table:"line"},
 {id:"minimal-green",name:"Minimal Green",category:"Minimal",accent:"#166534",header:"minimal",layout:"clean",radius:0,density:"normal",font:"Inter",table:"line"},
 {id:"minimal-slate",name:"Minimal Slate",category:"Minimal",accent:"#475569",header:"minimal",layout:"clean",radius:0,density:"compact",font:"Inter",table:"soft"},
 {id:"corporate",name:"Corporate Blue",category:"Corporate",accent:"#2563eb",header:"band",layout:"boxed",radius:2,density:"normal",font:"Inter",table:"grid"},
 {id:"corporate-navy",name:"Corporate Navy",category:"Corporate",accent:"#1e293b",header:"classic",layout:"standard",radius:3,density:"normal",font:"Inter",table:"grid"},
 {id:"corporate-teal",name:"Corporate Teal",category:"Corporate",accent:"#0f766e",header:"band",layout:"boxed",radius:4,density:"normal",font:"Inter",table:"soft"},
 {id:"premium",name:"Premium Gold",category:"Premium",accent:"#a16207",header:"classic",layout:"elegant",radius:4,density:"normal",font:"Georgia",table:"line"},
 {id:"royal",name:"Royal Executive",category:"Premium",accent:"#6d28d9",header:"band",layout:"elegant",radius:8,density:"normal",font:"Georgia",table:"grid"},
 {id:"premium-black",name:"Premium Black",category:"Premium",accent:"#18181b",header:"modern",layout:"elegant",radius:5,density:"normal",font:"Georgia",table:"soft"},
 {id:"elegant",name:"Elegant Mono",category:"Premium",accent:"#334155",header:"classic",layout:"elegant",radius:0,density:"compact",font:"Georgia",table:"line"},
 {id:"tech",name:"Tech Cyan",category:"Technology",accent:"#0891b2",header:"modern",layout:"split",radius:6,density:"compact",font:"Inter",table:"soft"},
 {id:"tech-indigo",name:"Tech Indigo",category:"Technology",accent:"#4f46e5",header:"band",layout:"bold",radius:8,density:"normal",font:"Inter",table:"grid"},
 {id:"services",name:"Service Invoice",category:"Services",accent:"#7c3aed",header:"minimal",layout:"clean",radius:10,density:"normal",font:"Inter",table:"soft"},
 {id:"consulting",name:"Consulting Elite",category:"Services",accent:"#475569",header:"classic",layout:"elegant",radius:5,density:"normal",font:"Georgia",table:"line"},
 {id:"construction",name:"Build Pro",category:"Industry",accent:"#ca8a04",header:"band",layout:"bold",radius:2,density:"compact",font:"Inter",table:"grid"},
 {id:"medical",name:"Clean Care",category:"Industry",accent:"#0284c7",header:"minimal",layout:"clean",radius:8,density:"normal",font:"Inter",table:"line"},
 {id:"restaurant",name:"Food & Restaurant",category:"Industry",accent:"#dc2626",header:"band",layout:"retail",radius:5,density:"compact",font:"Inter",table:"grid"},
 {id:"pharmacy",name:"Pharmacy Clean",category:"Industry",accent:"#059669",header:"modern",layout:"clean",radius:4,density:"compact",font:"Inter",table:"line"},
 {id:"creative",name:"Creative Studio",category:"Creative",accent:"#db2777",header:"modern",layout:"bold",radius:16,density:"normal",font:"Inter",table:"line"},
 {id:"startup",name:"Startup Fresh",category:"Startup",accent:"#16a34a",header:"modern",layout:"split",radius:14,density:"normal",font:"Inter",table:"soft"},
 {id:"soft",name:"Soft Business",category:"Services",accent:"#7c3aed",header:"minimal",layout:"clean",radius:12,density:"normal",font:"Inter",table:"soft"},
 {id:"blue-a4",name:"A4 Professional",category:"Professional",accent:"#1e40af",header:"classic",layout:"standard",radius:2,density:"normal",font:"Inter",table:"grid"},
 {id:"simple-a4",name:"Simple A4",category:"Professional",accent:"#334155",header:"minimal",layout:"standard",radius:0,density:"normal",font:"Inter",table:"line"},
 {id:"color-a4",name:"Color A4",category:"Professional",accent:"#0d9488",header:"band",layout:"boxed",radius:5,density:"normal",font:"Inter",table:"soft"},
 {id:"thermal",name:"Compact Thermal",category:"Quick Billing",accent:"#111827",header:"minimal",layout:"thermal",radius:0,density:"compact",font:"Inter",table:"line"},
 {id:"quick",name:"Quick Bill",category:"Quick Billing",accent:"#0f766e",header:"band",layout:"thermal",radius:2,density:"compact",font:"Inter",table:"grid"}
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
