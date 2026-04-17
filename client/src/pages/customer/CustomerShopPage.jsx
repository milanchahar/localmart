import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Plus, Minus, Star, MapPin, Clock, ArrowLeft, Package } from "lucide-react";
import { getShopById } from "../../services/customerService";
import { useCart } from "../../context/CartContext";
import toast, { Toaster } from "react-hot-toast";

const EMOJIS = { Grocery:"🛒", Dairy:"🥛", Vegetables:"🥦", Bakery:"🍞", Pharmacy:"💊", General:"📦" };

export default function CustomerShopPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, cart, setQty } = useCart();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (search = "") => {
    try {
      const res = await getShopById(id, search);
      setShop(res.shop);
      setProducts(res.products);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const getQtyInCart = (pid) => cart.items.find(i => i.productId === pid)?.qty || 0;
  const cartCount    = cart.items.reduce((s, i) => s + i.qty, 0);

  const onAdd = (product) => {
    addItem(shop, product);
    toast.success(`Added ${product.name}`, { icon:"🛒", duration:1500 });
  };

  return (
    <div style={{ background:"#f8fafc", minHeight:"100vh" }}>
      <Toaster position="top-center" toastOptions={{ style:{ borderRadius:12, fontFamily:"Inter,sans-serif", fontSize:14 } }} />

      {/* ── HERO HEADER ─────────────────────────────────────────────── */}
      {shop ? (
        <div style={{
          background:"linear-gradient(135deg,#4f46e5 0%,#7c3aed 60%,#a855f7 100%)",
          padding:"32px 24px 72px", position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:-50, right:-50, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
          <div style={{ position:"absolute", bottom:-30, left:"30%", width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />

          <div style={{ maxWidth:1140, margin:"0 auto", position:"relative", zIndex:1 }}>
            <button onClick={() => navigate(-1)} style={{
              display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.15)",
              border:"none", borderRadius:10, padding:"8px 14px", color:"white",
              fontSize:13, fontWeight:600, cursor:"pointer", marginBottom:24,
            }}>
              <ArrowLeft size={14} /> Back
            </button>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:18 }}>
                <div style={{
                  width:68, height:68, borderRadius:20, background:"rgba(255,255,255,0.18)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:34,
                  backdropFilter:"blur(8px)", border:"2px solid rgba(255,255,255,0.25)",
                }}>
                  {EMOJIS[shop.category] || "🏪"}
                </div>
                <div>
                  <h1 style={{ margin:"0 0 4px", fontSize:26, fontWeight:900, color:"white", letterSpacing:"-0.02em" }}>{shop.name}</h1>
                  <p style={{ margin:"0 0 8px", fontSize:13, color:"rgba(255,255,255,0.75)" }}>
                    {shop.category} · {shop.address}
                  </p>
                  <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                    <span style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:100, background: shop.isOpen ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.12)", color: shop.isOpen ? "#86efac" : "rgba(255,255,255,0.6)", fontSize:12.5, fontWeight:700, border:`1px solid ${shop.isOpen ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.2)"}` }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background: shop.isOpen ? "#4ade80" : "rgba(255,255,255,0.4)" }} />
                      {shop.isOpen ? "Open Now" : "Closed"}
                    </span>
                    {shop.rating > 0 && (
                      <span style={{ display:"flex", alignItems:"center", gap:5, color:"rgba(255,255,255,0.85)", fontSize:13, fontWeight:600 }}>
                        <Star size={13} fill="#fde68a" color="#fde68a" />
                        {Number(shop.rating).toFixed(1)} ({shop.totalRatings} reviews)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {cartCount > 0 && (
                <button onClick={() => navigate("/cart")} style={{
                  display:"flex", alignItems:"center", gap:10, padding:"14px 22px",
                  background:"white", border:"none", borderRadius:14, cursor:"pointer",
                  boxShadow:"0 8px 24px rgba(0,0,0,0.15)",
                }}>
                  <div style={{ position:"relative" }}>
                    <ShoppingCart size={20} color="#6366f1" />
                    <span style={{ position:"absolute", top:-8, right:-8, width:18, height:18, borderRadius:"50%", background:"#ef4444", color:"white", fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {cartCount}
                    </span>
                  </div>
                  <div style={{ textAlign:"left" }}>
                    <p style={{ margin:0, fontSize:11.5, color:"#94a3b8", fontWeight:500 }}>{cartCount} item{cartCount !== 1 ? "s" : ""}</p>
                    <p style={{ margin:0, fontSize:13.5, fontWeight:800, color:"#0f172a" }}>View Cart →</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="skeleton" style={{ height:200, borderRadius:0 }} />
      ) : null}

      <div style={{ maxWidth:1140, margin:"-32px auto 0", padding:"0 1.5rem 3rem", position:"relative", zIndex:2 }}>

        {/* ── SEARCH BAR ──────────────────────────────────────────────── */}
        <div style={{ background:"white", borderRadius:16, padding:"16px 20px", boxShadow:"var(--shadow)", border:"1px solid #f1f5f9", marginBottom:24, display:"flex", gap:12 }}>
          <div style={{ flex:1, position:"relative" }}>
            <Search size={16} style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
            <input
              className="input-base"
              style={{ paddingLeft:40 }}
              placeholder="Search products in this shop…"
              value={q}
              onChange={e => { setQ(e.target.value); if (!e.target.value) load(""); }}
              onKeyDown={e => e.key === "Enter" && load(q)}
            />
          </div>
          <button onClick={() => load(q)} className="btn-primary" style={{ padding:"10px 20px", fontSize:13.5 }}>
            Search
          </button>
        </div>

        {/* ── PRODUCTS ────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:14 }}>
            {[1,2,3,4,5,6].map(n => (
              <div key={n} style={{ background:"white", borderRadius:16, padding:18, border:"1px solid #f1f5f9" }}>
                <div className="skeleton" style={{ height:14, width:"70%", marginBottom:10 }} />
                <div className="skeleton" style={{ height:12, width:"45%", marginBottom:16 }} />
                <div className="skeleton" style={{ height:38, borderRadius:10 }} />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", background:"white", borderRadius:20, border:"1px solid #f1f5f9" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
            <p style={{ fontWeight:700, color:"#0f172a", marginBottom:4 }}>No products found</p>
            <p style={{ color:"#94a3b8", fontSize:13 }}>Try a different search term</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize:13, color:"#94a3b8", marginBottom:14, fontWeight:500 }}>
              {products.length} product{products.length !== 1 ? "s" : ""} available
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:14 }}>
              {products.map(p => {
                const qty = getQtyInCart(p._id);
                return (
                  <div key={p._id} style={{
                    background:"white", borderRadius:16, padding:18,
                    border:"1px solid #f1f5f9", boxShadow:"var(--shadow-sm)",
                    display:"flex", flexDirection:"column", justifyContent:"space-between",
                    transition:"all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow="var(--shadow)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow="var(--shadow-sm)"; e.currentTarget.style.transform="none"; }}
                  >
                    <div style={{ marginBottom:14 }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:8 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:"#6366f1", background:"#eef2ff", padding:"3px 10px", borderRadius:100 }}>
                          {p.category}
                        </span>
                        {p.stock <= 5 && (
                          <span style={{ fontSize:10.5, fontWeight:700, color:"#dc2626", background:"#fef2f2", padding:"3px 8px", borderRadius:100, border:"1px solid #fecaca" }}>
                            Low stock
                          </span>
                        )}
                      </div>
                      <h3 style={{ margin:"0 0 6px", fontSize:15, fontWeight:800, color:"#0f172a", lineHeight:1.3 }}>{p.name}</h3>
                      <p style={{ margin:0, fontSize:17, fontWeight:800, color:"#6366f1" }}>
                        ₹{p.price}
                        <span style={{ fontSize:12.5, color:"#94a3b8", fontWeight:400 }}> / {p.unit}</span>
                      </p>
                    </div>

                    {qty === 0 ? (
                      <button onClick={() => onAdd(p)} style={{
                        width:"100%", padding:"10px", borderRadius:10, border:"none",
                        background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                        color:"white", fontSize:13.5, fontWeight:700, cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                        boxShadow:"0 3px 10px rgba(99,102,241,0.3)", transition:"all 0.15s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow="0 6px 20px rgba(99,102,241,0.45)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow="0 3px 10px rgba(99,102,241,0.3)"}
                      >
                        <Plus size={15} /> Add to Cart
                      </button>
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", gap:0, border:"2px solid #6366f1", borderRadius:10, overflow:"hidden", height:42 }}>
                        <button onClick={() => setQty(p._id, qty - 1)} style={{ flex:1, height:"100%", border:"none", background:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#6366f1" }}>
                          <Minus size={15} />
                        </button>
                        <span style={{ minWidth:40, textAlign:"center", fontSize:15, fontWeight:800, color:"#6366f1", background:"#eef2ff" }}>{qty}</span>
                        <button onClick={() => onAdd(p)} style={{ flex:1, height:"100%", border:"none", background:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#6366f1" }}>
                          <Plus size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── FLOATING CART BAR ───────────────────────────────────────── */}
      {cartCount > 0 && (
        <div style={{
          position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
          zIndex:200, display:"flex",
        }}>
          <button onClick={() => navigate("/cart")} style={{
            display:"flex", alignItems:"center", gap:14, padding:"15px 28px",
            background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
            border:"none", borderRadius:16, cursor:"pointer",
            boxShadow:"0 8px 30px rgba(99,102,241,0.45)",
            color:"white", fontFamily:"Inter,sans-serif",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <ShoppingCart size={18} />
              <span style={{ fontSize:13.5, fontWeight:600 }}>{cartCount} items</span>
            </div>
            <div style={{ width:1, height:20, background:"rgba(255,255,255,0.3)" }} />
            <span style={{ fontSize:14, fontWeight:800 }}>View Cart →</span>
          </button>
        </div>
      )}
    </div>
  );
}
