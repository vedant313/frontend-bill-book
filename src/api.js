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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
    signal: controller.signal,
  });
  } catch (err) {
    clearTimeout(timeout);
    if (err?.name === "AbortError") throw new Error("Server took too long to respond. Please try again.");
    throw err;
  }
  clearTimeout(timeout);
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

// ---- Subscription ----
export const getSubscriptionPlans = () => request("/subscription/plans");
export const getSubscriptionStatus = () => request("/subscription/status");
export const submitSubscriptionPayment = (plan, utr) =>
  request("/subscription/payment-request", {
    method: "POST",
    body: JSON.stringify({ plan, utr }),
  });
export const getSubscriptionPaymentRequests = () => request("/subscription/payment-requests");

// ---- Product catalog ----
export const getProducts = () => request("/products");
export const createProduct = (product) => request("/products", { method: "POST", body: JSON.stringify(product) });
export const updateProduct = (id, product) => request("/products/" + id, { method: "PUT", body: JSON.stringify(product) });
export const deleteProduct = (id) => request("/products/" + id, { method: "DELETE" });
// ---- Customers ----
export const getCustomers = () => request("/customers");
export const createCustomer = (customer) => request("/customers", { method: "POST", body: JSON.stringify(customer) });
export const updateCustomer = (id, customer) => request("/customers/" + id, { method: "PUT", body: JSON.stringify(customer) });
export const deleteCustomer = (id) => request("/customers/" + id, { method: "DELETE" });

// ---- Expenses ----
export const getExpenses = () => request("/expenses");
export const createExpense = (expense) => request("/expenses", { method: "POST", body: JSON.stringify(expense) });
export const updateExpense = (id, expense) => request("/expenses/" + id, { method: "PUT", body: JSON.stringify(expense) });
export const deleteExpense = (id) => request("/expenses/" + id, { method: "DELETE" });

export const getStockMovements = (id) => request("/products/" + id + "/movements");
export const moveStock = (id, movement) => request("/products/" + id + "/stock", { method: "POST", body: JSON.stringify(movement) });
