"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import { Logo } from "./Logo";
import { socials, whatsappLink } from "@/lib/site";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Collection" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/about", label: "About" },
  { href: "/about#contact", label: "Contact" },
];

// Pages that open on a full-screen photo: the header sits over it in light text until you scroll.
const overPhoto = ["/lookbook", "/collections/"];

export function SiteHeader() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const openBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const isOver = overPhoto.some((p) => pathname.startsWith(p)) && !scrolled;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        openBtn.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isCurrent = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]) && !href.includes("#"));

  return (
    <>
      <header className={`site-header${isOver ? " is-over" : ""}${scrolled ? " is-scrolled" : ""}`}>
        <div className="wrap">
          <Link className="brand" href="/" aria-label="Veloura home">
            <Logo size={44} />
            <span className="wordmark">Veloura</span>
          </Link>
          <nav className="nav" aria-label="Main">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} aria-current={isCurrent(l.href) ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
            <Link href="/cart" aria-label={`Bag, ${count} item${count === 1 ? "" : "s"}`}>
              Bag ({ready ? count : 0})
            </Link>
          </nav>
          <Link className="bag-sm" href="/cart" aria-label={`Bag, ${count} item${count === 1 ? "" : "s"}`}>
            Bag ({ready ? count : 0})
          </Link>
          <button ref={openBtn} className="burger" aria-expanded={open} aria-controls="site-menu" aria-label="Open menu" onClick={() => setOpen(true)}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`menu${open ? " is-open" : ""}`} id="site-menu" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!open} inert={!open}>
        <div className="menu-photo">
          <Image src="/images/bamboo-print-black.webp" alt="" fill sizes="40vw" style={{ objectFit: "cover", objectPosition: "50% 30%" }} />
        </div>
        <div className="menu-body">
          <div className="menu-top">
            <span className="brand">
              <Logo size={52} />
              <span className="wordmark">Veloura</span>
            </span>
            <button ref={closeBtn} className="menu-close" aria-label="Close menu" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          </div>
          <div className="menu-main">
            <nav className="menu-links" aria-label="Menu">
              {navLinks.map((l, i) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{ transitionDelay: `${0.15 + i * 0.06}s` }}
                  aria-current={isCurrent(l.href) ? "page" : undefined}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="menu-cols">
              <ul>
                <li><Link href="/shop?category=scarves">Scarves</Link></li>
                <li><Link href="/shop?category=abaya-sets">Abaya sets</Link></li>
                <li><Link href="/collections/rose-edit">The Rose Edit</Link></li>
              </ul>
              <ul>
                <li className="label">Social</li>
                {socials.map((s) => (
                  <li key={s.name}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer">{s.name}</a>
                  </li>
                ))}
                <li>
                  <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
