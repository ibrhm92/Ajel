// src/components/StockMovementModal.jsx
import { useState } from "react";
import { addStockMovement } from "../hooks/useStock";
import BarcodeScanner from "./BarcodeScanner";

const TYPES = {
  in:         { label: "إضافة بضاعة",    icon: "📥", color: "#69db7c", bg: "#1a3a1a" },
  out:        { label: "صرف / بيع",       icon: "📤", color: "#ff6b6b", bg: "#3a1515" },
  adjustment: { label: "تعديل يدوي",     icon: "⚙️", color: "#ffa94d", bg: "#3a2a0a" },
};

const REASONS = {
  in:  ["استلام شحنة", "إرجاع من عميل", "تحويل من فرع", "أخرى"],
  out: ["بيع كاش", "بيع تقسيط", "تالف", "تحويل لفرع", "أخرى"],
  adjustment: ["جرد دوري", "تصحيح خطأ", "أخرى"],
};

export default function StockMovementModal({ product, onClose, onDone }) {
  const [type, setType] = useState("in");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSave() {
    if (!quantity) { setError("ادخل الكمية"); return; }
    if (!reason) { setError("اختر السبب"); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const newStock = await addStockMovement({
        productId: product.id,
        productName: product.name,
        type, quantity, reason, note,
      });
      setSuccess(`✅ تم! الكمية الجديدة: ${newStock} قطعة`);
      setTimeout(() => { onDone(); onClose(); }, 1200);
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  }

  const currentType = TYPES[type];

  return (
    <>
      <div style={s.overlay}>
        <div style={s.modal}>
          <div style={s.mHeader}>
            <div>
              <div style={s.mTitle}>تحديث المخزن</div>
              <div style={s.mSub}>{product.name}</div>
            </div>
            <button style={s.closeBtn} onClick={onClose}>✕</button>
          </div>

          <div style={s.body}>
            {/* الكمية الحالية */}
            <div style={s.currentStock}>
              <span style={s.csLabel}>الكمية الحالية</span>
              <span style={{
                ...s.csValue,
                color: product.stock === 0 ? "#ff6b6b" : product.stock <= product.minStock ? "#ffa94d" : "#69db7c"
              }}>
                {product.stock} قطعة
              </span>
            </div>

            {/* نوع الحركة */}
            <div style={s.typeRow}>
              {Object.entries(TYPES).map(([k, v]) => (
                <button key={k}
                  style={{ ...s.typeBtn, ...(type === k ? { ...s.typeBtnActive, background: v.bg, color: v.color, border: `1.5px solid ${v.color}44` } : {}) }}
                  onClick={() => { setType(k); setReason(""); }}
                >
                  <span>{v.icon}</span>
                  <span style={{ fontSize: 12 }}>{v.label}</span>
                </button>
              ))}
            </div>

            {/* الكمية */}
            <div style={s.field}>
              <label style={s.label}>
                {type === "adjustment" ? "الكمية الجديدة (إجمالي)" : "الكمية"}
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={s.input} type="number" min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                />
                <button style={s.scanBtn} onClick={() => setShowScanner(true)}>
                  📷 مسح
                </button>
              </div>
              {type !== "adjustment" && quantity && product.stock !== undefined && (
                <div style={{ ...s.preview, color: currentType.color }}>
                  {type === "in"
                    ? `بعد الإضافة: ${product.stock + Number(quantity)} قطعة`
                    : `بعد الخصم: ${Math.max(0, product.stock - Number(quantity))} قطعة`}
                </div>
              )}
            </div>

            {/* السبب */}
            <div style={s.field}>
              <label style={s.label}>السبب</label>
              <div style={s.reasonGrid}>
                {REASONS[type].map((r) => (
                  <button key={r}
                    style={{ ...s.reasonBtn, ...(reason === r ? s.reasonActive : {}) }}
                    onClick={() => setReason(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* ملاحظة */}
            <div style={s.field}>
              <label style={s.label}>ملاحظة (اختياري)</label>
              <input
                style={s.input}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="مثال: فاتورة رقم 123، شحنة مارس..."
              />
            </div>

            {error && <div style={s.error}>⚠️ {error}</div>}
            {success && <div style={s.successBox}>{success}</div>}
          </div>

          <div style={s.mFooter}>
            <button style={s.cancelBtn} onClick={onClose}>إلغاء</button>
            <button
              style={{ ...s.saveBtn, background: currentType.color, color: "#0f1923" }}
              onClick={handleSave} disabled={saving}
            >
              {saving ? "⏳ جاري الحفظ..." : `${currentType.icon} تأكيد`}
            </button>
          </div>
        </div>
      </div>

      {showScanner && (
        <BarcodeScanner
          onScan={(code) => {
            // لو مسح باركود منتج نفس الكمية تتعبى تلقائياً
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}

const CARD = "#1a2535"; const TEXT = "#e8dcc8"; const MUTED = "#7a8a9a";
const INPUT_BG = "#111c2a"; const GOLD = "#c9a84c"; const DARK = "#0f1923";

const s = {
  overlay: { position: "fixed", inset: 0, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150, padding: 16 },
  modal: { background: CARD, borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", display: "flex", flexDirection: "column", border: "1px solid #2a3a4a", fontFamily: "'Cairo',sans-serif", direction: "rtl" },
  mHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 20px", borderBottom: "1px solid #2a3a4a" },
  mTitle: { color: TEXT, fontWeight: 700, fontSize: 16 },
  mSub: { color: MUTED, fontSize: 13, marginTop: 2 },
  closeBtn: { background: "#3a1515", color: "#ff8888", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" },
  body: { flex: 1, overflowY: "auto", padding: "16px 20px" },
  currentStock: { display: "flex", justifyContent: "space-between", alignItems: "center", background: INPUT_BG, borderRadius: 10, padding: "12px 16px", marginBottom: 16, border: "1px solid #2a3a4a" },
  csLabel: { color: MUTED, fontSize: 14 },
  csValue: { fontSize: 20, fontWeight: 700 },
  typeRow: { display: "flex", gap: 8, marginBottom: 16 },
  typeBtn: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 6px", background: INPUT_BG, border: "1.5px solid #2a3a4a", borderRadius: 10, cursor: "pointer", color: MUTED, fontFamily: "inherit", fontSize: 18, transition: "all 0.15s" },
  typeBtnActive: {},
  field: { marginBottom: 16 },
  label: { display: "block", fontSize: 12, color: MUTED, marginBottom: 6, fontWeight: 600 },
  input: { width: "100%", background: INPUT_BG, border: "1.5px solid #2a3a4a", borderRadius: 8, color: TEXT, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  scanBtn: { background: "#1a2a4a", color: "#6ab0ff", border: "none", borderRadius: 8, padding: "0 14px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
  preview: { fontSize: 13, marginTop: 6, fontWeight: 600 },
  reasonGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  reasonBtn: { background: INPUT_BG, border: "1.5px solid #2a3a4a", color: MUTED, borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  reasonActive: { border: `1.5px solid ${GOLD}`, color: GOLD, background: "#2a2010" },
  error: { background: "#3a1515", border: "1px solid #6a2020", borderRadius: 8, padding: "10px 14px", color: "#ff8888", fontSize: 13 },
  successBox: { background: "#1a3a1a", border: "1px solid #2a6a2a", borderRadius: 8, padding: "10px 14px", color: "#69db7c", fontSize: 14, fontWeight: 600 },
  mFooter: { display: "flex", gap: 12, justifyContent: "flex-end", padding: "14px 20px", borderTop: "1px solid #2a3a4a" },
  cancelBtn: { background: INPUT_BG, border: "1px solid #2a3a4a", color: TEXT, borderRadius: 8, padding: "10px 20px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  saveBtn: { border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
};
