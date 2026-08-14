"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  imageUrl?: string;
  stripePriceId: string;
  stripeProductId: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  decrementItem: (id: string) => void;
};

const initialContext: CartContextType = {
  items: [],
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
  cartTotal: 0,
  decrementItem: () => {},
};

const CartContext = createContext<CartContextType>(initialContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("shopping-cart");
      if (savedCart) {
        try {
          return JSON.parse(savedCart);
        } catch (error) {
          console.error("Sepet yüklenirken hata oluştu");
        }
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("shopping-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((i) => i.id === item.id);
      if (existingItem) {
        return currentItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...currentItems, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((i) => i.id !== id));
  };

  const clearCart = () => setItems([]);

  const decrementItem = (id: string) => {
    setItems((currentItems) => {
      const existing = currentItems.find((i) => i.id === id);
      if (!existing) return currentItems;
      if (existing.quantity <= 1) {
        return currentItems.filter((i) => i.id !== id);
      }
      return currentItems.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity - 1 } : i,
      );
    });
  };

  const cartTotal = items.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        cartTotal,
        decrementItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
