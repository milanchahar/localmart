import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { placeCustomerOrder } from "../../services/customerService";
import { createRazorpayOrder, verifyAndPlace } from "../../services/paymentService";
import { openRazorpayCheckout } from "../../utils/razorpay";
import { decodeToken, getToken } from "../../utils/auth";

export default function CustomerCartPage() {
  const { cart, setQty, clearCart, total } = useCart();
  const navigate = useNavigate();
  const [paymentMode, setPaymentMode] = useState("cod");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const validate = () => {
    if (!cart.shopId || cart.items.length === 0) return "Cart is empty";
    if (!deliveryAddress.trim()) return "Delivery address is required";
    return null;
  };

  const placeCod = async () => {
    await placeCustomerOrder({
      shopId: cart.shopId,
      items: cart.items.map((it) => ({ productId: it.productId, qty: it.qty })),
      paymentMode: "cod",
      deliveryAddress: deliveryAddress.trim(),
    });
    clearCart();
    navigate("/orders");
  };

  const placeOnline = async () => {
    const { orderId, amount, currency } = await createRazorpayOrder(total);
    const payload = decodeToken(getToken());

    await new Promise((resolve, reject) => {
      openRazorpayCheckout({
        orderId,
        amount,
        currency,
        prefill: { name: payload?.name, email: payload?.email },
        onSuccess: async (response) => {
          try {
            await verifyAndPlace({
              ...response,
              shopId: cart.shopId,
              items: cart.items.map((it) => ({ productId: it.productId, qty: it.qty })),
              deliveryAddress: deliveryAddress.trim(),
            });
            clearCart();
            navigate("/orders");
            resolve();
          } catch (e) {
            reject(e);
          }
        },
        onDismiss: () => reject(new Error("Payment cancelled")),
      });
    });
  };

  const onPlaceOrder = async () => {
    const validErr = validate();
    if (validErr) { setErr(validErr); return; }
    setErr("");
    setLoading(true);
    try {
      if (paymentMode === "online") {
        await placeOnline();
      } else {
        await placeCod();
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Your Cart</h1>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm text-slate-500">Shop</p>
          <p className="font-medium">{cart.shopName || "None selected"}</p>
        </div>

        <div className="mt-4 space-y-2">
          {cart.items.length === 0 ? (
            <p className="py-6 text-center text-slate-500">Your cart is empty</p>
          ) : null}
          {cart.items.map((it) => (
            <div
              key={it.productId}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
            >
              <div>
                <p className="font-medium">{it.name}</p>
                <p className="text-sm text-slate-500">Rs {it.price} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty(it.productId, Math.max(0, it.qty - 1))}
                  className="h-7 w-7 rounded border text-sm"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm">{it.qty}</span>
                <button
                  onClick={() => setQty(it.productId, it.qty + 1)}
                  className="h-7 w-7 rounded border text-sm"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
          <textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Delivery address"
            rows={2}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />

          <div className="grid grid-cols-2 gap-3">
            {["cod", "online"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPaymentMode(mode)}
                className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                  paymentMode === mode
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-400"
                }`}
              >
                {mode === "cod" ? "Cash on Delivery" : "Pay Online"}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>Rs {total}</span>
          </div>

          {err ? <p className="text-sm text-red-600">{err}</p> : null}

          <button
            onClick={onPlaceOrder}
            disabled={loading || cart.items.length === 0}
            className="w-full rounded-lg bg-slate-900 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading
              ? "Processing..."
              : paymentMode === "online"
              ? "Pay & Place Order"
              : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
