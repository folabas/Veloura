import type { ReactNode } from "react";

/**
 * Text set around a circle that turns slowly, with something in the middle
 * (a play mark, the V monogram, an arrow). Rino & Pelle uses these over photos.
 */
export function CircleBadge({
  text,
  children,
  size = 132,
  spinOnScroll = false,
  className = "",
}: {
  text: string;
  children?: ReactNode;
  size?: number;
  spinOnScroll?: boolean;
  className?: string;
}) {
  const id = `circle-${text.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <span className={`badge ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="badge-ring" aria-hidden="true" data-spin={spinOnScroll ? "" : undefined}>
        <defs>
          <path id={id} d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text>
          <textPath href={`#${id}`} textLength="236">
            {text}
          </textPath>
        </text>
      </svg>
      {children && <span className="badge-core">{children}</span>}
    </span>
  );
}
