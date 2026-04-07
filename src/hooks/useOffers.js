// src/hooks/useOffers.js
import { useState, useEffect } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, query, orderBy
} from "firebase/firestore";
import { db } from "../config/firebase";

export function useOffers() {
  const [offers, setOffers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "offers"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOffers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { offers, loading };
}

// إضافة / تعديل عرض على منتج
export async function setProductOffer(productId, productName, discountPercent, endDate) {
  const discountData = {
    productId, productName,
    discountPercent: Number(discountPercent),
    endDate,
    createdAt: serverTimestamp(),
  };

  // احسب السعر الجديد وحدّثه
  return await addDoc(collection(db, "offers"), discountData);
}

export async function deleteOffer(id) {
  await deleteDoc(doc(db, "offers", id));
}

export async function applyDiscount(productId, originalPrice, discountPercent) {
  const discountPrice = Math.round(originalPrice * (1 - discountPercent / 100));
  await updateDoc(doc(db, "products", productId), { discountPrice });
}

export async function removeDiscount(productId) {
  await updateDoc(doc(db, "products", productId), { discountPrice: null });
}
