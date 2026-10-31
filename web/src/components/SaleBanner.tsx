"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "./CatalogProvider";
import { activeSale } from "@/lib/pricing";

const DISMISS_KEY = "veloura-sale-banner-dismissed";
const BANNER_H = "42px";

/*
  Thin bar above the header while any sale is running: "20% off selected pieces", a live countdown
  to the deadline, and a link to the Sale page. Closing it hides it for that sale only; a new sale
  (different discount or end time) brings it back. It appears on its own whenever the admin starts a sale.
*/
export function SaleBanner() {
  const { products } = useCatalog();
  const [now, setNow] = useState<number | null>(null); // null until mounted, so server and browser agree
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    setNow(Date.now());
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY));
    } catch {
      // Storage blocked: the banner just shows again next visit.
    }
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Running sales right now: the biggest discount, and the soonest deadline among them.
  const summary = useMemo(() => {
    if (now === null) return null;
    const running = products.map((p) => activeSale(p, now)).filter((s) => s !== null);
    if (!running.length) return null;
    const percents = running.map((s) => s.percent);
    const top = Math.max(...percents);
    const endsAt = Math.min(...running.map((s) => s.endsAt.getTime()));
    return { top, mixed: new Set(percents).size > 1, endsAt, id: `${top}-${endsAt}` };
  }, [products, now]);

  const visible = Boolean(summary && summary.id !== dismissed);

  // Push the header and page down by the banner's height while it shows.
  useEffect(() => {
    document.documentElement.style.setProperty("--banner-h", visible ? BANNER_H : "0px");
    return () => document.documentElement.style.setProperty("--banner-h", "0px");
  }, [visible]);

  if (!visible || !summary || now === null) return null;

  const left = Math.max(0, summary.endsAt - now);
  const d = Math.floor(left / 864e5);
  const h = Math.floor((left % 864e5) / 36e5);
  const m = Math.floor((left % 36e5) / 6e4);
  const s = Math.floor((left % 6e4) / 1e3);
  const pad = (n: number) => String(n).padStart(2, "0");

  const close = () => {
    setDismissed(summary.id);
    try {
      localStorage.setItem(DISMISS_KEY, summary.id);
    } catch {
      // Fine: it stays closed for this visit.
    }
  };

  return (
    <div className="sale-banner" role="region" aria-label="Sale">
      <div className="sale-banner-inner">
        <p className="sale-banner-text">
          <strong>{summary.mixed ? `Up to ${summary.top}% off` : `${summary.top}% off`}</strong>
          <span className="sale-banner-sub"> selected pieces</span>
        </p>
        <p className="sale-banner-clock" aria-label={`Ends in ${d} days ${h} hours ${m} minutes`}>
          <span className="sale-banner-ends">Ends in</span>
          {d > 0 && (
            <span className="unit">
              {d}
              <small>d</small>
            </span>
          )}
          <span className="unit">
            {pad(h)}
            <small>h</small>
          </span>
          <span className="unit">
            {pad(m)}
            <small>m</small>
          </span>
          <span className="unit">
            {pad(s)}
            <small>s</small>
          </span>
        </p>
        <Link className="sale-banner-link" href="/shop?category=sale">
          Shop the sale
        </Link>
      </div>
      <button type="button" className="sale-banner-close" aria-label="Close sale banner" onClick={close}>
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  );
}
