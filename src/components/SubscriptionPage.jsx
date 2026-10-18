import { useEffect, useState } from "react";
import * as api from "../api";
import { Check, Sparkles, ShieldCheck, Clock, AlertTriangle, Crown, Zap, QrCode, Copy, Smartphone, CreditCard, LockKeyhole } from "lucide-react";

const cardStyle = { border: "1px solid var(--border, #dedede)", borderRadius: 16, padding: 20, background: "var(--card, #fff)" };
const muted = { color: "var(--muted, #6b7280)", fontSize: 13, lineHeight: 1.55 };

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [upiId, setUpiId] = useState("");
  const [selected, setSelected] = useState("pro");
  const [utr, setUtr] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);\n  const [copied, setCopied] = useState(false);

  const refresh = () => api.getSubscriptionStatus().then(setSubscription).catch(() => {});
  useEffect(() => {
    refresh();
    api.getSubscriptionPlans().then((data) => { setPlans(data.plans || []); setUpiId(data.upiId || ""); }).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      await api.submitSubscriptionPayment(selected, utr.trim());
      setMessage("UTR submit ho gaya. Payment verify hone ke baad plan activate hoga.");
      setUtr("");
    } catch (err) {
      setMessage(err.message || "Payment reference submit nahi hua.");
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
  const paymentNote = "Nexsa Bills " + (selectedPlan?.name || "Pro") + " subscription";
  const upiLink = upiId
    ? "upi://pay?pa=" + encodeURIComponent(upiId) + "&pn=" + encodeURIComponent("Nexsa Technologies") + "&am=" + amount + "&cu=INR&tn=" + encodeURIComponent(paymentNote)
    : "";
  const qrImageUrl = upiLink
    ? "https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=" + encodeURIComponent(upiLink)
    : "";

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

      {!isOwner && trial && (
        <div role="status" style={{ ...cardStyle, borderColor: "#d6b36a", background: "#fffaf0", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Clock size={20} color="#946200"/>
          <div><strong>{subscription?.trialDaysRemaining ?? 14} day(s) left in your free trial</strong><div style={muted}>Trial ends {subscription?.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString() : "after 14 days"}. After that, Free plan limits apply: 5 invoices, 3 estimates and 5 payment entries.</div></div>
        </div>
      )}

      {!isOwner && expired && (
        <div role="alert" style={{ ...cardStyle, borderColor: "#e6a4a4", background: "#fff5f5", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <AlertTriangle size={20} color="#b42318"/><div><strong>Paid subscription expired</strong><div style={muted}>Your account and saved data remain available. Free plan limits apply now; choose a paid plan below to renew.</div></div>
        </div>
      )}

      {!isOwner && free && !expired && (
        <div role="status" style={{ ...cardStyle, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <ShieldCheck size={20}/><div><strong>Free plan active</strong><div style={muted}>You can keep using Nexsa Bills. Free plan includes 5 invoices, 3 estimates and 5 payment entries. Upgrade only if you need more.</div></div>
        </div>
      )}

      <div>
        <h3 style={{ margin: "0 0 5px", fontSize: 19 }}>Plans made simple</h3>
        <p style={{ ...muted, margin: "0 0 14px" }}>Everyone gets 14 days of full access. No payment needed to start.</p>
        <div className="bb-plan-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <div style={{ ...cardStyle, borderColor: trial ? "#111" : "var(--border, #dedede)", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><h3 style={{ margin: 0 }}>Free</h3><ShieldCheck size={19}/></div>
            <div><strong style={{ fontSize: 28 }}>₹0</strong><span style={muted}> / forever</span></div>
            <p style={{ ...muted, margin: 0 }}>14-day full-access trial, then basic usage limits.</p>
            <div style={{ display: "grid", gap: 9, fontSize: 13 }}>
              {["14-day full access trial", "After trial: 5 invoices", "3 estimates", "5 payment entries"].map(x => <div key={x} style={{ display: "flex", gap: 8 }}><Check size={15}/>{x}</div>)}
            </div>
            <div style={{ marginTop: "auto", paddingTop: 8, fontSize: 12, color: "var(--muted, #6b7280)" }}>{trial ? "Your trial is active" : free ? "Your current plan" : "Included for every account"}</div>
          </div>

          {plans.filter(p => p.id !== "free").map(plan => (
            <div key={plan.id} style={{ ...cardStyle, borderColor: selected === plan.id ? "#111" : "var(--border, #dedede)", boxShadow: selected === plan.id ? "0 0 0 1px #111" : "none", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><h3 style={{ margin: 0 }}>{plan.name}</h3>{plan.id === "advanced" ? <Crown size={19}/> : <Zap size={19}/>}</div>
              <div><strong style={{ fontSize: 28 }}>₹{plan.price}</strong><span style={muted}> / 30 days</span></div>
              <p style={{ ...muted, margin: 0 }}>{plan.id === "pro" ? "Growing businesses ke liye simple upgrade." : "Full toolkit aur premium customization."}</p>
              <div style={{ display: "grid", gap: 9, fontSize: 13 }}>
                {(plan.features || []).map(feature => <div key={feature} style={{ display: "flex", gap: 8 }}><Check size={15}/>{feature}</div>)}
              </div>
              <button type="button" className="bb-btn bb-btn-primary" style={{ marginTop: "auto" }} onClick={() => { setSelected(plan.id); setMessage(""); }}>{selected === plan.id ? "Selected" : "Choose " + plan.name}</button>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={submit} style={{ ...cardStyle, display: "grid", gap: 12 }}>
          <div><h3 style={{ margin: "0 0 5px" }}>{isOwner ? "Payment flow preview" : "Upgrade or renew"}</h3><p style={{ ...muted, margin: 0 }}>{isOwner ? "Owner access lifetime free rahega. Yahan se payment flow test kar sakte ho; owner benefits par koi asar nahi padega." : "UPI payment ke baad UTR submit karo. Verification ke baad hi paid plan activate hoga."}</p></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, alignItems: "stretch" }}>
            <div style={{ border: "1px solid var(--border, #dedede)", borderRadius: 14, padding: 16, display: "grid", justifyItems: "center", alignContent: "start", gap: 10, textAlign: "center" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "#111827", color: "#fff", display: "grid", placeItems: "center" }}><QrCode size={22}/></div>
              <strong>Scan & pay with any UPI app</strong>
              <div style={{ fontSize: 30, fontWeight: 750 }}>₹{amount}</div>
              <div style={muted}>{selectedPlan?.name || "Pro"} plan · 30 days</div>
              {qrImageUrl ? <img src={qrImageUrl} alt="UPI payment QR code" width="220" height="220" style={{ width: 220, height: 220, objectFit: "contain", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff" }} /> : <div style={{ width: 220, height: 220, display: "grid", placeItems: "center", background: "#f3f4f6", borderRadius: 12 }}>Loading QR…</div>}
              <div style={{ ...muted, maxWidth: 240 }}>Open PhonePe, Google Pay, Paytm or your bank app and scan this QR.</div>
              <a href={upiLink || undefined} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 9, background: "#111827", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 650 }}><Smartphone size={16}/> Pay with UPI app</a>
            </div>
            <div style={{ border: "1px solid var(--border, #dedede)", borderRadius: 14, padding: 16, display: "grid", alignContent: "start", gap: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}><LockKeyhole size={19}/><strong>Payment details</strong></div>
              <div style={{ borderRadius: 10, background: "var(--surface-secondary, #f5f5f5)", padding: 13 }}>
                <div style={muted}>Paying for</div><strong>{selectedPlan?.name || "Pro"} subscription</strong>
                <div style={{ marginTop: 9, ...muted }}>UPI ID</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <strong style={{ overflowWrap: "anywhere" }}>{upiId || "Loading…"}</strong>
                  <button type="button" onClick={() => { if (upiId && navigator.clipboard?.writeText) navigator.clipboard.writeText(upiId).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }).catch(() => {}); }} style={{ border: "1px solid var(--border, #ccc)", background: "transparent", borderRadius: 7, padding: 6, display: "inline-flex", alignItems: "center", gap: 5, cursor: "pointer", color: "inherit" }}><Copy size={14}/>{copied ? "Copied" : "Copy"}</button>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: 12, border: "1px solid var(--border, #dedede)", borderRadius: 10 }}>
                <CreditCard size={19}/>
                <div><strong style={{ fontSize: 13 }}>Card / Net Banking</strong><div style={muted}>Online card payments need a verified payment-gateway account. Card checkout is not enabled yet; no card details are collected here.</div></div>
              </div>
              <div style={muted}>After successful payment, enter the UTR below. Your subscription activates only after payment verification.</div>
            </div>
          </div>
          <label htmlFor="subscription-utr" style={{ fontSize: 13, fontWeight: 650 }}>UPI transaction reference / UTR</label>
          <input id="subscription-utr" value={utr} onChange={e => setUtr(e.target.value)} minLength={6} maxLength={80} required placeholder="Enter UTR after payment" style={{ width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 9, border: "1px solid var(--border, #ccc)", background: "var(--background, #fff)", color: "inherit" }} />
          <button className="bb-btn bb-btn-primary" type="submit" disabled={busy || !selectedPlan}>{busy ? "Submitting…" : "Submit payment for verification"}</button>
          {message && <p role="status" style={{ margin: 0, fontSize: 13 }}>{message}</p>}
      </form>
    </div>
  );
}
