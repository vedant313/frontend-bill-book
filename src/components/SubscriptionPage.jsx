import { useEffect, useState } from "react";
import * as api from "../api";
import { Check, Sparkles, ShieldCheck, Clock, AlertTriangle } from "lucide-react";

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [upiId, setUpiId] = useState("");
  const [selected, setSelected] = useState("pro");
  const [utr, setUtr] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = () => api.getSubscriptionStatus().then(setSubscription).catch(() => {});
  useEffect(() => {
    refresh();
    api.getSubscriptionPlans().then((data) => { setPlans(data.plans || []); setUpiId(data.upiId || ""); }).catch(() => {});
  }, []);
  const submit = async (e) => {
    e.preventDefault(); setMessage(""); setBusy(true);
    try {
      await api.submitSubscriptionPayment(selected, utr.trim());
      setMessage("Payment reference submitted. Your plan will activate after payment verification."); setUtr("");
    } catch (err) { setMessage(err.message || "Could not submit payment reference."); }
    finally { setBusy(false); }
  };
  const isOwner = subscription?.mode === "owner";
  const expired = subscription?.status === "expired";
  return (
    <div>
      <div className="bb-subscription-hero">
        <div>
          <div className="bb-subscription-kicker"><Sparkles size={14}/> Nexsa Bills</div>
          <h2>{isOwner ? "Owner full access" : "Choose your subscription"}</h2>
          <p>{isOwner ? "Your owner account has unlimited access and no expiry date." : "Paid plans last 30 days. We show an expiry warning so you can renew before access changes."}</p>
        </div>
        <div className="bb-subscription-badge"><ShieldCheck size={15}/> {isOwner ? "Owner access" : subscription?.planName || "Subscription"}</div>
      </div>
      {expired && <div role="alert" style={{ margin: "16px 0", padding: 14, borderRadius: 10, background: "#fff1f0", color: "#a52822" }}><AlertTriangle size={17} style={{ verticalAlign: "middle", marginRight: 8 }}/>Your previous subscription has expired. You are now on the Free plan. Renew below to restore paid features.</div>}
      {!isOwner && subscription?.expiresAt && !expired && subscription.daysRemaining !== null && (
        <div role="status" style={{ margin: "16px 0", padding: 14, borderRadius: 10, background: subscription.daysRemaining <= 7 ? "#fff7e6" : "#eef8f0", color: subscription.daysRemaining <= 7 ? "#8a4b08" : "#216e39" }}>
          <Clock size={17} style={{ verticalAlign: "middle", marginRight: 8 }}/>
          {subscription.daysRemaining <= 0 ? "Your subscription expires today." : "Your " + subscription.planName + " plan expires in " + subscription.daysRemaining + " day(s), on " + new Date(subscription.expiresAt).toLocaleDateString() + "."}
        </div>
      )}
      <div className="bb-plan-grid">
        {plans.filter(p => p.id !== "free").map(plan => (
          <div className={"bb-plan-card " + (selected === plan.id ? "featured" : "")} key={plan.id}>
            <div className="bb-plan-icon"><Check size={17}/></div>
            <h3>{plan.name}</h3><p className="bb-plan-subtitle">30 days of access</p>
            <div className="bb-plan-price"><strong>₹{plan.price}</strong><span> / 30 days</span></div>
            <div className="bb-plan-features">{(plan.features || ["Unlimited invoices", "Unlimited estimates", "Unlimited payment entries"]).map(feature => <div key={feature}><Check size={14}/> {feature}</div>)}</div>
            <button className="bb-btn bb-btn-primary" onClick={() => setSelected(plan.id)}>{selected === plan.id ? "Selected" : "Choose plan"}</button>
          </div>
        ))}
      </div>
      {!isOwner && (
        <form onSubmit={submit} style={{ marginTop: 22, padding: 18, border: "1px solid var(--border, #ddd)", borderRadius: 12 }}>
          <h3>Activate / renew plan</h3>
          <p>1. Pay the selected plan using your UPI app. 2. Enter the UTR / transaction reference below. 3. Access starts after verification.</p>
          <p><strong>UPI ID:</strong> {upiId || "Loading…"}</p>
          <label htmlFor="subscription-utr">UPI transaction reference (UTR)</label>
          <input id="subscription-utr" value={utr} onChange={e => setUtr(e.target.value)} minLength={6} maxLength={80} required placeholder="Enter UTR after payment" style={{ display: "block", width: "100%", boxSizing: "border-box", margin: "8px 0 12px", padding: 11, borderRadius: 8, border: "1px solid var(--border, #ccc)" }} />
          <button className="bb-btn bb-btn-primary" type="submit" disabled={busy || !plans.some(p => p.id === selected)}>{busy ? "Submitting…" : "Submit ₹" + (plans.find(p => p.id === selected)?.price || "") + " payment reference"}</button>
          {message && <p role="status" style={{ marginTop: 12 }}>{message}</p>}
        </form>
      )}
    </div>
  );
}
