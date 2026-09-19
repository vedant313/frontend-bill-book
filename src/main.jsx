import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";

class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"Inter,Arial,sans-serif",background:"#f6f8fb"}}>
        <div style={{maxWidth:460,textAlign:"center",background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:28,boxShadow:"0 15px 40px rgba(15,23,42,.08)"}}>
          <h2 style={{margin:"0 0 8px",color:"#0f172a"}}>BillBook needs a quick refresh</h2>
          <p style={{color:"#64748b",fontSize:13,lineHeight:1.6}}>Something unexpected happened in this screen. Your saved server data is not deleted.</p>
          <button onClick={()=>window.location.reload()} style={{border:0,borderRadius:9,padding:"10px 16px",background:"#0f766e",color:"#fff",fontWeight:700,cursor:"pointer"}}>Refresh BillBook</button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
