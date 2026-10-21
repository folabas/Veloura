import Link from "next/link";
import { CircleBadge } from "./CircleBadge";
import { Logo } from "./Logo";
import type { Category } from "@/lib/products";
import { PHONE_DISPLAY, PHONE_TEL, socials, whatsappLink } from "@/lib/site";

export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <>
      <section className="help" aria-labelledby="help-title">
        <div className="wrap help-grid">
          <h2 id="help-title" className="help-title">
            Need <em>help?</em>
          </h2>
          <div>
            <h3>How to order</h3>
            <p className="muted">Fill your bag, then send us your order on WhatsApp. We&apos;ll confirm delivery and payment with you.</p>
            <Link className="arrow-link label" href="/cart">View your bag</Link>
          </div>
          <div>
            <h3>Styling advice</h3>
            <p className="muted">Not sure which print suits the outfit you have in mind? Ask us, we love to help.</p>
            <Link className="arrow-link label" href="/about#contact">Ask us</Link>
          </div>
          <div>
            <h3>Need help?</h3>
            <p className="muted">Questions about a piece or an order you&apos;ve placed? Get in touch.</p>
            <Link className="arrow-link label" href="/about#contact">Contact us</Link>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div>
            <h3 className="label">Navigate</h3>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/shop">Collection</Link></li>
              <li><Link href="/lookbook">Lookbook</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/about#contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="label">Shop</h3>
            <ul>
              {categories.map((c) => (
                <li key={c.slug}><Link href={`/shop?category=${c.slug}`}>{c.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="label">Social</h3>
            <ul>
              {socials.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">{s.name}</a>
                </li>
              ))}
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </li>
              <li>
                <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
              </li>
            </ul>
          </div>
          <CircleBadge text="Veloura · For the woman you are · " size={124} className="footer-badge">
            <Logo size={74} />
          </CircleBadge>
        </div>
        <div className="wrap footer-base">
          <span>© {new Date().getFullYear()} Veloura</span>
          <span>Contemporary modest fashion</span>
        </div>
      </footer>
    </>
  );
}
