import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CircleBadge } from "@/components/CircleBadge";
import { Newsletter } from "@/components/Newsletter";
import { Photo } from "@/components/Photo";
import { RevealText } from "@/components/RevealText";
import { collections } from "@/lib/collections";
import { categories, formatNaira, getCategory, products, type Product } from "@/lib/products";

const collage = [
  { src: "/images/polka-dot-white.webp", alt: "Model in the ivory polka dot scarf", speed: 0.1 },
  { src: "/images/bow-print-pink.webp", alt: "Model in the rose pink bow print scarf", speed: 0.25 },
  { src: "/images/rose-print-brown-outdoor.webp", alt: "Model outdoors in the cocoa rose print scarf", speed: 0.05 },
  { src: "/images/bamboo-print-black.webp", alt: "Model in the ink bamboo print scarf", speed: 0.3 },
  { src: "/images/leopard-print-grey.webp", alt: "Model in the dove grey leopard print scarf", speed: 0.15 },
];

const categoryPhotos = [
  { src: "/images/bamboo-print-black.webp", className: "float-a", speed: 0.35 },
  { src: "/images/bow-print-pink.webp", className: "float-b", speed: -0.2 },
  { src: "/images/leopard-print-grey.webp", className: "float-c", speed: 0.25 },
];

// The spotlight fills 12 tiles (6 columns of 2), repeating the newest pieces until there are
// enough real products to fill it on their own.
function mosaicColumns(list: Product[], tiles = 12, columns = 6) {
  const filled = Array.from({ length: tiles }, (_, i) => ({ product: list[i % list.length], key: `${list[i % list.length].slug}-${i}` }));
  return Array.from({ length: columns }, (_, c) => filled.filter((_, i) => i % columns === c));
}

export default function Home() {
  const edit = collections[0];
  const newest = products.filter((p) => p.isNew);

  return (
    <>
      {/* Hero: monogram, mixed-italic headline and a staggered photo collage */}
      <section className="home-hero">
        <div className="wrap home-hero-copy">
          <span data-reveal="fade">
            <Logo size={128} className="hero-logo" label="Veloura" />
          </span>
          <p className="label" data-reveal="fade">Contemporary modest fashion</p>
          <RevealText
            as="h1"
            className="display-caps"
            lines={[
              "Modest, feminine",
              <>
                <em>and</em> contemporary
              </>,
              <>
                — <em>for the</em> woman you are
              </>,
            ]}
          />
        </div>
        <div className="collage">
          {collage.map((c, i) => (
            <div className={`collage-item c${i + 1}`} key={c.src} data-parallax={c.speed}>
              <Photo src={c.src} alt={c.alt} className="fill" sizes="(max-width: 720px) 45vw, 22vw" priority={i === 2} />
            </div>
          ))}
        </div>
      </section>

      {/* Collection teaser → its own story page */}
      <section className="section">
        <div className="wrap story-split">
          <div className="story-copy">
            <RevealText
              className="display"
              lines={[edit.name, <em key="i">{edit.italic}</em>, edit.season]}
            />
            <p className="muted" data-reveal="fade">{edit.intro}</p>
            <Link className="btn btn-clay label" href={`/collections/${edit.slug}`} data-reveal="fade">
              Discover the edit <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="overlap overlap-right">
            <Photo src={edit.hero.src} alt={edit.hero.alt} className="overlap-main" sizes="(max-width: 900px) 80vw, 36vw" focus="50% 40%" />
            <div className="overlap-inset" data-parallax="0.3">
              <Photo src={edit.hero.src} alt="Close-up of the rose print" className="fill detail-crop" sizes="20vw" focus="45% 62%" />
            </div>
          </div>
        </div>
      </section>

      {/* Category showcase: large serif list with floating photos */}
      <section className="section cat-show">
        <div className="wrap">
          <p className="label center" data-reveal="fade">Shop by category</p>
          <nav className="cat-list" aria-label="Shop by category">
            {categories.map((c) => (
              <Link key={c.slug} href={`/shop?category=${c.slug}`} data-reveal="fade">
                {c.name}
              </Link>
            ))}
          </nav>
          <div className="center" data-reveal="fade">
            <Link className="arrow-link label" href="/shop">
              See everything
            </Link>
          </div>
          {categoryPhotos.map((p) => (
            <div className={`cat-float ${p.className}`} key={p.src} data-parallax={p.speed} aria-hidden="true">
              <Photo src={p.src} alt="" className="fill" sizes="16vw" />
            </div>
          ))}
        </div>
      </section>

      {/* Full-bleed statement with a turning badge */}
      <section className="statement-band">
        <Photo src="/images/polka-dot-white.webp" alt="" className="band-photo" sizes="100vw" focus="50% 25%" reveal={false} />
        <div className="band-shade" />
        <div className="wrap band-copy">
          <p className="label">For the woman you are</p>
          <RevealText
            className="display"
            lines={["You don’t have to become", <><em>someone else</em> to feel</>, "beautiful in what you wear"]}
          />
        </div>
        <CircleBadge text="Soft or bold · Simple or expressive · " size={140} spinOnScroll className="band-badge">
          <Logo size={80} />
        </CircleBadge>
      </section>

      {/* About teaser */}
      <section className="section">
        <div className="wrap story-split reverse">
          <div className="overlap overlap-left">
            <Photo src="/images/leopard-print-grey.webp" alt="Model in the dove grey leopard print scarf" className="overlap-main" sizes="(max-width: 900px) 80vw, 32vw" focus="50% 40%" />
            <div className="overlap-inset" data-parallax="0.3">
              <Photo src="/images/bow-print-pink.webp" alt="Model in the rose pink bow print scarf" className="fill" sizes="20vw" focus="50% 30%" />
            </div>
          </div>
          <div className="story-copy">
            <RevealText className="display" lines={["Modesty with", <em key="i">individuality</em>]} />
            <p className="muted" data-reveal="fade">
              Modesty doesn&apos;t mean giving up your style. Veloura brings together modesty, femininity and contemporary fashion,
              so you can dress with confidence and still be completely yourself.
            </p>
            <Link className="btn btn-clay label" href="/about" data-reveal="fade">
              Our story <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* New pieces: side-by-side columns at staggered heights, each drifting at its own pace (Mark Clennon style) */}
      <section className="section spotlight">
        <div className="wrap section-head">
          <div>
            <p className="label muted">Spotlight</p>
            <RevealText className="display-sm" lines={["Explore our", <><em>newest</em> pieces</>]} />
          </div>
          <Link className="arrow-link label" href="/shop">
            Shop all
          </Link>
        </div>
        <div className="mosaic">
          {mosaicColumns(newest).map((column, c) => (
            <div className="mosaic-col" key={c} data-parallax={[0.1, 0.28, 0.04, 0.2, 0.12, 0.3][c]}>
              {column.map(({ product: p, key }) => (
                <Link className="tile" href={`/shop/${p.slug}`} key={key} data-reveal="image">
                  <Image
                    src={p.images[0].src}
                    alt={`${p.name}, ${p.colour}`}
                    fill
                    sizes="(max-width: 720px) 33vw, 17vw"
                    style={{ objectFit: "cover", objectPosition: p.images[0].focus ?? "50% 30%" }}
                  />
                  <span className="tile-info">
                    <span className="label">{getCategory(p.category)?.name}</span>
                    <span className="tile-name">
                      {p.name}, <em>{p.colour}</em>
                    </span>
                    <span className="price">{formatNaira(p.price)}</span>
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Lookbook teaser → its own gallery page */}
      <section className="section">
        <div className="wrap look-teaser">
          <div className="story-copy">
            <p className="label muted" data-reveal="fade">Lookbook</p>
            <RevealText className="display" lines={["Worn", <em key="i">your way</em>]} />
            <p className="muted" data-reveal="fade">Simple and neutral one day, a bold print the next. See how the pieces come together.</p>
            <Link className="btn btn-clay label" href="/lookbook" data-reveal="fade">
              See the lookbook <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="look-scatter">
            {[
              { src: "/images/bamboo-print-black.webp", s: 0.2 },
              { src: "/images/rose-print-brown-outdoor.webp", s: 0.4 },
              { src: "/images/polka-dot-white.webp", s: 0.1 },
              { src: "/images/bow-print-pink.webp", s: 0.3 },
            ].map((p, i) => (
              <div className={`scatter-item s${i + 1}`} key={p.src} data-parallax={p.s}>
                <Photo src={p.src} alt="" className="fill" sizes="18vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
