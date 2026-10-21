"use client";

import Image from "next/image";
import Link from "next/link";
import { useCatalog } from "./CatalogProvider";
import { formatNaira, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { getCategory } = useCatalog();
  const image = product.images[0];
  return (
    <Link className="card" href={`/shop/${product.slug}`} data-reveal="fade">
      <div className="card-img">
        {image && (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 900px) 50vw, 25vw"
            style={{ objectFit: "cover", objectPosition: image.focus ?? "50% 30%" }}
          />
        )}
      </div>
      <div className="card-meta">
        <span className="label muted">{getCategory(product.category)?.name}</span>
        <span className="card-name">
          {product.name}
          {product.colour && `, ${product.colour}`}
        </span>
        <span className="price">{product.soldOut ? "Sold out" : formatNaira(product.price)}</span>
      </div>
    </Link>
  );
}
