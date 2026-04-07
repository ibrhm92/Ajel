// src/hooks/useOrders.js
import { useState, useEffect } from "react";
import {
  collection, query, orderBy, onSnapshot,
  updateDoc, doc, serverTimestamp, limit
} from "firebase/firestore";
import { db } from "../config/firebase";

export const ORDER_STATUS = {
  new:       { label: "جديد",        color: "#6ab0ff", bg: "#1a2a4a", icon: "🆕" },
  contacted: { label: "تم التواصل",  color: "#ffa94d", bg: "#3a2a0a", icon: "📞" },
  done:      { label: "مكتمل",       color: "#69db7c", bg: "#1a3a1a", icon: "✅" },
  cancelled: { label: "ملغي",        color: "#ff6b6b", bg: "#3a1515", icon: "❌" },
};

export function useOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      limit(200)
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { orders, loading };
}

export async function updateOrderStatus(id, status) {
  await updateDoc(doc(db, "orders", id), {
    status,
    updatedAt: serverTimestamp(),
  });
}
