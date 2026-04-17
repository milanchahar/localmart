import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Minus, Plus, MapPin, Banknote, CreditCard, Trash2, ArrowRight, Package } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { placeCustomerOrder } from "../../services/customerService";
import { createRazorpayOrder, verifyAndPlace } from "../../services/paymentService";
import { openRazorpayCheckout } from "../../utils/razorpay";
import { decodeToken, getToken } from "../../utils/auth";
import toast, { Toaster } from "react-hot-toast";

export default function CustomerCartPage() {
  const { cart, setQty, clearCart, total } = useCart();
  const navigate = useNavigate();
  const [paymentMode, setPaymentMode] = useState("cod");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const placeCod = async () => {
    await placeCustomerOrder({
      shopId: cart.shopId,
      items: cart.items.map(it => ({ productId: it.productId, qty: it.qty })),
      paymentMode: "cod",
      deliveryAddress: address.trim(),
    });
    clearCart();
    navigate("/orders");
  };

  const placeOnline = async () => {
    const { orderId, amount, currency } = await createRazorpayOrder(total);
    const payload = decodeToken(getToken());
    await new Promise((resolve, reject) => {
      openRazorpayCheckout({
        orderId, amount, currency,
        prefill: { name: payload?.name, email: payload?.email },
        onSuccess: async response => {
          try {
            await verifyAndPlace({
              ...response, shopId: cart.shopId,
              items: cart.items.map(it => ({ productId: it.productId, qty: it.qty })),
              deliveryAddress: address.trim(),
            });
            clearCart();
            navigate("/orders");
            resolve();
          } catch (e) { reject(e); }
        },
        onDismiss: () => reject(new Error("Payment cancelled")),
      });
    });
  };

  const onPlaceOrder = async () => {
    if (!cart.shopId || cart.items.length === 0) { toast.error("Cart is empty"); return; }
    if (!address.trim()) { toast.error("Enter a delivery address"); return; }
    setLoading(true);
    try {
      if (paymentMode === "online") await placeOnline();
      else await placeCod();
      toast.success("Order placed! 🎉");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const itemCount = cart.items.reduce((s, i) => s + i.qty, 0);

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: 12, fontFamily: "Inter,sans-serif", fontSize: 14 } }} />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 60%,#a855f7 100%)", padding: "32px 24px 72px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <ShoppingCart size={22} color="white" />
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>Your Cart</h1>
          </div>
          {cart.shopName && (
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>from <strong style={{ color: "white" }}>{cart.shopName}</strong></p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "-36px auto 0", padding: "0 1.5rem 3rem", position: "relative", zIndex: 2 }}>

        {cart.items.length === 0 ? (
          <div style={{ background: "white", borderRadius: 24, padding: "64px 24px", textAlign: "center", boxShadow: "var(--shadow)", border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🛒</div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Your cart is empty</p>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 28px" }}>Add items from a shop to get started</p>
            <button onClick={() => navigate("/home")} style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
              Browse Shops
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>

            {/* Items card */}
            <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow)", border: "1px solid #f1f5f9" }}>
              <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                  {itemCount} item{itemCount !== 1 ? "s" : ""}
                </p>
                <button onClick={clearCart} style={{ fontSize: 12.5, color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
                  Clear all
                </button>
              </div>

              {cart.items.map((it, idx) => (
                <div key={it.productId} style={{
                  padding: "16px 22px",
                  borderBottom: idx < cart.items.length - 1 ? "1px solid #fafafa" : "none",
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#eef2ff,#e0e7ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    🛒
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 3px", fontSize: 14.5, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</p>
                    <p style={{ margin: 0, fontSize: 13, color: "#6366f1", fontWeight: 600 }}>₹{it.price} each</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 0, border: "2px solid #e2e8f0", borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                    <button onClick={() => setQty(it.productId, Math.max(0, it.qty - 1))} style={{ width: 36, height: 36, border: "none", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                      {it.qty === 1 ? <Trash2 size={13} color="#ef4444" /> : <Minus size={13} />}
                    </button>
                    <span style={{ minWidth: 36, textAlign: "center", fontSize: 14, fontWeight: 800, color: "#0f172a", background: "#f8fafc" }}>{it.qty}</span>
                    <button onClick={() => setQty(it.productId, it.qty + 1)} style={{ width: 36, height: 36, border: "none", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                      <Plus size={13} />
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a", minWidth: 64, textAlign: "right" }}>₹{it.qty * it.price}</p>
                </div>
              ))}
            </div>

            {/* Delivery address */}
            <div style={{ background: "white", borderRadius: 20, padding: "20px 22px", boxShadow: "var(--shadow-sm)", border: "1px solid #f1f5f9" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                <MapPin size={14} /> Delivery Address
              </label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter your complete delivery address…"
                rows={2}
                style={{
                  width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "12px 14px",
                  fontSize: 14, color: "#0f172a", background: "#fafafa", resize: "none",
                  outline: "none", fontFamily: "Inter,sans-serif", boxSizing: "border-box",
                  transition: "all 0.15s",
                }}
                onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.background = "white"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#fafafa"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Payment method */}
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment Method</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { key: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when delivered" },
                  { key: "online", label: "Pay Online", icon: CreditCard, desc: "UPI · Cards · Wallets" },
                ].map(({ key, label, icon: Icon, desc }) => (
                  <button key={key} type="button" onClick={() => setPaymentMode(key)} style={{
                    padding: "16px 18px", borderRadius: 14, cursor: "pointer", textAlign: "left",
                    border: `2px solid ${paymentMode === key ? "#6366f1" : "#e2e8f0"}`,
                    background: paymentMode === key ? "#eef2ff" : "white",
                    boxShadow: paymentMode === key ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
                    transition: "all 0.15s",
                  }}>
                    <Icon size={22} color={paymentMode === key ? "#6366f1" : "#94a3b8"} style={{ marginBottom: 10 }} />
                    <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 800, color: paymentMode === key ? "#6366f1" : "#0f172a" }}>{label}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary + Place order */}
            <div style={{ background: "white", borderRadius: 20, padding: "20px 22px", boxShadow: "var(--shadow)", border: "1px solid #f1f5f9" }}>
              <p style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800, color: "#0f172a" }}>Order Summary</p>
              {[
                { label: `Subtotal (${itemCount} items)`, val: `₹${total}` },
                { label: "Delivery fee", val: "FREE", green: true },
                { label: "Taxes & charges", val: "Included" },
              ].map(({ label, val, green }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13.5, color: "#64748b" }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 600, color: green ? "#16a34a" : "#64748b" }}>{val}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, borderTop: "2px dashed #e2e8f0", marginTop: 6, marginBottom: 20 }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Total</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#6366f1" }}>₹{total}</span>
              </div>

              <button onClick={onPlaceOrder} disabled={loading} style={{
                width: "100%", padding: "16px", borderRadius: 14, border: "none",
                background: loading ? "#a5b4fc" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "white", fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 6px 20px rgba(99,102,241,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                transition: "all 0.2s", letterSpacing: "-0.01em",
              }}>
                {loading ? "Processing…" : (
                  <>
                    {paymentMode === "online" ? `Pay ₹${total} Online` : `Place Order · ₹${total}`}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
