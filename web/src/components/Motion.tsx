"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { SPLASH_DONE } from "./Splash";

gsap.registerPlugin(ScrollTrigger);

/*
  Scroll animations in the Rino & Pelle style, driven by data attributes so pages stay plain markup:
    data-reveal="lines"   heading lines slide up out of a mask (use <RevealText>)
    data-reveal="chars"   letters fade in one by one
    data-reveal="fade"    fades and rises into place
    data-reveal="image"   photo uncovers from the bottom while settling from a slight zoom
    data-parallax="0.15"  drifts against the scroll; positive moves up faster, negative slower
    data-spin             rotates with the scroll (circular text badges)
    data-bg="#hex"        page background eases to this colour while the section is in view
  Initial states are set here in JS, so with scripts off or reduced motion everything simply shows.
*/
export function Motion() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {});
    const setup = () => ctx.add(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
        gsap.from(el.querySelectorAll(".line-inner"), {
          yPercent: 110,
          duration: 0.85,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 92%" },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="chars"]').forEach((el) => {
        const text = el.textContent ?? "";
        el.setAttribute("aria-label", text);
        el.innerHTML = [...text]
          .map((c) => `<span aria-hidden="true" class="char">${c === " " ? "&nbsp;" : c}</span>`)
          .join("");
        gsap.from(el.querySelectorAll(".char"), {
          opacity: 0,
          y: "0.3em",
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.035,
          scrollTrigger: { trigger: el, start: "top 92%" },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 94%" },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="image"]').forEach((el) => {
        const media = el.querySelector("img, video");
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 92%" } });
        tl.from(el, { clipPath: "inset(100% 0% 0% 0%)", duration: 0.95, ease: "power4.inOut" });
        // clearProps hands the photo back to CSS afterwards, so hover zooms still work.
        if (media) tl.from(media, { scale: 1.2, duration: 1.3, ease: "power3.out", clearProps: "transform" }, 0);
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = Number(el.dataset.parallax) || 0.15;
        gsap.fromTo(
          el,
          { yPercent: speed * 60 },
          {
            yPercent: -speed * 60,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-spin]").forEach((el) => {
        gsap.to(el, {
          rotate: 220,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      const base = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();
      gsap.utils.toArray<HTMLElement>("[data-bg]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 45%",
          onToggle: (self) =>
            gsap.to(document.body, {
              backgroundColor: self.isActive ? el.dataset.bg : base,
              duration: 0.8,
              ease: "power2.out",
              overwrite: "auto",
            }),
        });
      });
    });

    // While the splash screen is up, hide what's on screen and play the reveals as it lifts.
    const afterSplash = () => {
      gsap.set("main .line-inner", { clearProps: "transform" });
      setup();
    };
    const waiting = document.documentElement.dataset.splash === "play";
    if (waiting) {
      gsap.set("main .line-inner", { yPercent: 110 });
      window.addEventListener(SPLASH_DONE, afterSplash, { once: true });
    } else {
      setup();
    }

    // Images and fonts change the page height after first paint.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      window.removeEventListener(SPLASH_DONE, afterSplash);
      if (waiting) gsap.set("main .line-inner", { clearProps: "transform" });
      ctx.revert();
      gsap.set(document.body, { clearProps: "backgroundColor" });
    };
  }, [pathname]);

  return null;
}
