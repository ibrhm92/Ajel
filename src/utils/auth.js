// src/utils/auth.js

// تشفير كلمة المرور بـ SHA-256 (بدون bcrypt عشان بيشتغل في المتصفح)
export async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// حفظ الجلسة في localStorage
export function saveSession(user) {
  const session = {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    loginTime: Date.now(),
  };
  localStorage.setItem("shop_session", JSON.stringify(session));
}

// جلب الجلسة الحالية
export function getSession() {
  try {
    const session = JSON.parse(localStorage.getItem("shop_session"));
    if (!session) return null;

    // انتهاء الجلسة بعد 8 ساعات
    const eightHours = 8 * 60 * 60 * 1000;
    if (Date.now() - session.loginTime > eightHours) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

// مسح الجلسة
export function clearSession() {
  localStorage.removeItem("shop_session");
}

// التحقق من صلاحية الأدمن
export function isAdmin(session) {
  return session?.role === "admin";
}
