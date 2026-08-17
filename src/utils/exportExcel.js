import * as XLSX from "xlsx";
import { fmtDate } from "./helpers.js";

function autoWidth(rows) {
  if (!rows.length) return [];
  const keys = Object.keys(rows[0]);
  return keys.map((k) => ({
    wch: Math.min(40, Math.max(k.length, ...rows.map((r) => String(r[k] ?? "").length)) + 2),
  }));
}

function sheetFromRows(rows) {
  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = autoWidth(rows);
  return sheet;
}

function docRows(docs) {
  return docs.map((d) => ({
    Number: d.number || "",
    Party: d.partyName || "",
    Date: fmtDate(d.date),
    Status: d.status || "",
    "Subtotal (₹)": Number(d.subtotal || 0),
    "GST (₹)": Number(d.gstAmt || 0),
    "Discount (₹)": Number(d.discountAmt || 0),
    "Total (₹)": Number(d.total || 0),
    "GSTIN": d.partyGstin || "",
    "State": d.partyState || "",
  }));
}

function paymentRows(payments) {
  return payments.map((p) => ({
    Number: p.number || "",
    Party: p.partyName || "",
    Date: fmtDate(p.date),
    Mode: p.mode || "",
    Bank: p.bankName || "",
    "Against Invoice": p.againstInvoice || "",
    "Amount (₹)": Number(p.amount || 0),
  }));
}

function downloadWorkbook(wb, filename) {
  XLSX.writeFile(wb, filename);
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

// Exports just the invoices to an Excel file.
export function exportInvoices(docs, label = "invoices") {
  const invoices = docs.filter((d) => d.type === "invoice");
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheetFromRows(docRows(invoices)), "Invoices");
  downloadWorkbook(wb, `${label}-${todayStamp()}.xlsx`);
}

// Exports just the estimates to an Excel file.
export function exportEstimates(docs, label = "estimates") {
  const estimates = docs.filter((d) => d.type === "estimate");
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheetFromRows(docRows(estimates)), "Estimates");
  downloadWorkbook(wb, `${label}-${todayStamp()}.xlsx`);
}

// Exports just the payments to an Excel file.
export function exportPayments(payments, label = "payments") {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheetFromRows(paymentRows(payments)), "Payments");
  downloadWorkbook(wb, `${label}-${todayStamp()}.xlsx`);
}


export function exportFilteredData(docs, payments, filename = "billbook-filtered") {
  const invoices = docs.filter((d) => d.type === "invoice");
  const estimates = docs.filter((d) => d.type === "estimate");
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheetFromRows(docRows(invoices)), "Invoices");
  XLSX.utils.book_append_sheet(wb, sheetFromRows(docRows(estimates)), "Estimates");
  XLSX.utils.book_append_sheet(wb, sheetFromRows(paymentRows(payments)), "Payments");
  downloadWorkbook(wb, `${filename}-${todayStamp()}.xlsx`);
}

// Exports everything — invoices, estimates and payments — as one workbook
// with a sheet per type, so the user gets "sara data" in a single file.
export function exportAllData(docs, payments) {
  const invoices = docs.filter((d) => d.type === "invoice");
  const estimates = docs.filter((d) => d.type === "estimate");
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheetFromRows(docRows(invoices)), "Invoices");
  XLSX.utils.book_append_sheet(wb, sheetFromRows(docRows(estimates)), "Estimates");
  XLSX.utils.book_append_sheet(wb, sheetFromRows(paymentRows(payments)), "Payments");
  downloadWorkbook(wb, `billbook-all-data-${todayStamp()}.xlsx`);
}
