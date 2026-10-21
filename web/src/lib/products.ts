// Product catalogue. This is the one place to add, edit or remove products.
// Prices are in naira. PLACEHOLDER: names, prices and details below are samples until the real
// product list arrives. Images live in /public/images.

export type CategorySlug = "scarves" | "everyday" | "abaya-sets" | "statement";

export const categories: { slug: CategorySlug; name: string }[] = [
  { slug: "scarves", name: "Scarves" },
  { slug: "everyday", name: "Everyday" },
  { slug: "abaya-sets", name: "Abaya sets" },
  { slug: "statement", name: "Statement pieces" },
];

export type Product = {
  slug: string;
  name: string;
  colour: string;
  category: CategorySlug;
  price: number;
  description: string;
  details: { label: string; value: string }[];
  images: { src: string; alt: string; focus?: string }[];
  isNew?: boolean;
  soldOut?: boolean;
};

export const products: Product[] = [
  {
    slug: "bow-print-scarf-rose-pink",
    name: "Bow Print Scarf",
    colour: "Rose pink",
    category: "scarves",
    price: 12500,
    isNew: true,
    description:
      "A playful scattering of ribbon bows on a bright rose ground. Light enough for everyday wear, bold enough to carry the whole outfit.",
    details: [
      { label: "Fabric", value: "Soft woven chiffon" },
      { label: "Size", value: "Approx. 180 × 70 cm" },
      { label: "Care", value: "Hand wash cold, cool iron" },
    ],
    images: [{ src: "/images/bow-print-pink.webp", alt: "Model wearing the rose pink bow print scarf", focus: "50% 30%" }],
  },
  {
    slug: "bamboo-print-scarf-ink",
    name: "Bamboo Print Scarf",
    colour: "Ink",
    category: "scarves",
    price: 12500,
    isNew: true,
    description:
      "White bamboo leaves drawn across deep ink. Quiet and graphic, it pairs with everything from denim to an evening abaya.",
    details: [
      { label: "Fabric", value: "Soft woven chiffon" },
      { label: "Size", value: "Approx. 180 × 70 cm" },
      { label: "Care", value: "Hand wash cold, cool iron" },
    ],
    images: [{ src: "/images/bamboo-print-black.webp", alt: "Model wearing the ink bamboo print scarf", focus: "50% 28%" }],
  },
  {
    slug: "polka-dot-scarf-ivory",
    name: "Polka Dot Scarf",
    colour: "Ivory",
    category: "scarves",
    price: 11500,
    isNew: true,
    description:
      "Classic black dots on ivory with a soft drape. An easy favourite that softens a dark outfit or brightens a neutral one.",
    details: [
      { label: "Fabric", value: "Soft woven chiffon" },
      { label: "Size", value: "Approx. 180 × 70 cm" },
      { label: "Care", value: "Hand wash cold, cool iron" },
    ],
    images: [{ src: "/images/polka-dot-white.webp", alt: "Model wearing the ivory polka dot scarf", focus: "50% 30%" }],
  },
  {
    slug: "leopard-print-scarf-dove",
    name: "Leopard Print Scarf",
    colour: "Dove grey",
    category: "scarves",
    price: 13000,
    description:
      "A soft-focus leopard print in dove grey and cream. The wild print, made gentle enough to wear any day of the week.",
    details: [
      { label: "Fabric", value: "Jersey" },
      { label: "Size", value: "Approx. 180 × 70 cm" },
      { label: "Care", value: "Hand wash cold, cool iron" },
    ],
    images: [{ src: "/images/leopard-print-grey.webp", alt: "Model wearing the dove grey leopard print scarf", focus: "50% 40%" }],
  },
  {
    slug: "rose-print-scarf-cocoa",
    name: "Rose Print Scarf",
    colour: "Cocoa",
    category: "statement",
    price: 15000,
    isNew: true,
    description:
      "Full-blown roses in blush on deep cocoa satin. The piece that finishes an outfit, from the morning walk to the evening plans.",
    details: [
      { label: "Fabric", value: "Satin" },
      { label: "Size", value: "Approx. 180 × 70 cm" },
      { label: "Care", value: "Hand wash cold, cool iron on reverse" },
    ],
    images: [{ src: "/images/rose-print-brown-outdoor.webp", alt: "Model outdoors wearing the cocoa rose print scarf", focus: "50% 45%" }],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getCategory(slug: string | undefined) {
  return categories.find((c) => c.slug === slug);
}

export function productsIn(category?: CategorySlug) {
  return category ? products.filter((p) => p.category === category) : products;
}

export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);
}
