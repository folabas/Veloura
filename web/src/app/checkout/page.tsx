"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useCatalog } from "@/components/CatalogProvider";
import { formatNaira } from "@/lib/products";
import { WHATSAPP_NUMBER, whatsappLink } from "@/lib/site";

const fields = [
  { id: "name", label: "Full name", type: "text", autoComplete: "name" },
  { id: "phone", label: "Phone number", type: "tel", autoComplete: "tel" },
  { id: "address", label: "Delivery address", type: "text", autoComplete: "street-address" },
  { id: "city", label: "City", type: "text", autoComplete: "address-level2" },
  { id: "state", label: "State", type: "text", autoComplete: "address-level1" },
] as const;

// Orders go to Veloura on WhatsApp as a pre-filled message; payment is arranged in that chat.
export default function CheckoutPage() {
  const { lines, subtotal, ready } = useCart();
  const { getProduct } = useCatalog();
  const [sent, setSent] = useState(false);
  const ordering = WHATSAPP_NUMBER !== "";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();

    const items = lines.flatMap((line) => {
      const p = getProduct(line.slug);
      return p ? [`• ${p.name}, ${p.colour} × ${line.quantity} (${formatNaira(p.price * line.quantity)})`] : [];
    });
    const message = [
      "Hello Veloura, I'd like to order:",
      ...items,
      `Total: ${formatNaira(subtotal)}`,
      "",
      `Name: ${get("name")}`,
      `Phone: ${get("phone")}`,
      `Delivery address: ${get("address")}, ${get("city")}, ${get("state")}`,
      ...(get("notes") ? [`Notes: ${get("notes")}`] : []),
    ].join("\n");

    window.open(whatsappLink(message), "_blank", "noopener");
    setSent(true);
  }

  if (ready && lines.length === 0) {
    return (
      <div className="wrap result">
        <h1>
          Your bag is <em>empty</em>
        </h1>
        <Link className="btn btn-line label" href="/shop">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap">
      <header className="page-head">
        <p className="label muted">Place your order</p>
        <h1>
          Delivery <em>details</em>
        </h1>
      </header>
      <div className="cart-layout">
        <form className="form" onSubmit={onSubmit}>
          <div className="form-row">
            {fields.slice(0, 2).map((f) => (
              <div className="field" key={f.id}>
                <label className="label muted" htmlFor={f.id}>{f.label}</label>
                <input id={f.id} name={f.id} type={f.type} autoComplete={f.autoComplete} required />
              </div>
            ))}
          </div>
          {fields.slice(2, 3).map((f) => (
            <div className="field" key={f.id}>
              <label className="label muted" htmlFor={f.id}>{f.label}</label>
              <input id={f.id} name={f.id} type={f.type} autoComplete={f.autoComplete} required />
            </div>
          ))}
          <div className="form-row">
            {fields.slice(3).map((f) => (
              <div className="field" key={f.id}>
                <label className="label muted" htmlFor={f.id}>{f.label}</label>
                <input id={f.id} name={f.id} type={f.type} autoComplete={f.autoComplete} required />
              </div>
            ))}
          </div>
          <div className="field">
            <label className="label muted" htmlFor="notes">Order notes (optional)</label>
            <textarea id="notes" name="notes" maxLength={500} />
          </div>
          {ordering ? (
            <>
              <button className="btn btn-solid label" type="submit" disabled={!ready}>
                Send order on WhatsApp
              </button>
              <p className="muted" aria-live="polite">
                {sent
                  ? "Your order is ready in WhatsApp. Press send there and we'll confirm delivery and payment with you."
                  : "This opens WhatsApp with your order filled in. We'll confirm delivery and payment with you there."}
              </p>
            </>
          ) : (
            <p className="notice">Online ordering opens soon.</p>
          )}
        </form>

        <aside className="summary" aria-label="Order summary">
          {lines.map((line) => {
            const p = getProduct(line.slug);
            return p ? (
              <div className="summary-row" key={line.slug}>
                <span>
                  {p.name}, {p.colour} × {line.quantity}
                </span>
                <span className="price">{formatNaira(p.price * line.quantity)}</span>
              </div>
            ) : null;
          })}
          <div className="summary-row summary-total">
            <span>Total</span>
            <span className="price">{formatNaira(subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
