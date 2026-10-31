import type { Product } from "./products";

// Sale maths shared by product cards, product pages, the bag and the WhatsApp order.
// A sale only counts between its start and end, checked against the current time,
// so prices switch at the right moment even if the page was cached before.

export type ActiveSale = { percent: number; endsAt: Date; price: number };

export const discounted = (price: number, percent: number) => Math.round((price * (100 - percent)) / 100);

export function activeSale(p: Pick<Product, "price" | "sale">, now = Date.now()): ActiveSale | null {
  const s = p.sale;
  if (!s) return null;
  const start = Date.parse(s.startsAt);
  const end = Date.parse(s.endsAt);
  if (!(now >= start && now < end)) return null;
  return { percent: s.percent, endsAt: new Date(end), price: discounted(p.price, s.percent) };
}

/** What the customer pays right now. */
export const priceNow = (p: Pick<Product, "price" | "sale">, now = Date.now()) => activeSale(p, now)?.price ?? p.price;

/** "Ends in 2 days", "Ends in 5 hours", "Ends in 12 minutes". */
export function endsIn(end: Date, now = Date.now()) {
  const mins = Math.max(1, Math.round((end.getTime() - now) / 60000));
  if (mins < 60) return `Ends in ${mins} minute${mins === 1 ? "" : "s"}`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `Ends in ${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return `Ends in ${days} days`;
}
