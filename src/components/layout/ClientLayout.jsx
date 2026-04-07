// src/components/layout/ClientLayout.jsx
import { useState } from "react";
import { useCartContext } from "../../context/CartContext";

const NAV_LINKS = [
  { label: "الرئيسية", path: "/" },
  { label: "المنتجات", path: "/shop" },
];

export default function ClientLayout({ children, currentPath }) {
  const { totalItems } = useCartContext();
  const [menuOpen, setMenuOpen] = useState(false);

  function go(path) { window.location.pathname = path; }

  return (
    <div style={s.root}>
      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          {/* لوجو */}
          <button style={s.logo} onClick={() => go("/")}>
            <span style={s.logoIcon}>🏪</span>
            <span style={s.logoName}>متجر الأجهزة</span>
          </button>

          {/* روابط - ديسكتوب */}
          <div style={s.links}>
            {NAV_LINKS.map((l) => (
              <button key={l.path}
                style={{ ...s.link, ...(currentPath === l.path ? s.linkActive : {}) }}
                onClick={() => go(l.path)}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* السلة + موبايل */}
          <div style={s.navEnd}>
            <button style={s.cartBtn} onClick={() => go("/cart")}>
              🛒
              {totalItems > 0 && (
                <span style={s.cartBadge}>{totalItems}</span>
              )}
            </button>
            <button style={s.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          </div>
        </div>

        {/* موبايل منيو */}
        {menuOpen && (
          <div style={s.mobileMenu}>
            {NAV_LINKS.map((l) => (
              <button key={l.path} style={s.mobileLink} onClick={() => { go(l.path); setMenuOpen(false); }}>
                {l.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* محتوى */}
      <main style={s.main}>{children}</main>

      {/* Footer */}
      <footer style={s.footer}>
        <p style={s.footerText}>© 2025 متجر الأجهزة - جميع الحقوق محفوظة</p>
        <button style={s.adminLink} onClick={() => go("/admin")}>لوحة التحكم</button>
      </footer>
    </div>
  );
}

const GOLD = "#c9a84c"; const DARK = "#0f1923"; const NAV_BG = "#121d2a";
const TEXT = "#e8dcc8"; const MUTED = "#7a8a9a";

const s = {
  root: { minHeight: "100vh", background: DARK, fontFamily: "'Cairo','Tajawal',sans-serif", direction: "rtl", color: TEXT },
  nav: { background: NAV_BG, borderBottom: "1px solid #1e2d3d", position: "sticky", top: 0, zIndex: 50 },
  navInner: { maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", height: 60, gap: 24 },
  logo: { display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", textDecoration: "none" },
  logoIcon: { fontSize: 26 },
  logoName: { fontSize: 16, fontWeight: 700, color: TEXT, fontFamily: "inherit" },
  links: { display: "flex", gap: 4, flex: 1 },
  link: { background: "none", border: "none", color: MUTED, fontSize: 14, padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", transition: "color 0.15s" },
  linkActive: { color: GOLD, background: "#2a1e0a" },
  navEnd: { display: "flex", alignItems: "center", gap: 8 },
  cartBtn: { position: "relative", background: "#1a2535", border: "1px solid #2a3a4a", borderRadius: 10, padding: "8px 14px", fontSize: 18, cursor: "pointer", color: TEXT },
  cartBadge: { position: "absolute", top: -6, left: -6, background: GOLD, color: DARK, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 },
  menuBtn: { background: "none", border: "none", color: TEXT, fontSize: 20, cursor: "pointer", display: "none" },
  mobileMenu: { background: NAV_BG, borderTop: "1px solid #1e2d3d", padding: "10px 20px", display: "flex", flexDirection: "column", gap: 4 },
  mobileLink: { background: "none", border: "none", color: TEXT, fontSize: 15, padding: "10px 0", cursor: "pointer", fontFamily: "inherit", textAlign: "right", borderBottom: "1px solid #1e2d3d" },
  main: { maxWidth: 1100, margin: "0 auto", padding: "28px 20px", minHeight: "calc(100vh - 130px)" },
  footer: { background: NAV_BG, borderTop: "1px solid #1e2d3d", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  footerText: { color: MUTED, fontSize: 13, margin: 0 },
  adminLink: { background: "none", border: "none", color: MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" },
};
