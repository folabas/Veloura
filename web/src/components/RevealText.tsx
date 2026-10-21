import type { ReactNode } from "react";

type Tag = "h1" | "h2" | "h3" | "p";

/** Heading whose lines slide up out of a mask on scroll. Pass one entry per line. */
export function RevealText({ as: As = "h2", lines, className }: { as?: Tag; lines: ReactNode[]; className?: string }) {
  return (
    <As className={className} data-reveal="lines">
      {lines.map((line, i) => (
        <span className="line" key={i}>
          <span className="line-inner">{line}</span>
        </span>
      ))}
    </As>
  );
}
