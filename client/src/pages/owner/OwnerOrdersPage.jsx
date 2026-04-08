import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOwnerOrders, updateOwnerOrderStatus } from "../../services/ownerService";

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const res = await getOwnerOrders();
      setOrders(res.orders);
    } catch (error) {
      setErr(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onStatus = async (id, status) => {
    try {
      await updateOwnerOrderStatus(id, status);
      await load();
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Incoming Orders</h1>
        <Link to="/owner/dashboard" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          Back to Dashboard
        </Link>
      </div>

      {err ? <p className="mb-3 text-red-600">{err}</p> : null}

      <div className="space-y-3">
        {orders.length === 0 ? <p className="text-slate-600">No orders yet</p> : null}
        {orders.map((o) => (
          <div key={o._id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{o.customerId?.name || "Customer"}</p>
              <p className="text-sm uppercase text-slate-600">{o.status}</p>
            </div>
            <p className="text-sm text-slate-600">Phone: {o.customerId?.phone || "-"}</p>
            <p className="text-sm text-slate-600">Address: {o.deliveryAddress}</p>
            <p className="mt-1 text-sm font-medium">Total: Rs {o.totalAmount}</p>
            <div className="mt-2 text-sm text-slate-600">
              {o.items.map((it) => (
                <p key={it.productId}>
                  {it.name} x {it.qty}
                </p>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => onStatus(o._id, "accepted")} className="rounded border px-2 py-1 text-sm">
                Accept
              </button>
              <button onClick={() => onStatus(o._id, "cancelled")} className="rounded border px-2 py-1 text-sm">
                Reject
              </button>
              <button onClick={() => onStatus(o._id, "picked")} className="rounded border px-2 py-1 text-sm">
                Mark Ready
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
