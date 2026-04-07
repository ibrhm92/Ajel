// src/pages/admin/ProductsPage.jsx
import { useState } from "react";
import { useProducts, useCategories, deleteProduct } from "../../hooks/useProducts";
import ProductForm from "../../components/ProductForm";
import BarcodePrinter from "../../components/BarcodePrinter";

export default function ProductsPage() {
  const { products, loading } = useProducts();
  const categories = useCategories();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [selected, setSelected] = useState(null);
  const [printProduct, setPrintProduct] = useState(null);
  const [delConfirm, setDelConfirm] = useState(null);

  const filtered = products.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search);
    const matchCat = filterCat === "all" || p.category === filterCat;
    const matchStock =
      filterStock === "all" ? true :
      filterStock === "low" ? p.stock <= p.minStock && p.stock > 0 :
      filterStock === "out" ? p.stock === 0 : true;
    return matchSearch && matchCat && matchStock;
  });

  function stockStatus(p) {
    if (p.stock === 0) return { label: "نفد", color: "#ff6b6b", bg: "#3a1515" };
    if (p.stock <= p.minStock) return { label: "منخفض", color: "#ffa94d", bg: "#3a2a0a" };
    return { label: "متوفر", color: "#69db7c", bg: "#1a3a1a" };
  }

  async function handleDelete(id) {
    await deleteProduct(id);
    setDelConfirm(null);
  }

  const lowStockCount = products.filter((p) => p.stock <= p.minStock && p.stock > 0).length;
  const outCount = products.filter((p) => p.stock === 0).length;

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>📦 المنتجات</h2>
          <p style={s.sub}>{products.length} منتج إجمالي</p>
        </div>
        <button style={s.addBtn} onClick={() => { setSelected(null); setModal("add"); }}>+ منتج جديد</button>
      </div>

      {/* تنبيهات المخزن */}
      {(lowStockCount > 0 || outCount > 0) && (
        <div style={s.alerts}>
          {outCount > 0 && <div style={s.alertRed}>🔴 {outCount} منتج نفد من المخزن</div>}
          {lowStockCount > 0 && <div style={s.alertYellow}>🟡 {lowStockCount} منتج كميته منخفضة</div>}
        </div>
      )}

      {/* فلاتر */}
      <div style={s.filters}>
        <input style={s.searchInput} placeholder="🔍 ابحث بالاسم أو الباركود..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select style={s.select} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="all">كل الفئات</option>
          {categories.map((c) => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
        </select>
        <select style={s.select} value={filterStock} onChange={(e) => setFilterStock(e.target.value)}>
          <option value="all">كل المخزن</option>
          <option value="low">كمية منخفضة</option>
          <option value="out">نفد</option>
        </select>
      </div>

      {/* جدول المنتجات */}
      {loading ? (
        <div style={s.center}>⏳ جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div style={s.center}>لا توجد منتجات</div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>{["الصورة", "المنتج", "الفئة", "السعر", "المخزن", "الباركود", "الحالة", ""].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const st = stockStatus(p);
                return (
                  <tr key={p.id} style={s.tr}>
                    <td style={s.td}>
                      {p.images?.[0] ? (
                        <img src={p.images[0].url} alt="" style={s.thumb} />
                      ) : (
                        <div style={s.noImg}>📷</div>
                      )}
                    </td>
                    <td style={s.td}>
                      <div style={s.productName}>{p.name}</div>
                      {p.description && <div style={s.productDesc}>{p.description.slice(0, 40)}...</div>}
                    </td>
                    <td style={s.td}><span style={s.catBadge}>{p.category}</span></td>
                    <td style={s.td}>
                      {p.discountPrice ? (
                        <div>
                          <div style={s.oldPrice}>{p.price?.toLocaleString()} ج</div>
                          <div style={s.newPrice}>{p.discountPrice?.toLocaleString()} ج</div>
                        </div>
                      ) : (
                        <div style={s.price}>{p.price?.toLocaleString()} ج</div>
                      )}
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.stockBadge, color: st.color, background: st.bg }}>
                        {st.label} ({p.stock})
                      </span>
                    </td>
                    <td style={s.td}>
                      <code style={s.barcode}>{p.barcode}</code>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.activeBadge, ...(p.isActive ? s.activeOn : s.activeOff) }}>
                        {p.isActive ? "نشط" : "مخفي"}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        <button style={s.editBtn} onClick={() => { setSelected(p); setModal("edit"); }}>تعديل</button>
                        <button style={s.printBtn} onClick={() => setPrintProduct(p)}>🖨️</button>
                        <button style={s.delBtn} onClick={() => setDelConfirm(p)}>حذف</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal إضافة/تعديل */}
      {(modal === "add" || modal === "edit") && (
        <ProductForm
          product={selected}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={() => {}}
        />
      )}

      {/* طباعة باركود */}
      {printProduct && (
        <BarcodePrinter product={printProduct} onClose={() => setPrintProduct(null)} />
      )}

      {/* تأكيد الحذف */}
      {delConfirm && (
        <div style={s.overlay}>
          <div style={s.delModal}>
            <h3 style={s.delTitle}>🗑️ تأكيد الحذف</h3>
            <p style={s.delText}>هتحذف <strong style={{ color: "#ff8888" }}>{delConfirm.name}</strong>؟ مش هيتراجع.</p>
            <div style={s.delBtns}>
              <button style={s.cancelBtn} onClick={() => setDelConfirm(null)}>إلغاء</button>
              <button style={{ ...s.saveBtn, background: "#8B2020" }} onClick={() => handleDelete(delConfirm.id)}>حذف</button>
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
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  title: { margin: 0, fontSize: 22, color: TEXT },
  sub: { margin: "4px 0 0", fontSize: 13, color: MUTED },
  addBtn: { background: `linear-gradient(135deg,${GOLD},#a07830)`, color: DARK, border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  alerts: { display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" },
  alertRed: { background: "#3a1515", border: "1px solid #6a2020", color: "#ff8888", borderRadius: 8, padding: "8px 14px", fontSize: 13 },
  alertYellow: { background: "#3a2a0a", border: "1px solid #6a4a10", color: "#ffa94d", borderRadius: 8, padding: "8px 14px", fontSize: 13 },
  filters: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  searchInput: { flex: 2, minWidth: 200, background: INPUT_BG, border: "1.5px solid #2a3a4a", borderRadius: 8, color: TEXT, padding: "10px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" },
  select: { flex: 1, minWidth: 130, background: INPUT_BG, border: "1.5px solid #2a3a4a", borderRadius: 8, color: TEXT, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none" },
  center: { textAlign: "center", padding: 48, color: MUTED, fontSize: 15 },
  tableWrap: { overflowX: "auto", borderRadius: 12, border: "1px solid #2a3a4a" },
  table: { width: "100%", borderCollapse: "collapse", background: CARD },
  th: { padding: "12px 14px", textAlign: "right", fontSize: 12, color: MUTED, background: "#151f2e", borderBottom: "1px solid #2a3a4a", fontWeight: 600 },
  tr: { borderBottom: "1px solid #1e2d3d" },
  td: { padding: "12px 14px", fontSize: 13, verticalAlign: "middle" },
  thumb: { width: 48, height: 48, borderRadius: 8, objectFit: "cover" },
  noImg: { width: 48, height: 48, borderRadius: 8, background: INPUT_BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
  productName: { fontWeight: 600, color: TEXT, marginBottom: 2 },
  productDesc: { color: MUTED, fontSize: 11 },
  catBadge: { background: "#1a2a3a", color: "#6ab0ff", border: "1px solid #2a4a6a", borderRadius: 12, padding: "3px 10px", fontSize: 12 },
  oldPrice: { textDecoration: "line-through", color: MUTED, fontSize: 12 },
  newPrice: { color: "#ff6b6b", fontWeight: 700, fontSize: 14 },
  price: { color: TEXT, fontWeight: 600 },
  stockBadge: { borderRadius: 12, padding: "3px 10px", fontSize: 12, fontWeight: 600 },
  barcode: { background: INPUT_BG, padding: "3px 7px", borderRadius: 5, fontSize: 11, color: GOLD, fontFamily: "monospace" },
  activeBadge: { borderRadius: 12, padding: "3px 10px", fontSize: 12, fontWeight: 600 },
  activeOn: { background: "#1a3a1a", color: "#69db7c" },
  activeOff: { background: "#2a2a1a", color: MUTED },
  actions: { display: "flex", gap: 6 },
  editBtn: { background: "#1a2a4a", color: "#6ab0ff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  printBtn: { background: "#1a3a2a", color: "#69db7c", border: "none", borderRadius: 6, padding: "5px 8px", fontSize: 12, cursor: "pointer" },
  delBtn: { background: "#3a1515", color: "#ff8888", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  overlay: { position: "fixed", inset: 0, background: "#000000aa", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 },
  delModal: { background: CARD, borderRadius: 16, padding: 28, width: "100%", maxWidth: 380, border: "1px solid #2a3a4a" },
  delTitle: { margin: "0 0 12px", fontSize: 17, color: TEXT },
  delText: { color: TEXT, fontSize: 14, lineHeight: 1.7, marginBottom: 20 },
  delBtns: { display: "flex", gap: 12, justifyContent: "flex-end" },
  cancelBtn: { background: INPUT_BG, border: "1px solid #2a3a4a", color: TEXT, borderRadius: 8, padding: "9px 18px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  saveBtn: { background: `linear-gradient(135deg,${GOLD},#a07830)`, color: DARK, border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
};
