import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Truck, MapPin, Package, ArrowRight } from "lucide-react";
import { getAvailableOrders, acceptOrder } from "../../services/agentService";
import Spinner from "../../components/Spinner";
import toast, { Toaster } from "react-hot-toast";

const EMOJIS = { Grocery:"🛒", Dairy:"🥛", Vegetables:"🥦", Bakery:"🍞", Pharmacy:"💊", General:"📦", default:"🏪" };

export default function AgentHomePage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  const load = async () => {
    try { const res = await getAvailableOrders(); setOrders(res.orders); }
    catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onAccept = async id => {
    setAccepting(id);
    try { await acceptOrder(id); toast.success("Order accepted! Head to the shop 🛵"); await load(); }
    catch (e) { toast.error(e.message); }
    finally { setAccepting(null); }
  };

  if (loading) return <Spinner label="Finding orders…" />;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: 12, fontFamily: "Inter,sans-serif", fontSize: 14 } }} />

      <div style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#4f46e5 50%,#7c3aed 100%)", padding: "36px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Agent Dashboard</p>
          <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>Available Orders</h1>
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""} available for pickup
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "-40px auto 0", padding: "0 1.5rem 3rem", position: "relative", zIndex: 2 }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px", background: "white", borderRadius: 24, border: "1px solid #f1f5f9", boxShadow: "var(--shadow)" }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 36 }}>🛵</div>
            <p style={{ fontWeight: 800, fontSize: 17, color: "#0f172a", marginBottom: 6 }}>No orders yet</p>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Available orders will appear here in real-time</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {orders.map(o => (
              <div key={o._id} style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1px solid #f1f5f9", boxShadow: "var(--shadow-sm)" }}>
                {/* Shop header */}
                <div style={{ padding: "18px 22px 16px", background: "linear-gradient(135deg,#fafafe,#f5f3ff)", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: "white", border: "1.5px solid #e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "var(--shadow-xs)" }}>
                      {EMOJIS[o.shopId?.category] || EMOJIS.default}
                    </div>
                    <div>
                      <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{o.shopId?.name || "Shop"}</p>
                      <p style={{ margin: 0, fontSize: 12.5, color: "#6366f1", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
                        <MapPin size={11} /> {o.shopId?.address || "-"}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>₹{o.totalAmount}</span>
                </div>

                <div style={{ padding: "16px 22px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                    <div style={{ padding: "12px 14px", background: "#fafafa", borderRadius: 12 }}>
                      <p style={{ margin: "0 0 4px", fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Customer</p>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{o.customerId?.name || "-"}</p>
                    </div>
                    <div style={{ padding: "12px 14px", background: "#fafafa", borderRadius: 12 }}>
                      <p style={{ margin: "0 0 4px", fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Deliver To</p>
                      <p style={{ margin: 0, fontSize: 13, color: "#334155" }}>{o.deliveryAddress}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <p style={{ margin: "0 0 8px", fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                      <Package size={10} /> Items
                    </p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {o.items.map(it => (
                        <span key={it.productId} style={{ padding: "5px 12px", borderRadius: 100, background: "#eef2ff", color: "#6366f1", fontSize: 12.5, fontWeight: 600 }}>
                          {it.name} ×{it.qty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => onAccept(o._id)} disabled={!!accepting} style={{
                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    background: accepting === o._id ? "#a5b4fc" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    color: "white", fontSize: 15, fontWeight: 800, cursor: accepting ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    boxShadow: "0 4px 16px rgba(99,102,241,0.35)", transition: "all 0.2s",
                  }}>
                    <CheckCircle2 size={17} />
                    {accepting === o._id ? "Accepting…" : "Accept & Deliver"}
                    {accepting !== o._id && <ArrowRight size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
