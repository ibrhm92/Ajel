// src/components/ProductCard.jsx
import { useState } from "react";

export default function ProductCard({ product, onAddToCart, onClick, showBadge }) {
  const [added, setAdded] = useState(false);

  const price = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice;
  const discountPct = hasDiscount
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;
  const outOfStock = product.stock === 0;

  function handleAdd(e) {
    e.stopPropagation();
    if (outOfStock) return;
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div style={s.card} onClick={onClick}>
      {/* صورة */}
      <div style={s.imgWrap}>
        {product.images?.[0]?.url ? (
          <img src={product.images[0].url} alt={product.name} style={s.img} />
        ) : (
          <div style={s.noImg}>📷</div>
        )}
        {/* شارات */}
        {outOfStock && <span style={{ ...s.badge, ...s.badgeOut }}>نفد</span>}
        {!outOfStock && hasDiscount && (
          <span style={{ ...s.badge, ...s.badgeSale }}>-{discountPct}%</span>
        )}
        {!outOfStock && showBadge && !hasDiscount && (
          <span style={{ ...s.badge, ...s.badgeNew }}>{showBadge}</span>
        )}
      </div>

      {/* بيانات */}
      <div style={s.body}>
        <div style={s.name}>{product.name}</div>
        {product.category && <div style={s.cat}>{product.category}</div>}

        {/* السعر */}
        <div style={s.priceRow}>
          <span style={s.price}>{price?.toLocaleString()} ج</span>
          {hasDiscount && (
            <span style={s.oldPrice}>{product.price?.toLocaleString()} ج</span>
          )}
        </div>

        {/* زرار */}
        <button
          style={{
            ...s.addBtn,
            ...(outOfStock ? s.addBtnOut : added ? s.addBtnDone : {}),
          }}
          onClick={handleAdd}
          disabled={outOfStock}
        >
          {outOfStock ? "نفد المخزون" : added ? "✅ تمت الإضافة" : "+ أضف للسلة"}
        </button>
      </div>
    </div>
  );
}

const GOLD = "#c9a84c"; const DARK = "#0f1923"; const CARD = "#1a2535";
const TEXT = "#e8dcc8"; const MUTED = "#7a8a9a"; const INPUT_BG = "#111c2a";

const s = {
  card: { background: CARD, borderRadius: 14, overflow: "hidden", border: "1px solid #2a3a4a", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s", display: "flex", flexDirection: "column" },
  imgWrap: { position: "relative", background: INPUT_BG, height: 170, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: { fontSize: 48, color: MUTED },
  badge: { position: "absolute", top: 8, right: 8, borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700 },
  badgeOut: { background: "#3a1515", color: "#ff6b6b" },
  badgeSale: { background: "#c0392b", color: "white" },
  badgeNew: { background: GOLD, color: DARK },
  body: { padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 },
  name: { fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.4 },
  cat: { fontSize: 12, color: MUTED },
  priceRow: { display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 },
  price: { fontSize: 17, fontWeight: 700, color: GOLD },
  oldPrice: { fontSize: 12, color: MUTED, textDecoration: "line-through" },
  addBtn: { marginTop: "auto", background: `linear-gradient(135deg,${GOLD},#a07830)`, color: DARK, border: "none", borderRadius: 8, padding: "9px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", width: "100%", transition: "all 0.2s" },
  addBtnOut: { background: "#2a2a2a", color: MUTED, cursor: "not-allowed" },
  addBtnDone: { background: "#1a3a1a", color: "#69db7c" },
};
