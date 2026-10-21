import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleBadge } from "@/components/CircleBadge";
import { Logo } from "@/components/Logo";
import { LookLink } from "@/components/LookLink";
import { Photo } from "@/components/Photo";
import { ProductCard } from "@/components/ProductCard";
import { RevealText } from "@/components/RevealText";
import { ScrollDown } from "@/components/ScrollDown";
import { collections, getCollection } from "@/lib/collections";
import { findProduct, getCatalog } from "@/lib/catalog";
import { formatNaira, type Product } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCollection((await params).slug);
  return c ? { title: `${c.name} ${c.italic}`, description: c.intro } : {};
}

// Soft section tints the page fades through as you scroll, as on Rino & Pelle's lookbook.
const tints = ["#efe6dc", "#e8ddd6", "#e4e2da"];

export default async function CollectionPage({ params }: Props) {
  const collection = getCollection((await params).slug);
  if (!collection) notFound();
  const catalog = await getCatalog();
  const items = collection.productSlugs.map((s) => findProduct(catalog, s)).filter((p): p is Product => Boolean(p));

  return (
    <>
      <section className="full-hero">
        <Image src={collection.hero.src} alt={collection.hero.alt} fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition: collection.hero.focus }} />
        <div className="hero-shade" />
        <div className="full-hero-copy">
          <p className="label">Collection {collection.season}</p>
          <RevealText as="h1" className="display-xl" lines={[<>{collection.name} <em>{collection.italic}</em></>]} />
        </div>
        <CircleBadge text={`${collection.name} ${collection.italic} · ${collection.season} · `} size={128} className="hero-badge">
          <Logo size={80} />
        </CircleBadge>
        <ScrollDown to="story" className="hero-scroll" />
      </section>

      <section className="section" id="story" data-bg={tints[0]}>
        <div className="wrap center-stack">
          <RevealText className="display-caps" lines={collection.statement.map((l, i) => (i === 1 ? <em key={i}>{l}</em> : l))} />
          <p className="muted lead" data-reveal="fade">{collection.intro}</p>
        </div>
      </section>

      {items.map((p, i) => (
        <section className="section editorial-row-wrap" key={p.slug} data-bg={tints[(i + 1) % tints.length]}>
          <div className={`wrap editorial-row${i % 2 ? " flip" : ""}`}>
            <div className="editorial-main">
              <LookLink product={p.slug}>
                <Photo src={p.images[0].src} alt={p.images[0].alt} className="ed-big" sizes="(max-width: 900px) 90vw, 50vw" focus={p.images[0].focus} />
              </LookLink>
              {i === 0 && (
                <CircleBadge text="Effortless · Modest · Feminine · " size={150} spinOnScroll className="ed-badge" />
              )}
            </div>
            <div className="editorial-side" data-parallax="0.2">
              <LookLink product={p.slug}>
                <Photo src={p.images[0].src} alt="" className="ed-small" sizes="(max-width: 900px) 50vw, 22vw" focus="50% 70%" />
              </LookLink>
              <div className="ed-caption" data-reveal="fade">
                <p className="label muted">{p.colour}</p>
                <p className="card-name">{p.name}</p>
                <p className="muted">{p.description}</p>
                <Link className="arrow-link label" href={`/shop/${p.slug}`}>
                  {formatNaira(p.price)} · Shop now
                </Link>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <RevealText className="display-sm" lines={["Shop", <em key="i">the edit</em>]} />
            <Link className="arrow-link label" href="/shop">
              See everything
            </Link>
          </div>
          <div className="grid">
            {items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
