// src/pages/admin/OffersPage.jsx
import { useState } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useOffers, applyDiscount, removeDiscount } from "../../hooks/useOffers";

export default function OffersPage() {
  const { products } = useProducts();
  const { offers, loading } = useOffers();
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({ productId: "", discountPercent: "", endDate: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const productsWithOffer    = products.filter((p) => p.discountPrice);
  const productsWithoutOffer = products.filter((p) => !p.discountPrice);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  const selectedProduct = products.find((p) => p.id === form.productId);
  const previewPrice = selectedProduct && form.discountPercent
    ? Math.round(selectedProduct.price * (1 - Number(form.discountPercent) / 100))
    : null;

  async function handleSave() {
    if (!form.productId || !form.discountPercent) { setError("اختر منتج وحط نسبة الخصم"); return; }
    if (Number(form.discountPercent) <= 0 || Number(form.discountPercent) >= 100) { setError("النسبة لازم تكون بين 1 و 99"); return; }
    setSaving(true); setError("");
    try {
      await applyDiscount(form.productId, selectedProduct.price, Number(form.discountPercent));
      setModal(false);
      setForm({ productId: "", discountPercent: "", endDate: "" });
    } catch (e) { setError(e.message); }
    setSaving(false);
  }

  async function handleRemove(productId) {
    await removeDiscount(productId);
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>🎯 العروض والتخفيضات</h2>
          <p style={s.sub}>{productsWithOffer.length} منتج عليه عرض</p>
        </div>
        <button style={s.addBtn} onClick={() => setModal(true)}>+ عرض جديد</button>
      </div>

      {/* المنتجات عليها عروض */}
      {productsWithOffer.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: 48 }}>🏷️</div>
          <div style={{ color: "#7a8a9a", marginTop: 12 }}>لا توجد عروض حالياً</div>
          <button style={s.addBtnSm} onClick={() => setModal(true)}>أضف أول عرض</button>
        </div>
      ) : (
        <div style={s.grid}>
          {productsWithOffer.map((p) => {
            const pct = Math.round((1 - p.discountPrice / p.price) * 100);
            return (
              <div key={p.id} style={s.offerCard}>
                {/* صورة */}
                <div style={s.imgWrap}>
                  {p.images?.[0]?.url
                    ? <img src={p.images[0].url} alt={p.name} style={s.img} />
                    : <div style={s.noImg}>📷</div>}
                  <span style={s.pctBadge}>-{pct}%</span>
                </div>
                <div style={s.cardBody}>
                  <div style={s.productName}>{p.name}</div>
                  <div style={s.priceRow}>
                    <span style={s.newPrice}>{p.discountPrice?.toLocaleString()} ج</span>
                    <span style={s.oldPrice}>{p.price?.toLocaleString()} ج</span>
                  </div>
                  <div style={s.saving}>توفير: {(p.price - p.discountPrice)?.toLocaleString()} جنيه</div>
                  <button style={s.removeBtn} onClick={() => handleRemove(p.id)}>
                    ✕ إلغاء العرض
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal إضافة عرض */}
      {modal && (
        <div style={s.overlay}>
          <div style={s.modalBox}>
            <div style={s.mHeader}>
              <span style={s.mTitle}>🏷️ عرض جديد</span>
              <button style={s.closeBtn} onClick={() => setModal(false)}>✕</button>
            </div>
            <div style={s.mBody}>

              <div style={s.field}>
                <label style={s.label}>اختر المنتج</label>
                <select style={s.input} value={form.productId} onChange={(e) => set("productId", e.target.value)}>
                  <option value="">— اختر منتج —</option>
                  {productsWithoutOffer.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.price?.toLocaleString()} ج)</option>
                  ))}
                </select>
              </div>

              <div style={s.field}>
                <label style={s.label}>نسبة الخصم %</label>
                <input style={s.input} type="number" min="1" max="99"
                  value={form.discountPercent} onChange={(e) => set("discountPercent", e.target.value)}
                  placeholder="مثال: 20" />
              </div>

              {/* معاينة السعر */}
              {previewPrice && (
                <div style={s.preview}>
                  <div style={s.previewRow}>
                    <span>السعر الأصلي</span>
                    <span style={{ textDecoration: "line-through", color: "#7a8a9a" }}>{selectedProduct.price?.toLocaleString()} ج</span>
                  </div>
                  <div style={s.previewRow}>
                    <span>السعر بعد الخصم</span>
                    <span style={{ color: "#c9a84c", fontWeight: 700, fontSize: 18 }}>{previewPrice?.toLocaleString()} ج</span>
                  </div>
                  <div style={s.previewRow}>
                    <span>التوفير</span>
                    <span style={{ color: "#69db7c" }}>{(selectedProduct.price - previewPrice)?.toLocaleString()} ج</span>
                  </div>
                </div>
              )}

              {error && <div style={s.error}>⚠️ {error}</div>}
            </div>
            <div style={s.mFooter}>
              <button style={s.cancelBtn} onClick={() => setModal(false)}>إلغاء</button>
              <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? "جاري الحفظ..." : "تطبيق العرض"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const GOLD = "#c9a84c"; const DARK = "#0f1923"; const CARD = "#1a2535";
const TEXT = "#e8dcc8"; const MUTED = "#7a8a9a"; const INPUT_BG = "#111c2a";

const s = {
  root: { padding: 24, fontFamily: "'Cairo','Tajawal',sans-serif", direction: "rtl", color: TEXT, minHeight: "100vh", background: DARK },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  title: { margin: 0, fontSize: 22 },
  sub: { margin: "4px 0 0", fontSize: 13, color: MUTED },
  addBtn: { background: `linear-gradient(135deg,${GOLD},#a07830)`, color: DARK, border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  addBtnSm: { background: `linear-gradient(135deg,${GOLD},#a07830)`, color: DARK, border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 14 },
  empty: { textAlign: "center", padding: "48px 20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 },
  offerCard: { background: CARD, borderRadius: 14, overflow: "hidden", border: "1px solid #2a3a4a" },
  imgWrap: { position: "relative", height: 160, background: INPUT_BG, display: "flex", alignItems: "center", justifyContent: "center" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: { fontSize: 40, color: MUTED },
  pctBadge: { position: "absolute", top: 8, right: 8, background: "#c0392b", color: "white", borderRadius: 8, padding: "5px 10px", fontSize: 13, fontWeight: 700 },
  cardBody: { padding: "14px 16px" },
  productName: { fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 8 },
  priceRow: { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 },
  newPrice: { fontSize: 18, fontWeight: 700, color: GOLD },
  oldPrice: { fontSize: 13, color: MUTED, textDecoration: "line-through" },
  saving: { fontSize: 12, color: "#69db7c", marginBottom: 12 },
  removeBtn: { width: "100%", background: "#3a1515", color: "#ff8888", border: "none", borderRadius: 8, padding: "8px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  overlay: { position: "fixed", inset: 0, background: "#000000aa", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 },
  modalBox: { background: CARD, borderRadius: 16, width: "100%", maxWidth: 440, border: "1px solid #2a3a4a" },
  mHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #2a3a4a" },
  mTitle: { color: TEXT, fontWeight: 700, fontSize: 16 },
  closeBtn: { background: "#3a1515", color: "#ff8888", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" },
  mBody: { padding: "16px 20px" },
  field: { marginBottom: 14 },
  label: { display: "block", fontSize: 12, color: MUTED, marginBottom: 6, fontWeight: 600 },
  input: { width: "100%", background: INPUT_BG, border: "1.5px solid #2a3a4a", borderRadius: 8, color: TEXT, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  preview: { background: INPUT_BG, borderRadius: 10, padding: 14, marginBottom: 10 },
  previewRow: { display: "flex", justifyContent: "space-between", fontSize: 14, color: TEXT, marginBottom: 8 },
  error: { background: "#3a1515", border: "1px solid #6a2020", borderRadius: 8, padding: "10px 14px", color: "#ff8888", fontSize: 13 },
  mFooter: { display: "flex", gap: 12, justifyContent: "flex-end", padding: "14px 20px", borderTop: "1px solid #2a3a4a" },
  cancelBtn: { background: INPUT_BG, border: "1px solid #2a3a4a", color: TEXT, borderRadius: 8, padding: "10px 18px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  saveBtn: { background: `linear-gradient(135deg,${GOLD},#a07830)`, color: DARK, border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
};
