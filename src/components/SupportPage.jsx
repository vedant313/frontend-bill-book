import { Mail, MessageCircle, LockKeyhole, CreditCard, CircleHelp, ArrowLeft, Send } from "lucide-react";

const SUPPORT_EMAIL = "nexsatechnologies@gmail.com";
const SUPPORT_WHATSAPP = "918208581567";

export default function SupportPage({ onBack }) {
  const openWhatsApp = (topic) => {
    const message = `Hi Nexsa Bill Support, I need help with: ${topic}. My registered email is: `;
    window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const emailSupport = (subject) => {
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
  };

  return (
    <div className="bb-support-page">
      <div className="bb-support-head">
        <div>
          <div className="bb-section-kicker">Nexsa Bill Support</div>
          <h1>Need help? We’re here.</h1>
          <p>Account, password, payment or subscription problem? Contact support and include your registered email so we can identify the account.</p>
        </div>
        {onBack && <button className="bb-btn bb-btn-ghost" onClick={onBack}><ArrowLeft size={15}/> Back</button>}
      </div>

      <div className="bb-support-contact-grid">
        <button className="bb-support-contact" onClick={() => openWhatsApp("general support")}>
          <span className="bb-support-icon"><MessageCircle size={20}/></span>
          <span><b>WhatsApp Support</b><small>Chat with Nexsa Technologies support</small></span>
        </button>
        <button className="bb-support-contact" onClick={() => emailSupport("Nexsa Bill Support Request")}>
          <span className="bb-support-icon"><Mail size={20}/></span>
          <span><b>Email Support</b><small>{SUPPORT_EMAIL}</small></span>
        </button>
      </div>

      <div className="bb-support-grid">
        <section className="bb-card bb-support-card">
          <div className="bb-support-card-icon"><LockKeyhole size={19}/></div>
          <h3>Forgot your password?</h3>
          <p>Don’t create another account. Contact support from the email address registered with Nexsa Bill and ask for a password reset.</p>
          <button className="bb-btn bb-btn-primary" onClick={() => emailSupport("Password Reset Request")}>Request Password Reset <Send size={14}/></button>
        </section>

        <section className="bb-card bb-support-card">
          <div className="bb-support-card-icon"><CreditCard size={19}/></div>
          <h3>Paid but subscription not active?</h3>
          <p>Send your registered email, selected plan, payment date, amount and UTR/reference number. Never send your UPI PIN or password.</p>
          <button className="bb-btn bb-btn-primary" onClick={() => openWhatsApp("subscription payment / plan activation")}>Report Payment Issue <MessageCircle size={14}/></button>
        </section>

        <section className="bb-card bb-support-card">
          <div className="bb-support-card-icon"><CircleHelp size={19}/></div>
          <h3>Something else?</h3>
          <p>Tell us what happened, what you were trying to do, and the email used for your Nexsa Bill account.</p>
          <button className="bb-btn bb-btn-ghost" onClick={() => emailSupport("Nexsa Bill Help Request")}>Contact Support <Mail size={14}/></button>
        </section>
      </div>

      <div className="bb-support-note">
        <b>For payment issues:</b> UTR/reference number helps us match a manual payment request. Nexsa Bill support will never ask for your UPI PIN, OTP or account password.
      </div>
    </div>
  );
}
