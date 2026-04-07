// src/pages/admin/UsersPage.jsx
import { useState, useEffect } from "react";
import {
  getAllUsers,
  addUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
} from "../../hooks/useAuth";
import { useAuthContext } from "../../context/AuthContext";

const ROLES = { admin: "أدمن", employee: "موظف" };

export default function UsersPage() {
  const { session } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "employee" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm({ name: "", username: "", password: "", role: "employee" });
    setFormError("");
    setModal("add");
  }

  function openEdit(user) {
    setSelected(user);
    setForm({ name: user.name, username: user.username, password: "", role: user.role });
    setFormError("");
    setModal("edit");
  }

  function openDelete(user) {
    setSelected(user);
    setModal("delete");
  }

  async function handleSave() {
    if (!form.name || !form.username) { setFormError("ادخل الاسم واليوزر"); return; }
    if (modal === "add" && !form.password) { setFormError("ادخل كلمة المرور"); return; }
    setSaving(true);
    setFormError("");
    try {
      if (modal === "add") {
        await addUser(form);
      } else {
        await updateUser(selected.id, form);
      }
      await load();
      setModal(null);
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(user) {
    await toggleUserStatus(user.id, !user.isActive);
    await load();
  }

  async function handleDelete() {
    if (selected.id === session.id) { alert("مش قادر تحذف حسابك الحالي"); return; }
    setSaving(true);
    await deleteUser(selected.id);
    await load();
    setModal(null);
    setSaving(false);
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>👥 إدارة المستخدمين</h2>
          <p style={s.sub}>الأدمن فقط يقدر يشوف الصفحة دي</p>
        </div>
        <button style={s.addBtn} onClick={openAdd}>+ إضافة موظف</button>
      </div>

      {loading ? (
        <div style={s.center}>⏳ جاري التحميل...</div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {["الاسم", "اليوزر", "الدور", "آخر دخول", "الحالة", ""].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={s.tr}>
                  <td style={s.td}><span style={s.name}>{u.name}</span></td>
                  <td style={s.td}><code style={s.code}>{u.username}</code></td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...(u.role === "admin" ? s.badgeAdmin : s.badgeEmp) }}>
                      {ROLES[u.role]}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={s.muted}>
                      {u.lastLogin ? new Date(u.lastLogin.toDate()).toLocaleDateString("ar-EG") : "لم يدخل بعد"}
                    </span>
                  </td>
                  <td style={s.td}>
                    <button
                      style={{ ...s.statusBtn, ...(u.isActive ? s.statusOn : s.statusOff) }}
                      onClick={() => handleToggle(u)}
                      disabled={u.id === session.id}
                    >
                      {u.isActive ? "🟢 نشط" : "🔴 معطل"}
                    </button>
                  </td>
                  <td style={s.td}>
                    <div style={s.actions}>
                      <button style={s.editBtn} onClick={() => openEdit(u)}>تعديل</button>
                      {u.id !== session.id && (
                        <button style={s.delBtn} onClick={() => openDelete(u)}>حذف</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal إضافة / تعديل */}
      {(modal === "add" || modal === "edit") && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>{modal === "add" ? "➕ إضافة موظف جديد" : "✏️ تعديل بيانات"}</h3>

            <Field label="الاسم الكامل" value={form.name}
              onChange={(v) => setForm({ ...form, name: v })} placeholder="مثال: محمد أحمد" />
            <Field label="اسم المستخدم" value={form.username}
              onChange={(v) => setForm({ ...form, username: v })} placeholder="بالإنجليزي بدون مسافات"
              dir="ltr" disabled={modal === "edit"} />
            <Field label={modal === "add" ? "كلمة المرور" : "كلمة المرور الجديدة (اتركها فاضية لو مش هتغيرها)"}
              value={form.password} onChange={(v) => setForm({ ...form, password: v })}
              type="password" dir="ltr" />

            <div style={s.fieldWrap}>
              <label style={s.label}>الدور</label>
              <select style={s.select} value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="employee">موظف</option>
                <option value="admin">أدمن</option>
              </select>
            </div>

            {formError && <div style={s.error}>⚠️ {formError}</div>}

            <div style={s.modalBtns}>
              <button style={s.cancelBtn} onClick={() => setModal(null)}>إلغاء</button>
              <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal حذف */}
      {modal === "delete" && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>🗑️ تأكيد الحذف</h3>
            <p style={s.delConfirm}>
              هتحذف حساب <strong style={{ color: "#ff8888" }}>{selected?.name}</strong>؟
              <br />الحذف مش هيتراجع عنه.
            </p>
            <div style={s.modalBtns}>
              <button style={s.cancelBtn} onClick={() => setModal(null)}>إلغاء</button>
              <button style={{ ...s.saveBtn, background: "#8B2020" }} onClick={handleDelete} disabled={saving}>
                {saving ? "جاري الحذف..." : "حذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", dir, disabled }) {
  return (
    <div style={s.fieldWrap}>
      <label style={s.label}>{label}</label>
      <input style={{ ...s.input, ...(disabled ? s.inputDisabled : {}) }}
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        dir={dir} disabled={disabled} />
    </div>
  );
}

const DARK = "#0f1923"; const CARD = "#1a2535"; const GOLD = "#c9a84c";
const TEXT = "#e8dcc8"; const MUTED = "#7a8a9a"; const INPUT_BG = "#111c2a";

const s = {
  root: { padding: 24, fontFamily: "'Cairo','Tajawal',sans-serif", direction: "rtl", color: TEXT, minHeight: "100vh", background: DARK },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 },
  title: { margin: 0, fontSize: 22, color: TEXT },
  sub: { margin: "4px 0 0", fontSize: 13, color: MUTED },
  addBtn: { background: `linear-gradient(135deg,${GOLD},#a07830)`, color: DARK, border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  center: { textAlign: "center", padding: 40, color: MUTED },
  tableWrap: { overflowX: "auto", borderRadius: 12, border: `1px solid #2a3a4a` },
  table: { width: "100%", borderCollapse: "collapse", background: CARD },
  th: { padding: "14px 16px", textAlign: "right", fontSize: 13, color: MUTED, borderBottom: `1px solid #2a3a4a`, background: "#151f2e", fontWeight: 600 },
  tr: { borderBottom: `1px solid #1e2d3d` },
  td: { padding: "14px 16px", fontSize: 14 },
  name: { fontWeight: 600, color: TEXT },
  code: { background: INPUT_BG, padding: "3px 8px", borderRadius: 6, fontSize: 13, color: GOLD, fontFamily: "monospace" },
  badge: { padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
  badgeAdmin: { background: "#2a1a0a", color: GOLD, border: `1px solid ${GOLD}44` },
  badgeEmp: { background: "#1a2a1a", color: "#6db86d", border: "1px solid #6db86d44" },
  muted: { color: MUTED, fontSize: 13 },
  statusBtn: { border: "none", borderRadius: 20, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 },
  statusOn: { background: "#1a3a1a", color: "#6db86d" },
  statusOff: { background: "#3a1515", color: "#ff8888" },
  actions: { display: "flex", gap: 8 },
  editBtn: { background: "#1a2a4a", color: "#6ab0ff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  delBtn: { background: "#3a1515", color: "#ff8888", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  overlay: { position: "fixed", inset: 0, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 },
  modal: { background: CARD, borderRadius: 16, padding: 28, width: "100%", maxWidth: 420, border: `1px solid #2a3a4a` },
  modalTitle: { margin: "0 0 20px", fontSize: 18, color: TEXT },
  fieldWrap: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, color: MUTED, marginBottom: 6 },
  input: { width: "100%", background: INPUT_BG, border: "1.5px solid #2a3a4a", borderRadius: 8, color: TEXT, padding: "11px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  inputDisabled: { opacity: 0.5, cursor: "not-allowed" },
  select: { width: "100%", background: INPUT_BG, border: "1.5px solid #2a3a4a", borderRadius: 8, color: TEXT, padding: "11px 12px", fontSize: 14, fontFamily: "inherit", outline: "none" },
  error: { background: "#3a1515", border: "1px solid #6a2020", borderRadius: 8, padding: "10px 14px", color: "#ff8888", fontSize: 13, marginBottom: 16 },
  modalBtns: { display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 },
  cancelBtn: { background: "#1a2535", border: "1px solid #2a3a4a", color: TEXT, borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  saveBtn: { background: `linear-gradient(135deg,${GOLD},#a07830)`, color: DARK, border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  delConfirm: { color: TEXT, fontSize: 15, lineHeight: 1.8, marginBottom: 20 },
};
