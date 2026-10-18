import { useEffect, useState } from "react";
import * as api from "../api";
import { Check, Sparkles, ShieldCheck } from "lucide-react";

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    api.getSubscriptionStatus().then(setSubscription).catch(() => {});
  }, []);

  return (
    <div>
      <div className="bb-subscription-hero">
        <div>
          <div className="bb-subscription-kicker"><Sparkles size={14}/> Nexsa Bills</div>
          <h2>Free access for everyone</h2>
          <p>Paid plans are temporarily unavailable. Create invoices and manage your business without a usage quota.</p>
        </div>
        <div className="bb-subscription-badge"><ShieldCheck size={15}/> Free plan</div>
      </div>
      <div className="bb-plan-grid">
        <div className="bb-plan-card featured">
          <div className="bb-plan-icon"><Check size={17}/></div>
          <h3>Free</h3>
          <p className="bb-plan-subtitle">All users</p>
          <div className="bb-plan-price"><strong>Free</strong></div>
          <div className="bb-plan-features">
            {["Unlimited invoices", "Unlimited estimates", "Unlimited payment entries", "Business settings and document designs"].map((feature) => (
              <div key={feature}><Check size={14}/> {feature}</div>
            ))}
          </div>
          <button className="bb-btn bb-btn-primary" disabled>
            {subscription?.mode === "trial" ? "Full-access trial" : "Free plan active"}
          </button>
        </div>
      </div>
    </div>
  );
}
