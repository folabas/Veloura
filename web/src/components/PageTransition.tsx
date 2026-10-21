"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";

// Soft colours the curtain cycles through, like Rino & Pelle's page changes.
const tints = ["#e6e0d4", "#e5d6cc", "#dcd9cf", "#e9dfd3"];

const COVER_MS = 380; // matches the .curtain.is-cover transition
const LIFT_MS = 520; // matches the .curtain.is-reveal transition

/*
  Between pages a full-screen curtain in a soft tint covers the screen with the Veloura logo,
  the new page swaps in underneath, then the curtain lifts. Pages are prefetched as soon as the
  pointer rests on a link, so the swap behind the curtain is usually instant.
*/
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "cover" | "reveal">("idle");
  const [tint, setTint] = useState(tints[0]);
  const fallback = useRef<number | undefined>(undefined);

  const reveal = useCallback(() => {
    window.clearTimeout(fallback.current);
    window.scrollTo(0, 0);
    setPhase((p) => (p === "cover" ? "reveal" : p));
    window.setTimeout(() => setPhase((p) => (p === "reveal" ? "idle" : p)), LIFT_MS + 40);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prefetched = new Set<string>();

    const internalUrl = (target: EventTarget | null) => {
      const a = (target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return null;
      const url = new URL(a.href, location.href);
      return url.origin === location.origin ? url : null;
    };

    function onPointerOver(e: PointerEvent) {
      const url = internalUrl(e.target);
      if (!url) return;
      const href = url.pathname + url.search;
      if (prefetched.has(href)) return;
      prefetched.add(href);
      router.prefetch(href);
    }

    function onClick(e: MouseEvent) {
      if (reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const url = internalUrl(e.target);
      if (!url) return;
      if (url.pathname === location.pathname && (url.hash || url.search === location.search)) return;

      e.preventDefault();
      setTint(tints[Math.floor(Math.random() * tints.length)]);
      setPhase("cover");
      window.setTimeout(() => {
        router.push(url.pathname + url.search + url.hash, { scroll: false });
        // Same-path changes (e.g. shop filters) don't change the pathname, so lift anyway.
        fallback.current = window.setTimeout(reveal, 350);
      }, COVER_MS);
    }

    // Capture phase: runs before next/link's own handler, which then sees defaultPrevented and stands down.
    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerover", onPointerOver);
    };
  }, [router, reveal]);

  useEffect(() => {
    if (phase === "cover") reveal();
    // Only a route change should lift the curtain.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className={`curtain is-${phase}`} style={{ backgroundColor: tint }} aria-hidden="true">
      <span className="curtain-mark">
        <Logo size={110} />
      </span>
    </div>
  );
}
