/**
 * The Veloura logo (V monogram in a ring with a leaf sprig). It's drawn as a mask over
 * `currentColor`, so it takes the colour of the text around it: cocoa on paper, white on photos.
 * Source file: /public/brand/logo.png (transparent, cropped).
 */
export function Logo({ size = 64, className = "", label }: { size?: number; className?: string; label?: string }) {
  return (
    <span
      className={`logo ${className}`}
      style={{ width: size }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
