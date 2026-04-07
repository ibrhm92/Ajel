// src/App.jsx
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import ClientLayout from "./components/layout/ClientLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import ProductsPage from "./pages/admin/ProductsPage";
import StockPage from "./pages/admin/StockPage";
import OrdersPage from "./pages/admin/OrdersPage";
import OffersPage from "./pages/admin/OffersPage";
import ReportsPage from "./pages/admin/ReportsPage";
import UsersPage from "./pages/admin/UsersPage";
import HomePage from "./pages/client/HomePage";
import ShopPage from "./pages/client/ShopPage";
import ProductPage from "./pages/client/ProductPage";
import CartPage from "./pages/client/CartPage";

const ADMIN_ROUTES = {
  "/admin":          { component: DashboardPage },
  "/admin/products": { component: ProductsPage },
  "/admin/stock":    { component: StockPage },
  "/admin/orders":   { component: OrdersPage },
  "/admin/offers":   { component: OffersPage },
  "/admin/reports":  { component: ReportsPage },
  "/admin/users":    { component: UsersPage, adminOnly: true },
};

function AppRouter() {
  const path = window.location.pathname;

  // صفحات الأدمن
  if (path.startsWith("/admin")) {
    const route = ADMIN_ROUTES[path];
    if (!route) return (
      <div style={{ padding: 40, textAlign: "center", color: "#e8dcc8", fontFamily: "'Cairo',sans-serif", background: "#0f1923", minHeight: "100vh" }}>
        <div style={{ fontSize: 48 }}>404</div>
        <button onClick={() => window.location.pathname = "/admin"}
          style={{ marginTop: 16, background: "#c9a84c", color: "#0f1923", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
          الرئيسية
        </button>
      </div>
    );
    const PageComponent = route.component;
    return (
      <ProtectedRoute adminOnly={route.adminOnly}>
        <AdminLayout currentPath={path}>
          <PageComponent />
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  // صفحة منتج
  if (path.startsWith("/product/")) {
    const productId = path.replace("/product/", "");
    return (
      <ClientLayout currentPath={path}>
        <ProductPage productId={productId} />
      </ClientLayout>
    );
  }

  // صفحات العميل
  const clientPages = {
    "/":     <HomePage />,
    "/shop": <ShopPage />,
    "/cart": <CartPage />,
  };
  const page = clientPages[path];
  if (page) return <ClientLayout currentPath={path}>{page}</ClientLayout>;

  // 404
  return (
    <div style={{ padding: 40, textAlign: "center", color: "#e8dcc8", fontFamily: "'Cairo',sans-serif", background: "#0f1923", minHeight: "100vh" }}>
      <div style={{ fontSize: 64 }}>404</div>
      <div style={{ marginBottom: 20, color: "#7a8a9a" }}>الصفحة مش موجودة</div>
      <button onClick={() => window.location.pathname = "/"}
        style={{ background: "#c9a84c", color: "#0f1923", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
        الرئيسية
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  );
}
