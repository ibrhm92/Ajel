// src/components/ProductForm.jsx
import { useState } from "react";
import { addProduct, updateProduct, uploadImage, generateBarcode, addCategory } from "../hooks/useProducts";
import BarcodeScanner from "./BarcodeScanner";

export default function ProductForm({ product, categories, onClose, onSaved }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || "",
    category: product?.category || "",
    barcode: product?.barcode || "",
    price: product?.price || "",
    discountPrice: product?.discountPrice || "",
    stock: product?.stock ?? "",
    minStock: product?.minStock ?? 3,
    description: product?.description || "",
    isActive: product?.isActive ?? true,
  });
  const [images, setImages] = useState(product?.images || []);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImg(true);
    try {
      const tmpId = product?.id || "tmp-" + Date.now();
      const uploaded = await Promise.all(files.map((f) => uploadImage(f, tmpId)));
      setImages((prev) => [...prev, ...uploaded]);
    } catch { setError("فشل رفع الصورة"); }
    setUploadingImg(false);
  }

  function removeImage(idx) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleAddCategory() {
    if (!newCat.trim()) return;
    try {
      await addCategory(newCat.trim(), "📦");
      set("category", newCat.trim());
      setNewCat("");
      setShowNewCat(false);
    } catch (e) { setError(e.message); }
  }

  async function handleSave() {
    if (!form.name || !form.category || !form.price) { setError("الاسم والفئة والسعر مطلوبين"); return; }
    if (!form.barcode) { setError("لازم تضيف باركود أو تولد واحد"); return; }
    setSaving(true); setError("");
    try {
      const data = { ...form, images, price: Number(form.price), stock: Number(form.stock), minStock: Number(form.minStock), discountPrice: form.discountPrice ? Number(form.discountPrice) : null };
      if (isEdit) await updateProduct(product.id, data);
      else await addProduct(data);
      onSaved();
      onClose();
    } catch (e) { setError(e.message); }
    setSaving(false);
  }

  return (
    <>
      <div style={s.overlay}>
        <div style={s.modal}>
          <div style={s.mHeader}>
            <span style={s.mTitle}>{isEdit ? "✏️ تعديل منتج" : "➕ منتج جديد"}</span>
            <button style={s.closeBtn} onClick={onClose}>✕</button>
          </div>

          <div style={s.body}>
            {/* الاسم */}
            <Row label="اسم المنتج *">
              <input style={s.input} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="مثال: سامسونج A55" />
            </Row>

            {/* الفئة */}
            <Row label="الفئة *">
              <div style={{ display: "flex", gap: 8 }}>
                <select style={{ ...s.input, flex: 1 }} value={form.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="">اختر فئة</option>
                  {categories.map((c) => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
                </select>
                <button style={s.smallBtn} onClick={() => setShowNewCat(!showNewCat)}>+ جديد</button>
              </div>
              {showNewCat && (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input style={{ ...s.input, flex: 1 }} value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="اسم الفئة الجديدة" />
                  <button style={s.smallBtn} onClick={handleAddCategory}>إضافة</button>
                </div>
              )}
            </Row>

            {/* الباركود */}
            <Row label="الباركود *">
              <div style={{ display: "flex", gap: 8 }}>
                <input style={{ ...s.input, flex: 1 }} value={form.barcode} onChange={(e) => set("barcode", e.target.value)} placeholder="امسح أو اكتب الباركود" dir="ltr" />
                <button style={s.smallBtn} onClick={() => setShowScanner(true)}>📷 مسح</button>
                <button style={s.smallBtn} onClick={() => { set("barcode", generateBarcode()); set("barcodeGenerated", true); }}>🔄 توليد</button>
              </div>
            </Row>

            {/* السعر */}
            <div style={s.twoCol}>
              <Row label="السعر الأصلي *">
                <input style={s.input} type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0" />
              </Row>
              <Row label="سعر بعد الخصم">
                <input style={s.input} type="number" value={form.discountPrice} onChange={(e) => set("discountPrice", e.target.value)} placeholder="اتركه فاضي لو مفيش" />
              </Row>
            </div>

            {/* الكمية */}
            <div style={s.twoCol}>
              <Row label="الكمية الحالية">
                <input style={s.input} type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="0" />
              </Row>
              <Row label="حد التنبيه">
                <input style={s.input} type="number" value={form.minStock} onChange={(e) => set("minStock", e.target.value)} placeholder="3" />
              </Row>
            </div>

            {/* وصف */}
            <Row label="الوصف">
              <textarea style={{ ...s.input, minHeight: 70, resize: "vertical" }} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="مواصفات المنتج..." />
            </Row>

            {/* الصور */}
            <Row label="الصور">
              <div style={s.imagesGrid}>
                {images.map((img, i) => (
                  <div key={i} style={s.imgThumb}>
                    <img src={img.url} alt="" style={s.thumbImg} />
                    <button style={s.removeImg} onClick={() => removeImage(i)}>✕</button>
                    {i === 0 && <span style={s.mainBadge}>رئيسية</span>}
                  </div>
                ))}
                <label style={s.uploadBox}>
                  {uploadingImg ? "⏳" : "+ صورة"}
                  <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleImageUpload} />
                </label>
              </div>
            </Row>

            {/* نشط / غير نشط */}
            <Row label="الحالة">
              <div style={{ display: "flex", gap: 12 }}>
                {[{ v: true, l: "🟢 نشط" }, { v: false, l: "🔴 مخفي" }].map(({ v, l }) => (
                  <button key={l} style={{ ...s.toggleBtn, ...(form.isActive === v ? s.toggleActive : {}) }} onClick={() => set("isActive", v)}>{l}</button>
                ))}
              </div>
            </Row>

            {error && <div style={s.error}>⚠️ {error}</div>}
          </div>

          <div style={s.mFooter}>
            <button style={s.cancelBtn} onClick={onClose}>إلغاء</button>
            <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة المنتج"}
            </button>
          </div>
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner
          onScan={(code) => { set("barcode", code); setShowScanner(false); }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: "#7a8a9a", marginBottom: 6, fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );
}

const GOLD = "#c9a84c"; const DARK = "#0f1923"; const CARD = "#1a2535";
const TEXT = "#e8dcc8"; const MUTED = "#7a8a9a"; const INPUT_BG = "#111c2a";

const s = {
  overlay: { position: "fixed", inset: 0, background: "#000000aa", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 },
  modal: { background: CARD, borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", display: "flex", flexDirection: "column", border: "1px solid #2a3a4a", fontFamily: "'Cairo',sans-serif", direction: "rtl" },
  mHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #2a3a4a" },
  mTitle: { color: TEXT, fontWeight: 700, fontSize: 16 },
  closeBtn: { background: "#3a1515", color: "#ff8888", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" },
  body: { flex: 1, overflowY: "auto", padding: "16px 20px" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  input: { width: "100%", background: INPUT_BG, border: "1.5px solid #2a3a4a", borderRadius: 8, color: TEXT, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  smallBtn: { background: "#1a2a4a", color: "#6ab0ff", border: "none", borderRadius: 6, padding: "8px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
  imagesGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  imgThumb: { position: "relative", width: 72, height: 72, borderRadius: 8, overflow: "hidden", border: "1px solid #2a3a4a" },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover" },
  removeImg: { position: "absolute", top: 2, right: 2, background: "#000000aa", color: "white", border: "none", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" },
  mainBadge: { position: "absolute", bottom: 0, left: 0, right: 0, background: "#c9a84c99", color: "white", fontSize: 9, textAlign: "center", padding: "2px 0" },
  uploadBox: { width: 72, height: 72, border: "1.5px dashed #2a3a4a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: MUTED, fontSize: 12 },
  toggleBtn: { background: INPUT_BG, border: "1.5px solid #2a3a4a", color: MUTED, borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  toggleActive: { border: `1.5px solid ${GOLD}`, color: GOLD },
  error: { background: "#3a1515", border: "1px solid #6a2020", borderRadius: 8, padding: "10px 14px", color: "#ff8888", fontSize: 13, marginTop: 8 },
  mFooter: { display: "flex", gap: 12, justifyContent: "flex-end", padding: "14px 20px", borderTop: "1px solid #2a3a4a" },
  cancelBtn: { background: INPUT_BG, border: "1px solid #2a3a4a", color: TEXT, borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  saveBtn: { background: `linear-gradient(135deg,${GOLD},#a07830)`, color: DARK, border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
};
