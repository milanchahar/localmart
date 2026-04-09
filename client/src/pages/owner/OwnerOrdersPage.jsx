import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getOwnerOrders, updateOwnerOrderStatus } from "../../services/ownerService";
import { connectSocket, disconnectSocket } from "../../utils/socket";

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");
  const shopIdRef = useRef(null);

  const load = async () => {
    try {
      const res = await getOwnerOrders();
      setOrders(res.orders);
      if (res.orders.length > 0 && !shopIdRef.current) {
        shopIdRef.current = res.orders[0].shopId;
      }
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    load();

    const socket = connectSocket();

    const onNewOrder = () => load();
    socket.on("new_order", onNewOrder);

    return () => {
      socket.off("new_order", onNewOrder);
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (shopIdRef.current) {
      const socket = connectSocket();
      socket.emit("join_shop", shopIdRef.current);
    }
  }, [orders]);

  const onStatus = async (id, status) => {
    try {
      await updateOwnerOrderStatus(id, status);
      await load();
    } catch (e) {
      setErr(e.message);
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
              <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium uppercase text-slate-700">
                {o.status}
              </span>
            </div>
            <p className="text-sm text-slate-500">Phone: {o.customerId?.phone || "-"}</p>
            <p className="text-sm text-slate-500">Address: {o.deliveryAddress}</p>
            <p className="mt-1 text-sm font-medium">Rs {o.totalAmount}</p>

            <div className="mt-2 space-y-0.5 text-sm text-slate-600">
              {o.items.map((it) => (
                <p key={it.productId}>
                  {it.name} × {it.qty}
                </p>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              {o.status === "pending" ? (
                <>
                  <button
                    onClick={() => onStatus(o._id, "accepted")}
                    className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onStatus(o._id, "cancelled")}
                    className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
                  >
                    Reject
                  </button>
                </>
              ) : null}
              {o.status === "accepted" ? (
                <button
                  onClick={() => onStatus(o._id, "picked")}
                  className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
                >
                  Mark Ready
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
