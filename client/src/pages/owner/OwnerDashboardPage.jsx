import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Package, Clock, AlertTriangle, IndianRupee, ShoppingBag, Star, ToggleLeft, ToggleRight, ArrowRight } from "lucide-react";
import { getOwnerDashboard, updateOwnerShop } from "../../services/ownerService";
import Spinner from "../../components/Spinner";
import toast, { Toaster } from "react-hot-toast";

function StatCard({ icon: Icon, label, value, sub, color, bg, border }) {
  return (
    <div style={{ background: "white", borderRadius: 18, padding: "20px 22px", border: `1px solid ${border || "#f1f5f9"}`, boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} color={color} />
        </div>
      </div>
      <p style={{ margin: "0 0 4px", fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
      <p style={{ margin: "0 0 4px", fontSize: 30, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{sub}</p>}
    </div>
  );
}

export default function OwnerDashboardPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const load = async () => {
    try {
      const res = await getOwnerDashboard();
      setData(res);
    } catch (e) {
      toast.error(e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleOpen = async () => {
    if (!data) return;
    setToggling(true);
    try {
      await updateOwnerShop({ isOpen: !data.shop.isOpen });
      await load();
      toast.success(data.shop.isOpen ? "Shop is now closed" : "Shop is open! 🎉");
    } catch (e) { toast.error(e.message); }
    finally { setToggling(false); }
  };

  if (loading) return <Spinner label="Loading dashboard…" />;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: 12, fontFamily: "Inter,sans-serif", fontSize: 14 } }} />

      {/* ── HERO HEADER ─────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#4f46e5 50%,#7c3aed 100%)", padding: "36px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -70, right: -70, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -30, left: "30%", width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        {data && (
          <div style={{ maxWidth: 1140, margin: "0 auto", position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Dashboard</p>
              <h1 style={{ margin: "0 0 8px", fontSize: "clamp(24px,3vw,36px)", fontWeight: 900, color: "white", letterSpacing: "-0.03em" }}>{data.shop.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {data.shop.rating > 0 ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#fde68a", fontSize: 14, fontWeight: 700 }}>
                    <Star size={14} fill="#fde68a" color="#fde68a" />
                    {Number(data.shop.rating).toFixed(1)} / 5
                  </span>
                ) : (
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>No ratings yet</span>
                )}
                <span style={{ padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                  background: data.shop.isOpen ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.1)",
                  color: data.shop.isOpen ? "#86efac" : "rgba(255,255,255,0.6)",
                  border: `1px solid ${data.shop.isOpen ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.2)"}`,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: data.shop.isOpen ? "#4ade80" : "rgba(255,255,255,0.4)" }} />
                  {data.shop.isOpen ? "Open" : "Closed"}
                </span>
              </div>
            </div>

            <button onClick={toggleOpen} disabled={toggling} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 22px",
              background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.2)",
              borderRadius: 16, cursor: "pointer", color: "white", backdropFilter: "blur(8px)",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
            >
              {data.shop.isOpen ? <ToggleRight size={30} color="#4ade80" /> : <ToggleLeft size={30} color="rgba(255,255,255,0.4)" />}
              <div style={{ textAlign: "left" }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>{data.shop.isOpen ? "Shop Open" : "Shop Closed"}</p>
                <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,0.6)" }}>Click to {data.shop.isOpen ? "close" : "open"}</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* ── STAT CARDS ──────────────────────────────────────────────── */}
      {data && (
        <div style={{ maxWidth: 1140, margin: "-44px auto 0", padding: "0 1.5rem 2rem", position: "relative", zIndex: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 14, marginBottom: 20 }}>
            <StatCard icon={ShoppingBag}   label="Today's Orders"  value={data.stats.todayOrders}           sub="Since midnight"          color="#6366f1" bg="#eef2ff" border="#e0e7ff" />
            <StatCard icon={IndianRupee}   label="Today's Revenue" value={`₹${data.stats.todayRevenue}`}    sub="Collected today"          color="#16a34a" bg="#f0fdf4" border="#bbf7d0" />
            <StatCard icon={Clock}         label="Pending Orders"  value={data.stats.pendingOrders}         sub="Needs your action"        color="#d97706" bg="#fffbeb" border="#fde68a" />
            <StatCard icon={Package}       label="Products"        value={data.stats.totalProducts}         sub={data.stats.lowStockCount > 0 ? `${data.stats.lowStockCount} low stock` : "All good"} color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" />
            <StatCard icon={TrendingUp}    label="Total Revenue"   value={`₹${data.stats.totalRevenue}`}    sub="All time"                 color="#0ea5e9" bg="#f0f9ff" border="#bae6fd" />
          </div>

          {/* Alerts */}
          {data.stats.pendingOrders > 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 22px", background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚡</div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#92400e" }}>
                    {data.stats.pendingOrders} pending order{data.stats.pendingOrders > 1 ? "s" : ""} waiting!
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: "#a16207" }}>Accept or reject to keep customers happy</p>
                </div>
              </div>
              <Link to="/owner/orders" style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, background: "#d97706", color: "white", fontSize: 13, fontWeight: 700 }}>
                View Orders <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 22px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 16 }}>
              <div style={{ fontSize: 28 }}>✅</div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#166534" }}>All caught up!</p>
                <p style={{ margin: 0, fontSize: 13, color: "#15803d" }}>No pending orders — great work!</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
