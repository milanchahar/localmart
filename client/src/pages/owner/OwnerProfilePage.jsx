import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOwnerShop, updateOwnerShop } from "../../services/ownerService";

const initial = {
  name: "",
  category: "",
  address: "",
  isOpen: true,
  open: "09:00",
  close: "21:00",
};

export default function OwnerProfilePage() {
  const [form, setForm] = useState(initial);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOwnerShop();
        setForm({
          name: res.shop.name || "",
          category: res.shop.category || "",
          address: res.shop.address || "",
          isOpen: Boolean(res.shop.isOpen),
          open: res.shop.timings?.open || "09:00",
          close: res.shop.timings?.close || "21:00",
        });
      } catch (error) {
        setErr(error.message);
      }
    };
    load();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      await updateOwnerShop({
        name: form.name,
        category: form.category,
        address: form.address,
        isOpen: form.isOpen,
        timings: { open: form.open, close: form.close },
      });
      setMsg("Profile updated");
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shop Profile</h1>
        <Link to="/owner/dashboard" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          Back to Dashboard
        </Link>
      </div>

      <form onSubmit={onSubmit} className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="space-y-3">
          <input name="name" value={form.name} onChange={onChange} className="w-full rounded border px-3 py-2" placeholder="Shop Name" required />
          <input name="category" value={form.category} onChange={onChange} className="w-full rounded border px-3 py-2" placeholder="Category" required />
          <input name="address" value={form.address} onChange={onChange} className="w-full rounded border px-3 py-2" placeholder="Address" required />
          <div className="grid grid-cols-2 gap-3">
            <input type="time" name="open" value={form.open} onChange={onChange} className="rounded border px-3 py-2" />
            <input type="time" name="close" value={form.close} onChange={onChange} className="rounded border px-3 py-2" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isOpen" checked={form.isOpen} onChange={onChange} />
            Shop is open
          </label>
        </div>
        {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
        {msg ? <p className="mt-3 text-sm text-green-700">{msg}</p> : null}
        <button disabled={loading} className="mt-4 rounded bg-slate-900 px-4 py-2 text-sm text-white">
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
