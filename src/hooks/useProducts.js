// src/hooks/useProducts.js
import { useState, useEffect } from "react";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp, where, getDocs
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../config/firebase";

// جلب كل المنتجات realtime
export function useProducts(activeOnly = false) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    if (activeOnly) q = query(collection(db, "products"), where("isActive", "==", true), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [activeOnly]);

  return { products, loading };
}

// جلب الفئات
export function useCategories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);
  return categories;
}

// رفع صورة على Firebase Storage
export async function uploadImage(file, productId) {
  const ext = file.name.split(".").pop();
  const path = `products/${productId}/${Date.now()}.${ext}`;
  const r = ref(storage, path);
  await uploadBytes(r, file);
  return { url: await getDownloadURL(r), path };
}

// حذف صورة من Storage
export async function deleteImage(path) {
  try { await deleteObject(ref(storage, path)); } catch {}
}

// توليد باركود فريد
export function generateBarcode() {
  return "SHOP-" + Date.now() + "-" + Math.floor(Math.random() * 9000 + 1000);
}

// إضافة منتج
export async function addProduct(data) {
  return await addDoc(collection(db, "products"), {
    ...data,
    stock: Number(data.stock) || 0,
    price: Number(data.price) || 0,
    discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
    minStock: Number(data.minStock) || 3,
    images: [],
    isActive: true,
    barcodeGenerated: data.barcodeGenerated || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// تعديل منتج
export async function updateProduct(id, data) {
  await updateDoc(doc(db, "products", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// حذف منتج
export async function deleteProduct(id) {
  await deleteDoc(doc(db, "products", id));
}

// إضافة فئة
export async function addCategory(name, icon) {
  const q = query(collection(db, "categories"), where("name", "==", name));
  const ex = await getDocs(q);
  if (!ex.empty) throw new Error("الفئة دي موجودة بالفعل");
  return await addDoc(collection(db, "categories"), { name, icon: icon || "📦" });
}
