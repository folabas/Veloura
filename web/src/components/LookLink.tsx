import Link from "next/link";
import type { ReactNode } from "react";
import { findProduct, getCatalog } from "@/lib/catalog";

/** Makes a lookbook photo open its product, with the image cursor showing that piece on hover. */
export async function LookLink({ product, children }: { product?: string; children: ReactNode }) {
  const p = product ? findProduct(await getCatalog(), product) : undefined;
  if (!p) return <>{children}</>;
  return (
    <Link
      className="look-link"
      href={`/shop/${p.slug}`}
      aria-label={`Shop the ${p.name}${p.colour ? `, ${p.colour}` : ""}`}
      data-cursor-img={p.images[0]?.src}
      data-cursor-label={p.colour ? `${p.name}, ${p.colour}` : p.name}
    >
      {children}
    </Link>
  );
}
