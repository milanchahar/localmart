import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCustomerOrderById } from "../../services/customerService";
import { submitReview } from "../../services/paymentService";
import { connectSocket, disconnectSocket } from "../../utils/socket";
import Spinner from "../../components/Spinner";

const STATUS_STEPS = ["pending", "accepted", "picked", "delivered"];

const STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  picked: "Out for Delivery",
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

function ReviewForm({ orderId, onDone }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setErr("Pick a rating"); return; }
    setLoading(true);
    try {
      await submitReview({ orderId, rating, comment });
      onDone();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <p className="mb-3 font-medium">Rate this order</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`h-9 w-9 rounded-full border text-sm font-medium transition-colors ${
                rating >= n
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-500 hover:border-slate-400"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional comment"
          rows={2}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
        {err ? <p className="text-sm text-red-600">{err}</p> : null}
        <button
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}

export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const res = await getCustomerOrderById(id);
      setOrder(res.order);
      setReview(res.review);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
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

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Order Details</h1>

      {err ? <p className="text-red-600">{err}</p> : null}

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
            <div className="mb-5 flex items-center gap-1 overflow-x-auto pb-1">
              {STATUS_STEPS.map((s, i) => (
                <div key={s} className="flex shrink-0 items-center gap-1">
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
                      className={`mb-3 h-px w-10 shrink-0 ${
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
              {order.paymentMode.toUpperCase()} —{" "}
              <span
                className={
                  order.paymentStatus === "paid" ? "text-green-600" : "text-slate-500"
                }
              >
                {order.paymentStatus}
              </span>
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

          {order.status === "delivered" && !review ? (
            <ReviewForm orderId={id} onDone={load} />
          ) : null}

          {review ? (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="mb-1 text-sm font-medium text-slate-700">Your review</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`h-6 w-6 rounded-full text-center text-xs leading-6 ${
                      review.rating >= n
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {n}
                  </div>
                ))}
              </div>
              {review.comment ? (
                <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
