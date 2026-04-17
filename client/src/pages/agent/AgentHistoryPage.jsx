import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Package, Truck } from "lucide-react";
import { getAgentHistory } from "../../services/agentService";
import Spinner from "../../components/Spinner";

export default function AgentHistoryPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { const res = await getAgentHistory(); setOrders(res.orders); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <Spinner label="Loading history…" />;

  const totalEarnings = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>

      <div style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#4f46e5 50%,#7c3aed 100%)", padding: "36px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Agent</p>
            <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>Delivery History</h1>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{orders.length} completed deliveries</p>
          </div>
          {orders.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 16, padding: "14px 22px", backdropFilter: "blur(8px)" }}>
              <p style={{ margin: "0 0 3px", fontSize: 11.5, color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Total deliveries</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>{orders.length}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "-40px auto 0", padding: "0 1.5rem 3rem", position: "relative", zIndex: 2 }}>

        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px", background: "white", borderRadius: 24, border: "1px solid #f1f5f9", boxShadow: "var(--shadow)" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🛵</div>
            <p style={{ fontWeight: 800, fontSize: 17, color: "#0f172a", marginBottom: 6 }}>No deliveries yet</p>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Accept available orders to start delivering</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {orders.map(o => (
              <div key={o._id} style={{ background: "white", borderRadius: 18, overflow: "hidden", border: "1px solid #f1f5f9", boxShadow: "var(--shadow-sm)", display: "flex", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ width: 5, background: "linear-gradient(180deg,#22c55e,#16a34a)", flexShrink: 0 }} />
                <div style={{ flex: 1, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: "#f0fdf4", border: "1.5px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CheckCircle2 size={22} color="#16a34a" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{o.shopId?.name || "Shop"}</p>
                    <p style={{ margin: "0 0 3px", fontSize: 13, color: "#64748b" }}>→ {o.customerId?.name || "Customer"}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={11} />
                      {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ margin: "0 0 5px", fontSize: 18, fontWeight: 900, color: "#0f172a" }}>₹{o.totalAmount}</p>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", padding: "3px 10px", borderRadius: 100, border: "1px solid #bbf7d0" }}>
                      DELIVERED
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
