"use client";
import { useSyncExternalStore } from "react";

export type CartLine = { itemId: string; name: string; priceFcfa: number; qty: number };
export type Cart = { restaurantId: string; slug: string; restaurantName: string; lines: CartLine[] };
type Carts = Record<string, Cart>;

const KEY = "resto:cart:v1";
const EMPTY: Carts = {};
const listeners = new Set<() => void>();
let raw: string | null = null;
let cached: Carts = EMPTY;

function read(): Carts {
  try {
    const s = localStorage.getItem(KEY) ?? "";
    if (s !== raw) {
      raw = s;
      cached = s ? (JSON.parse(s) as Carts) : EMPTY;
    }
  } catch {
    cached = EMPTY;
  }
  return cached;
}

function write(next: Carts) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignoré : le panier reste valable pour cette session */
    raw = null;
    cached = next;
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCarts(): Carts {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function addToCart(
  r: { id: string; slug: string; name: string },
  item: { id: string; name: string; price_fcfa: number },
  qty = 1,
) {
  const carts = { ...read() };
  const cart: Cart = carts[r.id] ?? { restaurantId: r.id, slug: r.slug, restaurantName: r.name, lines: [] };
  const existing = cart.lines.find((l) => l.itemId === item.id);
  const lines = existing
    ? cart.lines.map((l) => (l.itemId === item.id ? { ...l, qty: Math.min(50, l.qty + qty) } : l))
    : [...cart.lines, { itemId: item.id, name: item.name, priceFcfa: item.price_fcfa, qty: Math.min(50, qty) }];
  carts[r.id] = { ...cart, lines };
  write(carts);
}

export function setQty(restaurantId: string, itemId: string, qty: number) {
  const carts = { ...read() };
  const cart = carts[restaurantId];
  if (!cart) return;
  const lines = qty <= 0 ? cart.lines.filter((l) => l.itemId !== itemId) : cart.lines.map((l) => (l.itemId === itemId ? { ...l, qty: Math.min(50, qty) } : l));
  if (lines.length === 0) delete carts[restaurantId];
  else carts[restaurantId] = { ...cart, lines };
  write(carts);
}

export function clearCart(restaurantId: string) {
  const carts = { ...read() };
  delete carts[restaurantId];
  write(carts);
}

// Affichage uniquement : le montant officiel est recalculé côté serveur.
export const cartCount = (c?: Cart) => (c ? c.lines.reduce((n, l) => n + l.qty, 0) : 0);
export const cartTotal = (c?: Cart) => (c ? c.lines.reduce((n, l) => n + l.qty * l.priceFcfa, 0) : 0);
