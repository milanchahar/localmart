import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomerOrders } from "../../services/customerService";
import Spinner from "../../components/Spinner";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  picked: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCustomerOrders();
        setOrders(res.orders);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">My Orders</h1>

      {err ? <p className="mb-3 text-red-600">{err}</p> : null}

      {orders.length === 0 && !err ? (
        <div className="rounded-lg border border-slate-200 bg-white py-16 text-center">
          <p className="text-slate-500">No orders yet.</p>
          <Link to="/home" className="mt-3 inline-block text-sm text-slate-700 underline">
            Browse shops
          </Link>
        </div>
      ) : null}

      <div className="space-y-3">
        {orders.map((o) => (
          <Link
            key={o._id}
            to={`/order/${o._id}`}
            className="block rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{o.shopId?.name || "Shop"}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  STATUS_COLORS[o.status] || "bg-slate-100 text-slate-600"
                }`}
              >
                {o.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {new Date(o.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="mt-1 text-sm font-medium">Rs {o.totalAmount}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
