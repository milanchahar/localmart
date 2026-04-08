import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomerProfile, getShops } from "../../services/customerService";

export default function CustomerHomePage() {
  const [shops, setShops] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [pincode, setPincode] = useState("");
  const [err, setErr] = useState("");

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
      <h1 className="text-2xl font-semibold">Nearby Shops</h1>

      <form onSubmit={onSearch} className="mt-4 grid gap-2 md:grid-cols-4">
        <input className="rounded border px-3 py-2" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
        <input className="rounded border px-3 py-2" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input className="rounded border px-3 py-2" placeholder="Search by shop name" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="rounded bg-slate-900 px-3 py-2 text-white">Search</button>
      </form>

      {err ? <p className="mt-3 text-red-600">{err}</p> : null}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {shops.length === 0 ? <p className="text-slate-600">No shops found</p> : null}
        {shops.map((shop) => (
          <div key={shop._id} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-lg font-medium">{shop.name}</p>
            <p className="text-sm text-slate-600">{shop.category}</p>
            <p className="text-sm text-slate-600">{shop.address}</p>
            <p className="mt-2 text-sm">{shop.isOpen ? "Open" : "Closed"}</p>
            <Link to={`/shop/${shop._id}`} className="mt-3 inline-block rounded border border-slate-300 px-3 py-1 text-sm">
              View shop
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
