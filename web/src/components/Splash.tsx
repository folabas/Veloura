"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";

export const SPLASH_KEY = "veloura-splash-seen";
export const SPLASH_DONE = "veloura:splash-done";

// Runs before the page paints (inlined in <head>): skips the splash if it already played this visit.
export const splashBootScript = `try{document.documentElement.dataset.splash=sessionStorage.getItem("${SPLASH_KEY}")?"skip":"play"}catch(e){document.documentElement.dataset.splash="play"}`;

const MIN_MS = 1700; // long enough for the logo and tagline to play
const MAX_MS = 3000; // never hold a slow connection longer than this

/*
  Opening screen on the first visit: the logo opens out from its centre in a widening circle,
  the tagline fades in, then the whole panel lifts away to show the home page.
  Tap or press any key to skip.
*/
export function Splash() {
  const [phase, setPhase] = useState<"play" | "lift" | "gone">("play");

  useEffect(() => {
    if (document.documentElement.dataset.splash !== "play") {
      setPhase("gone");
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    // The splash opens the home page from the top, even if the browser restored a scroll position.
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    let done = false;

    const lift = () => {
      if (done) return;
      done = true;
      try {
        sessionStorage.setItem(SPLASH_KEY, "1");
      } catch {
        // Private mode: the splash may play again next visit, which is fine.
      }
      setPhase("lift");
      document.documentElement.dataset.splash = "done";
      window.dispatchEvent(new Event(SPLASH_DONE));
      window.setTimeout(() => setPhase("gone"), 800);
    };

    const whenLoaded = () => window.setTimeout(lift, Math.max(0, (reduce ? 400 : MIN_MS) - (performance.now() - start)));
    if (document.readyState === "complete") whenLoaded();
    else window.addEventListener("load", whenLoaded, { once: true });
    const cap = window.setTimeout(lift, MAX_MS);

    window.addEventListener("keydown", lift, { once: true });
    return () => {
      window.clearTimeout(cap);
      window.removeEventListener("load", whenLoaded);
      window.removeEventListener("keydown", lift);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = phase === "play" ? "hidden" : "";
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      className={`splash is-${phase}`}
      aria-hidden="true"
      onClick={() => window.dispatchEvent(new KeyboardEvent("keydown"))}
    >
      <div className="splash-inner">
        <Logo size={220} className="splash-logo" />
        <span className="splash-tag">For the woman you are</span>
      </div>
      <span className="splash-line" />
    </div>
  );
}
