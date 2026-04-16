import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearToken, getRoleFromToken, decodeToken, getToken } from "../utils/auth";

const NAV_LINKS = {
  customer: [
    { to: "/home", label: "Shops" },
    { to: "/orders", label: "My Orders" },
    { to: "/cart", label: "Cart" },
  ],
  shop_owner: [
    { to: "/owner/dashboard", label: "Dashboard" },
    { to: "/owner/products", label: "Products" },
    { to: "/owner/orders", label: "Orders" },
    { to: "/owner/profile", label: "Profile" },
  ],
  delivery_agent: [
    { to: "/agent/home", label: "Available" },
    { to: "/agent/active", label: "Active" },
    { to: "/agent/history", label: "History" },
  ],
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getRoleFromToken();
  const payload = decodeToken(getToken());
  const links = NAV_LINKS[role] || [];

  const onLogout = () => {
    clearToken();
    navigate("/login");
  };

  if (!role) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to={links[0]?.to || "/"} className="text-lg font-bold tracking-tight text-slate-900">
          LocalMart
        </Link>

        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                location.pathname === l.to
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {payload?.name ? (
            <span className="hidden text-sm text-slate-500 sm:block">{payload.name}</span>
          ) : null}
          <button
            onClick={onLogout}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
