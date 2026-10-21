"use client";

/** Round "scroll down" button that glides to the next section. */
export function ScrollDown({ to, className = "" }: { to: string; className?: string }) {
  return (
    <button
      type="button"
      className={`scroll-down ${className}`}
      aria-label="Scroll to the next section"
      onClick={() => document.getElementById(to)?.scrollIntoView({ behavior: "smooth" })}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </button>
  );
}
