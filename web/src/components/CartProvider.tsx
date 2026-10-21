"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProduct } from "@/lib/products";

export type CartLine = { slug: string; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "veloura-cart";
export const MAX_QUANTITY = 10;

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  // The bag lives in this browser only; it is re-checked against the catalogue on load
  // so removed products don't linger.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as CartLine[];
      setLines(saved.filter((l) => getProduct(l.slug) && l.quantity > 0));
    } catch {
      setLines([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage can be blocked (private mode); the bag still works for this visit.
    }
  }, [lines, ready]);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setLines((prev) => {
      const q = Math.max(0, Math.min(MAX_QUANTITY, quantity));
      if (q === 0) return prev.filter((l) => l.slug !== slug);
      return prev.some((l) => l.slug === slug)
        ? prev.map((l) => (l.slug === slug ? { ...l, quantity: q } : l))
        : [...prev, { slug, quantity: q }];
    });
  }, []);

  const add = useCallback((slug: string, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.slug === slug);
      const q = Math.min(MAX_QUANTITY, (existing?.quantity ?? 0) + quantity);
      return existing ? prev.map((l) => (l.slug === slug ? { ...l, quantity: q } : l)) : [...prev, { slug, quantity: q }];
    });
  }, []);

  const remove = useCallback((slug: string) => setLines((prev) => prev.filter((l) => l.slug !== slug)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(() => {
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = lines.reduce((sum, l) => sum + (getProduct(l.slug)?.price ?? 0) * l.quantity, 0);
    return { lines, count, subtotal, ready, add, setQuantity, remove, clear };
  }, [lines, ready, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
