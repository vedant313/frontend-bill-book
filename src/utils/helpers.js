export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const fmt = (n) => "₹" + (Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const fmtDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const monthLabel = (d) => new Date(d).toLocaleDateString("en-IN", { month: "short" });

export const DOC_META = {
  invoice: { label: "Tax Invoice", short: "Invoice", statuses: ["Unpaid", "Partially Paid", "Paid", "Overdue"] },
  estimate: { label: "Estimate", short: "Estimate", statuses: ["Draft", "Sent", "Accepted", "Rejected"] },
};

// Each item: { id, name, hsn, qty, rate, gstPct }
export function calcTotals(items, flatDiscount) {
  const subtotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
  const gstAmt = items.reduce((s, it) => {
    const amt = (Number(it.qty) || 0) * (Number(it.rate) || 0);
    return s + (amt * (Number(it.gstPct) || 0)) / 100;
  }, 0);
  const discountAmt = Number(flatDiscount) || 0;
  const total = subtotal + gstAmt - discountAmt;
  return { subtotal, gstAmt, discountAmt, total };
}

// HSN/SAC-wise CGST/SGST breakup for the tax summary box
export function taxSummary(items) {
  const groups = {};
  items.forEach((it) => {
    const key = it.hsn || "—";
    const taxable = (Number(it.qty) || 0) * (Number(it.rate) || 0);
    const gstPct = Number(it.gstPct) || 0;
    const gstAmt = (taxable * gstPct) / 100;
    if (!groups[key]) groups[key] = { hsn: key, rate: gstPct, taxable: 0, cgstAmt: 0, sgstAmt: 0, totalTax: 0 };
    groups[key].taxable += taxable;
    groups[key].cgstAmt += gstAmt / 2;
    groups[key].sgstAmt += gstAmt / 2;
    groups[key].totalTax += gstAmt;
  });
  return Object.values(groups);
}

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigitWords(n) {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
}
function threeDigitWords(n) {
  let str = "";
  if (n > 99) {
    str += ONES[Math.floor(n / 100)] + " Hundred ";
    n %= 100;
  }
  str += twoDigitWords(n);
  return str.trim();
}

export function amountInWords(num) {
  num = Math.round(Number(num) || 0);
  if (num === 0) return "Zero Rupees only";
  const crore = Math.floor(num / 10000000); num %= 10000000;
  const lakh = Math.floor(num / 100000); num %= 100000;
  const thousand = Math.floor(num / 1000); num %= 1000;
  const hundred = num;
  const parts = [];
  if (crore) parts.push(threeDigitWords(crore) + " Crore");
  if (lakh) parts.push(threeDigitWords(lakh) + " Lakh");
  if (thousand) parts.push(threeDigitWords(thousand) + " Thousand");
  if (hundred) parts.push(threeDigitWords(hundred));
  return parts.join(" ") + " Rupees only";
}

export function nextNumber(docs, type) {
  const nums = docs.filter(d => d.type === type).map(d => Number(String(d.number || "").replace(/\D/g, ""))).filter(Number.isFinite);
  return String((nums.length ? Math.max(...nums) : 0) + 1);
}

export function nextPaymentNumber(payments) {
  const nums = (payments || []).map(p => Number(String(p.number || "").replace(/\D/g, ""))).filter(Number.isFinite);
  return String((nums.length ? Math.max(...nums) : 0) + 1);
}
