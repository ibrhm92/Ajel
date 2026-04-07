// src/pages/client/CartPage.jsx
import { useState } from "react";
import { useCartContext } from "../../context/CartContext";
import { calcInstallment } from "../../hooks/useCart";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

const WHATSAPP_NUMBER = "201000000000"; // ← غيّر ده لرقم المحل

export default function CartPage() {
  const { cart, removeFromCart, updateQty, clearCart, totalPrice, totalItems } = useCartContext();
  const [payType, setPayType]       = useState("cash"); // cash | installment
  const [name, setName]             = useState("");
  const [phone, setPhone]           = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [months, setMonths]         = useState(12);
  const [interest, setInterest]     = useState(0);
  const [sending, setSending]       = useState(false);
  const [sent, setSent]             = useState(false);

  const monthly = payType === "installment" && downPayment && Number(downPayment) < totalPrice
    ? calcInstallment({ price: totalPrice, downPayment: Number(downPayment), months, interestRate: interest })
    : null;

  function go(path) { window.location.pathname = path; }

  async function handleOrder() {
    if (!name.trim() || !phone.trim()) { alert("ادخل اسمك ورقم تليفونك"); return; }
    if (payType === "installment" && !downPayment) { alert("ادخل المقدم"); return; }
    setSending(true);

    // حفظ الطلب في Firestore
    const orderData = {
      customerName: name,
      phone,
      items: cart.map((i) => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price })),
      totalPrice,
      paymentType: payType,
      installmentDetails: payType === "installment" ? { downPayment: Number(downPayment), months, interest, monthly } : null,
      status: "new",
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "orders"), orderData);
    } catch (e) {
      console.error("فشل حفظ الطلب:", e);
    }

    // بناء رسالة واتساب
    const itemsList = cart.map((i) => `• ${i.name} × ${i.qty} = ${(i.price * i.qty).toLocaleString()} ج`).join("\n");
    const installMsg = payType === "installment"
      ? `\n💳 *تقسيط:*\nمقدم: ${Number(downPayment).toLocaleString()} ج\nعدد الأشهر: ${months}\nالقسط الشهري: ${monthly?.toLocaleString()} ج`
      : "\n💵 *دفع كاش*";

    const msg = `🛒 *طلب جديد*\n\n👤 الاسم: ${name}\n📞 التليفون: ${phone}\n\n*المنتجات:*\n${itemsList}\n\n💰 الإجمالي: ${totalPrice.toLocaleString()} جنيه${installMsg}\n\n---\nمن موقع المتجر`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");

    setSent(true);
    clearCart();
    setSending(false);
  }

  if (cart.length === 0 && !sent) {
    return (
      <div style={s.emptyWrap}>
        <div style={s.emptyIcon}>🛒</div>
        <h2 style={s.emptyTitle}>السلة فاضية</h2>
        <p style={s.emptySub}>ابدأ التسوق وأضف منتجات للسلة</p>
        <button style={s.shopBtn} onClick={() => go("/shop")}>تسوق الآن</button>
      </div>
    );
  }

  if (sent) {
    return (
      <div style={s.emptyWrap}>
        <div style={{ fontSize: 64 }}>✅</div>
        <h2 style={{ ...s.emptyTitle, color: "#69db7c" }}>تم إرسال طلبك!</h2>
        <p style={s.emptySub}>هيتواصل معاك المحل على واتساب قريباً</p>
        <button style={s.shopBtn} onClick={() => go("/shop")}>استمر في التسوق</button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={s.title}>🛒 سلة المشتريات ({totalItems} منتج)</h1>

      <div style={s.layout}>
        {/* قائمة المنتجات */}
        <div style={s.itemsSection}>
          {cart.map((item) => (
            <div key={item.id} style={s.cartItem}>
              {item.image ? (
                <img src={item.image} alt={item.name} style={s.itemImg} />
              ) : (
                <div style={s.itemNoImg}>📷</div>
              )}
              <div style={s.itemInfo}>
                <div style={s.itemName}>{item.name}</div>
                <div style={s.itemPrice}>{item.price?.toLocaleString()} جنيه</div>
              </div>
              <div style={s.qtyControl}>
                <button style={s.qtyBtn} onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                <span style={s.qty}>{item.qty}</span>
                <button style={s.qtyBtn}
                  onClick={() => { if (item.qty < item.stock) updateQty(item.id, item.qty + 1); }}
                  disabled={item.qty >= item.stock}
                >+</button>
              </div>
              <div style={s.itemTotal}>{(item.price * item.qty).toLocaleString()} ج</div>
              <button style={s.removeBtn} onClick={() => removeFromCart(item.id)}>🗑️</button>
            </div>
          ))}
        </div>

        {/* ملخص الطلب */}
        <div style={s.summary}>
          <h3 style={s.sumTitle}>📋 تفاصيل الطلب</h3>

          {/* بيانات العميل */}
          <div style={s.field}>
            <label style={s.label}>الاسم *</label>
            <input style={s.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك كامل" />
          </div>
          <div style={s.field}>
            <label style={s.label}>رقم التليفون *</label>
            <input style={s.input} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="01xxxxxxxxx" dir="ltr" />
          </div>

          {/* طريقة الدفع */}
          <div style={s.field}>
            <label style={s.label}>طريقة الدفع</label>
            <div style={s.payRow}>
              {[
                { v: "cash",        l: "💵 كاش" },
                { v: "installment", l: "💳 تقسيط" },
              ].map(({ v, l }) => (
                <button key={v}
                  style={{ ...s.payBtn, ...(payType === v ? s.payBtnActive : {}) }}
                  onClick={() => setPayType(v)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* حاسبة القسط */}
          {payType === "installment" && (
            <div style={s.installBox}>
              <div style={s.field}>
                <label style={s.label}>المقدم (جنيه)</label>
                <input style={s.input} type="number" min="0"
                  value={downPayment} onChange={(e) => setDownPayment(e.target.value)} placeholder="0" />
              </div>
              <div style={s.twoCol}>
                <div style={s.field}>
                  <label style={s.label}>عدد الأشهر</label>
                  <select style={s.input} value={months} onChange={(e) => setMonths(Number(e.target.value))}>
                    {[3, 6, 9, 12, 18, 24, 36].map((m) => (
                      <option key={m} value={m}>{m} شهر</option>
                    ))}
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>فائدة %</label>
                  <input style={s.input} type="number" min="0"
                    value={interest} onChange={(e) => setInterest(Number(e.target.value))} placeholder="0" />
                </div>
              </div>

              {monthly && (
                <div style={s.monthlyResult}>
                  <span>القسط الشهري</span>
                  <span style={s.monthlyVal}>{monthly.toLocaleString()} ج</span>
                </div>
              )}
            </div>
          )}

          {/* الإجمالي */}
          <div style={s.totalBox}>
            <div style={s.totalRow}>
              <span style={s.totalLabel}>إجمالي المنتجات</span>
              <span style={s.totalVal}>{totalPrice.toLocaleString()} جنيه</span>
            </div>
            {payType === "installment" && downPayment && (
              <>
                <div style={s.totalRow}>
                  <span style={s.totalLabel}>المقدم</span>
                  <span style={s.totalVal}>{Number(downPayment).toLocaleString()} جنيه</span>
                </div>
                {monthly && (
                  <div style={{ ...s.totalRow, borderTop: "1px solid #2a3a4a", paddingTop: 10, marginTop: 6 }}>
                    <span style={{ color: "#e8dcc8", fontWeight: 700 }}>القسط الشهري</span>
                    <span style={s.monthlyBig}>{monthly.toLocaleString()} ج × {months} شهر</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* زرار الإرسال */}
          <button style={s.orderBtn} onClick={handleOrder} disabled={sending}>
            {sending ? "⏳ جاري الإرسال..." : "📲 أرسل الطلب على واتساب"}
          </button>
          <p style={s.whatsappNote}>هيفتح واتساب مع تفاصيل طلبك وهيتواصل معاك المحل</p>
        </div>
      </div>
    </div>
  );
}

const GOLD = "#c9a84c"; const DARK = "#0f1923"; const CARD = "#1a2535";
const TEXT = "#e8dcc8"; const MUTED = "#7a8a9a"; const INPUT_BG = "#111c2a";

const s = {
  title: { margin: "0 0 24px", fontSize: 22, color: TEXT },
  layout: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" },
  itemsSection: { display: "flex", flexDirection: "column", gap: 12 },
  cartItem: { background: CARD, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, border: "1px solid #2a3a4a" },
  itemImg: { width: 64, height: 64, borderRadius: 10, objectFit: "cover", flexShrink: 0 },
  itemNoImg: { width: 64, height: 64, borderRadius: 10, background: INPUT_BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 4 },
  itemPrice: { fontSize: 13, color: MUTED },
  qtyControl: { display: "flex", alignItems: "center", gap: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 8, background: INPUT_BG, border: "1px solid #2a3a4a", color: TEXT, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  qty: { fontSize: 15, fontWeight: 700, color: TEXT, minWidth: 24, textAlign: "center" },
  itemTotal: { fontSize: 15, fontWeight: 700, color: GOLD, minWidth: 80, textAlign: "center" },
  removeBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: "4px" },
  summary: { background: CARD, borderRadius: 16, padding: 20, border: "1px solid #2a3a4a", position: "sticky", top: 80 },
  sumTitle: { margin: "0 0 16px", fontSize: 16, color: TEXT },
  field: { marginBottom: 14 },
  label: { display: "block", fontSize: 12, color: MUTED, marginBottom: 6, fontWeight: 600 },
  input: { width: "100%", background: INPUT_BG, border: "1.5px solid #2a3a4a", borderRadius: 8, color: TEXT, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  payRow: { display: "flex", gap: 10 },
  payBtn: { flex: 1, background: INPUT_BG, border: "1.5px solid #2a3a4a", color: MUTED, borderRadius: 10, padding: "11px", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 },
  payBtnActive: { border: `1.5px solid ${GOLD}`, color: GOLD, background: "#2a1e0a" },
  installBox: { background: INPUT_BG, borderRadius: 10, padding: 14, marginBottom: 14 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  monthlyResult: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1a2535", borderRadius: 8, padding: "10px 14px" },
  monthlyVal: { color: GOLD, fontSize: 18, fontWeight: 700 },
  totalBox: { background: INPUT_BG, borderRadius: 10, padding: 14, marginBottom: 16 },
  totalRow: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
  totalLabel: { color: MUTED, fontSize: 13 },
  totalVal: { color: TEXT, fontWeight: 600, fontSize: 14 },
  monthlyBig: { color: GOLD, fontWeight: 700 },
  orderBtn: { width: "100%", background: "#25D366", color: "white", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  whatsappNote: { textAlign: "center", color: MUTED, fontSize: 12, marginTop: 8, marginBottom: 0 },
  emptyWrap: { textAlign: "center", padding: "60px 20px" },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, color: TEXT, margin: "0 0 8px" },
  emptySub: { color: MUTED, fontSize: 15, marginBottom: 24 },
  shopBtn: { background: `linear-gradient(135deg,${GOLD},#a07830)`, color: DARK, border: "none", borderRadius: 10, padding: "12px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
};
