import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Package, Phone, Navigation2 } from "lucide-react";
import { getActiveDelivery, updateDeliveryStatus } from "../../services/agentService";
import DeliveryMap from "../../components/DeliveryMap";
import Spinner from "../../components/Spinner";
import toast, { Toaster } from "react-hot-toast";

const STATUS_STEPS = ["accepted", "picked", "delivered"];
const STATUS_LABELS = { accepted: "Accepted", picked: "Picked Up", delivered: "Delivered" };

export default function AgentActiveDeliveryPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [agentLocation, setAgentLocation] = useState(null);
  const watchRef = useRef(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await getActiveDelivery();
      setOrder(res.order);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (navigator.geolocation) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => setAgentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true }
      );
    }
    return () => { if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current); };
  }, []);

  const nextStatus = () => {
    if (!order) return null;
    const idx = STATUS_STEPS.indexOf(order.status);
    return idx === -1 || idx === STATUS_STEPS.length - 1 ? null : STATUS_STEPS[idx + 1];
  };

  const onUpdate = async () => {
    const next = nextStatus();
    if (!next) return;
    setUpdating(true);
    try {
      await updateDeliveryStatus(order._id, next);
      toast.success(next === "delivered" ? "Order delivered! 🎉" : "Status updated");
      if (next === "delivered") navigate("/agent/history");
      else await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUpdating(false);
    }
  };

  const next = nextStatus();
  const statusIdx = order ? STATUS_STEPS.indexOf(order.status) : -1;

  if (loading) return <Spinner />;

  return (
    <div className="page-container">
      <Toaster position="top-center" />
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, color: "#0f172a" }}>Active Delivery</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Follow the steps to complete your delivery</p>
      </div>

      {!order ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16, border: "1px solid #e2e8f0" }}>
          <Navigation2 size={40} color="#94a3b8" style={{ margin: "0 auto 14px" }} />
          <p style={{ color: "#64748b", fontWeight: 500 }}>No active delivery</p>
          <p style={{ color: "#94a3b8", fontSize: 13 }}>Accept an available order to start</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Progress</p>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {STATUS_STEPS.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STATUS_STEPS.length - 1 ? 1 : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: i <= statusIdx ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#f1f5f9",
                      border: i <= statusIdx ? "none" : "2px solid #e2e8f0",
                      fontSize: 13, fontWeight: 700, color: i <= statusIdx ? "white" : "#94a3b8",
                    }}>
                      {i < statusIdx ? "✓" : i + 1}
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: 11, color: i <= statusIdx ? "#6366f1" : "#94a3b8", fontWeight: 600, whiteSpace: "nowrap" }}>{STATUS_LABELS[s]}</p>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, margin: "0 8px 16px", background: i < statusIdx ? "#6366f1" : "#e2e8f0", borderRadius: 100 }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0" }}>
            <DeliveryMap order={order} agentLocation={agentLocation} />
          </div>

          <div style={{ background: "white", borderRadius: 16, padding: 20, border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ padding: "14px", background: "#f8fafc", borderRadius: 12 }}>
                <p style={{ margin: "0 0 5px", fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={11} /> Pickup From
                </p>
                <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{order.shopId?.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{order.shopId?.address}</p>
              </div>
              <div style={{ padding: "14px", background: "#f8fafc", borderRadius: 12 }}>
                <p style={{ margin: "0 0 5px", fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                  <Phone size={11} /> Customer
                </p>
                <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{order.customerId?.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{order.customerId?.phone}</p>
              </div>
            </div>

            <div style={{ padding: "14px", background: "#f8fafc", borderRadius: 12, marginBottom: 16 }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Delivery Address</p>
              <p style={{ margin: 0, fontSize: 14, color: "#0f172a" }}>{order.deliveryAddress}</p>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {order.items.map((it) => (
                <span key={it.productId} style={{ padding: "5px 12px", borderRadius: 100, background: "#eef2ff", color: "#6366f1", fontSize: 12, fontWeight: 500 }}>
                  {it.name} ×{it.qty}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>₹{order.totalAmount}</p>
              {next && (
                <button onClick={onUpdate} disabled={updating} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "12px 24px",
                  background: next === "delivered" ? "linear-gradient(135deg, #16a34a, #22c55e)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700,
                  cursor: updating ? "not-allowed" : "pointer", opacity: updating ? 0.7 : 1,
                  boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                }}>
                  <Package size={15} />
                  {updating ? "Updating..." : next === "picked" ? "Mark as Picked Up" : "Mark as Delivered"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
