// src/components/BarcodePrinter.jsx
import { useRef } from "react";
import Barcode from "react-barcode";

export default function BarcodePrinter({ product, onClose }) {
  const printRef = useRef(null);

  function handlePrint() {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=400,height=300");
    win.document.write(`
      <html dir="rtl">
        <head>
          <title>طباعة باركود</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700&display=swap" rel="stylesheet"/>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Cairo', sans-serif; background: white; }
            .sticker-grid { display: flex; flex-wrap: wrap; gap: 8px; padding: 10px; }
            .sticker {
              border: 1px solid #ccc; border-radius: 6px;
              padding: 8px 12px; text-align: center;
              width: 180px; page-break-inside: avoid;
            }
            .product-name { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
            .price { font-size: 12px; color: #555; margin-top: 4px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  }

  const copies = 1; // عدد النسخ - ممكن تعمله input

  return (
    <div style={s.overlay}>
      <div style={s.box}>
        <div style={s.header}>
          <span style={s.title}>🖨️ طباعة باركود</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* معاينة الستيكر */}
        <div style={s.preview}>
          <div style={s.sticker}>
            <div style={s.productName}>{product.name}</div>
            <Barcode
              value={product.barcode}
              width={1.4}
              height={50}
              fontSize={11}
              margin={4}
              background="white"
              lineColor="#1a1a1a"
            />
            {product.discountPrice ? (
              <div style={s.price}>
                <span style={s.oldPrice}>{product.price?.toLocaleString()} ج</span>
                {"  "}
                <span style={s.newPrice}>{product.discountPrice?.toLocaleString()} ج</span>
              </div>
            ) : (
              <div style={s.price}>{product.price?.toLocaleString()} جنيه</div>
            )}
          </div>
        </div>

        {/* المحتوى المخفي للطباعة */}
        <div ref={printRef} style={{ display: "none" }}>
          <div className="sticker-grid">
            {Array.from({ length: copies }).map((_, i) => (
              <div key={i} className="sticker">
                <div className="product-name">{product.name}</div>
                <svg id={`bc-${i}`} />
                <div className="price">
                  {product.discountPrice
                    ? `${product.discountPrice?.toLocaleString()} جنيه`
                    : `${product.price?.toLocaleString()} جنيه`}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.actions}>
          <button style={s.cancelBtn} onClick={onClose}>إلغاء</button>
          <button style={s.printBtn} onClick={handlePrint}>🖨️ طباعة</button>
        </div>

        <p style={s.hint}>* الطباعة بتشتغل مع أي طابعة عادية أو طابعة ستيكر</p>
      </div>
    </div>
  );
}

const GOLD = "#c9a84c"; const DARK = "#0f1923"; const CARD = "#1a2535";
const TEXT = "#e8dcc8"; const MUTED = "#7a8a9a";

const s = {
  overlay: { position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 },
  box: { background: CARD, borderRadius: 16, width: "100%", maxWidth: 380, border: "1px solid #2a3a4a", fontFamily: "'Cairo',sans-serif", direction: "rtl" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #2a3a4a" },
  title: { color: TEXT, fontWeight: 700, fontSize: 15 },
  closeBtn: { background: "#3a1515", color: "#ff8888", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" },
  preview: { padding: 24, display: "flex", justifyContent: "center" },
  sticker: { background: "white", borderRadius: 10, padding: "12px 16px", textAlign: "center", border: "1.5px solid #ddd", boxShadow: "0 4px 16px #00000030", maxWidth: 200 },
  productName: { fontFamily: "'Cairo',sans-serif", fontWeight: 700, fontSize: 14, color: "#1a1a1a", marginBottom: 6 },
  price: { fontFamily: "'Cairo',sans-serif", fontSize: 13, color: "#333", marginTop: 6 },
  oldPrice: { textDecoration: "line-through", color: "#999", marginLeft: 6 },
  newPrice: { color: "#c0392b", fontWeight: 700 },
  actions: { display: "flex", gap: 12, padding: "0 18px 18px", justifyContent: "flex-end" },
  cancelBtn: { background: "#111c2a", border: "1px solid #2a3a4a", color: TEXT, borderRadius: 8, padding: "9px 18px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  printBtn: { background: `linear-gradient(135deg,${GOLD},#a07830)`, color: DARK, border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  hint: { textAlign: "center", color: MUTED, fontSize: 11, paddingBottom: 14 },
};
