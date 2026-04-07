// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { hashPassword, saveSession, getSession, clearSession } from "../utils/auth";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    setLoading(false);
  }, []);

  // تسجيل الدخول
  const login = useCallback(async (username, password) => {
    const hashed = await hashPassword(password);
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("username", "==", username.trim()),
      where("passwordHash", "==", hashed),
      where("isActive", "==", true)
    );

    const snap = await getDocs(q);
    if (snap.empty) throw new Error("اسم المستخدم أو كلمة المرور غلط");

    const userDoc = snap.docs[0];
    const userData = userDoc.data();

    // التحقق من القفل
    if (userData.lockedUntil && userData.lockedUntil.toDate() > new Date()) {
      throw new Error("الحساب مقفول مؤقتاً، حاول بعد شوية");
    }

    // تحديث آخر دخول وإعادة عداد المحاولات
    await updateDoc(doc(db, "users", userDoc.id), {
      lastLogin: serverTimestamp(),
      failedAttempts: 0,
      lockedUntil: null,
    });

    const user = { id: userDoc.id, ...userData };
    saveSession(user);
    setSession(user);
    return user;
  }, []);

  // تسجيل الخروج
  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  return { session, loading, login, logout };
}

// ====== إدارة المستخدمين (للأدمن فقط) ======

// جلب كل المستخدمين
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// إضافة موظف جديد
export async function addUser({ name, username, password, role }) {
  // التحقق إن اليوزرنيم مش موجود
  const q = query(collection(db, "users"), where("username", "==", username));
  const existing = await getDocs(q);
  if (!existing.empty) throw new Error("اسم المستخدم ده موجود بالفعل");

  const passwordHash = await hashPassword(password);
  return await addDoc(collection(db, "users"), {
    name,
    username,
    passwordHash,
    role: role || "employee",
    isActive: true,
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: serverTimestamp(),
    lastLogin: null,
  });
}

// تعديل بيانات موظف
export async function updateUser(id, data) {
  const updates = { ...data };
  if (data.password) {
    updates.passwordHash = await hashPassword(data.password);
    delete updates.password;
  }
  await updateDoc(doc(db, "users", id), updates);
}

// تفعيل / تعطيل حساب
export async function toggleUserStatus(id, isActive) {
  await updateDoc(doc(db, "users", id), { isActive });
}

// حذف مستخدم
export async function deleteUser(id) {
  await deleteDoc(doc(db, "users", id));
}
