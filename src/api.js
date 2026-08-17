// Thin wrapper around the backend REST API.
// In dev, Vite proxies /api to http://localhost:4000 (see vite.config.js).
// In production, set VITE_API_BASE to your deployed backend URL.

const BASE = import.meta.env.VITE_API_BASE || "/api";
const TOKEN_KEY = "billbook_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY) || "";
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore non-JSON error bodies */
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

// ---- Auth ----
export const signup = (name, email, password) =>
  request("/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) });
export const login = (email, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const me = () => request("/auth/me");

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
