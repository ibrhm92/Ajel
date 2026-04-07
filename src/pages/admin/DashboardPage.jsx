// src/pages/admin/DashboardPage.jsx
import { useProducts } from "../../hooks/useProducts";

export default function DashboardPage() {
  const { products } = useProducts();

  const totalProducts = products.length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const activeProducts = products.filter((p) => p.isActive).length;

  const stats = [
    { icon: "📦", label: "إجمالي المنتجات", value: totalProducts, color: "#6ab0ff", bg: "#1a2a4a" },
    { icon: "🟢", label: "منتجات نشطة", value: activeProducts, color: "#69db7c", bg: "#1a3a1a" },
    { icon: "🟡", label: "كمية منخفضة", value: lowStock, color: "#ffa94d", bg: "#3a2a0a" },
    { icon: "🔴", label: "نفد المخزون", value: outOfStock, color: "#ff6b6b", bg: "#3a1515" },
  ];

  const alerts = products.filter((p) => p.stock <= p.minStock).sort((a, b) => a.stock - b.stock);

  return (
    <div style={s.root}>
      <h2 style={s.title}>👋 أهلاً، كل حاجة تمام؟</h2>

      {/* Stats */}
      <div style={s.statsGrid}>
        {stats.map((st) => (
          <div key={st.label} style={{ ...s.statCard, background: st.bg, border: `1px solid ${st.color}22` }}>
            <div style={s.statIcon}>{st.icon}</div>
            <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
            <div style={s.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* تنبيهات المخزن */}
      {alerts.length > 0 && (
        <div style={s.section}>
          <h3 style={s.sectionTitle}>⚠️ تنبيهات المخزن</h3>
          <div style={s.alertsList}>
            {alerts.slice(0, 8).map((p) => (
              <div key={p.id} style={s.alertRow}>
                <span style={s.alertName}>{p.name}</span>
                <span style={{
                  ...s.alertStock,
                  color: p.stock === 0 ? "#ff6b6b" : "#ffa94d",
                  background: p.stock === 0 ? "#3a1515" : "#3a2a0a",
                }}>
                  {p.stock === 0 ? "نفد" : `${p.stock} قطعة`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* روابط سريعة */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>⚡ وصول سريع</h3>
        <div style={s.quickGrid}>
          {[
            { icon: "➕", label: "منتج جديد", path: "/admin/products" },
            { icon: "🏷️", label: "تحديث المخزن", path: "/admin/stock" },
            { icon: "👥", label: "المستخدمين", path: "/admin/users" },
          ].map((q) => (
            <button key={q.label} style={s.quickBtn} onClick={() => window.location.pathname = q.path}>
              <span style={s.quickIcon}>{q.icon}</span>
              <span style={s.quickLabel}>{q.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const GOLD = "#c9a84c"; const DARK = "#0f1923";
const TEXT = "#e8dcc8"; const MUTED = "#7a8a9a";

const s = {
  root: { padding: 24, color: TEXT, fontFamily: "'Cairo','Tajawal',sans-serif", direction: "rtl" },
  title: { margin: "0 0 24px", fontSize: 20, color: TEXT },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 28 },
  statCard: { borderRadius: 14, padding: "20px 16px", textAlign: "center" },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 32, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 12, color: MUTED, marginTop: 6 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 15, color: TEXT, fontWeight: 700, marginBottom: 14 },
  alertsList: { background: "#1a2535", borderRadius: 12, border: "1px solid #2a3a4a", overflow: "hidden" },
  alertRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #1e2d3d" },
  alertName: { fontSize: 14, color: TEXT },
  alertStock: { borderRadius: 12, padding: "4px 12px", fontSize: 12, fontWeight: 600 },
  quickGrid: { display: "flex", gap: 12, flexWrap: "wrap" },
  quickBtn: { display: "flex", alignItems: "center", gap: 8, background: "#1a2535", border: "1px solid #2a3a4a", borderRadius: 10, padding: "12px 18px", cursor: "pointer", fontFamily: "inherit", color: TEXT, fontSize: 14 },
  quickIcon: { fontSize: 20 },
  quickLabel: { fontWeight: 600 },
};
