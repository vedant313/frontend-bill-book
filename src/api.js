// Thin wrapper around the backend REST API.
const BASE = import.meta.env.VITE_API_BASE || "https://backend1-tx8q.onrender.com/api";
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
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...options, signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err?.name === "AbortError") throw new Error("Server took too long to respond. Please try again.");
    throw err;
  }
  clearTimeout(timeout);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try { const data = await res.json(); if (data?.error) message = data.error; } catch {}
    const err = new Error(message); err.status = res.status; throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}
export const signup = (name, email, password) => request("/auth/signup", { method: "POST", body: JSON.stringify({ name, email, password }) });
export const login = (identifier, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ identifier, password }) });
export const phonePasswordLogin = (phone, password) => request("/auth/firebase-phone/password-login", { method: "POST", body: JSON.stringify({ phone, password }) });
export const sendPhoneOtp = (phone) => request("/auth/phone-otp/send", { method: "POST", body: JSON.stringify({ phone }) });
export const verifyPhoneOtp = (phone, otp, profile = {}) => request("/auth/phone-otp/verify", { method: "POST", body: JSON.stringify({ phone, otp, ...profile }) });
export const me = () => request("/auth/me");
export const linkFirebasePhone = (idToken) => request("/auth/firebase-phone/link", { method: "POST", body: JSON.stringify({ idToken }) });

export const getBusiness = () => request("/business");
export const saveBusiness = (business) => request("/business", { method: "PUT", body: JSON.stringify(business) });
export const getDocuments = (type) => request(`/documents${type ? `?type=${type}` : ""}`);
export const createDocument = (doc) => request("/documents", { method: "POST", body: JSON.stringify(doc) });
export const updateDocument = (id, doc) => request(`/documents/${id}`, { method: "PUT", body: JSON.stringify(doc) });
export const deleteDocument = (id) => request(`/documents/${id}`, { method: "DELETE" });
export const getPayments = () => request("/payments");
export const createPayment = (p) => request("/payments", { method: "POST", body: JSON.stringify(p) });
export const updatePayment = (id, p) => request(`/payments/${id}`, { method: "PUT", body: JSON.stringify(p) });
export const deletePayment = (id) => request(`/payments/${id}`, { method: "DELETE" });
export const getSubscriptionPlans = () => request("/subscription/plans");
export const getSubscriptionStatus = () => request("/subscription/status");
export const createCashfreeOrder = (plan, phone) => request("/subscription/cashfree/create-order", { method: "POST", body: JSON.stringify({ plan, phone }) });
export const verifyCashfreeOrder = (orderId) => request("/subscription/cashfree/verify-order", { method: "POST", body: JSON.stringify({ orderId }) });
export const submitSubscriptionPayment = (plan, utr) => request("/subscription/payment-request", { method: "POST", body: JSON.stringify({ plan, utr }) });
export const getSubscriptionPaymentRequests = () => request("/subscription/payment-requests");
export const getProducts = () => request("/products");
export const createProduct = (product) => request("/products", { method: "POST", body: JSON.stringify(product) });
export const updateProduct = (id, product) => request("/products/" + id, { method: "PUT", body: JSON.stringify(product) });
export const deleteProduct = (id) => request("/products/" + id, { method: "DELETE" });
export const getCustomers = () => request("/customers");
export const createCustomer = (customer) => request("/customers", { method: "POST", body: JSON.stringify(customer) });
export const updateCustomer = (id, customer) => request("/customers/" + id, { method: "PUT", body: JSON.stringify(customer) });
export const deleteCustomer = (id) => request("/customers/" + id, { method: "DELETE" });
export const getStockMovements = (id) => request("/products/" + id + "/movements");
export const moveStock = (id, movement) => request("/products/" + id + "/stock", { method: "POST", body: JSON.stringify(movement) });
export const getRecurring = () => request("/recurring");
export const createRecurring = (item) => request("/recurring", { method: "POST", body: JSON.stringify(item) });
export const updateRecurring = (id, item) => request("/recurring/" + id, { method: "PUT", body: JSON.stringify(item) });
export const deleteRecurring = (id) => request("/recurring/" + id, { method: "DELETE" });
export const getExpenses = () => request("/expenses");
export const createExpense = (expense) => request("/expenses", { method: "POST", body: JSON.stringify(expense) });
export const updateExpense = (id, expense) => request("/expenses/" + id, { method: "PUT", body: JSON.stringify(expense) });
export const deleteExpense = (id) => request("/expenses/" + id, { method: "DELETE" });

export const adminOverview = () => request("/admin/overview");
export const adminUsers = (q = "", page = 1) => request("/admin/users?q=" + encodeURIComponent(q) + "&page=" + page);
export const adminSetUserStatus = (id, status) => request("/admin/users/" + encodeURIComponent(id) + "/status", { method: "PATCH", body: JSON.stringify({ status }) });
export const adminSetSubscription = (id, plan, days = 30) => request("/admin/users/" + encodeURIComponent(id) + "/subscription", { method: "PATCH", body: JSON.stringify({ plan, days }) });
export const adminDeleteUser = (id, confirmEmail) => request("/admin/users/" + encodeURIComponent(id), { method: "DELETE", body: JSON.stringify({ confirmEmail }) });
export const adminAudit = () => request("/admin/audit");
