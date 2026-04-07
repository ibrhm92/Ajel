// src/pages/client/ProductPage.jsx
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useCartContext } from "../../context/CartContext";
import { calcInstallment } from "../../hooks/useCart";

export default function ProductPage({ productId }) {
  const { addToCart } = useCartContext();
  const [product, setProduct] = useState(null);
  const [loading, setLoading]  = useState(true);
  const [imgIdx, setImgIdx]    = useState(0);
  const [added, setAdded]      = useState(false);

  // حاسبة القسط
  const price = product?.discountPrice || product?.price || 0;
  const [downPayment, setDownPayment] = useState("");
  const [months, setMonths]           = useState(12);
  const [interest, setInterest]       = useState(0);
  const monthly = downPayment !== "" && Number(downPayment) < price
    ? calcInstallment({ price, downPayment: Number(downPayment), months, interestRate: interest })
    : null;

  useEffect(() => {
    if (!productId) return;
    getDoc(doc(db, "products", productId)).then((snap) => {
      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
  }, [productId]);

  function go(path) { window.location.pathname = path; }

  function handleAdd() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) return <div style={s.center}>⏳ جاري التحميل...</div>;
  if (!product) return <div style={s.center}>المنتج مش موجود</div>;

  const hasDiscount = !!product.discountPrice;
  const discountPct = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;
  const outOfStock  = product.stock === 0;

  return (
    <div>
      {/* Breadcrumb */}
      <div style={s.breadcrumb}>
        <button style={s.breadBtn} onClick={() => go("/")}>الرئيسية</button>
        <span style={s.breadSep}>›</span>
        <button style={s.breadBtn} onClick={() => go("/shop")}>المنتجات</button>
        <span style={s.breadSep}>›</span>
        <span style={s.breadCurrent}>{product.name}</span>
      </div>

      <div style={s.layout}>
        {/* الصور */}
        <div style={s.imgSection}>
          <div style={s.mainImgWrap}>
            {product.images?.[imgIdx]?.url ? (
              <img src={product.images[imgIdx].url} alt={product.name} style={s.mainImg} />
            ) : (
              <div style={s.noImg}>📷</div>
            )}
            {hasDiscount && <span style={s.discountBadge}>-{discountPct}%</span>}
          </div>
          {product.images?.length > 1 && (
            <div style={s.thumbRow}>
              {product.images.map((img, i) => (
                <img key={i} src={img.url} alt="" style={{ ...s.thumb, ...(imgIdx === i ? s.thumbActive : {}) }}
                  onClick={() => setImgIdx(i)} />
              ))}
            </div>
          )}
        </div>

        {/* التفاصيل */}
        <div style={s.details}>
          <div style={s.category}>{product.category}</div>
          <h1 style={s.name}>{product.name}</h1>

          {/* السعر */}
          <div style={s.priceBox}>
            <span style={s.price}>{price?.toLocaleString()} جنيه</span>
            {hasDiscount && <span style={s.oldPrice}>{product.price?.toLocaleString()} جنيه</span>}
          </div>

          {/* المخزون */}
          <div style={{ ...s.stockStatus, color: outOfStock ? "#ff6b6b" : product.stock <= product.minStock ? "#ffa94d" : "#69db7c" }}>
            {outOfStock ? "🔴 نفد المخزون" : product.stock <= product.minStock ? `🟡 كمية محدودة (${product.stock} قطعة)` : "🟢 متوفر"}
          </div>

          {/* الوصف */}
          {product.description && <p style={s.desc}>{product.description}</p>}

          {/* زرار السلة */}
          <button style={{ ...s.addBtn, ...(outOfStock ? s.addBtnOut : added ? s.addBtnDone : {}) }}
            onClick={handleAdd} disabled={outOfStock}>
            {outOfStock ? "نفد المخزون" : added ? "✅ تمت الإضافة للسلة" : "🛒 أضف للسلة"}
          </button>
          <button style={s.cartBtn} onClick={() => go("/cart")}>
            عرض السلة
          </button>

          {/* حاسبة القسط */}
          <div style={s.calcBox}>
            <h3 style={s.calcTitle}>💳 احسب القسط</h3>
            <div style={s.calcGrid}>
              <div style={s.calcField}>
                <label style={s.calcLabel}>المقدم (جنيه)</label>
                <input style={s.calcInput} type="number" min="0" max={price}
                  value={downPayment} onChange={(e) => setDownPayment(e.target.value)}
                  placeholder="0" />
              </div>
              <div style={s.calcField}>
                <label style={s.calcLabel}>عدد الأشهر</label>
                <select style={s.calcInput} value={months} onChange={(e) => setMonths(Number(e.target.value))}>
                  {[3, 6, 9, 12, 18, 24, 36].map((m) => (
                    <option key={m} value={m}>{m} شهر</option>
                  ))}
                </select>
              </div>
              <div style={s.calcField}>
                <label style={s.calcLabel}>نسبة الفائدة %</label>
                <input style={s.calcInput} type="number" min="0"
                  value={interest} onChange={(e) => setInterest(Number(e.target.value))}
                  placeholder="0" />
              </div>
            </div>

            {monthly !== null && (
              <div style={s.calcResult}>
                <div style={s.calcRow}>
                  <span>السعر الكلي</span>
                  <span style={s.calcVal}>{price?.toLocaleString()} ج</span>
                </div>
                <div style={s.calcRow}>
                  <span>المقدم</span>
                  <span style={s.calcVal}>{Number(downPayment).toLocaleString()} ج</span>
                </div>
                <div style={s.calcRow}>
                  <span>المتبقي</span>
                  <span style={s.calcVal}>{(price - Number(downPayment)).toLocaleString()} ج</span>
                </div>
                <div style={{ ...s.calcRow, ...s.calcTotal }}>
                  <span>القسط الشهري</span>
                  <span style={s.calcMonthly}>{monthly?.toLocaleString()} ج/شهر</span>
                </div>
                <button style={s.installBtn} onClick={() => go("/cart")}>
                  اطلب بالتقسيط 💳
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const GOLD = "#c9a84c"; const DARK = "#0f1923"; const CARD = "#1a2535";
const TEXT = "#e8dcc8"; const MUTED = "#7a8a9a"; const INPUT_BG = "#111c2a";

const s = {
  center: { textAlign: "center", padding: 60, color: MUTED, fontFamily: "'Cairo',sans-serif" },
  breadcrumb: { display: "flex", alignItems: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" },
  breadBtn: { background: "none", border: "none", color: MUTED, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  breadSep: { color: MUTED },
  breadCurrent: { color: TEXT, fontSize: 13 },
  layout: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, "@media(max-width:640px)": { gridTemplateColumns: "1fr" } },
  imgSection: {},
  mainImgWrap: { position: "relative", background: INPUT_BG, borderRadius: 16, overflow: "hidden", height: 320, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  mainImg: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: { fontSize: 64, color: MUTED },
  discountBadge: { position: "absolute", top: 12, right: 12, background: "#c0392b", color: "white", borderRadius: 8, padding: "6px 12px", fontSize: 14, fontWeight: 700 },
  thumbRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  thumb: { width: 64, height: 64, borderRadius: 8, objectFit: "cover", cursor: "pointer", border: "2px solid transparent", opacity: 0.7 },
  thumbActive: { border: `2px solid ${GOLD}`, opacity: 1 },
  details: { display: "flex", flexDirection: "column", gap: 14 },
  category: { color: GOLD, fontSize: 13, fontWeight: 600 },
  name: { margin: 0, fontSize: 24, fontWeight: 700, color: TEXT, lineHeight: 1.3 },
  priceBox: { display: "flex", alignItems: "baseline", gap: 12 },
  price: { fontSize: 28, fontWeight: 700, color: GOLD },
  oldPrice: { fontSize: 16, color: MUTED, textDecoration: "line-through" },
  stockStatus: { fontSize: 14, fontWeight: 600 },
  desc: { color: MUTED, fontSize: 14, lineHeight: 1.8, margin: 0 },
  addBtn: { width: "100%", background: `linear-gradient(135deg,${GOLD},#a07830)`, color: DARK, border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" },
  addBtnOut: { background: "#2a2a2a", color: MUTED, cursor: "not-allowed" },
  addBtnDone: { background: "#1a3a1a", color: "#69db7c" },
  cartBtn: { width: "100%", background: "transparent", color: TEXT, border: "1.5px solid #2a3a4a", borderRadius: 10, padding: "12px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  calcBox: { background: CARD, borderRadius: 14, padding: 18, border: "1px solid #2a3a4a" },
  calcTitle: { margin: "0 0 14px", fontSize: 16, color: TEXT },
  calcGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 },
  calcField: {},
  calcLabel: { display: "block", fontSize: 12, color: MUTED, marginBottom: 5 },
  calcInput: { width: "100%", background: INPUT_BG, border: "1.5px solid #2a3a4a", borderRadius: 8, color: TEXT, padding: "9px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  calcResult: { background: INPUT_BG, borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 8 },
  calcRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: MUTED },
  calcVal: { color: TEXT, fontWeight: 600 },
  calcTotal: { borderTop: `1px solid #2a3a4a`, paddingTop: 10, marginTop: 4 },
  calcMonthly: { color: GOLD, fontSize: 20, fontWeight: 700 },
  installBtn: { width: "100%", background: "#1a3a2a", color: "#69db7c", border: "1px solid #2a6a4a", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 6 },
};
