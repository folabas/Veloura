"use client";

import Link from "next/link";
import { useState } from "react";
import { MAX_QUANTITY, useCart } from "./CartProvider";

export function AddToBag({ slug, soldOut }: { slug: string; soldOut?: boolean }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div className="buy-row">
        <div className="qty" role="group" aria-label="Quantity">
          <button type="button" aria-label="One fewer" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={soldOut}>
            −
          </button>
          <output aria-live="polite">{qty}</output>
          <button type="button" aria-label="One more" onClick={() => setQty((q) => Math.min(MAX_QUANTITY, q + 1))} disabled={soldOut}>
            +
          </button>
        </div>
        <button
          type="button"
          className="btn btn-solid label"
          disabled={soldOut}
          onClick={() => {
            add(slug, qty);
            setAdded(true);
          }}
        >
          {soldOut ? "Sold out" : "Add to bag"}
        </button>
      </div>
      <p className="added" aria-live="polite">
        {added && (
          <>
            Added to your bag. <Link className="link-arrow" href="/cart">View bag</Link>
          </>
        )}
      </p>
    </div>
  );
}
