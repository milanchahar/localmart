import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag, LayoutDashboard, Package, ClipboardList,
  User, Truck, History, MapPin, LogOut, ShoppingCart, Zap
} from "lucide-react";
import { clearToken, getRoleFromToken, decodeToken, getToken } from "../utils/auth";

const NAV = {
  customer: [
    { to: "/home",   label: "Shops",   icon: ShoppingBag },
    { to: "/orders", label: "Orders",  icon: ClipboardList },
    { to: "/cart",   label: "Cart",    icon: ShoppingCart },
  ],
  shop_owner: [
    { to: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/owner/products",  label: "Products",  icon: Package },
    { to: "/owner/orders",    label: "Orders",    icon: ClipboardList },
    { to: "/owner/profile",   label: "Profile",   icon: User },
  ],
  delivery_agent: [
    { to: "/agent/home",   label: "Available", icon: MapPin },
    { to: "/agent/active", label: "Active",    icon: Truck },
    { to: "/agent/history",label: "History",   icon: History },
  ],
};

const ROLE_COLOR = {
  customer:       { bg:"#eef2ff", color:"#6366f1" },
  shop_owner:     { bg:"#fef9c3", color:"#854d0e" },
  delivery_agent: { bg:"#f0fdf4", color:"#15803d" },
};

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const role      = getRoleFromToken();
  const payload   = decodeToken(getToken());
  const links     = NAV[role] || [];
  const rc        = ROLE_COLOR[role] || { bg:"#f1f5f9", color:"#64748b" };
  const roleLabel = role === "shop_owner" ? "Owner" : role === "delivery_agent" ? "Agent" : "Customer";

  if (!role) return null;

  return (
    <nav style={{
      background: "rgba(255,255,255,0.94)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(226,232,240,0.8)",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1140, margin: "0 auto", padding: "0 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: 62,
      }}>

        {/* Logo */}
        <Link to={links[0]?.to || "/"} style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none", flexShrink:0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
          }}>
            <ShoppingBag size={17} color="white" />
          </div>
          <div>
            <span style={{ fontWeight: 900, fontSize: 17, color: "#0f172a", letterSpacing: "-0.03em" }}>LocalMart</span>
            <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: "#fef3c7", color: "#92400e" }}>BETA</span>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {links.map((l) => {
            const Icon   = l.icon;
            const active = location.pathname === l.to;
            return (
              <Link key={l.to} to={l.to} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 13px", borderRadius: 10, textDecoration: "none",
                fontSize: 13.5, fontWeight: active ? 700 : 500,
                background: active ? "#eef2ff" : "transparent",
                color: active ? "#6366f1" : "#475569",
                transition: "all 0.15s",
              }}>
                <Icon size={15} />
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right: user + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
              {payload?.name?.split(" ")[0] || "User"}
            </p>
            <span style={{
              fontSize: 10.5, fontWeight: 600, padding: "1px 7px", borderRadius: 4,
              background: rc.bg, color: rc.color,
            }}>
              {roleLabel.toUpperCase()}
            </span>
          </div>
          <button onClick={() => { clearToken(); navigate("/login"); }} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 13px", borderRadius: 10,
            border: "1.5px solid #e2e8f0", background: "transparent",
            fontSize: 13, color: "#64748b", fontWeight: 500, cursor: "pointer",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
