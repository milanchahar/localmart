import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { placeCustomerOrder } from "../../services/customerService";

export default function CustomerCartPage() {
  const { cart, setQty, clearCart, total } = useCart();
  const navigate = useNavigate();
  const [paymentMode, setPaymentMode] = useState("cod");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onPlaceOrder = async () => {
    setErr("");
    if (!cart.shopId || cart.items.length === 0) {
      setErr("Cart is empty");
      return;
    }
    if (!deliveryAddress.trim()) {
      setErr("Delivery address is required");
      return;
    }

    setLoading(true);
    try {
      await placeCustomerOrder({
        shopId: cart.shopId,
        items: cart.items.map((it) => ({ productId: it.productId, qty: it.qty })),
        paymentMode,
        deliveryAddress: deliveryAddress.trim(),
      });
      clearCart();
      navigate("/home", { replace: true });
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cart</h1>
        <Link to="/home" className="rounded border border-slate-300 px-3 py-2 text-sm">
          Continue shopping
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">Shop</p>
        <p className="font-medium">{cart.shopName || "No shop selected"}</p>

        <div className="mt-4 space-y-3">
          {cart.items.length === 0 ? <p className="text-slate-600">Your cart is empty</p> : null}
          {cart.items.map((it) => (
            <div key={it.productId} className="flex items-center justify-between rounded border border-slate-200 p-3">
              <div>
                <p className="font-medium">{it.name}</p>
                <p className="text-sm text-slate-600">Rs {it.price} each</p>
              </div>
              <input
                type="number"
                min="0"
                value={it.qty}
                onChange={(e) => setQty(it.productId, e.target.value)}
                className="w-20 rounded border px-2 py-1"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <input
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Delivery address"
            className="w-full rounded border px-3 py-2"
          />
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="w-full rounded border px-3 py-2"
          >
            <option value="cod">Cash on delivery</option>
            <option value="online">Online</option>
          </select>
          <p className="text-lg font-semibold">Total: Rs {total}</p>
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          <button
            onClick={onPlaceOrder}
            disabled={loading}
            className="rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-70"
          >
            {loading ? "Placing..." : "Place order"}
          </button>
        </div>
      </div>
    </div>
  );
}
