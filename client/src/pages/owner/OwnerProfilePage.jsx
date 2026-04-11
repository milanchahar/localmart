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
  lat: "",
  lng: "",
};

export default function OwnerProfilePage() {
  const [form, setForm] = useState(initial);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

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
          lat: res.shop.coords?.lat || "",
          lng: res.shop.coords?.lng || "",
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

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      () => setLocating(false)
    );
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
        coords: {
          lat: form.lat ? Number(form.lat) : undefined,
          lng: form.lng ? Number(form.lng) : undefined,
        },
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
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            className="w-full rounded border px-3 py-2"
            placeholder="Shop Name"
            required
          />
          <input
            name="category"
            value={form.category}
            onChange={onChange}
            className="w-full rounded border px-3 py-2"
            placeholder="Category (e.g. Grocery)"
            required
          />
          <input
            name="address"
            value={form.address}
            onChange={onChange}
            className="w-full rounded border px-3 py-2"
            placeholder="Full address with pincode"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              name="open"
              value={form.open}
              onChange={onChange}
              className="rounded border px-3 py-2"
            />
            <input
              type="time"
              name="close"
              value={form.close}
              onChange={onChange}
              className="rounded border px-3 py-2"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isOpen" checked={form.isOpen} onChange={onChange} />
            Shop is open right now
          </label>

          <div className="border-t border-slate-100 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Shop location (for map)</p>
              <button
                type="button"
                onClick={useMyLocation}
                disabled={locating}
                className="rounded border border-slate-300 px-2 py-1 text-xs"
              >
                {locating ? "Locating..." : "Use my location"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="lat"
                value={form.lat}
                onChange={onChange}
                className="rounded border px-3 py-2 text-sm"
                placeholder="Latitude"
              />
              <input
                name="lng"
                value={form.lng}
                onChange={onChange}
                className="rounded border px-3 py-2 text-sm"
                placeholder="Longitude"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Enter coordinates or click "Use my location" to pin your shop on the map.
            </p>
          </div>
        </div>

        {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
        {msg ? <p className="mt-3 text-sm text-green-700">{msg}</p> : null}
        <button
          disabled={loading}
          className="mt-4 rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
