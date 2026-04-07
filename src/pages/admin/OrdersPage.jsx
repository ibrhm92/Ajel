// src/pages/admin/OrdersPage.jsx
import { useState, useRef } from "react";
import { useOrders, updateOrderStatus, ORDER_STATUS } from "../../hooks/useOrders";

const WHATSAPP_NUMBER = "201000000000"; // ← رقم المحل

export default function OrdersPage() {
  const { orders, loading } = useOrders();
  const [filter, setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);
  const printRef = useRef(null);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const counts = Object.keys(ORDER_STATUS).reduce((acc, k) => {
    acc[k] = orders.filter((o) => o.status === k).length;
    return acc;
  }, {});

  function formatDate(ts) {
    if (!ts) return "-";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("ar-EG") + " " + d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  }

  function handleWhatsApp(order) {
    const msg = `أهلاً ${order.customerName}،\nبخصوص طلبك رقم ${order.id.slice(-6).toUpperCase()}\nإجمالي: ${order.totalPrice?.toLocaleString()} جنيه\nنرجو التواصل لإتمام الطلب 🙏`;
    window.open(`https://wa.me/${order.phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  function handlePrint(order) {
    const installInfo = order.paymentType === "installment" && order.installmentDetails
      ? `<div class="row"><span>المقدم:</span><span>${order.installmentDetails.downPayment?.toLocaleString()} ج</span></div>
         <div class="row"><span>القسط الشهري:</span><span>${order.installmentDetails.monthly?.toLocaleString()} ج × ${order.installmentDetails.months} شهر</span></div>`
      : `<div class="row"><span>طريقة الدفع:</span><span>كاش</span></div>`;

    const itemsHtml = order.items?.map((i) =>
      `<tr><td>${i.name}</td><td>${i.qty}</td><td>${i.price?.toLocaleString()} ج</td><td>${(i.price * i.qty)?.toLocaleString()} ج</td></tr>`
    ).join("") || "";

    const win = window.open("", "_blank", "width=500,height=700");
    win.document.write(`
      <html dir="rtl">
      <head>
        <title>إيصال طلب</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet"/>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family:'Cairo',sans-serif; padding:24px; color:#111; }
          h2 { text-align:center; margin-bottom:4px; font-size:20px; }
          .sub { text-align:center; color:#666; font-size:13px; margin-bottom:16px; }
          .divider { border-top:1px dashed #ccc; margin:12px 0; }
          .row { display:flex; justify-content:space-between; font-size:14px; margin:6px 0; }
          table { width:100%; border-collapse:collapse; margin:12px 0; }
          th { background:#f0f0f0; padding:8px; font-size:13px; text-align:right; }
          td { padding:8px; font-size:13px; border-bottom:1px solid #eee; }
          .total { font-size:18px; font-weight:700; }
          .footer { text-align:center; color:#888; font-size:12px; margin-top:20px; }
          @media print { button { display:none; } }
        </style>
      </head>
      <body>
        <h2>🏪 متجر الأجهزة</h2>
        <div class="sub">إيصال طلب رقم: #${order.id.slice(-6).toUpperCase()}</div>
        <div class="divider"/>
        <div class="row"><span>العميل:</span><span>${order.customerName}</span></div>
        <div class="row"><span>التليفون:</span><span>${order.phone}</span></div>
        <div class="row"><span>التاريخ:</span><span>${formatDate(order.createdAt)}</span></div>
        <div class="divider"/>
        <table>
          <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div class="divider"/>
        ${installInfo}
        <div class="divider"/>
        <div class="row total"><span>الإجمالي الكلي</span><span>${order.totalPrice?.toLocaleString()} جنيه</span></div>
        <div class="footer">شكراً لتعاملكم معنا - متجر الأجهزة</div>
        <br/>
        <button onclick="window.print()" style="width:100%;padding:12px;background:#c9a84c;border:none;border-radius:8px;font-family:'Cairo',sans-serif;font-size:16px;font-weight:700;cursor:pointer;">🖨️ طباعة</button>
      </body></html>
    `);
    win.document.close();
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>🛒 الطلبات</h2>
          <p style={s.sub}>{orders.length} طلب إجمالي</p>
        </div>
      </div>

      {/* إحصائيات */}
      <div style={s.statsRow}>
        {Object.entries(ORDER_STATUS).map(([k, v]) => (
          <div key={k} style={{ ...s.statCard, background: v.bg, cursor: "pointer", border: filter === k ? `1.5px solid ${v.color}` : "1px solid transparent" }}
            onClick={() => setFilter(filter === k ? "all" : k)}>
            <div style={{ fontSize: 22 }}>{v.icon}</div>
            <div style={{ ...s.statVal, color: v.color }}>{counts[k] || 0}</div>
            <div style={s.statLabel}>{v.label}</div>
          </div>
        ))}
        <div style={{ ...s.statCard, background: "#1a2535", cursor: "pointer", border: filter === "all" ? "1.5px solid #c9a84c" : "1px solid transparent" }}
          onClick={() => setFilter("all")}>
          <div style={{ fontSize: 22 }}>📋</div>
          <div style={{ ...s.statVal, color: "#c9a84c" }}>{orders.length}</div>
          <div style={s.statLabel}>الكل</div>
        </div>
      </div>

      {/* الطلبات */}
      {loading ? (
        <div style={s.center}>⏳ جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div style={s.center}>لا توجد طلبات</div>
      ) : (
        <div style={s.ordersList}>
          {filtered.map((order) => {
            const st = ORDER_STATUS[order.status] || ORDER_STATUS.new;
            return (
              <div key={order.id} style={s.orderCard}>
                {/* رأس الطلب */}
                <div style={s.orderHeader}>
                  <div style={s.orderId}>#{order.id.slice(-6).toUpperCase()}</div>
                  <div style={{ ...s.statusBadge, color: st.color, background: st.bg }}>
                    {st.icon} {st.label}
                  </div>
                  <div style={s.orderDate}>{formatDate(order.createdAt)}</div>
                </div>

                {/* بيانات العميل */}
                <div style={s.orderBody}>
                  <div style={s.customerRow}>
                    <div>
                      <div style={s.customerName}>{order.customerName}</div>
                      <div style={s.customerPhone}>{order.phone}</div>
                    </div>
                    <div style={s.payBadge}>
                      {order.paymentType === "installment" ? "💳 تقسيط" : "💵 كاش"}
                    </div>
                  </div>

                  {/* المنتجات */}
                  <div style={s.itemsList}>
                    {order.items?.map((item, i) => (
                      <div key={i} style={s.orderItem}>
                        <span style={s.itemName}>{item.name}</span>
                        <span style={s.itemQty}>× {item.qty}</span>
                        <span style={s.itemPrice}>{(item.price * item.qty)?.toLocaleString()} ج</span>
                      </div>
                    ))}
                  </div>

                  {/* التقسيط */}
                  {order.paymentType === "installment" && order.installmentDetails && (
                    <div style={s.installInfo}>
                      <span>مقدم: {order.installmentDetails.downPayment?.toLocaleString()} ج</span>
                      <span>قسط: {order.installmentDetails.monthly?.toLocaleString()} ج × {order.installmentDetails.months} شهر</span>
                    </div>
                  )}

                  {/* الإجمالي */}
                  <div style={s.orderTotal}>
                    <span style={s.totalLabel}>الإجمالي</span>
                    <span style={s.totalVal}>{order.totalPrice?.toLocaleString()} جنيه</span>
                  </div>
                </div>

                {/* الأكشن */}
                <div style={s.orderFooter}>
                  {/* تغيير الحالة */}
                  <select style={s.statusSelect}
                    value={order.status || "new"}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}>
                    {Object.entries(ORDER_STATUS).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>

                  <div style={s.actionBtns}>
                    <button style={s.waBtn} onClick={() => handleWhatsApp(order)}>
                      💬 واتساب
                    </button>
                    <button style={s.printBtn} onClick={() => handlePrint(order)}>
                      🖨️ طباعة
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const GOLD = "#c9a84c"; const DARK = "#0f1923"; const CARD = "#1a2535";
const TEXT = "#e8dcc8"; const MUTED = "#7a8a9a"; const INPUT_BG = "#111c2a";

const s = {
  root: { padding: 24, fontFamily: "'Cairo','Tajawal',sans-serif", direction: "rtl", color: TEXT, minHeight: "100vh", background: DARK },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  title: { margin: 0, fontSize: 22, color: TEXT },
  sub: { margin: "4px 0 0", fontSize: 13, color: MUTED },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12, marginBottom: 24 },
  statCard: { borderRadius: 12, padding: "14px 12px", textAlign: "center", transition: "border 0.15s" },
  statVal: { fontSize: 26, fontWeight: 700, margin: "4px 0" },
  statLabel: { fontSize: 12, color: MUTED },
  center: { textAlign: "center", padding: 48, color: MUTED, fontSize: 15 },
  ordersList: { display: "flex", flexDirection: "column", gap: 16 },
  orderCard: { background: CARD, borderRadius: 16, border: "1px solid #2a3a4a", overflow: "hidden" },
  orderHeader: { display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: "1px solid #1e2d3d", background: "#151f2e", flexWrap: "wrap" },
  orderId: { fontFamily: "monospace", color: GOLD, fontWeight: 700, fontSize: 15 },
  statusBadge: { borderRadius: 12, padding: "4px 12px", fontSize: 12, fontWeight: 700 },
  orderDate: { color: MUTED, fontSize: 12, marginRight: "auto" },
  orderBody: { padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 },
  customerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  customerName: { fontSize: 15, fontWeight: 700, color: TEXT },
  customerPhone: { fontSize: 13, color: MUTED, direction: "ltr", textAlign: "right" },
  payBadge: { background: INPUT_BG, borderRadius: 8, padding: "4px 12px", fontSize: 13, color: MUTED },
  itemsList: { background: INPUT_BG, borderRadius: 10, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 },
  orderItem: { display: "flex", gap: 10, alignItems: "center", fontSize: 13 },
  itemName: { flex: 1, color: TEXT },
  itemQty: { color: MUTED },
  itemPrice: { color: GOLD, fontWeight: 600 },
  installInfo: { display: "flex", gap: 16, fontSize: 13, color: MUTED, background: "#1a2a4a", borderRadius: 8, padding: "8px 14px", flexWrap: "wrap" },
  orderTotal: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #2a3a4a", paddingTop: 10 },
  totalLabel: { color: MUTED, fontSize: 14 },
  totalVal: { color: GOLD, fontSize: 20, fontWeight: 700 },
  orderFooter: { display: "flex", gap: 12, padding: "12px 18px", borderTop: "1px solid #1e2d3d", background: "#151f2e", alignItems: "center", flexWrap: "wrap" },
  statusSelect: { background: INPUT_BG, border: "1.5px solid #2a3a4a", borderRadius: 8, color: TEXT, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", flex: 1, minWidth: 160 },
  actionBtns: { display: "flex", gap: 8 },
  waBtn: { background: "#1a3a1a", color: "#25D366", border: "1px solid #25D36644", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 },
  printBtn: { background: "#1a2a4a", color: "#6ab0ff", border: "1px solid #2a4a6a44", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
};
