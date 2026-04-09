import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCustomerOrderById } from "../../services/customerService";
import { connectSocket, disconnectSocket } from "../../utils/socket";

const STATUS_STEPS = ["pending", "accepted", "picked", "delivered"];

const STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  picked: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const ORDER_EVENTS = [
  "order_accepted",
  "order_cancelled",
  "order_agent_assigned",
  "order_picked",
  "order_delivered",
];

export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const res = await getCustomerOrderById(id);
      setOrder(res.order);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    load();

    const socket = connectSocket();
    socket.emit("join_order", id);

    const onUpdate = () => load();
    ORDER_EVENTS.forEach((ev) => socket.on(ev, onUpdate));

    return () => {
      ORDER_EVENTS.forEach((ev) => socket.off(ev, onUpdate));
      disconnectSocket();
    };
  }, [id]);

  const statusIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order Details</h1>
        <Link to="/orders" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          Back to Orders
        </Link>
      </div>

      {err ? <p className="text-red-600">{err}</p> : null}
      {!order && !err ? <p className="text-slate-600">Loading order...</p> : null}

      {order ? (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <p className="font-medium">{order.shopId?.name || "Shop"}</p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                order.status === "delivered"
                  ? "bg-green-100 text-green-700"
                  : order.status === "cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>

          {order.status !== "cancelled" ? (
            <div className="mb-5 flex items-center gap-2">
              {STATUS_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        i <= statusIndex ? "bg-slate-900" : "bg-slate-200"
                      }`}
                    />
                    <span className="text-[10px] text-slate-500">{STATUS_LABELS[s]}</span>
                  </div>
                  {i < STATUS_STEPS.length - 1 ? (
                    <div
                      className={`mb-3 h-px w-8 ${
                        i < statusIndex ? "bg-slate-900" : "bg-slate-200"
                      }`}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          <div className="space-y-1 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-800">Placed:</span>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>
            <p>
              <span className="font-medium text-slate-800">Deliver to:</span>{" "}
              {order.deliveryAddress}
            </p>
            <p>
              <span className="font-medium text-slate-800">Payment:</span>{" "}
              {order.paymentMode.toUpperCase()}
            </p>
          </div>

          <div className="mt-4 space-y-1 border-t border-slate-100 pt-4 text-sm">
            {order.items.map((it) => (
              <div key={it.productId} className="flex justify-between">
                <span>
                  {it.name} × {it.qty}
                </span>
                <span>Rs {it.qty * it.price}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold">
              <span>Total</span>
              <span>Rs {order.totalAmount}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
