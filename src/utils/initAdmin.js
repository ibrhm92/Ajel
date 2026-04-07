// src/utils/initAdmin.js
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { hashPassword } from "./auth";

// إنشاء أول أدمن تلقائياً لو ما فيه مستخدمين
export async function initDefaultAdmin() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));

    // لو فيه مستخدمين بالفعل، ما نسوي شي
    if (!usersSnap.empty) return;

    // إنشاء أدمن افتراضي
    const passwordHash = await hashPassword("admin123");

    await addDoc(collection(db, "users"), {
      name: "أدمن",
      username: "admin",
      passwordHash,
      role: "admin",
      isActive: true,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: serverTimestamp(),
      lastLogin: null,
    });

    console.log("✅ تم إنشاء حساب الأدمن الافتراضي");
    console.log("👤 اسم المستخدم: admin");
    console.log("🔑 كلمة المرور: admin123");
  } catch (err) {
    console.error("❌ خطأ في إنشاء الأدمن الافتراضي:", err);
  }
}
