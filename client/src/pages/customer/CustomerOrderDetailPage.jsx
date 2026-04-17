import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, Phone, Package, Star, CheckCircle2, Clock, CreditCard } from "lucide-react";
import { getCustomerOrderById } from "../../services/customerService";
import { submitReview } from "../../services/paymentService";
import { connectSocket, disconnectSocket } from "../../utils/socket";
import Spinner from "../../components/Spinner";
import toast, { Toaster } from "react-hot-toast";

const STEPS = ["pending", "accepted", "picked", "delivered"];
const STEP_LABEL = { pending: "Order Placed", accepted: "Accepted", picked: "Out for Delivery", delivered: "Delivered" };
const STEP_EMOJI = { pending: "📋", accepted: "✅", picked: "🛵", delivered: "🎉" };
const STATUS_STYLE = {
  pending:   { bg:"#fffbeb", color:"#d97706", border:"#fde68a" },
  accepted:  { bg:"#eff6ff", color:"#2563eb", border:"#bfdbfe" },
  picked:    { bg:"#f5f3ff", color:"#7c3aed", border:"#ddd6fe" },
  delivered: { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0" },
  cancelled: { bg:"#fef2f2", color:"#dc2626", border:"#fecaca" },
};
const ORDER_EVENTS = ["order_accepted","order_cancelled","order_agent_assigned","order_picked","order_delivered"];

function StarPicker({ value, onChange }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
          onClick={() => onChange(n)}
          style={{ width: 40, height: 40, border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
        >
          <Star size={32} fill={(hov || value) >= n ? "#f59e0b" : "none"} color={(hov || value) >= n ? "#f59e0b" : "#e2e8f0"} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ orderId, onDone }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async e => {
    e.preventDefault();
    if (!rating) { toast.error("Please give a rating"); return; }
    setLoading(true);
    try {
      await submitReview({ orderId, rating, comment });
      toast.success("Review submitted! Thanks 🙏");
      onDone();
    } catch (e) {
      toast.error(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ marginTop: 20, padding: "22px", background: "linear-gradient(135deg,#fafafa,#f0fdf4)", borderRadius: 16, border: "1.5px solid #bbf7d0" }}>
      <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Rate your experience</p>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>How was this order? Your feedback helps local shops improve.</p>
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <StarPicker value={rating} onChange={setRating} />
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Add a comment (optional)…"
          rows={2}
          style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontFamily: "Inter,sans-serif", resize: "none", outline: "none" }}
          onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
          onBlur={e  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
        />
        <button type="submit" disabled={loading} style={{
          alignSelf: "flex-start", padding: "11px 24px", borderRadius: 10, border: "none",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white",
          fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 4px 12px rgba(99,102,241,0.3)", opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Submitting…" : "Submit Review"}
        </button>
      </form>
    </div>
  );
}

export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder]   = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await getCustomerOrderById(id);
      setOrder(res.order);
      setReview(res.review);
    } catch (e) {
      toast.error(e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const socket = connectSocket();
    socket.emit("join_order", id);
    const onUpdate = () => load();
    ORDER_EVENTS.forEach(ev => socket.on(ev, onUpdate));
    return () => { ORDER_EVENTS.forEach(ev => socket.off(ev, onUpdate)); disconnectSocket(); };
  }, [id]);

  if (loading) return <Spinner label="Loading order…" />;

  const statusIdx = order ? STEPS.indexOf(order.status) : -1;
  const s = STATUS_STYLE[order?.status] || STATUS_STYLE.pending;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: 12, fontFamily: "Inter,sans-serif", fontSize: 14 } }} />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 60%,#a855f7 100%)", padding: "32px 24px 72px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <Package size={22} color="white" />
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>Order Details</h1>
          </div>
          {order && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={13} />
                {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
              </span>
              <span style={{ padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                {order.status?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "-36px auto 0", padding: "0 1.5rem 3rem", position: "relative", zIndex: 2 }}>
        {order && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Progress tracker */}
            {order.status !== "cancelled" && (
              <div style={{ background: "white", borderRadius: 20, padding: "22px 24px", boxShadow: "var(--shadow)", border: "1px solid #f1f5f9" }}>
                <p style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Order Progress</p>
                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  {STEPS.map((step, i) => {
                    const done    = i <= statusIdx;
                    const current = i === statusIdx;
                    return (
                      <div key={step} style={{ display: "flex", alignItems: "flex-start", flex: i < STEPS.length - 1 ? 1 : "none" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: "50%",
                            background: done ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#f1f5f9",
                            border: `2px solid ${current ? "#6366f1" : done ? "#6366f1" : "#e2e8f0"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: done ? 16 : 14, boxShadow: current ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
                          }}>
                            {done ? STEP_EMOJI[step] : <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: 12 }}>{i + 1}</span>}
                          </div>
                          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: done ? "#6366f1" : "#94a3b8", textAlign: "center", lineHeight: 1.3, maxWidth: 64 }}>
                            {STEP_LABEL[step]}
                          </p>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div style={{ flex: 1, height: 3, marginTop: 19, background: i < statusIdx ? "linear-gradient(90deg,#6366f1,#8b5cf6)" : "#e2e8f0", borderRadius: 100 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shop + delivery info */}
            <div style={{ background: "white", borderRadius: 20, padding: "22px 24px", boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9" }}>
              <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Delivery Info</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ padding: "14px", background: "#fafafa", borderRadius: 12 }}>
                  <p style={{ margin: "0 0 5px", fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Shop</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{order.shopId?.name}</p>
                </div>
                <div style={{ padding: "14px", background: "#fafafa", borderRadius: 12 }}>
                  <p style={{ margin: "0 0 5px", fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={10} /> Deliver To
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: "#0f172a" }}>{order.deliveryAddress}</p>
                </div>
                <div style={{ padding: "14px", background: "#fafafa", borderRadius: 12 }}>
                  <p style={{ margin: "0 0 5px", fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 4 }}>
                    <CreditCard size={10} /> Payment
                  </p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: order.paymentStatus === "paid" ? "#16a34a" : "#d97706" }}>
                    {order.paymentMode?.toUpperCase()} · {order.paymentStatus}
                  </p>
                </div>
                <div style={{ padding: "14px", background: "#fafafa", borderRadius: 12 }}>
                  <p style={{ margin: "0 0 5px", fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Total</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#6366f1" }}>₹{order.totalAmount}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9" }}>
              <div style={{ padding: "16px 22px", borderBottom: "1px solid #fafafa" }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Items Ordered</p>
              </div>
              {order.items.map((it, idx) => (
                <div key={it.productId} style={{ padding: "14px 22px", borderBottom: idx < order.items.length - 1 ? "1px solid #fafafa" : "none", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🛒</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{it.name}</p>
                    <p style={{ margin: 0, fontSize: 12.5, color: "#94a3b8" }}>Qty: {it.qty} × ₹{it.price}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#0f172a" }}>₹{it.qty * it.price}</p>
                </div>
              ))}
              <div style={{ padding: "14px 22px", display: "flex", justifyContent: "space-between", background: "#fafafa", borderTop: "2px dashed #e2e8f0" }}>
                <span style={{ fontWeight: 700, color: "#64748b" }}>Total</span>
                <span style={{ fontSize: 17, fontWeight: 900, color: "#6366f1" }}>₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Review */}
            {order.status === "delivered" && !review && <ReviewForm orderId={id} onDone={load} />}
            {review && (
              <div style={{ background: "white", borderRadius: 20, padding: "22px 24px", boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <CheckCircle2 size={18} color="#16a34a" />
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Your Review</p>
                </div>
                <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} size={22} fill={review.rating >= n ? "#f59e0b" : "none"} color={review.rating >= n ? "#f59e0b" : "#e2e8f0"} strokeWidth={1.5} />
                  ))}
                </div>
                {review.comment && <p style={{ margin: 0, fontSize: 14, color: "#475569", fontStyle: "italic" }}>"{review.comment}"</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
