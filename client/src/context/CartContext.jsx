import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ shopId: "", shopName: "", items: [] });

  const addItem = (shop, product) => {
    setCart((prev) => {
      if (prev.shopId && prev.shopId !== shop._id) {
        return {
          shopId: shop._id,
          shopName: shop.name,
          items: [{ productId: product._id, name: product.name, price: product.price, qty: 1 }],
        };
      }

      const found = prev.items.find((it) => it.productId === product._id);
      if (found) {
        return {
          ...prev,
          shopId: shop._id,
          shopName: shop.name,
          items: prev.items.map((it) =>
            it.productId === product._id ? { ...it, qty: it.qty + 1 } : it
          ),
        };
      }

      return {
        ...prev,
        shopId: shop._id,
        shopName: shop.name,
        items: [...prev.items, { productId: product._id, name: product.name, price: product.price, qty: 1 }],
      };
    });
  };

  const setQty = (productId, qty) => {
    const num = Number(qty);
    if (num <= 0) {
      setCart((prev) => ({ ...prev, items: prev.items.filter((it) => it.productId !== productId) }));
      return;
    }
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.productId === productId ? { ...it, qty: num } : it)),
    }));
  };

  const clearCart = () => setCart({ shopId: "", shopName: "", items: [] });
  const total = useMemo(() => cart.items.reduce((sum, it) => sum + it.price * it.qty, 0), [cart.items]);

  return (
    <CartContext.Provider value={{ cart, addItem, setQty, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
