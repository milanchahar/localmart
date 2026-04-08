import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOwnerDashboard } from "../../services/ownerService";

export default function OwnerDashboardPage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOwnerDashboard();
        setData(res);
      } catch (error) {
        setErr(error.message);
      }
    };

    load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Owner Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/owner/products" className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white">
            Products
          </Link>
          <Link to="/owner/orders" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            Orders
          </Link>
          <Link to="/owner/profile" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            Shop Profile
          </Link>
        </div>
      </div>

      {err ? <p className="text-red-600">{err}</p> : null}

      {data ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Shop</p>
            <p className="mt-1 text-lg font-medium">{data.shop.name}</p>
            <p className="mt-2 text-sm">{data.shop.isOpen ? "Open" : "Closed"}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Total Products</p>
            <p className="mt-1 text-2xl font-semibold">{data.stats.totalProducts}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">Low Stock Items</p>
            <p className="mt-1 text-2xl font-semibold">{data.stats.lowStockCount}</p>
          </div>
        </div>
      ) : (
        <p className="text-slate-600">Loading dashboard...</p>
      )}
    </div>
  );
}
