"use client";

import Image from "next/image";
import Link from "next/link";
import { MAX_QUANTITY, useCart } from "@/components/CartProvider";
import { formatNaira, getProduct } from "@/lib/products";

export default function CartPage() {
  const { lines, subtotal, ready, setQuantity, remove } = useCart();

  return (
    <div className="wrap">
      <header className="page-head">
        <p className="label muted">Your bag</p>
        <h1>
          Your <em>bag</em>
        </h1>
      </header>

      {!ready ? null : lines.length === 0 ? (
        <div className="result" style={{ paddingTop: 0 }}>
          <p className="muted">Your bag is empty.</p>
          <Link className="btn btn-line label" href="/shop">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {lines.map((line) => {
              const p = getProduct(line.slug);
              if (!p) return null;
              return (
                <div className="cart-line" key={line.slug}>
                  <Link className="cart-thumb" href={`/shop/${p.slug}`}>
                    <Image src={p.images[0].src} alt={p.images[0].alt} fill sizes="96px" style={{ objectFit: "cover", objectPosition: p.images[0].focus }} />
                  </Link>
                  <div className="cart-line-info">
                    <Link className="card-name" href={`/shop/${p.slug}`}>
                      {p.name}, {p.colour}
                    </Link>
                    <span className="muted price">{formatNaira(p.price)}</span>
                    <div className="qty" role="group" aria-label={`Quantity of ${p.name}`}>
                      <button type="button" aria-label="One fewer" onClick={() => setQuantity(p.slug, line.quantity - 1)}>
                        −
                      </button>
                      <output>{line.quantity}</output>
                      <button
                        type="button"
                        aria-label="One more"
                        onClick={() => setQuantity(p.slug, line.quantity + 1)}
                        disabled={line.quantity >= MAX_QUANTITY}
                      >
                        +
                      </button>
                    </div>
                    <button type="button" className="remove label" onClick={() => remove(p.slug)}>
                      Remove
                    </button>
                  </div>
                  <span className="price">{formatNaira(p.price * line.quantity)}</span>
                </div>
              );
            })}
          </div>
          <aside className="summary" aria-label="Order summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span className="price">{formatNaira(subtotal)}</span>
            </div>
            <div className="summary-row muted">
              <span>Delivery</span>
              {/* PLACEHOLDER: delivery pricing not decided yet */}
              <span>To be confirmed</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span className="price">{formatNaira(subtotal)}</span>
            </div>
            <Link className="btn btn-solid label" href="/checkout">
              Place order
            </Link>
            <Link className="label muted" href="/shop" style={{ textAlign: "center" }}>
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
