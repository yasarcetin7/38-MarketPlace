"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Sepette tutacağımız ürün bilgileri
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

// Hafızanın yapabildiği işlemler
type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  decrementItem: (id: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Sayfa yüklendiğinde eski sepeti tarayıcıdan (localStorage) al
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem("shopping-cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Sepet yüklenirken hata oluştu");
      }
    }
  }, []);

  // Sepet her değiştiğinde tarayıcıya kaydet
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("shopping-cart", JSON.stringify(items));
    }
  }, [items, isMounted]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((i) => i.id === item.id);
      if (existingItem) {
        return currentItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
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
        i.id === id ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  // Sepetteki ürünlerin toplam fiyatını hesapla
  const cartTotal = items.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0
  );

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, cartTotal, decrementItem  }}>
      {children}
    </CartContext.Provider>
  );
}

// Diğer sayfalarda sepeti kolayca kullanmak için özel bir hook (kanca) oluşturuyoruz
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart, CartProvider içinde kullanılmalıdır");
  }
  return context;
}