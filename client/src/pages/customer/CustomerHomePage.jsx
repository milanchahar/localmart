import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomerProfile, getShops } from "../../services/customerService";
import ShopsMap from "../../components/ShopsMap";

const CATEGORIES = ["Grocery", "Vegetables", "Dairy", "Bakery", "Pharmacy", "General"];

export default function CustomerHomePage() {
  const [shops, setShops] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [pincode, setPincode] = useState("");
  const [err, setErr] = useState("");
  const [showMap, setShowMap] = useState(false);

  const load = async (params = {}) => {
    try {
      const res = await getShops(params);
      setShops(res.shops);
    } catch (error) {
      setErr(error.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const me = await getCustomerProfile();
        const pin = me.user?.location?.pincode || "";
        setPincode(pin);
        await load({ pincode: pin });
      } catch (error) {
        setErr(error.message);
      }
    };
    init();
  }, []);

  const onSearch = async (e) => {
    e.preventDefault();
    await load({ pincode, category, q });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Nearby Shops</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMap((v) => !v)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {showMap ? "List view" : "Map view"}
          </button>
          <Link to="/orders" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            My Orders
          </Link>
        </div>
      </div>

      <form onSubmit={onSearch} className="mt-4 grid gap-2 md:grid-cols-4">
        <input
          className="rounded border px-3 py-2"
          placeholder="Pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
        />
        <select
          className="rounded border px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className="rounded border px-3 py-2"
          placeholder="Search by shop name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="rounded bg-slate-900 px-3 py-2 text-white">Search</button>
      </form>

      {err ? <p className="mt-3 text-red-600">{err}</p> : null}

      {showMap ? (
        <div className="mt-6">
          <ShopsMap shops={shops} />
          {shops.filter((s) => s.coords?.lat && s.coords?.lng).length === 0 ? (
            <p className="mt-2 text-center text-sm text-slate-500">
              No shops have map coordinates set yet.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {shops.length === 0 ? <p className="text-slate-600">No shops found</p> : null}
          {shops.map((shop) => (
            <div key={shop._id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-medium">{shop.name}</p>
                  <p className="text-sm text-slate-500">{shop.category}</p>
                  <p className="text-sm text-slate-500">{shop.address}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    shop.isOpen
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {shop.isOpen ? "Open" : "Closed"}
                </span>
              </div>
              {shop.rating > 0 ? (
                <p className="mt-1 text-xs text-slate-500">
                  {shop.rating.toFixed(1)} / 5
                </p>
              ) : null}
              <Link
                to={`/shop/${shop._id}`}
                className="mt-3 inline-block rounded border border-slate-300 px-3 py-1 text-sm"
              >
                View shop
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
