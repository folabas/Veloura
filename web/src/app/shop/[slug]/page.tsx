import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToBag } from "@/components/AddToBag";
import { ProductCard } from "@/components/ProductCard";
import { formatNaira, getCategory, getProduct, products } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return product ? { title: `${product.name}, ${product.colour}`, description: product.description } : {};
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const category = getCategory(product.category);
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <>
      <div className="wrap product">
        <div className="product-gallery">
          {product.images.map((img, i) => (
            <div className="product-photo" key={img.src}>
              <Image
                src={img.src}
                alt={img.alt}
                fill
                priority={i === 0}
                sizes="(max-width: 900px) 100vw, 55vw"
                style={{ objectFit: "cover", objectPosition: img.focus ?? "50% 30%" }}
              />
            </div>
          ))}
        </div>
        <div className="product-info">
          <nav className="breadcrumb label" aria-label="Breadcrumb">
            <Link href="/shop">Shop</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/shop?category=${product.category}`}>{category?.name}</Link>
          </nav>
          <div style={{ display: "grid", gap: 8 }}>
            <h1>
              {product.name}, <em>{product.colour}</em>
            </h1>
            <p className="price">{formatNaira(product.price)}</p>
          </div>
          <p className="desc">{product.description}</p>
          <AddToBag slug={product.slug} soldOut={product.soldOut} />
          <div className="details">
            {product.details.map((d) => (
              <div key={d.label}>
                <span className="label muted">{d.label}</span>
                <span>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="related-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="related-title">
              You may <em>also love</em>
            </h2>
          </div>
          <div className="grid grid-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
