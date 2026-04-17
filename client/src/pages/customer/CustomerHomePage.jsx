import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Star, ChevronRight, Map, List, Zap } from "lucide-react";
import { getShops } from "../../services/customerService";
import ShopsMap from "../../components/ShopsMap";
import toast, { Toaster } from "react-hot-toast";

const CATEGORIES = [
  { key: "All",       label: "All Shops",   emoji: "🏪", grad: "linear-gradient(135deg,#eef2ff,#e0e7ff)" },
  { key: "Grocery",   label: "Grocery",     emoji: "🛒", grad: "linear-gradient(135deg,#fef9c3,#fde68a)" },
  { key: "Vegetables",label: "Vegetables",  emoji: "🥦", grad: "linear-gradient(135deg,#dcfce7,#bbf7d0)" },
  { key: "Dairy",     label: "Dairy",       emoji: "🥛", grad: "linear-gradient(135deg,#e0f2fe,#bae6fd)" },
  { key: "Bakery",    label: "Bakery",      emoji: "🍞", grad: "linear-gradient(135deg,#fce7f3,#fbcfe8)" },
  { key: "Pharmacy",  label: "Pharmacy",    emoji: "💊", grad: "linear-gradient(135deg,#fef3c7,#fde68a)" },
  { key: "General",   label: "General",     emoji: "📦", grad: "linear-gradient(135deg,#f3e8ff,#e9d5ff)" },
];

const CITY_SHORTCUTS = [
  { label: "Mumbai",    pincode: "400058" },
  { label: "Delhi",     pincode: "110005" },
  { label: "Bangalore", pincode: "560034" },
  { label: "Pune",      pincode: "411038" },
  { label: "Chennai",   pincode: "600040" },
];

const SHOP_EMOJIS = { Grocery:"🛒", Dairy:"🥛", Vegetables:"🥦", Bakery:"🍞", Pharmacy:"💊", General:"📦", default:"🏪" };

function ShopCard({ shop }) {
  const emoji = SHOP_EMOJIS[shop.category] || SHOP_EMOJIS.default;
  const catColors = {
    Grocery:    { bg:"#fefce8", ring:"#fde68a", label:"#854d0e" },
    Dairy:      { bg:"#e0f2fe", ring:"#bae6fd", label:"#0369a1" },
    Vegetables: { bg:"#f0fdf4", ring:"#bbf7d0", label:"#166534" },
    Bakery:     { bg:"#fdf2f8", ring:"#fbcfe8", label:"#9d174d" },
    Pharmacy:   { bg:"#fffbeb", ring:"#fde68a", label:"#92400e" },
    General:    { bg:"#faf5ff", ring:"#e9d5ff", label:"#6b21a8" },
  };
  const c = catColors[shop.category] || { bg:"#eef2ff", ring:"#c7d2fe", label:"#4338ca" };

  return (
    <Link to={`/shop/${shop._id}`} style={{ textDecoration:"none", display:"block" }}>
      <div
        className="hover-lift"
        style={{
          background:"white", borderRadius:20, overflow:"hidden",
          border:"1px solid #f1f5f9", boxShadow:"var(--shadow-sm)",
          cursor:"pointer",
        }}
      >
        {/* Top accent strip */}
        <div style={{ height:4, background: shop.isOpen
          ? "linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa)"
          : "linear-gradient(90deg,#e2e8f0,#cbd5e1)" }} />

        <div style={{ padding:"18px 20px 20px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
            <div style={{
              width:52, height:52, borderRadius:16, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:26,
              background:`linear-gradient(135deg,${c.bg},white)`,
              border:`2px solid ${c.ring}`,
              boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
            }}>
              {emoji}
            </div>
            <span style={{
              display:"inline-flex", alignItems:"center", gap:5,
              padding:"4px 11px", borderRadius:100, fontSize:11.5, fontWeight:700,
              background: shop.isOpen ? "#f0fdf4" : "#f8fafc",
              color: shop.isOpen ? "#15803d" : "#94a3b8",
              border:`1.5px solid ${shop.isOpen ? "#bbf7d0" : "#e2e8f0"}`,
            }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background: shop.isOpen ? "#22c55e" : "#cbd5e1", display:"inline-block" }} />
              {shop.isOpen ? "Open" : "Closed"}
            </span>
          </div>

          <h3 style={{ margin:"0 0 5px", fontSize:16, fontWeight:800, color:"#0f172a", letterSpacing:"-0.01em", lineHeight:1.3 }}>
            {shop.name}
          </h3>

          <span style={{
            display:"inline-block", padding:"3px 10px", borderRadius:100,
            background:c.bg, color:c.label, border:`1px solid ${c.ring}`,
            fontSize:11.5, fontWeight:600, marginBottom:10,
          }}>
            {shop.category}
          </span>

          <p style={{ margin:"0 0 14px", fontSize:12.5, color:"#94a3b8", display:"flex", alignItems:"center", gap:5, lineHeight:1.4 }}>
            <MapPin size={12} style={{ flexShrink:0 }} />
            <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{shop.address}</span>
          </p>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            {shop.rating > 0 ? (
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <Star size={13} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{Number(shop.rating).toFixed(1)}</span>
                <span style={{ fontSize:12, color:"#94a3b8" }}>({shop.totalRatings})</span>
              </div>
            ) : (
              <span style={{ fontSize:12, color:"#94a3b8" }}>No reviews yet</span>
            )}
            <div style={{
              display:"flex", alignItems:"center", gap:4, fontSize:12.5, fontWeight:600,
              color:"#6366f1",
            }}>
              Visit <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CustomerHomePage() {
  const [shops, setShops] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  const load = async (params = {}) => {
    setLoading(true);
    try {
      const res = await getShops(params);
      setShops(res.shops);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSearch = async (e) => {
    e.preventDefault();
    await load({ pincode, category: category === "All" ? "" : category, q });
  };

  const onCategory = async (cat) => {
    setCategory(cat);
    await load({ pincode, category: cat === "All" ? "" : cat, q });
  };

  const onCity = async (p) => {
    setPincode(p);
    await load({ pincode: p, category: category === "All" ? "" : category, q });
  };

  const openCount = shops.filter(s => s.isOpen).length;

  return (
    <div style={{ background:"#f8fafc", minHeight:"100vh" }}>
      <Toaster position="top-center" toastOptions={{ style:{ borderRadius:12, fontFamily:"Inter, sans-serif", fontSize:14 } }} />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div style={{
        background:"linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)",
        padding:"48px 24px 80px",
        position:"relative", overflow:"hidden",
      }}>
        {/* decorative blobs */}
        <div style={{ position:"absolute", top:-60, right:-60, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
        <div style={{ position:"absolute", bottom:-40, left:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ position:"absolute", top:30, left:"40%", width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />

        <div style={{ maxWidth:1140, margin:"0 auto", position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <Zap size={16} fill="#fde68a" color="#fde68a" />
            <span style={{ color:"#fde68a", fontSize:13, fontWeight:600, letterSpacing:"0.04em" }}>HYPERLOCAL DELIVERY</span>
          </div>
          <h1 style={{ margin:"0 0 8px", fontSize:"clamp(28px,4vw,42px)", fontWeight:900, color:"white", letterSpacing:"-0.03em", lineHeight:1.1 }}>
            Fresh groceries,<br />at your doorstep
          </h1>
          <p style={{ margin:"0 0 28px", fontSize:15, color:"rgba(255,255,255,0.75)", maxWidth:460 }}>
            Shop from 20+ local kirana stores across India. Fresh, fast, and affordable.
          </p>

          {/* Search bar */}
          <form onSubmit={onSearch} style={{ display:"flex", gap:10, maxWidth:640 }}>
            <div style={{ flex:1, position:"relative" }}>
              <Search size={17} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }} />
              <input
                style={{
                  width:"100%", paddingLeft:44, paddingRight:16, paddingTop:14, paddingBottom:14,
                  borderRadius:12, border:"none", fontSize:14.5, outline:"none",
                  boxShadow:"0 4px 24px rgba(0,0,0,0.15)", background:"white",
                  color:"#0f172a", fontFamily:"Inter, sans-serif", boxSizing:"border-box",
                }}
                placeholder="Search shops, cities, categories…"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
            </div>
            <button type="submit" style={{
              padding:"14px 24px", background:"white", border:"none", borderRadius:12,
              fontSize:14, fontWeight:700, color:"#6366f1", cursor:"pointer",
              boxShadow:"0 4px 24px rgba(0,0,0,0.15)", whiteSpace:"nowrap",
              transition:"all 0.2s",
            }}>
              Search
            </button>
          </form>

          {/* City shortcuts */}
          <div style={{ display:"flex", gap:8, marginTop:16, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.55)", alignSelf:"center" }}>Quick:</span>
            {CITY_SHORTCUTS.map(({ label, pincode: p }) => (
              <button key={p} onClick={() => onCity(p)} type="button" style={{
                padding:"5px 14px", borderRadius:100,
                background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)",
                color:"white", fontSize:12.5, fontWeight:500, cursor:"pointer",
                transition:"all 0.15s",
              }}
                onMouseEnter={e => e.target.style.background="rgba(255,255,255,0.25)"}
                onMouseLeave={e => e.target.style.background="rgba(255,255,255,0.15)"}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1140, margin:"-36px auto 0", padding:"0 1.5rem 3rem", position:"relative", zIndex:2 }}>

        {/* ── CATEGORY GRID ───────────────────────────────────────────── */}
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:10, marginBottom:28,
        }}
          className="cat-grid"
        >
          {CATEGORIES.map(cat => (
            <button key={cat.key} type="button" onClick={() => onCategory(cat.key)} style={{
              padding:"16px 8px 14px", borderRadius:16, border:"2px solid",
              borderColor: category === cat.key ? "#6366f1" : "transparent",
              background: category === cat.key ? "white" : "white",
              boxShadow: category === cat.key ? "0 0 0 3px rgba(99,102,241,0.15), var(--shadow)" : "var(--shadow-sm)",
              display:"flex", flexDirection:"column", alignItems:"center", gap:8,
              cursor:"pointer", transition:"all 0.2s",
            }}
              onMouseEnter={e => { if (category !== cat.key) { e.currentTarget.style.boxShadow="var(--shadow)"; e.currentTarget.style.transform="translateY(-2px)"; } }}
              onMouseLeave={e => { if (category !== cat.key) { e.currentTarget.style.boxShadow="var(--shadow-sm)"; e.currentTarget.style.transform="none"; } }}
            >
              <div style={{
                width:44, height:44, borderRadius:14, background:cat.grad,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
              }}>
                {cat.emoji}
              </div>
              <span style={{ fontSize:11.5, fontWeight:600, color: category===cat.key ? "#6366f1" : "#475569", textAlign:"center", lineHeight:1.2 }}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── TOOLBAR ─────────────────────────────────────────────────── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <div>
            <p style={{ margin:0, fontSize:20, fontWeight:800, color:"#0f172a", letterSpacing:"-0.01em" }}>
              {category === "All" ? "All Shops" : category + " Stores"}
            </p>
            {!loading && (
              <p style={{ margin:0, fontSize:13, color:"#64748b" }}>
                {shops.length} shop{shops.length !== 1 ? "s" : ""} found
                {openCount > 0 ? ` · ${openCount} open now` : ""}
              </p>
            )}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {/* Pincode filter */}
            <div style={{ position:"relative" }}>
              <MapPin size={15} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} />
              <input
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && load({ pincode, category: category==="All"?"":category, q })}
                placeholder="Filter by pincode"
                style={{
                  paddingLeft:32, paddingRight:12, paddingTop:9, paddingBottom:9,
                  borderRadius:10, border:"1.5px solid #e2e8f0", background:"white",
                  fontSize:13, color:"#0f172a", outline:"none", width:160,
                  fontFamily:"Inter, sans-serif",
                }}
                onFocus={e => e.target.style.borderColor="#6366f1"}
                onBlur={e => e.target.style.borderColor="#e2e8f0"}
              />
            </div>

            <button onClick={() => setShowMap(v => !v)} style={{
              display:"flex", alignItems:"center", gap:7, padding:"9px 16px",
              borderRadius:10, border:"1.5px solid",
              borderColor: showMap ? "#6366f1" : "#e2e8f0",
              background: showMap ? "#eef2ff" : "white",
              color: showMap ? "#6366f1" : "#475569",
              fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s",
            }}>
              {showMap ? <List size={15} /> : <Map size={15} />}
              {showMap ? "List" : "Map"}
            </button>
          </div>
        </div>

        {/* ── CONTENT ─────────────────────────────────────────────────── */}
        {showMap ? (
          <div style={{ borderRadius:20, overflow:"hidden", border:"1px solid #e2e8f0", boxShadow:"var(--shadow)" }}>
            <ShopsMap shops={shops} />
          </div>
        ) : loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
            {[1,2,3,4,5,6].map(n => (
              <div key={n} style={{ background:"white", borderRadius:20, overflow:"hidden", border:"1px solid #f1f5f9" }}>
                <div className="skeleton" style={{ height:4, width:"100%", borderRadius:0 }} />
                <div style={{ padding:"18px 20px 20px" }}>
                  <div style={{ display:"flex", gap:12, marginBottom:14 }}>
                    <div className="skeleton" style={{ width:52, height:52, borderRadius:16, flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div className="skeleton" style={{ height:16, width:"65%", marginBottom:8 }} />
                      <div className="skeleton" style={{ height:12, width:"40%" }} />
                    </div>
                  </div>
                  <div className="skeleton" style={{ height:13, width:"80%", marginBottom:10 }} />
                  <div className="skeleton" style={{ height:13, width:"55%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div style={{
            textAlign:"center", padding:"72px 24px", background:"white",
            borderRadius:24, border:"1px solid #f1f5f9", boxShadow:"var(--shadow-sm)",
          }}>
            <div style={{
              width:72, height:72, borderRadius:22, background:"linear-gradient(135deg,#eef2ff,#e0e7ff)",
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 18px", fontSize:34,
            }}>🔍</div>
            <p style={{ fontSize:18, fontWeight:800, color:"#0f172a", margin:"0 0 8px" }}>No shops found</p>
            <p style={{ fontSize:14, color:"#94a3b8", margin:"0 0 24px" }}>
              Try a different city, pincode, or category
            </p>
            <button onClick={() => { setPincode(""); setCategory("All"); load({}); }} style={{
              padding:"11px 28px", borderRadius:12, border:"none",
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              color:"white", fontSize:14, fontWeight:700, cursor:"pointer",
              boxShadow:"0 4px 14px rgba(99,102,241,0.35)",
            }}>
              Show all shops
            </button>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
            {shops.map(shop => <ShopCard key={shop._id} shop={shop} />)}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width:768px) {
          .cat-grid { grid-template-columns: repeat(4,1fr) !important; }
        }
        @media (max-width:480px) {
          .cat-grid { grid-template-columns: repeat(4,1fr) !important; }
        }
      `}</style>
    </div>
  );
}
