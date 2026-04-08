import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCustomerOrderById } from "../../services/customerService";

export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCustomerOrderById(id);
        setOrder(res.order);
      } catch (error) {
        setErr(error.message);
      }
    };
    load();
  }, [id]);

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
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">{order.shopId?.name || "Shop"}</p>
            <p className="text-sm uppercase text-slate-600">{order.status}</p>
          </div>
          <p className="mt-1 text-sm text-slate-600">{new Date(order.createdAt).toLocaleString()}</p>
          <p className="mt-2 text-sm text-slate-600">Delivery: {order.deliveryAddress}</p>
          <div className="mt-3 space-y-1 text-sm">
            {order.items.map((it) => (
              <p key={it.productId}>
                {it.name} x {it.qty} = Rs {it.qty * it.price}
              </p>
            ))}
          </div>
          <p className="mt-3 text-lg font-semibold">Total: Rs {order.totalAmount}</p>
        </div>
      ) : null}
    </div>
  );
}
