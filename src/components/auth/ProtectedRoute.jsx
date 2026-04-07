// src/components/auth/ProtectedRoute.jsx
import { useAuthContext } from "../../context/AuthContext";
import LoginPage from "../../pages/LoginPage";

// حماية الصفحات - لو مش مسجل دخول يروح لصفحة اللوجن
export function ProtectedRoute({ children, adminOnly = false }) {
  const { session, loading } = useAuthContext();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0f1923",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#c9a84c",
        fontFamily: "'Cairo', sans-serif",
        fontSize: 18,
      }}>
        ⏳ جاري التحميل...
      </div>
    );
  }

  if (!session) return <LoginPage />;

  if (adminOnly && session.role !== "admin") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0f1923",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ff8888",
        fontFamily: "'Cairo', sans-serif",
        fontSize: 18,
        direction: "rtl",
      }}>
        🚫 مش عندك صلاحية للدخول على الصفحة دي
      </div>
    );
  }

  return children;
}
