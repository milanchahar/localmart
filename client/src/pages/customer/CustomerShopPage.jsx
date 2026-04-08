import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getShopById } from "../../services/customerService";
import { useCart } from "../../context/CartContext";

export default function CustomerShopPage() {
  const { id } = useParams();
  const { addItem, cart } = useCart();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  const load = async (search = "") => {
    try {
      const res = await getShopById(id, search);
      setShop(res.shop);
      setProducts(res.products);
    } catch (error) {
      setErr(error.message);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onSearch = async (e) => {
    e.preventDefault();
    await load(q);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{shop ? shop.name : "Shop"}</h1>
        <Link to="/cart" className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
          Cart ({cart.items.length})
        </Link>
      </div>

      <form onSubmit={onSearch} className="mb-4 flex gap-2">
        <input className="w-full rounded border px-3 py-2" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" />
        <button className="rounded border border-slate-300 px-3 py-2">Search</button>
      </form>

      {err ? <p className="text-red-600">{err}</p> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {products.length === 0 ? <p className="text-slate-600">No products found</p> : null}
        {products.map((p) => (
          <div key={p._id} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="font-medium">{p.name}</p>
            <p className="text-sm text-slate-600">
              {p.category} | Rs {p.price}/{p.unit}
            </p>
            <p className="text-sm text-slate-600">Stock {p.stock}</p>
            <button onClick={() => addItem(shop, p)} className="mt-3 rounded bg-slate-900 px-3 py-2 text-sm text-white">
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
