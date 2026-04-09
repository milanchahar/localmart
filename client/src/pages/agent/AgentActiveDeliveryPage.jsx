import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getActiveDelivery, updateDeliveryStatus } from "../../services/agentService";

const STATUS_STEPS = ["accepted", "picked", "delivered"];

export default function AgentActiveDeliveryPage() {
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await getActiveDelivery();
      setOrder(res.order);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const nextStatus = () => {
    if (!order) return null;
    const idx = STATUS_STEPS.indexOf(order.status);
    if (idx === -1 || idx === STATUS_STEPS.length - 1) return null;
    return STATUS_STEPS[idx + 1];
  };

  const onUpdate = async () => {
    const next = nextStatus();
    if (!next) return;
    setLoading(true);
    try {
      await updateDeliveryStatus(order._id, next);
      if (next === "delivered") {
        navigate("/agent/history");
      } else {
        await load();
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const next = nextStatus();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Active Delivery</h1>
        <Link to="/agent/home" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          Available Orders
        </Link>
      </div>

      {err ? <p className="mb-4 text-red-600">{err}</p> : null}

      {!order && !err ? <p className="text-slate-600">Loading...</p> : null}

      {!order && !err === false && !err ? (
        <p className="text-slate-600">No active delivery. Go accept one.</p>
      ) : null}

      {order === null && !err ? null : !order ? (
        <p className="text-slate-600">No active delivery. Go accept one.</p>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    order.status === s
                      ? "bg-slate-900 text-white"
                      : STATUS_STEPS.indexOf(order.status) > i
                      ? "bg-slate-200 text-slate-600"
                      : "border border-slate-200 text-slate-400"
                  }`}
                >
                  {s}
                </span>
                {i < STATUS_STEPS.length - 1 ? (
                  <span className="text-slate-300">→</span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-800">Shop:</span>{" "}
              {order.shopId?.name} — {order.shopId?.address}
            </p>
            <p>
              <span className="font-medium text-slate-800">Customer:</span>{" "}
              {order.customerId?.name} — {order.customerId?.phone}
            </p>
            <p>
              <span className="font-medium text-slate-800">Deliver to:</span>{" "}
              {order.deliveryAddress}
            </p>
            <p>
              <span className="font-medium text-slate-800">Amount:</span> Rs{" "}
              {order.totalAmount}
            </p>
          </div>

          <div className="mt-4 space-y-1 text-sm text-slate-600">
            <p className="font-medium text-slate-800">Items</p>
            {order.items.map((it) => (
              <p key={it.productId}>
                {it.name} × {it.qty}
              </p>
            ))}
          </div>

          {next ? (
            <button
              onClick={onUpdate}
              disabled={loading}
              className="mt-6 rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {loading ? "Updating..." : next === "picked" ? "Mark as Picked Up" : "Mark as Delivered"}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
