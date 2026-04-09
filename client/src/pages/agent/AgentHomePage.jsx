import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAvailableOrders, acceptDelivery } from "../../services/agentService";

export default function AgentHomePage() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");
  const [accepting, setAccepting] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await getAvailableOrders();
      setOrders(res.orders);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onAccept = async (id) => {
    setAccepting(id);
    try {
      await acceptDelivery(id);
      navigate("/agent/active");
    } catch (e) {
      setErr(e.message);
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Available Deliveries</h1>
        <div className="flex gap-2">
          <Link
            to="/agent/active"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            Active
          </Link>
          <Link
            to="/agent/history"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            History
          </Link>
        </div>
      </div>

      {err ? <p className="mb-4 text-red-600">{err}</p> : null}

      <div className="space-y-3">
        {orders.length === 0 ? (
          <p className="text-slate-600">No deliveries available right now.</p>
        ) : null}
        {orders.map((o) => (
          <div key={o._id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{o.shopId?.name || "Shop"}</p>
                <p className="text-sm text-slate-500">{o.shopId?.address}</p>
                <p className="mt-2 text-sm text-slate-600">
                  Customer: {o.customerId?.name} — {o.customerId?.phone}
                </p>
                <p className="text-sm text-slate-600">Deliver to: {o.deliveryAddress}</p>
                <p className="mt-1 text-sm font-medium">Rs {o.totalAmount}</p>
              </div>
              <button
                onClick={() => onAccept(o._id)}
                disabled={accepting === o._id}
                className="shrink-0 rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {accepting === o._id ? "Accepting..." : "Accept"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
