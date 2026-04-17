import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Store, Truck, Mail, Lock, Phone, MapPin, Tag, ArrowRight, Zap } from "lucide-react";
import { loginUser, registerUser } from "../../services/authService";
import { getHomeByRole, saveToken } from "../../utils/auth";
import toast, { Toaster } from "react-hot-toast";

const ROLE_TABS = [
  { key: "customer",       label: "Customer",   icon: User,  desc: "Shop from local stores" },
  { key: "shop_owner",     label: "Shop Owner", icon: Store, desc: "Manage your store" },
  { key: "delivery_agent", label: "Agent",      icon: Truck, desc: "Deliver orders" },
];

const FIELD_CFG = {
  name:        { label: "Full Name",        icon: User,  type: "text" },
  phone:       { label: "Phone Number",     icon: Phone, type: "tel" },
  email:       { label: "Email Address",    icon: Mail,  type: "email" },
  password:    { label: "Password",         icon: Lock,  type: "password" },
  pincode:     { label: "Your Pincode",     icon: MapPin,type: "text" },
  shopName:    { label: "Shop Name",        icon: Store, type: "text" },
  shopAddress: { label: "Shop Address",     icon: MapPin,type: "text" },
  category:    { label: "Shop Category",    icon: Tag,   type: "text" },
  vehicleType: { label: "Vehicle Type",     icon: Truck, type: "text" },
};

export default function AuthPage({ mode = "login" }) {
  const navigate     = useNavigate();
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({ name:"", phone:"", email:"", password:"", pincode:"", shopName:"", shopAddress:"", category:"", vehicleType:"" });
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  const fields = useMemo(() => {
    if (!isRegister) return ["email", "password"];
    const common = ["name", "phone", "email", "password"];
    if (role === "customer")       return [...common, "pincode"];
    if (role === "shop_owner")     return [...common, "shopName", "shopAddress", "category"];
    return [...common, "vehicleType"];
  }, [isRegister, role]);

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { role };
      fields.forEach(k => { payload[k] = form[k].trim(); });
      const data = isRegister ? await registerUser(payload) : await loginUser(payload);
      saveToken(data.token);
      toast.success(isRegister ? "Account created! 🎉" : "Welcome back! 👋");
      setTimeout(() => navigate(getHomeByRole(role), { replace: true }), 600);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 45%, #f0fdf4 100%)",
      display: "flex",
    }}>
      <Toaster position="top-center" toastOptions={{ style:{ borderRadius:12, fontFamily:"Inter,sans-serif", fontSize:14 } }} />

      {/* Left panel (hidden on mobile) */}
      <div style={{
        flex: 1, background: "linear-gradient(160deg, #4f46e5 0%, #7c3aed 60%, #a855f7 100%)",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "48px 56px", position: "relative", overflow: "hidden",
      }}
        className="auth-left-panel"
      >
        <div style={{ position:"absolute", top:-80, right:-80, width:260, height:260, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
        <div style={{ position:"absolute", bottom:-40, left:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />

        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:48, position:"relative", zIndex:1 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <ShoppingBag size={22} color="white" />
          </div>
          <span style={{ fontSize:22, fontWeight:900, color:"white", letterSpacing:"-0.02em" }}>LocalMart</span>
        </div>

        <div style={{ position:"relative", zIndex:1 }}>
          <h2 style={{ margin:"0 0 16px", fontSize:36, fontWeight:900, color:"white", letterSpacing:"-0.03em", lineHeight:1.1 }}>
            Groceries<br />delivered fast
          </h2>
          <p style={{ margin:"0 0 40px", fontSize:16, color:"rgba(255,255,255,0.72)", lineHeight:1.6 }}>
            Shop from 20+ local kirana stores<br />across your city.
          </p>

          {[
            { emoji:"⚡", text:"10–30 min delivery" },
            { emoji:"🏪", text:"20+ local shops" },
            { emoji:"💰", text:"Best local prices" },
          ].map(({ emoji, text }) => (
            <div key={text} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
              <span style={{ fontSize:20 }}>{emoji}</span>
              <span style={{ fontSize:15, color:"rgba(255,255,255,0.85)", fontWeight:500 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — the form */}
      <div style={{
        width: "100%", maxWidth: 520, display:"flex", flexDirection:"column",
        justifyContent:"center", padding:"40px 48px", overflowY:"auto",
      }}
        className="auth-right-panel"
      >
        <div style={{ marginBottom:32 }}>
          <h1 style={{ margin:"0 0 6px", fontSize:28, fontWeight:900, color:"#0f172a", letterSpacing:"-0.02em" }}>
            {isRegister ? "Create account" : "Sign in"}
          </h1>
          <p style={{ margin:0, fontSize:14, color:"#64748b" }}>
            {isRegister ? "Join LocalMart and start ordering" : "Continue to your LocalMart dashboard"}
          </p>
        </div>

        {/* Role tabs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:28, background:"#f1f5f9", borderRadius:14, padding:6 }}>
          {ROLE_TABS.map(tab => {
            const Icon   = tab.icon;
            const active = role === tab.key;
            return (
              <button key={tab.key} type="button" onClick={() => setRole(tab.key)} style={{
                padding:"12px 6px 10px", borderRadius:10, border:"none", cursor:"pointer",
                background: active ? "white" : "transparent",
                boxShadow: active ? "var(--shadow)" : "none",
                display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                color: active ? "#6366f1" : "#94a3b8", transition:"all 0.2s",
              }}>
                <Icon size={18} />
                <span style={{ fontSize:11.5, fontWeight: active ? 700 : 500 }}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={onSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {fields.map(field => {
            const cfg = FIELD_CFG[field];
            const Icon = cfg.icon;
            return (
              <div key={field} style={{ position:"relative" }}>
                <label style={{ display:"block", fontSize:11.5, fontWeight:700, color:"#64748b", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>
                  {cfg.label}
                </label>
                <div style={{ position:"relative" }}>
                  <Icon size={15} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }} />
                  <input
                    name={field}
                    type={cfg.type}
                    placeholder={cfg.label}
                    value={form[field]}
                    onChange={onChange}
                    required
                    style={{
                      width:"100%", paddingLeft:40, paddingRight:14, paddingTop:12, paddingBottom:12,
                      border:"1.5px solid #e2e8f0", borderRadius:11, fontSize:14, color:"#0f172a",
                      background:"#fafafa", outline:"none", transition:"all 0.15s", boxSizing:"border-box",
                      fontFamily:"Inter,sans-serif",
                    }}
                    onFocus={e => { e.target.style.borderColor="#6366f1"; e.target.style.background="white"; e.target.style.boxShadow="0 0 0 3px rgba(99,102,241,0.1)"; }}
                    onBlur={e  => { e.target.style.borderColor="#e2e8f0"; e.target.style.background="#fafafa"; e.target.style.boxShadow="none"; }}
                  />
                </div>
              </div>
            );
          })}

          <button type="submit" disabled={loading} style={{
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            marginTop:8, padding:"14px", borderRadius:12, border:"none",
            background: loading ? "#a5b4fc" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color:"white", fontSize:15, fontWeight:800, cursor: loading ? "not-allowed" : "pointer",
            boxShadow:"0 4px 18px rgba(99,102,241,0.4)", transition:"all 0.2s",
            letterSpacing:"-0.01em",
          }}>
            {loading ? "Please wait…" : isRegister ? "Create Account" : "Sign In"}
            {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        <p style={{ textAlign:"center", marginTop:24, fontSize:14, color:"#64748b" }}>
          {isRegister ? "Already have an account? " : "New to LocalMart? "}
          <Link to={isRegister ? "/login" : "/register"} style={{ color:"#6366f1", fontWeight:700 }}>
            {isRegister ? "Sign in" : "Create account"}
          </Link>
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
          .auth-right-panel { max-width: 100% !important; padding: 32px 24px !important; }
        }
      `}</style>
    </div>
  );
}
