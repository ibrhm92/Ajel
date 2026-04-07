// src/hooks/useCart.js
import { useState, useEffect } from "react";

const CART_KEY = "shop_cart";

export function useCart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY)) || [];
      setCart(saved);
    } catch { setCart([]); }
  }, []);

  function save(items) {
    setCart(items);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      let updated;
      if (existing) {
        updated = prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        updated = [...prev, {
          id: product.id,
          name: product.name,
          price: product.discountPrice || product.price,
          originalPrice: product.price,
          image: product.images?.[0]?.url || null,
          qty: 1,
          stock: product.stock,
        }];
      }
      localStorage.setItem(CART_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  function removeFromCart(id) {
    const updated = cart.filter((i) => i.id !== id);
    save(updated);
  }

  function updateQty(id, qty) {
    if (qty < 1) { removeFromCart(id); return; }
    const updated = cart.map((i) => i.id === id ? { ...i, qty } : i);
    save(updated);
  }

  function clearCart() { save([]); }

  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  return { cart, addToCart, removeFromCart, updateQty, clearCart, totalPrice, totalItems };
}

// حاسبة القسط
export function calcInstallment({ price, downPayment, months, interestRate = 0 }) {
  const remaining = price - downPayment;
  if (remaining <= 0) return 0;
  const total = remaining * (1 + interestRate / 100);
  return Math.ceil(total / months);
}
