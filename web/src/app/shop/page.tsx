import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { findCategory, getCatalog, productsIn } from "@/lib/catalog";
import { activeSale } from "@/lib/pricing";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category: slug } = await searchParams;
  const catalog = await getCatalog();
  const { categories } = catalog;
  // "Sale" is a built-in filter: everything with a discount running right now.
  const onSale = catalog.products.filter((p) => activeSale(p));
  const showingSale = slug === "sale";
  const category = showingSale ? undefined : findCategory(catalog, slug);
  const list = showingSale ? onSale : productsIn(catalog, category?.slug);

  return (
    <div className="wrap">
      <header className="page-head">
        <p className="label muted">Collection</p>
        <h1>{showingSale ? <>On <em>sale</em></> : category ? category.name : "Everything"}</h1>
      </header>
      <div className="shop" style={{ paddingBottom: "clamp(64px, 8vw, 110px)" }}>
        <nav className="cats" aria-label="Categories">
          <Link href="/shop" aria-current={!category && !showingSale ? "page" : undefined}>
            Everything
          </Link>
          {(onSale.length > 0 || showingSale) && (
            <Link className="cat-sale" href="/shop?category=sale" aria-current={showingSale ? "page" : undefined}>
              Sale
            </Link>
          )}
          {categories.map((c) => (
            <Link key={c.slug} href={`/shop?category=${c.slug}`} aria-current={category?.slug === c.slug ? "page" : undefined}>
              {c.name}
            </Link>
          ))}
        </nav>
        {list.length ? (
          <div className="grid">
            {list.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <p className="empty">
            {showingSale ? "There's no sale on right now." : `New ${category?.name.toLowerCase() ?? "pieces"} are on their way.`}{" "}
            <Link className="link-arrow" href="/shop">See everything</Link>
          </p>
        )}
      </div>
    </div>
  );
}
