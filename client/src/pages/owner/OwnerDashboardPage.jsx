import { useEffect, useState } from "react";
import { getOwnerDashboard, updateOwnerShop } from "../../services/ownerService";
import Spinner from "../../components/Spinner";

const StatCard = ({ label, value, sub }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    {sub ? <p className="mt-0.5 text-xs text-slate-400">{sub}</p> : null}
  </div>
);

export default function OwnerDashboardPage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [toggling, setToggling] = useState(false);

  const load = async () => {
    try {
      const res = await getOwnerDashboard();
      setData(res);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleOpen = async () => {
    if (!data) return;
    setToggling(true);
    try {
      const { updateOwnerShop } = await import("../../services/ownerService");
      await updateOwnerShop({ isOpen: !data.shop.isOpen });
      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setToggling(false);
    }
  };

  if (!data && !err) return <Spinner />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {err ? <p className="mb-4 text-red-600">{err}</p> : null}

      {data ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{data.shop.name}</h1>
              {data.shop.rating > 0 ? (
                <p className="text-sm text-slate-500">
                  {data.shop.rating} / 5 rating ({data.stats.totalRevenue ? `Rs ${data.stats.totalRevenue} total` : ""})
                </p>
              ) : null}
            </div>
            <button
              onClick={toggleOpen}
              disabled={toggling}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                data.shop.isOpen
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {toggling ? "..." : data.shop.isOpen ? "Open — click to close" : "Closed — click to open"}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Today's Orders"
              value={data.stats.todayOrders}
            />
            <StatCard
              label="Today's Revenue"
              value={`Rs ${data.stats.todayRevenue}`}
            />
            <StatCard
              label="Pending Orders"
              value={data.stats.pendingOrders}
              sub="Need your action"
            />
            <StatCard
              label="Total Products"
              value={data.stats.totalProducts}
              sub={`${data.stats.lowStockCount} low stock`}
            />
          </div>

          {data.stats.pendingOrders > 0 ? (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You have {data.stats.pendingOrders} pending order{data.stats.pendingOrders > 1 ? "s" : ""} waiting for your response.{" "}
              <a href="/owner/orders" className="font-medium underline">
                View orders
              </a>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
