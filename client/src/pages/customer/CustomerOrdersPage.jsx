import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Package, Clock, ShoppingBag } from "lucide-react";
import { getCustomerOrders } from "../../services/customerService";
import Spinner from "../../components/Spinner";

const STATUS = {
  pending:   { label:"Pending",          bg:"#fffbeb", color:"#d97706", border:"#fde68a", dot:"#f59e0b", emoji:"⏳" },
  accepted:  { label:"Accepted",         bg:"#eff6ff", color:"#2563eb", border:"#bfdbfe", dot:"#3b82f6", emoji:"✅" },
  picked:    { label:"Out for Delivery", bg:"#f5f3ff", color:"#7c3aed", border:"#ddd6fe", dot:"#8b5cf6", emoji:"🛵" },
  delivered: { label:"Delivered",        bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0", dot:"#22c55e", emoji:"📦" },
  cancelled: { label:"Cancelled",        bg:"#fef2f2", color:"#dc2626", border:"#fecaca", dot:"#ef4444", emoji:"❌" },
};

export default function CustomerOrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCustomerOrders();
        setOrders(res.orders);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <Spinner label="Loading orders…" />;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 60%,#a855f7 100%)", padding: "32px 24px 72px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <ShoppingBag size={22} color="white" />
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>My Orders</h1>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "-36px auto 0", padding: "0 1.5rem 3rem", position: "relative", zIndex: 2 }}>

        {orders.length === 0 ? (
          <div style={{ background: "white", borderRadius: 24, padding: "64px 24px", textAlign: "center", boxShadow: "var(--shadow)", border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🛒</div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>No orders yet</p>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 28px" }}>Start shopping from local stores near you</p>
            <Link to="/home" style={{ display: "inline-block", padding: "12px 32px", borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontSize: 15, fontWeight: 700, boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
              Browse Shops
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map(o => {
              const s = STATUS[o.status] || STATUS.pending;
              return (
                <Link key={o._id} to={`/order/${o._id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "white", borderRadius: 18, overflow: "hidden",
                    border: "1px solid #f1f5f9", boxShadow: "var(--shadow-sm)",
                    display: "flex", transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "none"; }}
                  >
                    {/* Left accent */}
                    <div style={{ width: 5, background: s.dot, flexShrink: 0 }} />

                    <div style={{ flex: 1, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
                      {/* Emoji icon */}
                      <div style={{ width: 50, height: 50, borderRadius: 14, background: s.bg, border: `1.5px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                        {s.emoji}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {o.shopId?.name || "Shop"}
                        </p>
                        <p style={{ margin: "0 0 4px", fontSize: 12.5, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={11} />
                          {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
                          {s.label}
                        </span>
                      </div>

                      {/* Amount + arrow */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900, color: "#0f172a" }}>₹{o.totalAmount}</p>
                        <ChevronRight size={16} color="#94a3b8" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
