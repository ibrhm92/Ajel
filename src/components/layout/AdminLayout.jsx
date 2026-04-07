// src/components/layout/AdminLayout.jsx
import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";

const NAV = [
  { icon: "📊", label: "الرئيسية", path: "/admin" },
  { icon: "📦", label: "المنتجات", path: "/admin/products" },
  { icon: "🏷️", label: "المخزن", path: "/admin/stock" },
  { icon: "🛒", label: "الطلبات", path: "/admin/orders", soon: true },
  { icon: "🎯", label: "العروض", path: "/admin/offers", soon: true },
  { icon: "📈", label: "التقارير", path: "/admin/reports", soon: true },
  { icon: "👥", label: "المستخدمين", path: "/admin/users", adminOnly: true },
];

export default function AdminLayout({ children, currentPath }) {
  const { session, logout } = useAuthContext();
  const [sideOpen, setSideOpen] = useState(false);

  function navigate(path) {
    window.location.pathname = path;
    setSideOpen(false);
  }

  const navItems = NAV.filter((n) => !n.adminOnly || session?.role === "admin");

  return (
    <div style={s.root}>
      {/* Overlay موبايل */}
      {sideOpen && <div style={s.mobileOverlay} onClick={() => setSideOpen(false)} />}

      {/* Sidebar */}
      <aside style={{ ...s.sidebar, ...(sideOpen ? s.sidebarOpen : {}) }}>
        {/* لوجو */}
        <div style={s.logo}>
          <span style={s.logoIcon}>🏪</span>
          <div>
            <div style={s.logoName}>متجر الأجهزة</div>
            <div style={s.logoRole}>{session?.role === "admin" ? "أدمن" : "موظف"}</div>
          </div>
        </div>

        <div style={s.divider} />

        {/* Navigation */}
        <nav style={s.nav}>
          {navItems.map((item) => {
            const active = currentPath === item.path;
            return (
              <button
                key={item.path}
                style={{ ...s.navItem, ...(active ? s.navActive : {}), ...(item.soon ? s.navSoon : {}) }}
                onClick={() => !item.soon && navigate(item.path)}
                disabled={item.soon}
              >
                <span style={s.navIcon}>{item.icon}</span>
                <span style={s.navLabel}>{item.label}</span>
                {item.soon && <span style={s.soonBadge}>قريباً</span>}
                {active && <div style={s.activeBar} />}
              </button>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div style={s.sideBottom}>
          <div style={s.userInfo}>
            <div style={s.avatar}>{session?.name?.[0] || "U"}</div>
            <div>
              <div style={s.userName}>{session?.name}</div>
              <div style={s.userUsername}>@{session?.username}</div>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={logout}>خروج</button>
        </div>
      </aside>

      {/* Main */}
      <div style={s.main}>
        {/* Topbar موبايل */}
        <div style={s.topbar}>
          <button style={s.menuBtn} onClick={() => setSideOpen(true)}>☰</button>
          <span style={s.topTitle}>{navItems.find((n) => n.path === currentPath)?.label || "لوحة التحكم"}</span>
          <div style={s.topUser}>{session?.name?.[0]}</div>
        </div>

        <div style={s.content}>{children}</div>
      </div>
    </div>
  );
}

const GOLD = "#c9a84c"; const DARK = "#0f1923"; const SIDEBAR = "#121d2a";
const TEXT = "#e8dcc8"; const MUTED = "#7a8a9a"; const ACTIVE_BG = "#1e3a2a";

const s = {
  root: { display: "flex", minHeight: "100vh", background: DARK, fontFamily: "'Cairo','Tajawal',sans-serif", direction: "rtl" },
  mobileOverlay: { position: "fixed", inset: 0, background: "#000000aa", zIndex: 49, display: "none", "@media(max-width:768px)": { display: "block" } },
  sidebar: {
    width: 240, background: SIDEBAR, display: "flex", flexDirection: "column",
    borderLeft: "1px solid #1e2d3d", position: "sticky", top: 0, height: "100vh",
    transition: "transform 0.25s",
    "@media(max-width:768px)": { position: "fixed", zIndex: 50, right: 0, top: 0, transform: "translateX(100%)" }
  },
  sidebarOpen: { transform: "translateX(0)" },
  logo: { display: "flex", alignItems: "center", gap: 12, padding: "20px 18px" },
  logoIcon: { fontSize: 30 },
  logoName: { fontSize: 14, fontWeight: 700, color: TEXT },
  logoRole: { fontSize: 11, color: GOLD, letterSpacing: 1 },
  divider: { height: 1, background: "#1e2d3d", margin: "0 16px" },
  nav: { flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 },
  navItem: {
    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
    borderRadius: 10, border: "none", background: "transparent", color: MUTED,
    cursor: "pointer", fontFamily: "inherit", fontSize: 14, width: "100%",
    textAlign: "right", position: "relative", transition: "background 0.15s, color 0.15s",
  },
  navActive: { background: ACTIVE_BG, color: TEXT },
  navSoon: { opacity: 0.4, cursor: "not-allowed" },
  navIcon: { fontSize: 18, minWidth: 24 },
  navLabel: { flex: 1 },
  soonBadge: { fontSize: 10, background: "#2a3a4a", color: MUTED, borderRadius: 8, padding: "2px 6px" },
  activeBar: { position: "absolute", right: 0, top: "20%", bottom: "20%", width: 3, background: GOLD, borderRadius: 3 },
  sideBottom: { padding: "12px 14px 20px", borderTop: "1px solid #1e2d3d" },
  userInfo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${GOLD},#a07830)`, display: "flex", alignItems: "center", justifyContent: "center", color: DARK, fontWeight: 700, fontSize: 16 },
  userName: { fontSize: 13, color: TEXT, fontWeight: 600 },
  userUsername: { fontSize: 11, color: MUTED },
  logoutBtn: { width: "100%", background: "#3a1515", color: "#ff8888", border: "none", borderRadius: 8, padding: "8px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  topbar: { display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid #1e2d3d", background: SIDEBAR },
  menuBtn: { background: "transparent", border: "none", color: TEXT, fontSize: 20, cursor: "pointer", padding: "2px 6px" },
  topTitle: { flex: 1, fontSize: 15, fontWeight: 700, color: TEXT },
  topUser: { width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${GOLD},#a07830)`, display: "flex", alignItems: "center", justifyContent: "center", color: DARK, fontWeight: 700, fontSize: 14 },
  content: { flex: 1 },
};
