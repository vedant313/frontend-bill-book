const BASE = import.meta.env.VITE_API_BASE || "https://backend1-tx8q.onrender.com/api";

export async function firebasePhoneLogin(idToken, profile = {}) {
  const response = await fetch(`${BASE}/auth/firebase-phone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, ...profile }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not finish phone sign-in.");
  return data;
}

export async function resetPhonePassword(idToken, password) {
  const response = await fetch(`${BASE}/auth/firebase-phone/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Could not reset password.");
  return data;
}
