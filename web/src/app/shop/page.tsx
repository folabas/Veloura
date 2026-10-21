import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { categories, getCategory, productsIn } from "@/lib/products";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category: slug } = await searchParams;
  const category = getCategory(slug);
  const list = productsIn(category?.slug);

  return (
    <div className="wrap">
      <header className="page-head">
        <p className="label muted">Collection</p>
        <h1>{category ? category.name : "Everything"}</h1>
      </header>
      <div className="shop" style={{ paddingBottom: "clamp(64px, 8vw, 110px)" }}>
        <nav className="cats" aria-label="Categories">
          <Link href="/shop" aria-current={!category ? "page" : undefined}>
            Everything
          </Link>
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
            New {category?.name.toLowerCase()} are on their way. <Link className="link-arrow" href="/shop">See everything</Link>
          </p>
        )}
      </div>
    </div>
  );
}
