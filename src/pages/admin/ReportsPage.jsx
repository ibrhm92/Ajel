// src/pages/admin/ReportsPage.jsx
import { useOrders } from "../../hooks/useOrders";
import { useProducts } from "../../hooks/useProducts";
import { useStockMovements } from "../../hooks/useStock";

export default function ReportsPage() {
  const { orders }    = useOrders();
  const { products }  = useProducts();
  const { movements } = useStockMovements();

  // إحصائيات الطلبات
  const doneOrders      = orders.filter((o) => o.status === "done");
  const totalRevenue    = doneOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const cashOrders      = orders.filter((o) => o.paymentType === "cash").length;
  const installOrders   = orders.filter((o) => o.paymentType === "installment").length;
  const newOrders       = orders.filter((o) => o.status === "new").length;

  // إحصائيات المنتجات
  const outOfStock  = products.filter((p) => p.stock === 0).length;
  const lowStock    = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const withOffers  = products.filter((p) => p.discountPrice).length;

  // أكثر المنتجات طلباً
  const productCounts = {};
  orders.forEach((o) => {
    o.items?.forEach((i) => {
      productCounts[i.name] = (productCounts[i.name] || 0) + i.qty;
    });
  });
  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // حركات المخزن هذا الشهر
  const now = new Date();
  const thisMonth = movements.filter((m) => {
    if (!m.date) return false;
    const d = m.date.toDate ? m.date.toDate() : new Date(m.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const addedQty = thisMonth.filter((m) => m.type === "in").reduce((s, m) => s + m.quantity, 0);
  const soldQty  = thisMonth.filter((m) => m.type === "out").reduce((s, m) => s + m.quantity, 0);

  const StatCard = ({ icon, label, value, color = "#c9a84c", bg = "#2a1e0a" }) => (
    <div style={{ background: bg, borderRadius: 14, padding: "18px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "#7a8a9a", marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div style={s.root}>
      <h2 style={s.title}>📊 التقارير والإحصائيات</h2>

      {/* الطلبات */}
      <section style={s.section}>
        <h3 style={s.sectionTitle}>🛒 الطلبات</h3>
        <div style={s.grid4}>
          <StatCard icon="📋" label="إجمالي الطلبات"  value={orders.length}      color="#6ab0ff" bg="#1a2a4a" />
          <StatCard icon="✅" label="طلبات مكتملة"    value={doneOrders.length}  color="#69db7c" bg="#1a3a1a" />
          <StatCard icon="🆕" label="طلبات جديدة"     value={newOrders}          color="#ffa94d" bg="#3a2a0a" />
          <StatCard icon="💰" label="إيراد المكتملة"  value={`${totalRevenue.toLocaleString()} ج`} color="#c9a84c" bg="#2a1e0a" />
        </div>
      </section>

      {/* نسبة كاش vs تقسيط */}
      <section style={s.section}>
        <h3 style={s.sectionTitle}>💳 طرق الدفع</h3>
        <div style={s.payRow}>
          <div style={s.payCard}>
            <div style={s.payVal}>{cashOrders}</div>
            <div style={s.payLabel}>💵 كاش</div>
            {orders.length > 0 && (
              <div style={s.payBar}>
                <div style={{ ...s.payBarFill, width: `${Math.round(cashOrders / orders.length * 100)}%`, background: "#69db7c" }} />
              </div>
            )}
            <div style={s.payPct}>{orders.length > 0 ? Math.round(cashOrders / orders.length * 100) : 0}%</div>
          </div>
          <div style={s.payCard}>
            <div style={s.payVal}>{installOrders}</div>
            <div style={s.payLabel}>💳 تقسيط</div>
            {orders.length > 0 && (
              <div style={s.payBar}>
                <div style={{ ...s.payBarFill, width: `${Math.round(installOrders / orders.length * 100)}%`, background: "#6ab0ff" }} />
              </div>
            )}
            <div style={s.payPct}>{orders.length > 0 ? Math.round(installOrders / orders.length * 100) : 0}%</div>
          </div>
        </div>
      </section>

      {/* المنتجات */}
      <section style={s.section}>
        <h3 style={s.sectionTitle}>📦 المنتجات</h3>
        <div style={s.grid4}>
          <StatCard icon="📦" label="إجمالي المنتجات" value={products.length}  color="#6ab0ff" bg="#1a2a4a" />
          <StatCard icon="🏷️" label="عليها عروض"       value={withOffers}      color="#c9a84c" bg="#2a1e0a" />
          <StatCard icon="🟡" label="كمية منخفضة"      value={lowStock}        color="#ffa94d" bg="#3a2a0a" />
          <StatCard icon="🔴" label="نفد المخزون"       value={outOfStock}      color="#ff6b6b" bg="#3a1515" />
        </div>
      </section>

      {/* المخزن هذا الشهر */}
      <section style={s.section}>
        <h3 style={s.sectionTitle}>🏷️ المخزن - هذا الشهر</h3>
        <div style={s.grid2}>
          <StatCard icon="📥" label="قطع تم استلامها" value={addedQty} color="#69db7c" bg="#1a3a1a" />
          <StatCard icon="📤" label="قطع تم صرفها"    value={soldQty}  color="#ff6b6b" bg="#3a1515" />
        </div>
      </section>

      {/* أكثر المنتجات طلباً */}
      {topProducts.length > 0 && (
        <section style={s.section}>
          <h3 style={s.sectionTitle}>🏆 أكثر المنتجات طلباً</h3>
          <div style={s.topList}>
            {topProducts.map(([name, count], i) => (
              <div key={name} style={s.topRow}>
                <span style={s.topRank}>#{i + 1}</span>
                <span style={s.topName}>{name}</span>
                <div style={s.topBarWrap}>
                  <div style={{ ...s.topBar, width: `${Math.round(count / topProducts[0][1] * 100)}%` }} />
                </div>
                <span style={s.topCount}>{count} قطعة</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const DARK = "#0f1923"; const CARD = "#1a2535";
const TEXT = "#e8dcc8"; const MUTED = "#7a8a9a"; const GOLD = "#c9a84c";

const s = {
  root: { padding: 24, fontFamily: "'Cairo','Tajawal',sans-serif", direction: "rtl", color: TEXT, minHeight: "100vh", background: DARK },
  title: { margin: "0 0 24px", fontSize: 22, color: TEXT },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 14 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 },
  payRow: { display: "flex", gap: 16, flexWrap: "wrap" },
  payCard: { flex: 1, minWidth: 180, background: CARD, borderRadius: 14, padding: 20, border: "1px solid #2a3a4a" },
  payVal: { fontSize: 32, fontWeight: 700, color: TEXT, marginBottom: 4 },
  payLabel: { fontSize: 15, color: MUTED, marginBottom: 12 },
  payBar: { height: 8, background: "#111c2a", borderRadius: 4, overflow: "hidden", marginBottom: 6 },
  payBarFill: { height: "100%", borderRadius: 4, transition: "width 0.5s" },
  payPct: { fontSize: 13, color: MUTED },
  topList: { background: CARD, borderRadius: 14, padding: "16px 20px", border: "1px solid #2a3a4a", display: "flex", flexDirection: "column", gap: 14 },
  topRow: { display: "flex", alignItems: "center", gap: 12 },
  topRank: { color: GOLD, fontWeight: 700, fontSize: 16, minWidth: 28 },
  topName: { color: TEXT, fontSize: 14, minWidth: 140, flex: 1 },
  topBarWrap: { flex: 2, height: 8, background: "#111c2a", borderRadius: 4, overflow: "hidden" },
  topBar: { height: "100%", background: `linear-gradient(to left, ${GOLD}, #a07830)`, borderRadius: 4 },
  topCount: { color: MUTED, fontSize: 13, minWidth: 60, textAlign: "left" },
};
