import { useEffect, useState } from "react";
import * as api from "../api";
import { Check, Sparkles, ShieldCheck, Clock, AlertTriangle, Crown, Zap, CreditCard, LockKeyhole, Smartphone, RefreshCw } from "lucide-react";

const cardStyle = { border: "1px solid var(--border, #dedede)", borderRadius: 16, padding: 20, background: "var(--card, #fff)" };
const muted = { color: "var(--muted, #6b7280)", fontSize: 13, lineHeight: 1.55 };

function loadCashfreeSdk() {
  if (window.Cashfree) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-cashfree-sdk="true"]');
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.dataset.cashfreeSdk = "true";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Cashfree checkout could not load. Check your internet connection and try again."));
    document.head.appendChild(script);
  });
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState("pro");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState("");

  const refresh = () => api.getSubscriptionStatus().then(setSubscription).catch(() => {});
  useEffect(() => {
    refresh();
    api.getSubscriptionPlans().then((data) => setPlans(data.plans || [])).catch(() => {});
    const params = new URLSearchParams(window.location.search);
    const returnedOrderId = params.get("order_id");
    if (params.get("cashfree") === "return" && returnedOrderId) {
      setPendingOrderId(returnedOrderId);
      setMessage("Payment se wapas aaye ho. Payment status verify kar rahe hain…");
      api.verifyCashfreeOrder(returnedOrderId)
        .then((result) => {
          if (result.status === "paid") {
            setMessage("Payment verified! Your subscription is active.");
            refresh();
          } else {
            setMessage("Payment abhi confirm nahi hua. Thodi der baad “Check payment status” dabao.");
          }
        })
        .catch((err) => setMessage(err.message || "Payment status abhi verify nahi hua."));
    }
  }, []);

  const checkPayment = async () => {
    if (!pendingOrderId) return;
    setBusy(true);
    setMessage("Cashfree se payment status check ho raha hai…");
    try {
      const result = await api.verifyCashfreeOrder(pendingOrderId);
      if (result.status === "paid") {
        setMessage("Payment verified! Your subscription is active.");
        await refresh();
      } else {
        setMessage("Payment abhi pending hai. Agar amount deduct hua hai, kuch der baad dobara check karo.");
      }
    } catch (err) {
      setMessage(err.message || "Payment status check nahi ho paya.");
    } finally {
      setBusy(false);
    }
  };

  const startCheckout = async (e) => {
    e.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const order = await api.createCashfreeOrder(selected, phone);
      setPendingOrderId(order.orderId);
      await loadCashfreeSdk();
      const cashfree = window.Cashfree({ mode: order.mode === "production" ? "production" : "sandbox" });
      const result = await cashfree.checkout({ paymentSessionId: order.paymentSessionId, redirectTarget: "_modal" });
      if (result?.error) {
        setMessage(result.error.message || "Checkout close ho gaya ya payment start nahi hua.");
        return;
      }
      const verification = await api.verifyCashfreeOrder(order.orderId);
      if (verification.status === "paid") {
        setMessage("Payment verified! Your subscription is active.");
        await refresh();
      } else {
        setMessage("Checkout complete hua. Payment confirmation ka wait hai; status check kar sakte ho.");
      }
    } catch (err) {
      setMessage(err.message || "Checkout start nahi ho paya.");
    } finally {
      setBusy(false);
    }
  };

  const isOwner = subscription?.mode === "owner";
  const expired = subscription?.status === "expired";
  const trial = subscription?.mode === "trial";
  const free = subscription?.mode === "free";
  const selectedPlan = plans.find(p => p.id === selected);
  const amount = selectedPlan?.price || (selected === "advanced" ? 399 : 199);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section style={{ borderRadius: 18, padding: "24px 22px", color: "#fff", background: "linear-gradient(135deg, #111 0%, #292929 100%)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
        <div style={{ maxWidth: 520 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, letterSpacing: 1.3, textTransform: "uppercase", opacity: .78 }}><Sparkles size={15}/> Nexsa Bills Membership</div>
          <h2 style={{ margin: "10px 0 8px", fontSize: 26 }}>{isOwner ? "Owner access" : trial ? "14 days. Full power." : expired ? "Your plan has ended" : free ? "Free plan" : "Choose your plan"}</h2>
          <p style={{ margin: 0, color: "#d4d4d4", lineHeight: 1.6 }}>{isOwner ? "Owner account par full access hamesha free rahega." : trial ? "Trial ke dauran saare core features use karo. Trial ke baad bhi account aur purana data rahega." : "Apne business ke hisaab se plan choose karo. Trial ke baad Free plan ki limits apply hongi."}</p>
        </div>
        <div style={{ border: "1px solid #555", borderRadius: 999, padding: "9px 13px", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, whiteSpace: "nowrap" }}>
          <ShieldCheck size={16}/>{isOwner ? "Owner • Lifetime" : trial ? "Free trial active" : subscription?.planName || "Free plan"}
        </div>
      </section>

      {isOwner && <div role="status" style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 12 }}><Crown size={22}/><div><strong>Owner benefit active</strong><div style={muted}>No subscription fee, no limits, no expiry.</div></div></div>}
      {!isOwner && trial && <div role="status" style={{ ...cardStyle, borderColor: "#d6b36a", background: "#fffaf0", display: "flex", alignItems: "flex-start", gap: 12 }}><Clock size={20} color="#946200"/><div><strong>{subscription?.trialDaysRemaining ?? 14} day(s) left in your free trial</strong><div style={muted}>Trial ends {subscription?.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString() : "after 14 days"}. After that, Free plan limits apply.</div></div></div>}
      {!isOwner && expired && <div role="alert" style={{ ...cardStyle, borderColor: "#e6a4a4", background: "#fff5f5", display: "flex", alignItems: "flex-start", gap: 12 }}><AlertTriangle size={20} color="#b42318"/><div><strong>Paid subscription expired</strong><div style={muted}>Your account and saved data remain available. Free plan limits apply now; choose a paid plan below to renew.</div></div></div>}
      {!isOwner && free && !expired && <div role="status" style={{ ...cardStyle, display: "flex", alignItems: "flex-start", gap: 12 }}><ShieldCheck size={20}/><div><strong>Free plan active</strong><div style={muted}>Free plan includes 5 invoices, 3 estimates and 5 payment entries.</div></div></div>}

      <div>
        <h3 style={{ margin: "0 0 5px", fontSize: 19 }}>Plans made simple</h3>
        <p style={{ ...muted, margin: "0 0 14px" }}>Everyone gets 14 days of full access. No payment needed to start.</p>
        <div className="bb-plan-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><h3 style={{ margin: 0 }}>Free</h3><ShieldCheck size={19}/></div>
            <div><strong style={{ fontSize: 28 }}>₹0</strong><span style={muted}> / forever</span></div>
            <p style={{ ...muted, margin: 0 }}>14-day full-access trial, then basic usage limits.</p>
            <div style={{ display: "grid", gap: 9, fontSize: 13 }}>{["14-day full access trial", "After trial: 5 invoices", "3 estimates", "5 payment entries"].map(x => <div key={x} style={{ display: "flex", gap: 8 }}><Check size={15}/>{x}</div>)}</div>
          </div>
          {plans.filter(p => p.id !== "free").map(plan => (
            <div key={plan.id} style={{ ...cardStyle, borderColor: selected === plan.id ? "#111" : "var(--border, #dedede)", boxShadow: selected === plan.id ? "0 0 0 1px #111" : "none", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><h3 style={{ margin: 0 }}>{plan.name}</h3>{plan.id === "advanced" ? <Crown size={19}/> : <Zap size={19}/>}</div>
              <div><strong style={{ fontSize: 28 }}>₹{plan.price}</strong><span style={muted}> / 30 days</span></div>
              <p style={{ ...muted, margin: 0 }}>{plan.id === "pro" ? "Growing businesses ke liye simple upgrade." : "Full toolkit aur premium customization."}</p>
              <div style={{ display: "grid", gap: 9, fontSize: 13 }}>{(plan.features || []).map(feature => <div key={feature} style={{ display: "flex", gap: 8 }}><Check size={15}/>{feature}</div>)}</div>
              <button type="button" className="bb-btn bb-btn-primary" style={{ marginTop: "auto" }} onClick={() => { setSelected(plan.id); setMessage(""); }}>{selected === plan.id ? "Selected" : "Choose " + plan.name}</button>
            </div>
          ))}
        </div>
      </div>

      {!isOwner ? <form onSubmit={startCheckout} style={{ ...cardStyle, display: "grid", gap: 14 }}>
        <div><h3 style={{ margin: "0 0 5px" }}>Secure checkout</h3><p style={{ ...muted, margin: 0 }}>Pay securely through Cashfree. Your plan activates only after the backend verifies a successful payment.</p></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
          <div style={{ border: "1px solid var(--border, #dedede)", borderRadius: 14, padding: 16, display: "grid", alignContent: "start", gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#111827", color: "#fff", display: "grid", placeItems: "center" }}><CreditCard size={22}/></div>
            <strong>{selectedPlan?.name || "Pro"} subscription</strong>
            <div style={{ fontSize: 32, fontWeight: 750 }}>₹{amount}</div>
            <div style={muted}>30 days of access · secure Cashfree checkout</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, ...muted }}><LockKeyhole size={15}/> Payment details are handled by Cashfree.</div>
          </div>
          <div style={{ border: "1px solid var(--border, #dedede)", borderRadius: 14, padding: 16, display: "grid", alignContent: "start", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}><Smartphone size={19}/><strong>Receipt contact</strong></div>
            <label htmlFor="cashfree-phone" style={{ fontSize: 13, fontWeight: 650 }}>Mobile number</label>
            <input id="cashfree-phone" type="tel" inputMode="numeric" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} minLength={10} maxLength={10} required placeholder="10-digit mobile number" style={{ width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 9, border: "1px solid var(--border, #ccc)", background: "var(--background, #fff)", color: "inherit" }} />
            <div style={muted}>Cashfree uses this number for payment processing and receipt details.</div>
          </div>
        </div>
        <button className="bb-btn bb-btn-primary" type="submit" disabled={busy || !selectedPlan || isOwner}>{busy ? "Opening secure checkout…" : "Continue to Cashfree · ₹" + amount}</button>
        {pendingOrderId && <button type="button" className="bb-btn" onClick={checkPayment} disabled={busy} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}><RefreshCw size={15}/> Check payment status</button>}
        {message && <p role="status" style={{ margin: 0, fontSize: 13 }}>{message}</p>}
      </form> : <div role="status" style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 12 }}><Crown size={22}/><div><strong>Owner account par payment ki zaroorat nahi hai.</strong><div style={muted}>Paid checkout ko test karne ke liye customer account se sign in karein.</div></div></div>}
    </div>
  );
}
