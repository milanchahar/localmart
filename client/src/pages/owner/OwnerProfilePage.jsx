import { useEffect, useState } from "react";
import { MapPin, Clock, Tag, Save, Navigation } from "lucide-react";
import { getOwnerShop, updateOwnerShop } from "../../services/ownerService";
import Spinner from "../../components/Spinner";
import toast, { Toaster } from "react-hot-toast";

const CATEGORIES = ["Grocery", "Vegetables", "Dairy", "Bakery", "Pharmacy", "General", "Other"];
const initial = { name: "", category: "", address: "", isOpen: true, open: "09:00", close: "21:00", lat: "", lng: "" };

export default function OwnerProfilePage() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOwnerShop();
        setForm({
          name: res.shop.name || "", category: res.shop.category || "",
          address: res.shop.address || "", isOpen: Boolean(res.shop.isOpen),
          open: res.shop.timings?.open || "09:00", close: res.shop.timings?.close || "21:00",
          lat: res.shop.coords?.lat || "", lng: res.shop.coords?.lng || "",
        });
      } catch (e) {
        toast.error(e.message);
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setForm((p) => ({ ...p, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) })); setLocating(false); toast.success("Location captured!"); },
      () => { setLocating(false); toast.error("Could not get location"); }
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateOwnerShop({
        name: form.name, category: form.category, address: form.address, isOpen: form.isOpen,
        timings: { open: form.open, close: form.close },
        coords: { lat: form.lat ? Number(form.lat) : undefined, lng: form.lng ? Number(form.lng) : undefined },
      });
      toast.success("Profile saved!");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <Spinner />;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1rem" }}>
      <Toaster position="top-center" />
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, color: "#0f172a" }}>Shop Profile</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>Update your shop details and location</p>
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
            <Tag size={16} color="#6366f1" /> Basic Details
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Shop Name</label>
              <input className="input-base" name="name" value={form.name} onChange={onChange} placeholder="e.g. Milan's Kirana Store" required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Category</label>
              <select className="input-base" name="category" value={form.category} onChange={onChange}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Full Address</label>
              <input className="input-base" name="address" value={form.address} onChange={onChange} placeholder="Street, locality, city, pincode" required />
            </div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={16} color="#6366f1" /> Hours & Status
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Opens</label>
              <input className="input-base" type="time" name="open" value={form.open} onChange={onChange} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Closes</label>
              <input className="input-base" type="time" name="close" value={form.close} onChange={onChange} />
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "12px 16px", borderRadius: 10, background: form.isOpen ? "#f0fdf4" : "#f8fafc", border: `1.5px solid ${form.isOpen ? "#bbf7d0" : "#e2e8f0"}`, transition: "all 0.2s" }}>
            <input type="checkbox" name="isOpen" checked={form.isOpen} onChange={onChange} style={{ width: 18, height: 18, accentColor: "#6366f1" }} />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: form.isOpen ? "#166534" : "#64748b" }}>
                {form.isOpen ? "Shop is Open" : "Shop is Closed"}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Toggle to open or close your shop now</p>
            </div>
          </label>
        </div>

        <div style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={16} color="#6366f1" /> Map Location
            </h2>
            <button type="button" onClick={useMyLocation} disabled={locating} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white",
              fontSize: 12.5, fontWeight: 600, color: "#6366f1", cursor: "pointer",
            }}>
              <Navigation size={13} /> {locating ? "Locating..." : "Use My Location"}
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Latitude</label>
              <input className="input-base" name="lat" value={form.lat} onChange={onChange} placeholder="e.g. 19.0760" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Longitude</label>
              <input className="input-base" name="lng" value={form.lng} onChange={onChange} placeholder="e.g. 72.8777" />
            </div>
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "#94a3b8" }}>
            Your shop will appear as a pin on the customer map when coordinates are set.
          </p>
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", fontSize: 15 }}>
          <Save size={16} /> {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
