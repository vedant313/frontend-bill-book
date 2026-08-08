// Thin wrapper around the backend REST API.
// In dev, Vite proxies /api to http://localhost:4000 (see vite.config.js).
// In production, set VITE_API_BASE to your deployed backend URL.

const BASE = import.meta.env.VITE_API_BASE || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${options.method || "GET"} ${path} failed: ${res.status} ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ---- Business profile ----
export const getBusiness = () => request("/business");
export const saveBusiness = (business) => request("/business", { method: "PUT", body: JSON.stringify(business) });

// ---- Documents (invoices & estimates) ----
export const getDocuments = (type) => request(`/documents${type ? `?type=${type}` : ""}`);
export const createDocument = (doc) => request("/documents", { method: "POST", body: JSON.stringify(doc) });
export const updateDocument = (id, doc) => request(`/documents/${id}`, { method: "PUT", body: JSON.stringify(doc) });
export const deleteDocument = (id) => request(`/documents/${id}`, { method: "DELETE" });

// ---- Payments ----
export const getPayments = () => request("/payments");
export const createPayment = (p) => request("/payments", { method: "POST", body: JSON.stringify(p) });
export const updatePayment = (id, p) => request(`/payments/${id}`, { method: "PUT", body: JSON.stringify(p) });
export const deletePayment = (id) => request(`/payments/${id}`, { method: "DELETE" });
