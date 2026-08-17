import { useState } from "react";
import { ArrowRight, BarChart3, FileText, Palette, Search, ShieldCheck, Sparkles, X, Zap } from "lucide-react";
import Login from "./Login";

export default function Landing({ onAuthed, onLegal, legalPage }) {
  const [auth, setAuth] = useState(null);
  if (legalPage) return <div className="bb-landing"><div style={{maxWidth:980,margin:"auto",padding:"30px 24px"}}><button className="bb-back" onClick={()=>onLegal(null)}>Back to BillBook</button></div><LegalContent type={legalPage} onBack={()=>onLegal(null)}/></div>;
  if (auth) {
    return (
      <div className="bb-auth-overlay">
        <button className="bb-auth-close" onClick={() => setAuth(null)}><X size={20}/></button>
        <Login mode={auth} onAuthed={onAuthed} onClose={() => setAuth(null)} />
      </div>
    );
  }
  return (
    <div className="bb-landing">
      <header className="bb-landing-nav">
        <div className="bb-landing-brand"><span className="bb-brand-mark"><FileText size={17}/></span><b>BillBook</b></div>
        <div className="bb-landing-nav-actions">
          <button className="bb-btn bb-btn-ghost" onClick={() => setAuth("login")}>Log In</button>
          <button className="bb-btn bb-btn-primary" onClick={() => setAuth("signup")}>Get Started <ArrowRight size={15}/></button>
        </div>
      </header>

      <main>
        <section className="bb-hero">
          <div className="bb-hero-copy">
            <div className="bb-eyebrow"><Sparkles size={14}/> Simple billing. Powerful business.</div>
            <h1>Invoices, estimates & payments — <span>beautifully managed.</span></h1>
            <p>Create professional documents, track payments, search every transaction and export your business data to Excel. Built for small, mid-size and growing businesses.</p>
            <div className="bb-hero-actions">
              <button className="bb-btn bb-btn-primary bb-btn-lg" onClick={() => setAuth("signup")}>Start Free <ArrowRight size={17}/></button>
              <button className="bb-btn bb-btn-ghost bb-btn-lg" onClick={() => setAuth("login")}>I already have an account</button>
            </div>
            <div className="bb-trust"><ShieldCheck size={15}/> Your business data stays separated by account.</div>
          </div>
          <div className="bb-hero-dashboard">
            <div className="bb-window-bar"><i/><i/><i/><span>BillBook Dashboard</span></div>
            <div className="bb-mini-stats">
              <div><small>Total Invoiced</small><strong>₹4,86,500</strong><em>+18.4%</em></div>
              <div><small>Received</small><strong>₹3,72,000</strong><em>₹1,14,500 pending</em></div>
            </div>
            <div className="bb-mini-chart"><span style={{height:"34%"}}/><span style={{height:"50%"}}/><span style={{height:"42%"}}/><span style={{height:"68%"}}/><span style={{height:"58%"}}/><span style={{height:"82%"}}/><span style={{height:"72%"}}/></div>
            <div className="bb-mini-table"><b>Recent invoices</b><div><span>INV-1048</span><span>Rahul Traders</span><strong>₹42,800</strong></div><div><span>INV-1047</span><span>Shree Electricals</span><strong>₹18,600</strong></div><div><span>INV-1046</span><span>Patil Enterprises</span><strong>₹31,250</strong></div></div>
          </div>
        </section>

        <section className="bb-feature-section">
          <div className="bb-section-kicker">Everything you asked for</div>
          <h2>One place for your whole billing workflow.</h2>
          <div className="bb-feature-grid">
            <Feature icon={<FileText/>} title="Professional documents" text="Create invoices, estimates and payment receipts with ready-made layouts."/>
            <Feature icon={<Palette/>} title="Design your own" text="Choose from many business-ready designs or build a custom document style."/>
            <Feature icon={<Search/>} title="Powerful search & filters" text="Find by customer, number, amount, date, status, payment mode and more."/>
            <Feature icon={<BarChart3/>} title="Excel reports" text="Export selected dates, months, years or custom ranges to Excel in one click."/>
            <Feature icon={<Zap/>} title="Fast for daily work" text="Quick dashboard, recent transactions and one-click actions for busy businesses."/>
            <Feature icon={<ShieldCheck/>} title="Account-based data" text="Each user sees their own business, invoices, estimates and payments."/>
          </div>
        </section>

        <section className="bb-landing-cta">
          <div><div className="bb-section-kicker">Ready to start?</div><h2>Make billing look as professional as your business.</h2></div>
          <button className="bb-btn bb-btn-primary bb-btn-lg" onClick={() => setAuth("signup")}>Create your BillBook <ArrowRight size={17}/></button>
        </section>
      </main>
      <footer className="bb-landing-footer"><div className="bb-footer-brand">BillBook · A product of <b>Nexsa Technologies</b></div><div className="bb-footer-links"><button onClick={()=>onLegal("privacy")}>Privacy Policy</button><button onClick={()=>onLegal("terms")}>Terms of Use</button></div><div>© {new Date().getFullYear()} Nexsa Technologies · Professional billing for modern businesses</div></footer>
    </div>
  );
}
function LegalContent({type,onBack}) { const terms=type==="terms"; return <div className="bb-legal-page"><div className="bb-legal-card"><div className="bb-section-kicker">BillBook by Nexsa Technologies</div><h1>{terms?"Terms of Use":"Privacy Policy"}</h1><p className="bb-legal-updated">Last updated: August 17, 2026</p><h3>About BillBook</h3><p>BillBook helps businesses create invoices, estimates and payment receipts, manage records, customize document designs and export business data.</p><h3>{terms?"Responsible use":"Information we store"}</h3><p>{terms?"You are responsible for the accuracy of documents and tax information you create. Do not use BillBook for unlawful, fraudulent or abusive activity.":"We store account, business, document, payment, settings and design information needed to provide your workspace. Records are associated with your signed-in account."}</p><h3>{terms?"Documents and service":"Your control"}</h3><p>{terms?"Review documents before sending them to customers or authorities. Service availability may be affected by maintenance, hosting or network issues.":"You control the business records and exports created in your workspace. Keep your credentials secure and maintain backups of important records."}</p><h3>Contact</h3><p>BillBook is a product of <b>Nexsa Technologies</b>. Use the support details available in your BillBook workspace for questions.</p><button className="bb-btn bb-btn-primary" onClick={onBack}>Back to BillBook</button></div></div> }
function Feature({icon,title,text}) {
  return <div className="bb-feature-card"><div className="bb-feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>;
}
