import Link from "next/link";
import type { ReactNode } from "react";
import { getProduct } from "@/lib/products";

/** Makes a lookbook photo open its product, with the image cursor showing that piece on hover. */
export function LookLink({ product, children }: { product?: string; children: ReactNode }) {
  const p = product ? getProduct(product) : undefined;
  if (!p) return <>{children}</>;
  return (
    <Link
      className="look-link"
      href={`/shop/${p.slug}`}
      aria-label={`Shop the ${p.name}, ${p.colour}`}
      data-cursor-img={p.images[0].src}
      data-cursor-label={`${p.name}, ${p.colour}`}
    >
      {children}
    </Link>
  );
}
