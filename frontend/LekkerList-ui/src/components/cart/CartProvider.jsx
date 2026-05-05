// Cart context provider
import { useState, useEffect } from "react";
import { CartContext } from "./CartContext";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const onFocus = () => {
      try {
        const stored = localStorage.getItem("cart");
        const parsed = stored ? JSON.parse(stored) : [];

        if (JSON.stringify(parsed) !== JSON.stringify(items)) {
          setItems(parsed);
        }
      } catch {
        setItems([]);
      }
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
    };
  }, [items]);

  // Persist to localStorage on every change
  const save = (next) => {
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  const addToCart = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      const next = existing
        ? prev.map((i) =>
            i._id === product._id ? { ...i, qty: i.qty + 1 } : i,
          )
        : [...prev, { ...product, qty: 1 }];
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  };

  const removeFromCart = (id) => save(items.filter((i) => i._id == id));
  const clearCart = () => {
    localStorage.removeItem("cart");
    setItems([]);
  };

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}
