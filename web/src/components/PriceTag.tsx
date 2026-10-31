"use client";

import { useEffect, useState } from "react";
import { activeSale, endsIn } from "@/lib/pricing";
import { formatNaira, type Product } from "@/lib/products";

/** Re-checks the clock every minute so sales switch on and off while the page is open. */
export function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

/** Price with the original struck through during a sale. `countdown` adds "Ends in …". */
export function PriceTag({ product, countdown = false, className = "" }: { product: Product; countdown?: boolean; className?: string }) {
  const now = useNow();
  if (product.soldOut) return <span className={`price ${className}`}>Sold out</span>;
  const sale = activeSale(product, now);
  if (!sale) return <span className={`price ${className}`}>{formatNaira(product.price)}</span>;
  return (
    <span className={`price on-sale ${className}`} suppressHydrationWarning>
      <span className="price-now">{formatNaira(sale.price)}</span>{" "}
      <s className="price-was" aria-label={`was ${formatNaira(product.price)}`}>{formatNaira(product.price)}</s>{" "}
      <span className="price-off">{sale.percent}% off</span>
      {countdown && <span className="price-ends">{endsIn(sale.endsAt, now)}</span>}
    </span>
  );
}

/** "−20%" corner badge for photos; renders nothing when there's no running sale. */
export function SaleBadge({ product }: { product: Product }) {
  const now = useNow();
  const sale = activeSale(product, now);
  if (!sale || product.soldOut) return null;
  return <span className="sale-badge" suppressHydrationWarning>−{sale.percent}%</span>;
}
