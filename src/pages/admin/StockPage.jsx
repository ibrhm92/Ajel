// src/pages/admin/StockPage.jsx
import { useState } from "react";
import { useProducts, useCategories } from "../../hooks/useProducts";
import { useStockMovements } from "../../hooks/useStock";
import StockMovementModal from "../../components/StockMovementModal";
import BarcodeScanner from "../../components/BarcodeScanner";

const TYPE_CONFIG = {
  in:         { label: "إضافة",   color: "#69db7c", icon: "📥" },
  out:        { label: "صرف",     color: "#ff6b6b", icon: "📤" },
  adjustment: { label: "تعديل",   color: "#ffa94d", icon: "⚙️" },
};

function StockBadge({ stock, minStock }) {
  if (stock === 0)           return <span style={{ ...badge, color: "#ff6b6b", background: "#3a1515" }}>🔴 نفد</span>;
  if (stock <= minStock)     return <span style={{ ...badge, color: "#ffa94d", background: "#3a2a0a" }}>🟡 منخفض</span>;
  return                            <span style={{ ...badge, color: "#69db7c", background: "#1a3a1a" }}>🟢 متوفر</span>;
}
const badge = { borderRadius: 12, padding: "3px 10px", fontSize: 12, fontWeight: 600 };

export default function StockPage() {
  const { products, loading: pLoading } = useProducts();
  const categories = useCategories();
  const { movements, loading: mLoading } = useStockMovements();

  const [tab, setTab] = useState("inventory"); // inventory | history
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [movModal, setMovModal] = useState(null); // product | null
  const [showScanner, setShowScanner] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("all");

  // فلترة المنتجات
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search);
    const matchCat = filterCat === "all" || p.category === filterCat;
    const matchStatus =
      filterStatus === "all" ? true :
      filterStatus === "out" ? p.stock === 0 :
      filterStatus === "low" ? p.stock > 0 && p.stock <= p.minStock :
      filterStatus === "ok"  ? p.stock > p.minStock : true;
    return matchSearch && matchCat && matchStatus;
  });

  // فلترة السجل
  const filteredMovements = movements.filter((m) =>
    historyFilter === "all" ? true : m.type === historyFilter
  );

  // إحصائيات سريعة
  const outCount  = products.filter((p) => p.stock === 0).length;
  const lowCount  = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const okCount   = products.filter((p) => p.stock > p.minStock).length;
  const totalQty  = products.reduce((s, p) => s + (p.stock || 0), 0);

  // مسح باركود للبحث السريع
  function handleBarcodeScan(code) {
    setShowScanner(false);
    setSearch(code);
    setTab("inventory");
  }

  function formatDate(ts) {
    if (!ts) return "-";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("ar-EG") + " - " + d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>🏷️ إدارة المخزن</h2>
          <p style={s.sub}>{products.length} منتج - {totalQty} قطعة إجمالي</p>
        </div>
        <button style={s.scanBtn} onClick={() => setShowScanner(true)}>📷 مسح باركود</button>
      </div>

      {/* إحصائيات */}
      <div style={s.statsRow}>
        {[
          { label: "متوفر",      value: okCount,  color: "#69db7c", bg: "#1a3a1a" },
          { label: "منخفض",      value: lowCount, color: "#ffa94d", bg: "#3a2a0a" },
          { label: "نفد",        value: outCount, color: "#ff6b6b", bg: "#3a1515" },
          { label: "إجمالي قطع", value: totalQty, color: "#6ab0ff", bg: "#1a2a4a" },
        ].map((st) => (
          <div key={st.label} style={{ ...s.statCard, background: st.bg }}>
            <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
            <div style={s.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {[
          { key: "inventory", label: "📦 المخزون الحالي" },
          { key: "history",   label: "📋 سجل الحركات" },
        ].map((t) => (
          <button key={t.key}
            style={{ ...s.tab, ...(tab === t.key ? s.tabActive : {}) }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ======= TAB: المخزون ======= */}
      {tab === "inventory" && (
        <>
          {/* فلاتر */}
          <div style={s.filters}>
            <input style={s.searchInput}
              placeholder="🔍 اسم أو باركود..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
            <select style={s.select} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
              <option value="all">كل الفئات</option>
              {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select style={s.select} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">كل الحالات</option>
              <option value="ok">🟢 متوفر</option>
              <option value="low">🟡 منخفض</option>
              <option value="out">🔴 نفد</option>
            </select>
          </div>

          {pLoading ? (
            <div style={s.center}>⏳ جاري التحميل...</div>
          ) : filteredProducts.length === 0 ? (
            <div style={s.center}>لا توجد منتجات</div>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["المنتج", "الفئة", "الكمية", "حد التنبيه", "الحالة", "الباركود", ""].map((h) => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} style={s.tr}>
                      <td style={s.td}>
                        <div style={s.productName}>{p.name}</div>
                        <div style={s.productPrice}>{p.price?.toLocaleString()} ج</div>
                      </td>
                      <td style={s.td}><span style={s.catBadge}>{p.category}</span></td>
                      <td style={s.td}>
                        <span style={{
                          fontSize: 20, fontWeight: 700,
                          color: p.stock === 0 ? "#ff6b6b" : p.stock <= p.minStock ? "#ffa94d" : "#69db7c"
                        }}>
                          {p.stock}
                        </span>
                      </td>
                      <td style={s.td}><span style={s.minStock}>{p.minStock}</span></td>
                      <td style={s.td}><StockBadge stock={p.stock} minStock={p.minStock} /></td>
                      <td style={s.td}><code style={s.barcode}>{p.barcode}</code></td>
                      <td style={s.td}>
                        <button style={s.updateBtn} onClick={() => setMovModal(p)}>
                          تحديث المخزن
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ======= TAB: السجل ======= */}
      {tab === "history" && (
        <>
          <div style={s.filters}>
            <select style={s.select} value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)}>
              <option value="all">كل الحركات</option>
              <option value="in">📥 إضافة</option>
              <option value="out">📤 صرف</option>
              <option value="adjustment">⚙️ تعديل</option>
            </select>
          </div>

          {mLoading ? (
            <div style={s.center}>⏳ جاري التحميل...</div>
          ) : filteredMovements.length === 0 ? (
            <div style={s.center}>لا توجد حركات بعد</div>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["النوع", "المنتج", "الكمية", "قبل", "بعد", "السبب", "ملاحظة", "التاريخ"].map((h) => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((m) => {
                    const tc = TYPE_CONFIG[m.type] || TYPE_CONFIG.adjustment;
                    return (
                      <tr key={m.id} style={s.tr}>
                        <td style={s.td}>
                          <span style={{ ...s.typeBadge, color: tc.color, background: tc.color + "22" }}>
                            {tc.icon} {tc.label}
                          </span>
                        </td>
                        <td style={s.td}><div style={s.productName}>{m.productName}</div></td>
                        <td style={s.td}>
                          <span style={{ fontWeight: 700, color: tc.color, fontSize: 16 }}>
                            {m.type === "adjustment" ? m.quantity : (m.type === "in" ? "+" : "-") + m.quantity}
                          </span>
                        </td>
                        <td style={s.td}><span style={s.prevStock}>{m.previousStock ?? "-"}</span></td>
                        <td style={s.td}><span style={{ color: tc.color, fontWeight: 600 }}>{m.newStock ?? "-"}</span></td>
                        <td style={s.td}><span style={s.reason}>{m.reason}</span></td>
                        <td style={s.td}><span style={s.note}>{m.note || "-"}</span></td>
                        <td style={s.td}><span style={s.date}>{formatDate(m.date)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal تحديث المخزن */}
      {movModal && (
        <StockMovementModal
          product={movModal}
          onClose={() => setMovModal(null)}
          onDone={() => setMovModal(null)}
        />
      )}

      {/* Scanner */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

const GOLD = "#c9a84c"; const DARK = "#0f1923"; const CARD = "#1a2535";
const TEXT = "#e8dcc8"; const MUTED = "#7a8a9a"; const INPUT_BG = "#111c2a";

const s = {
  root: { padding: 24, fontFamily: "'Cairo','Tajawal',sans-serif", direction: "rtl", color: TEXT, minHeight: "100vh", background: DARK },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  title: { margin: 0, fontSize: 22, color: TEXT },
  sub: { margin: "4px 0 0", fontSize: 13, color: MUTED },
  scanBtn: { background: "#1a2a4a", color: "#6ab0ff", border: "1px solid #2a4a6a", borderRadius: 8, padding: "10px 18px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, marginBottom: 24 },
  statCard: { borderRadius: 12, padding: "16px 12px", textAlign: "center" },
  statValue: { fontSize: 28, fontWeight: 700 },
  statLabel: { fontSize: 12, color: MUTED, marginTop: 4 },
  tabs: { display: "flex", gap: 4, marginBottom: 20, background: INPUT_BG, borderRadius: 10, padding: 4, width: "fit-content" },
  tab: { background: "transparent", border: "none", color: MUTED, borderRadius: 8, padding: "8px 18px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  tabActive: { background: CARD, color: TEXT, fontWeight: 600 },
  filters: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  searchInput: { flex: 2, minWidth: 180, background: INPUT_BG, border: "1.5px solid #2a3a4a", borderRadius: 8, color: TEXT, padding: "10px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" },
  select: { flex: 1, minWidth: 130, background: INPUT_BG, border: "1.5px solid #2a3a4a", borderRadius: 8, color: TEXT, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none" },
  center: { textAlign: "center", padding: 48, color: MUTED, fontSize: 15 },
  tableWrap: { overflowX: "auto", borderRadius: 12, border: "1px solid #2a3a4a" },
  table: { width: "100%", borderCollapse: "collapse", background: CARD },
  th: { padding: "12px 14px", textAlign: "right", fontSize: 12, color: MUTED, background: "#151f2e", borderBottom: "1px solid #2a3a4a", fontWeight: 600 },
  tr: { borderBottom: "1px solid #1e2d3d" },
  td: { padding: "12px 14px", fontSize: 13, verticalAlign: "middle" },
  productName: { fontWeight: 600, color: TEXT },
  productPrice: { color: MUTED, fontSize: 12, marginTop: 2 },
  catBadge: { background: "#1a2a3a", color: "#6ab0ff", borderRadius: 12, padding: "3px 10px", fontSize: 12 },
  minStock: { color: MUTED, fontWeight: 600 },
  barcode: { background: INPUT_BG, padding: "3px 7px", borderRadius: 5, fontSize: 11, color: GOLD, fontFamily: "monospace" },
  updateBtn: { background: `linear-gradient(135deg,${GOLD},#a07830)`, color: DARK, border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
  typeBadge: { borderRadius: 12, padding: "4px 10px", fontSize: 12, fontWeight: 600 },
  prevStock: { color: MUTED, fontWeight: 600 },
  reason: { color: TEXT, fontSize: 12 },
  note: { color: MUTED, fontSize: 12, fontStyle: "italic" },
  date: { color: MUTED, fontSize: 11, whiteSpace: "nowrap" },
};
