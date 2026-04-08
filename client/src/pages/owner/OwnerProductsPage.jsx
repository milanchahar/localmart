import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addOwnerProduct,
  editOwnerProduct,
  getOwnerProducts,
  removeOwnerProduct,
} from "../../services/ownerService";

const emptyForm = {
  name: "",
  category: "",
  price: "",
  unit: "piece",
  stock: "",
  image: "",
};

export default function OwnerProductsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const res = await getOwnerProducts();
      setItems(res.products);
    } catch (error) {
      setErr(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const reset = () => {
    setForm(emptyForm);
    setEditId("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };

    try {
      if (editId) {
        await editOwnerProduct(editId, payload);
      } else {
        await addOwnerProduct(payload);
      }
      reset();
      await load();
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditId(item._id);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      unit: item.unit,
      stock: item.stock.toString(),
      image: item.image || "",
    });
  };

  const onDelete = async (id) => {
    try {
      await removeOwnerProduct(id);
      await load();
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Owner Products</h1>
        <Link to="/owner/dashboard" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          Back to Dashboard
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-medium">{editId ? "Edit Product" : "Add Product"}</h2>
          <div className="space-y-3">
            <input className="w-full rounded border px-3 py-2" name="name" placeholder="Name" value={form.name} onChange={onChange} required />
            <input className="w-full rounded border px-3 py-2" name="category" placeholder="Category" value={form.category} onChange={onChange} required />
            <input className="w-full rounded border px-3 py-2" name="price" type="number" min="0" placeholder="Price" value={form.price} onChange={onChange} required />
            <select className="w-full rounded border px-3 py-2" name="unit" value={form.unit} onChange={onChange}>
              <option value="kg">kg</option>
              <option value="piece">piece</option>
              <option value="litre">litre</option>
            </select>
            <input className="w-full rounded border px-3 py-2" name="stock" type="number" min="0" placeholder="Stock" value={form.stock} onChange={onChange} required />
            <input className="w-full rounded border px-3 py-2" name="image" placeholder="Image URL (optional)" value={form.image} onChange={onChange} />
          </div>
          {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
          <div className="mt-4 flex gap-2">
            <button disabled={loading} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
              {loading ? "Saving..." : editId ? "Update" : "Add"}
            </button>
            {editId ? (
              <button type="button" onClick={reset} className="rounded border px-3 py-2 text-sm">
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-medium">Product List</h2>
          <div className="space-y-2">
            {items.length === 0 ? <p className="text-slate-600">No products yet</p> : null}
            {items.map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded border border-slate-200 p-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-slate-600">
                    {item.category} | Rs {item.price} / {item.unit} | Stock {item.stock}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(item)} className="rounded border px-2 py-1 text-sm">
                    Edit
                  </button>
                  <button onClick={() => onDelete(item._id)} className="rounded border border-red-300 px-2 py-1 text-sm text-red-600">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
