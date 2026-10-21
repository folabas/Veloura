import Image from "next/image";

/**
 * A cropped photo box. `reveal` uncovers it on scroll; `parallax` makes the whole box drift
 * against the scroll (positive = faster than the page). Size and shape come from `className`.
 */
export function Photo({
  src,
  alt,
  className = "",
  sizes = "50vw",
  focus = "50% 35%",
  priority,
  reveal = true,
  parallax,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  focus?: string;
  priority?: boolean;
  reveal?: boolean;
  parallax?: number;
}) {
  return (
    <div
      className={`photo ${className}`}
      data-reveal={reveal ? "image" : undefined}
      data-parallax={parallax ? String(parallax) : undefined}
    >
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} style={{ objectFit: "cover", objectPosition: focus }} />
    </div>
  );
}
