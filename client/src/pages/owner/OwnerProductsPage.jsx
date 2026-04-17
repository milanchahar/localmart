import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Package, Search } from "lucide-react";
import { addOwnerProduct, editOwnerProduct, getOwnerProducts, removeOwnerProduct } from "../../services/ownerService";
import Spinner from "../../components/Spinner";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = { name: "", category: "", price: "", unit: "piece", stock: "", image: "" };

function Modal({ form, editId, onChange, onSubmit, onClose, loading }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "white", borderRadius: 24, padding: "32px 32px 28px", width: "100%", maxWidth: 480, boxShadow: "var(--shadow-xl)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#0f172a" }}>{editId ? "Edit Product" : "Add New Product"}</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>{editId ? "Update product details" : "Fill in the details below"}</p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, border: "none", background: "#f1f5f9", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} color="#64748b" />
          </button>
        </div>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            ["name",     "Product Name",       "text",   true ],
            ["category", "Category",           "text",   true ],
            ["price",    "Price (₹)",          "number", true ],
            ["stock",    "Stock Quantity",      "number", true ],
            ["image",    "Image URL (optional)","text",   false],
          ].map(([field, label, type, required]) => (
            <div key={field}>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
              <input className="input-base" name={field} type={type} min={type === "number" ? "0" : undefined} placeholder={label} value={form[field]} onChange={onChange} required={required} />
            </div>
          ))}
          <div>
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Unit</label>
            <select className="input-base" name="unit" value={form.unit} onChange={onChange}>
              {["piece","kg","litre","packet","dozen"].map(u => <option key={u} value={u}>{u.charAt(0).toUpperCase()+u.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, padding: "13px", fontSize: 14 }}>
              {loading ? "Saving…" : editId ? "Update Product" : "Add Product"}
            </button>
            <button type="button" onClick={onClose} className="btn-outline" style={{ padding: "13px 20px" }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OwnerProductsPage() {
  const [items, setItems]         = useState([]);
  const [form, setForm]           = useState(emptyForm);
  const [editId, setEditId]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    try { const res = await getOwnerProducts(); setItems(res.products); }
    catch (e) { toast.error(e.message); }
    finally { setPageLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const reset    = () => { setForm(emptyForm); setEditId(""); setShowModal(false); };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editId) { await editOwnerProduct(editId, payload); toast.success("Product updated ✅"); }
      else        { await addOwnerProduct(payload);          toast.success("Product added 🎉"); }
      reset(); await load();
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const startEdit = item => {
    setEditId(item._id);
    setForm({ name: item.name, category: item.category, price: item.price.toString(), unit: item.unit, stock: item.stock.toString(), image: item.image || "" });
    setShowModal(true);
  };

  const onDelete = async id => {
    if (!confirm("Delete this product?")) return;
    try { await removeOwnerProduct(id); toast.success("Deleted"); await load(); }
    catch (e) { toast.error(e.message); }
  };

  const filtered = items.filter(it => it.name.toLowerCase().includes(q.toLowerCase()) || it.category.toLowerCase().includes(q.toLowerCase()));

  if (pageLoading) return <Spinner label="Loading products…" />;

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: 12, fontFamily: "Inter,sans-serif", fontSize: 14 } }} />
      {showModal && <Modal form={form} editId={editId} onChange={onChange} onSubmit={onSubmit} onClose={reset} loading={loading} />}

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#4f46e5 50%,#7c3aed 100%)", padding: "36px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ maxWidth: 1140, margin: "0 auto", position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Inventory</p>
            <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>Products</h1>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
              {items.length} product{items.length !== 1 ? "s" : ""} in your store
            </p>
          </div>
          <button onClick={() => { setEditId(""); setForm(emptyForm); setShowModal(true); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12, border: "none", background: "white", color: "#6366f1", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "-40px auto 0", padding: "0 1.5rem 3rem", position: "relative", zIndex: 2 }}>
        {/* Search */}
        <div style={{ background: "white", borderRadius: 16, padding: "14px 18px", boxShadow: "var(--shadow)", border: "1px solid #f1f5f9", marginBottom: 20, display: "flex", gap: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input className="input-base" style={{ paddingLeft: 40 }} placeholder="Search products…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px", background: "white", borderRadius: 24, border: "1px solid #f1f5f9", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📦</div>
            <p style={{ fontWeight: 800, fontSize: 17, color: "#0f172a", marginBottom: 6 }}>No products yet</p>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Add your first product to start selling</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
            {filtered.map(item => (
              <div key={item._id} style={{ background: "white", borderRadius: 18, overflow: "hidden", border: "1px solid #f1f5f9", boxShadow: "var(--shadow-sm)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ height: 4, background: item.isAvailable ? "linear-gradient(90deg,#6366f1,#8b5cf6)" : "#e2e8f0" }} />
                <div style={{ padding: "18px 20px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", background: "#eef2ff", padding: "3px 10px", borderRadius: 100 }}>{item.category}</span>
                      {item.stock <= 5 && <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", background: "#fef2f2", padding: "3px 10px", borderRadius: 100, border: "1px solid #fecaca" }}>Low stock</span>}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => startEdit(item)} style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Pencil size={13} color="#64748b" />
                      </button>
                      <button onClick={() => onDelete(item._id)} style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Trash2 size={13} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                  <h3 style={{ margin: "0 0 5px", fontSize: 16, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>{item.name}</h3>
                  <p style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 900, color: "#6366f1" }}>
                    ₹{item.price} <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 400 }}>/ {item.unit}</span>
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: item.stock <= 5 ? "#fef2f2" : "#fafafa", borderRadius: 10 }}>
                    <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Stock</span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: item.stock <= 5 ? "#dc2626" : "#0f172a" }}>{item.stock}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
