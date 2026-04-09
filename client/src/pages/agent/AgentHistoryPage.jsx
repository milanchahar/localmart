import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDeliveryHistory } from "../../services/agentService";

export default function AgentHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDeliveryHistory();
        setOrders(res.orders);
      } catch (e) {
        setErr(e.message);
      }
    };
    load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Delivery History</h1>
        <Link to="/agent/home" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          Available Orders
        </Link>
      </div>

      {err ? <p className="mb-4 text-red-600">{err}</p> : null}

      <div className="space-y-3">
        {orders.length === 0 ? (
          <p className="text-slate-600">No deliveries completed yet.</p>
        ) : null}
        {orders.map((o) => (
          <div key={o._id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{o.shopId?.name || "Shop"}</p>
                <p className="text-sm text-slate-500">
                  Customer: {o.customerId?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Rs {o.totalAmount}</p>
                <p className="text-xs text-slate-500">
                  {new Date(o.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">{o.deliveryAddress}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
