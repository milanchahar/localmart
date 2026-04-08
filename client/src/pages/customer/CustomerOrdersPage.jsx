import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomerOrders } from "../../services/customerService";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCustomerOrders();
        setOrders(res.orders);
      } catch (error) {
        setErr(error.message);
      }
    };
    load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <Link to="/home" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          Back to Home
        </Link>
      </div>

      {err ? <p className="mb-3 text-red-600">{err}</p> : null}

      <div className="space-y-3">
        {orders.length === 0 ? <p className="text-slate-600">No orders found</p> : null}
        {orders.map((o) => (
          <Link
            key={o._id}
            to={`/order/${o._id}`}
            className="block rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{o.shopId?.name || "Shop"}</p>
              <p className="text-sm uppercase text-slate-600">{o.status}</p>
            </div>
            <p className="mt-1 text-sm text-slate-600">{new Date(o.createdAt).toLocaleString()}</p>
            <p className="mt-1 text-sm font-medium">Total: Rs {o.totalAmount}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
