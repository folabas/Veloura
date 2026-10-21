import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CircleBadge } from "@/components/CircleBadge";
import { Logo } from "@/components/Logo";
import { LookLink } from "@/components/LookLink";
import { Photo } from "@/components/Photo";
import { RevealText } from "@/components/RevealText";
import { ScrollDown } from "@/components/ScrollDown";
import { chapters, lookbookHero } from "@/lib/looks";

export const metadata: Metadata = { title: "Lookbook" };

export default function LookbookPage() {
  return (
    <>
      <section className="full-hero">
        {lookbookHero.video ? (
          <video className="hero-video" src={lookbookHero.video} poster={lookbookHero.src} autoPlay muted loop playsInline />
        ) : (
          <Image src={lookbookHero.src} alt={lookbookHero.alt} fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition: "50% 40%" }} />
        )}
        <div className="hero-shade" />
        <div className="full-hero-copy">
          <p className="label">Lookbook</p>
          <RevealText as="h1" className="display-xl" lines={[<>Worn <em>your way</em></>]} />
        </div>
        <CircleBadge text={lookbookHero.video ? "Watch the film · Veloura · " : "Lookbook · Veloura · 2026 · "} size={128} className="hero-badge">
          {lookbookHero.video ? <span aria-hidden="true">▶</span> : <Logo size={80} />}
        </CircleBadge>
        <ScrollDown to="chapter-1" className="hero-scroll" />
      </section>

      {chapters.map((ch, i) => (
        <section className="chapter" id={`chapter-${i + 1}`} key={i} data-bg={ch.tint}>
          <div className="wrap">
            <RevealText
              className="display-caps chapter-lines"
              lines={ch.lines.map((l, j) =>
                typeof l === "string" ? l : (
                  <span key={j}>
                    {l[0]}
                    <em>{l[1]}</em>
                    {l[2]}
                  </span>
                ),
              )}
            />
            <div className="chapter-hero">
              <LookLink product={ch.main.product}>
                {ch.video ? (
                  <div className="photo ed-center" data-reveal="image">
                    <video src={ch.video} poster={ch.main.src} autoPlay muted loop playsInline />
                  </div>
                ) : (
                  <Photo src={ch.main.src} alt={ch.main.alt} className="ed-center" sizes="(max-width: 900px) 80vw, 38vw" focus={ch.main.focus} />
                )}
              </LookLink>
            </div>
            <div className={`editorial-row${i % 2 ? " flip" : ""}`}>
              <div className="editorial-main">
                <LookLink product={ch.side.product}>
                  <Photo src={ch.side.src} alt={ch.side.alt} className="ed-big" sizes="(max-width: 900px) 90vw, 48vw" focus={ch.side.focus} />
                </LookLink>
                {ch.circle && <CircleBadge text={ch.circle} size={150} spinOnScroll className="ed-badge" />}
              </div>
              <div className="editorial-side" data-parallax="0.25">
                <LookLink product={ch.main.product}>
                  <Photo src={ch.main.src} alt="" className="ed-small" sizes="(max-width: 900px) 50vw, 22vw" focus="50% 65%" />
                </LookLink>
                <div className="ed-caption" data-reveal="fade">
                  <p className="muted">{ch.caption}</p>
                  {ch.side.product && (
                    <Link className="arrow-link label" href={`/shop/${ch.side.product}`}>
                      Shop the look
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="section">
        <div className="wrap center-stack">
          <RevealText className="display" lines={["Find the piece", <><em>made for</em> you</>]} />
          <Link className="btn btn-clay label" href="/shop" data-reveal="fade">
            Shop the collection <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
