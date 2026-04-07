// src/pages/client/HomePage.jsx
import { useProducts } from "../../hooks/useProducts";
import { useCartContext } from "../../context/CartContext.jsx";
import ProductCard from "../../components/ProductCard";

export default function HomePage() {
  const { products } = useProducts(true);
  const { addToCart } = useCartContext();

  const featured = products.slice(0, 6);
  const offers = products.filter((p) => p.discountPrice);

  function go(path) { window.location.pathname = path; }

  return (
    <div>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.heroContent}>
          <h1 style={s.heroTitle}>أفضل الأجهزة<br /><span style={s.heroAccent}>بأفضل الأسعار</span></h1>
          <p style={s.heroSub}>موبايلات - شاشات - أجهزة كهربائية | كاش وتقسيط مريح</p>
          <div style={s.heroBtns}>
            <button style={s.heroBtnMain} onClick={() => go("/shop")}>تسوق الآن</button>
            <button style={s.heroBtnSec} onClick={() => go("/cart")}>🛒 السلة</button>
          </div>
        </div>
      </div>

      {/* العروض */}
      {offers.length > 0 && (
        <section style={s.section}>
          <div style={s.sectionHeader}>
            <h2 style={s.sectionTitle}>🔥 عروض خاصة</h2>
            <button style={s.seeAll} onClick={() => go("/shop")}>شوف الكل</button>
          </div>
          <div style={s.grid}>
            {offers.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={() => addToCart(p)}
                onClick={() => go(`/product/${p.id}`)} showBadge="عرض" />
            ))}
          </div>
        </section>
      )}

      {/* منتجات مميزة */}
      <section style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>📦 أحدث المنتجات</h2>
          <button style={s.seeAll} onClick={() => go("/shop")}>شوف الكل</button>
        </div>
        {featured.length === 0 ? (
          <div style={s.empty}>لا توجد منتجات متاحة حالياً</div>
        ) : (
          <div style={s.grid}>
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={() => addToCart(p)}
                onClick={() => go(`/product/${p.id}`)} />
            ))}
          </div>
        )}
      </section>

      {/* مميزات المحل */}
      <section style={s.features}>
        {[
          { icon: "💳", title: "تقسيط مريح", sub: "قسّط على 36 شهر بدون تعقيد" },
          { icon: "✅", title: "منتجات أصلية", sub: "ضمان على جميع الأجهزة" },
          { icon: "🚀", title: "أسعار تنافسية", sub: "أرخص سعر في المنطقة" },
          { icon: "📞", title: "خدمة عملاء", sub: "متاح 7 أيام في الأسبوع" },
        ].map((f) => (
          <div key={f.title} style={s.featureCard}>
            <div style={s.featureIcon}>{f.icon}</div>
            <div style={s.featureTitle}>{f.title}</div>
            <div style={s.featureSub}>{f.sub}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

const GOLD = "#c9a84c"; const DARK = "#0f1923";
const TEXT = "#e8dcc8"; const MUTED = "#7a8a9a"; const CARD = "#1a2535";

const s = {
  hero: { position: "relative", borderRadius: 20, overflow: "hidden", marginBottom: 40, minHeight: 280, display: "flex", alignItems: "center" },
  heroBg: { position: "absolute", inset: 0, background: `radial-gradient(ellipse at 70% 50%, #1a3a1a 0%, #0f1923 60%), linear-gradient(135deg, #0f1923, #1a2535)` },
  heroContent: { position: "relative", zIndex: 1, padding: "40px 32px" },
  heroTitle: { margin: "0 0 12px", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, color: TEXT, lineHeight: 1.3 },
  heroAccent: { color: GOLD },
  heroSub: { color: MUTED, fontSize: 15, marginBottom: 24 },
  heroBtns: { display: "flex", gap: 12, flexWrap: "wrap" },
  heroBtnMain: { background: `linear-gradient(135deg,${GOLD},#a07830)`, color: DARK, border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  heroBtnSec: { background: "transparent", color: TEXT, border: "1.5px solid #2a3a4a", borderRadius: 10, padding: "12px 20px", fontSize: 15, cursor: "pointer", fontFamily: "inherit" },
  section: { marginBottom: 40 },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { margin: 0, fontSize: 20, color: TEXT, fontWeight: 700 },
  seeAll: { background: "none", border: "none", color: GOLD, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 },
  empty: { textAlign: "center", color: MUTED, padding: 40 },
  features: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 20 },
  featureCard: { background: CARD, borderRadius: 14, padding: "20px 16px", textAlign: "center", border: "1px solid #2a3a4a" },
  featureIcon: { fontSize: 32, marginBottom: 10 },
  featureTitle: { fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 6 },
  featureSub: { fontSize: 13, color: MUTED },
};
