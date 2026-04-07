// src/hooks/useStock.js
import { useState, useEffect } from "react";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp,
  where, getDocs, limit
} from "firebase/firestore";
import { db } from "../config/firebase";

// جلب كل حركات المخزن مع فلتر اختياري
export function useStockMovements(productId = null) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(
      collection(db, "stockMovements"),
      orderBy("date", "desc"),
      limit(200)
    );
    if (productId) {
      q = query(
        collection(db, "stockMovements"),
        where("productId", "==", productId),
        orderBy("date", "desc")
      );
    }
    const unsub = onSnapshot(q, (snap) => {
      setMovements(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [productId]);

  return { movements, loading };
}

// إضافة حركة مخزن + تحديث الكمية تلقائياً
export async function addStockMovement({ productId, productName, type, quantity, reason, note }) {
  const qty = Number(quantity);
  if (!qty || qty <= 0) throw new Error("الكمية لازم تكون أكبر من صفر");

  // جلب الكمية الحالية
  const productRef = doc(db, "products", productId);
  const productSnap = await getDocs(
    query(collection(db, "products"), where("__name__", "==", productId))
  );

  let currentStock = 0;
  if (!productSnap.empty) currentStock = productSnap.docs[0].data().stock || 0;

  // حساب الكمية الجديدة
  let newStock;
  if (type === "in") newStock = currentStock + qty;
  else if (type === "out") {
    if (qty > currentStock) throw new Error(`الكمية المطلوبة (${qty}) أكبر من المتوفر (${currentStock})`);
    newStock = currentStock - qty;
  } else if (type === "adjustment") {
    newStock = qty; // تعديل مباشر للكمية
  }

  // تسجيل الحركة
  await addDoc(collection(db, "stockMovements"), {
    productId,
    productName,
    type,
    quantity: qty,
    previousStock: currentStock,
    newStock,
    reason,
    note: note || "",
    date: serverTimestamp(),
  });

  // تحديث المنتج
  await updateDoc(productRef, {
    stock: newStock,
    updatedAt: serverTimestamp(),
  });

  return newStock;
}

// جلب آخر حركة لكل منتج (للسريع)
export async function getLastMovement(productId) {
  const q = query(
    collection(db, "stockMovements"),
    where("productId", "==", productId),
    orderBy("date", "desc"),
    limit(1)
  );
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}
