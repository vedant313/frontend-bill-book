import { useEffect, useMemo, useState } from "react";
import * as api from "../api";
import { Check, Copy, ExternalLink, QrCode, ShieldCheck, Sparkles, X } from "lucide-react";

const UPI_ID = "shamkantgopal@ybl";

const PLANS = [
  { id: "free", name: "Free", price: 0, subtitle: "For starting small", features: ["Basic invoices & estimates", "Payment tracking", "Basic business settings", "Excel export"] },
  { id: "pro", name: "Pro", price: 199, subtitle: "For growing businesses", popular: true, features: ["Everything in Free", "Unlimited invoices", "Advanced document designs", "Advanced reports", "Priority feature access"] },
  { id: "advanced", name: "Advanced", price: 399, subtitle: "For serious business workflows", features: ["Everything in Pro", "Premium document studio", "Advanced business controls", "Priority support", "Early access to new features"] },
];

function buildUpiUrl(amount, planName) {
  const params = new URLSearchParams({ pa: UPI_ID, pn: "BillBook by Nexsa Technologies", am: String(amount), cu: "INR", tn: `BillBook ${planName} subscription` });
  return `upi://pay?${params.toString()}`;
}

export default function SubscriptionPage() {
  const [selected, setSelected] = useState(null);
  const [utr, setUtr] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [subscription, setSubscription] = useState(null);
  const plan = useMemo(() => PLANS.find((p) => p.id === selected) || null, [selected]);

  useEffect(() => {
    api.getSubscriptionStatus().then(setSubscription).catch(() => {});
  }, [submitted]);

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const submitPayment = async () => {
    if (!plan || !utr.trim() || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await api.submitSubscriptionPayment(plan.id, utr.trim());
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Could not submit payment details");
    } finally {
      setSubmitting(false);
    }
  };

  if (plan) {
    const upiUrl = buildUpiUrl(plan.price, plan.name);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(upiUrl)}`;
    return (
      <div>
        <div className="bb-page-head">
          <div><h2>Upgrade to {plan.name}</h2><span>Pay by UPI and submit the UTR for verification.</span></div>
          <button className="bb-btn bb-btn-ghost" onClick={() => { setSelected(null); setUtr(""); setSubmitted(false); }}><X size={14}/> Back to Plans</button>
        </div>
        <div className="bb-subscription-payment-grid">
          <div className="bb-card bb-payment-card">
            <div className="bb-payment-kicker"><QrCode size={16}/> Scan & Pay</div>
            <h3>{plan.name} Plan · ₹{plan.price}/month</h3>
            <p>Scan with PhonePe, Google Pay, Paytm or any UPI app.</p>
            <div className="bb-qr-wrap"><img src={qrUrl} alt="BillBook UPI payment QR code" /></div>
            <a className="bb-btn bb-btn-primary" href={upiUrl}><ExternalLink size={14}/> Open UPI App</a>
            <div className="bb-upi-row"><code>{UPI_ID}</code><button className="bb-btn bb-btn-ghost" onClick={copyUpi}><Copy size={13}/> {copied ? "Copied" : "Copy UPI ID"}</button></div>
          </div>
          <div className="bb-card">
            <div className="bb-payment-kicker"><ShieldCheck size={16}/> Payment confirmation</div>
            <h3>Submit payment reference</h3>
            <p>After paying, enter the UTR / transaction reference number. Payment is activated only after verification.</p>
            {submitted ? (
              <div className="bb-submitted-box"><Check size={22}/><div><b>Payment details submitted</b><div>We’ll verify the payment and activate your plan.</div></div></div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                <label className="bb-label">UTR / Transaction reference</label>
                <input className="bb-input" value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="Enter your UTR number" />
                <button className="bb-btn bb-btn-primary" disabled={!utr.trim() || submitting} onClick={submitPayment}>{submitting ? "Submitting…" : "Submit Payment Details"}</button>{submitError && <div className="bb-note" style={{ color: "#B94A3F" }}>{submitError}</div>}
              </div>
            )}
            <div className="bb-note"><b>UPI ID:</b> {UPI_ID}<br/><b>Plan:</b> {plan.name}<br/><b>Amount:</b> ₹{plan.price}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bb-subscription-hero">
        <div><div className="bb-subscription-kicker"><Sparkles size={14}/> BillBook Plans</div><h2>Choose the plan that fits your business</h2><p>Start with a 14-day full-access trial, then continue on the limited Free plan or upgrade.</p></div>
        <div className="bb-subscription-badge"><ShieldCheck size={15}/> UPI payments supported</div>
      </div>
      <div className="bb-plan-grid">
        {PLANS.map((p) => (
          <div key={p.id} className={`bb-plan-card ${p.popular ? "featured" : ""}`}>
            {p.popular && <div className="bb-plan-popular">MOST POPULAR</div>}
            <div className="bb-plan-icon"><QrCode size={17}/></div><h3>{p.name}</h3><p className="bb-plan-subtitle">{p.subtitle}</p>
            <div className="bb-plan-price"><strong>{p.price === 0 ? "Free" : `₹${p.price}`}</strong>{p.price > 0 && <span>/month</span>}</div>
            <div className="bb-plan-features">{p.features.map((f) => <div key={f}><Check size={14}/> {f}</div>)}</div>
            <button className={`bb-btn ${p.popular ? "bb-btn-primary" : "bb-btn-ghost"}`} onClick={() => p.id === "free" ? setSelected(null) : setSelected(p.id)}>{p.id === "free" ? (subscription?.mode === "trial" ? "14-Day Trial" : "Free Plan") : `Choose ${p.name}`}</button>
          </div>
        ))}
      </div>
      <div className="bb-card bb-upi-banner"><div><b>Pay securely via UPI</b><div>PhonePe · Google Pay · Paytm · Any UPI app</div></div><code>{UPI_ID}</code></div>
    </div>
  );
}
