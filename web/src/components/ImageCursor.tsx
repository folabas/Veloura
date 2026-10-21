"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/*
  On devices with a mouse, hovering anything marked data-cursor-img swaps the arrow for a small
  floating photo of the piece with its name, which trails the pointer softly. Clicking still
  follows the link underneath. Touch screens keep normal behaviour.
*/
export function ImageCursor() {
  const pathname = usePathname();
  const el = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<{ img: string; label: string } | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let frame = 0;
    let current: HTMLElement | null = null;

    const tick = () => {
      const ease = reduce ? 1 : 0.18;
      pos.x += (target.x - pos.x) * ease;
      pos.y += (target.y - pos.y) * ease;
      if (el.current) el.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      const hit = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor-img]");
      if (hit === current) return;
      if (hit && !current) {
        pos.x = target.x;
        pos.y = target.y;
      }
      current = hit;
      setPreview(hit ? { img: hit.dataset.cursorImg!, label: hit.dataset.cursorLabel ?? "" } : null);
    };
    const onLeave = () => {
      current = null;
      setPreview(null);
    };

    document.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      setPreview(null);
    };
  }, [pathname]);

  return (
    <div ref={el} className={`image-cursor${preview ? " is-on" : ""}`} aria-hidden="true">
      <div className="image-cursor-card">
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny decorative preview of an image already on the page */}
        {preview && <img src={preview.img} alt="" />}
        <span className="image-cursor-label">
          <span className="label">Shop</span>
          {preview?.label}
        </span>
      </div>
    </div>
  );
}
