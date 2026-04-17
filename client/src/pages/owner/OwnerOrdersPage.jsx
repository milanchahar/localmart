import { useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle, ChevronRight, Package, User, Phone, MapPin, Clock, Bell } from "lucide-react";
import { getOwnerOrders, updateOwnerOrderStatus } from "../../services/ownerService";
import { connectSocket, disconnectSocket } from "../../utils/socket";
import Spinner from "../../components/Spinner";
import toast, { Toaster } from "react-hot-toast";

const STATUS_STYLE = {
  pending:   { bg:"#fffbeb", color:"#d97706", border:"#fde68a", label:"Pending",          dot:"#f59e0b" },
  accepted:  { bg:"#eff6ff", color:"#2563eb", border:"#bfdbfe", label:"Accepted",          dot:"#3b82f6" },
  picked:    { bg:"#f5f3ff", color:"#7c3aed", border:"#ddd6fe", label:"Out for Delivery",  dot:"#8b5cf6" },
  delivered: { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0", label:"Delivered",         dot:"#22c55e" },
  cancelled: { bg:"#fef2f2", color:"#dc2626", border:"#fecaca", label:"Cancelled",         dot:"#ef4444" },
};

const TABS = ["all", "pending", "accepted", "delivered", "cancelled"];

export default function OwnerOrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("all");
  const shopIdRef             = useRef(null);

  const load = async () => {
    try {
      const res = await getOwnerOrders();
      setOrders(res.orders);
      if (res.orders[0] && !shopIdRef.current) shopIdRef.current = res.orders[0].shopId;
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const socket = connectSocket();
    socket.on("new_order", () => { load(); toast("New order received! 🛒", { icon:"🔔" }); });
    return () => { socket.off("new_order"); disconnectSocket(); };
  }, []);

  useEffect(() => {
    if (shopIdRef.current) connectSocket().emit("join_shop", shopIdRef.current);
  }, [orders]);

  const onStatus = async (id, status) => {
    try { await updateOwnerOrderStatus(id, status); toast.success(`Order ${status}`); await load(); }
    catch (e) { toast.error(e.message); }
  };

  const filtered = tab === "all" ? orders : orders.filter(o => o.status === tab);
  const counts   = TABS.reduce((acc, t) => { acc[t] = t === "all" ? orders.length : orders.filter(o => o.status === t).length; return acc; }, {});

  if (loading) return <Spinner label="Loading orders…" />;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: 12, fontFamily: "Inter,sans-serif", fontSize: 14 } }} />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#4f46e5 50%,#7c3aed 100%)", padding: "36px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ maxWidth: 1140, margin: "0 auto", position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Real-time</p>
            <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>Incoming Orders</h1>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{orders.length} total orders · updates live</p>
          </div>
          {counts.pending > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, background: "#f59e0b", color: "white" }}>
              <Bell size={16} />
              <span style={{ fontWeight: 800, fontSize: 14 }}>{counts.pending} pending</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "-40px auto 0", padding: "0 1.5rem 3rem", position: "relative", zIndex: 2 }}>
        {/* Tab filter */}
        <div style={{ background: "white", borderRadius: 16, padding: "10px 14px", boxShadow: "var(--shadow)", border: "1px solid #f1f5f9", marginBottom: 20, display: "flex", gap: 6, overflowX: "auto" }}>
          {TABS.map(t => {
            const active = tab === t;
            const s = STATUS_STYLE[t];
            return (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", whiteSpace: "nowrap",
                background: active ? (t === "all" ? "#eef2ff" : s.bg) : "transparent",
                color: active ? (t === "all" ? "#6366f1" : s.color) : "#64748b",
                fontWeight: active ? 700 : 500, fontSize: 13, transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 7,
              }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
                <span style={{ padding: "1px 7px", borderRadius: 100, background: active ? "rgba(0,0,0,0.08)" : "#f1f5f9", fontSize: 11, fontWeight: 700 }}>
                  {counts[t]}
                </span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px", background: "white", borderRadius: 24, border: "1px solid #f1f5f9", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📋</div>
            <p style={{ fontWeight: 800, fontSize: 17, color: "#0f172a", marginBottom: 6 }}>No orders here</p>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>New orders will appear here in real-time</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map(o => {
              const s = STATUS_STYLE[o.status] || STATUS_STYLE.pending;
              return (
                <div key={o._id} style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1px solid #f1f5f9", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ height: 4, background: s.dot }} />
                  <div style={{ padding: "18px 22px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, borderBottom: "1px solid #fafafa" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>
                      <div>
                        <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{o.customerId?.name || "Customer"}</p>
                        <p style={{ margin: 0, fontSize: 12.5, color: "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
                          <Phone size={11} /> {o.customerId?.phone || "-"}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 100, fontSize: 11.5, fontWeight: 700, background: s.bg, color: s.color, border: `1.5px solid ${s.border}` }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
                        {s.label}
                      </span>
                      <span style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>₹{o.totalAmount}</span>
                    </div>
                  </div>

                  <div style={{ padding: "14px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <p style={{ margin: "0 0 5px", fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={10} /> Deliver To
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: "#334155" }}>{o.deliveryAddress}</p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 5px", fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                        <Package size={10} /> Items
                      </p>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {o.items.map(it => (
                          <span key={it.productId} style={{ padding: "3px 9px", borderRadius: 100, background: "#f1f5f9", fontSize: 11.5, color: "#475569", fontWeight: 500 }}>
                            {it.name} ×{it.qty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {(o.status === "pending" || o.status === "accepted") && (
                    <div style={{ padding: "12px 22px 16px", borderTop: "1px solid #fafafa", display: "flex", gap: 8 }}>
                      {o.status === "pending" && (
                        <>
                          <button onClick={() => onStatus(o._id, "accepted")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 10px rgba(99,102,241,0.3)" }}>
                            <CheckCircle size={14} /> Accept Order
                          </button>
                          <button onClick={() => onStatus(o._id, "cancelled")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}
                      {o.status === "accepted" && (
                        <button onClick={() => onStatus(o._id, "picked")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 10, border: "1.5px solid #bbf7d0", background: "#f0fdf4", color: "#16a34a", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                          <ChevronRight size={14} /> Mark Ready for Pickup
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
