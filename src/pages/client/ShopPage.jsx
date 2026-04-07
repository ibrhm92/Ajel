// src/pages/client/ShopPage.jsx
import { useState } from "react";
import { useProducts, useCategories } from "../../hooks/useProducts";
import { useCartContext } from "../../context/CartContext.jsx";
import ProductCard from "../../components/ProductCard";

const SORT_OPTIONS = [
  { value: "newest",   label: "الأحدث" },
  { value: "price_asc",  label: "السعر: الأقل" },
  { value: "price_desc", label: "السعر: الأعلى" },
  { value: "offers",   label: "العروض أولاً" },
];

export default function ShopPage() {
  const { products, loading } = useProducts(true);
  const categories = useCategories();
  const { addToCart } = useCartContext();

  const [search, setSearch]     = useState("");
  const [cat, setCat]           = useState("all");
  const [sort, setSort]         = useState("newest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  function go(path) { window.location.pathname = path; }

  let filtered = products.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat    = cat === "all" || p.category === cat;
    const matchMin    = !priceMin || (p.discountPrice || p.price) >= Number(priceMin);
    const matchMax    = !priceMax || (p.discountPrice || p.price) <= Number(priceMax);
    return matchSearch && matchCat && matchMin && matchMax;
  });

  filtered = [...filtered].sort((a, b) => {
    const pa = a.discountPrice || a.price;
    const pb = b.discountPrice || b.price;
    if (sort === "price_asc")  return pa - pb;
    if (sort === "price_desc") return pb - pa;
    if (sort === "offers")     return (b.discountPrice ? 1 : 0) - (a.discountPrice ? 1 : 0);
    return 0; // newest - Firestore بيرتبهم بالتاريخ
  });

  return (
    <div>
      <h1 style={s.title}>🛍️ جميع المنتجات</h1>

      {/* فلاتر */}
      <div style={s.filterBox}>
        <input style={s.searchInput}
          placeholder="🔍 ابحث عن منتج..."
          value={search} onChange={(e) => setSearch(e.target.value)} />

        <select style={s.select} value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">كل الفئات</option>
          {categories.map((c) => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
        </select>

        <select style={s.select} value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div style={s.priceRange}>
          <input style={{ ...s.select, width: 100 }} type="number"
            placeholder="من" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
          <span style={{ color: "#7a8a9a" }}>—</span>
          <input style={{ ...s.select, width: 100 }} type="number"
            placeholder="إلى" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
        </div>

        {(search || cat !== "all" || priceMin || priceMax) && (
          <button style={s.clearBtn} onClick={() => { setSearch(""); setCat("all"); setPriceMin(""); setPriceMax(""); }}>
            ✕ مسح الفلاتر
          </button>
        )}
      </div>

      {/* نتائج */}
      <div style={s.resultsBar}>
        <span style={s.resultsCount}>{filtered.length} منتج</span>
      </div>

      {loading ? (
        <div style={s.center}>⏳ جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🔍</div>
          <div style={s.emptyText}>مفيش منتجات بالفلاتر دي</div>
          <button style={s.emptyBtn} onClick={() => { setSearch(""); setCat("all"); }}>شوف الكل</button>
        </div>
      ) : (
        <div style={s.grid}>
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p}
              onAddToCart={() => addToCart(p)}
              onClick={() => go(`/product/${p.id}`)}
              showBadge={p.discountPrice ? null : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const TEXT = "#e8dcc8"; const MUTED = "#7a8a9a"; const GOLD = "#c9a84c";
const INPUT_BG = "#111c2a"; const DARK = "#0f1923";

const s = {
  title: { margin: "0 0 20px", fontSize: 22, color: TEXT },
  filterBox: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16, background: "#1a2535", borderRadius: 14, padding: 16, border: "1px solid #2a3a4a" },
  searchInput: { flex: 2, minWidth: 200, background: INPUT_BG, border: "1.5px solid #2a3a4a", borderRadius: 8, color: TEXT, padding: "10px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" },
  select: { flex: 1, minWidth: 120, background: INPUT_BG, border: "1.5px solid #2a3a4a", borderRadius: 8, color: TEXT, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none" },
  priceRange: { display: "flex", alignItems: "center", gap: 8 },
  clearBtn: { background: "#3a1515", color: "#ff8888", border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  resultsBar: { marginBottom: 16 },
  resultsCount: { color: MUTED, fontSize: 13 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 },
  center: { textAlign: "center", padding: 60, color: MUTED },
  empty: { textAlign: "center", padding: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: MUTED, fontSize: 16, marginBottom: 16 },
  emptyBtn: { background: `linear-gradient(135deg,${GOLD},#a07830)`, color: DARK, border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 },
};
