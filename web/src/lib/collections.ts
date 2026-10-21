// Collections (seasonal edits). Each gets its own story page at /collections/<slug>.
// PLACEHOLDER: "The Rose Edit" name, copy and which products belong to it are samples.

export type Collection = {
  slug: string;
  name: string;
  /** Second word, set in italic: "The Rose" + "Edit" */
  italic: string;
  season: string;
  intro: string;
  statement: string[];
  hero: { src: string; alt: string; focus?: string };
  productSlugs: string[];
};

export const collections: Collection[] = [
  {
    slug: "rose-edit",
    name: "The Rose",
    italic: "Edit",
    season: "2026",
    intro:
      "Deep cocoa grounds with soft rose blooms, and the quiet prints that sit beside them. Made to move with you from the morning walk to the evening plans.",
    statement: ["Deep cocoa", "and soft rose", "for every side of you"],
    hero: { src: "/images/rose-print-brown-outdoor.webp", alt: "Model outdoors by the water in the cocoa rose print scarf", focus: "50% 40%" },
    productSlugs: ["rose-print-scarf-cocoa", "bamboo-print-scarf-ink", "leopard-print-scarf-dove"],
  },
];

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug);
}
