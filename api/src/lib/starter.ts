import { categories, products } from "../db.js";
import { storeImage } from "./images.js";

// The four shop categories and five sample scarves the site launched with.
// Loaded by `npm run seed` or the admin panel's "Load starter products" button.
// Anything that already exists is left alone, so loading twice is safe.

export const starterCategories = [
  { slug: "scarves", name: "Scarves", order: 1 },
  { slug: "everyday", name: "Everyday", order: 2 },
  { slug: "abaya-sets", name: "Abaya sets", order: 3 },
  { slug: "statement", name: "Statement pieces", order: 4 },
];

const care = (fabric: string) => [
  { label: "Fabric", value: fabric },
  { label: "Size", value: "Approx. 180 × 70 cm" },
  { label: "Care", value: "Hand wash cold, cool iron" },
];

export const starterProducts = [
  { slug: "bow-print-scarf-rose-pink", name: "Bow Print Scarf", colour: "Rose pink", category: "scarves", price: 12500, isNew: true, file: "bow-print-pink.webp", focus: "50% 30%",
    description: "A playful scattering of ribbon bows on a bright rose ground. Light enough for everyday wear, bold enough to carry the whole outfit.", details: care("Soft woven chiffon") },
  { slug: "bamboo-print-scarf-ink", name: "Bamboo Print Scarf", colour: "Ink", category: "scarves", price: 12500, isNew: true, file: "bamboo-print-black.webp", focus: "50% 28%",
    description: "White bamboo leaves drawn across deep ink. Quiet and graphic, it pairs with everything from denim to an evening abaya.", details: care("Soft woven chiffon") },
  { slug: "polka-dot-scarf-ivory", name: "Polka Dot Scarf", colour: "Ivory", category: "scarves", price: 11500, isNew: true, file: "polka-dot-white.webp", focus: "50% 30%",
    description: "Classic black dots on ivory with a soft drape. An easy favourite that softens a dark outfit or brightens a neutral one.", details: care("Soft woven chiffon") },
  { slug: "leopard-print-scarf-dove", name: "Leopard Print Scarf", colour: "Dove grey", category: "scarves", price: 13000, isNew: false, file: "leopard-print-grey.webp", focus: "50% 40%",
    description: "A soft-focus leopard print in dove grey and cream. The wild print, made gentle enough to wear any day of the week.", details: care("Jersey") },
  { slug: "rose-print-scarf-cocoa", name: "Rose Print Scarf", colour: "Cocoa", category: "statement", price: 15000, isNew: true, file: "rose-print-brown-outdoor.webp", focus: "50% 45%",
    description: "Full-blown roses in blush on deep cocoa satin. The piece that finishes an outfit, from the morning walk to the evening plans.", details: care("Satin") },
];

/** Adds whatever starter categories and products are missing. `getPhoto` supplies each photo file. */
export async function loadStarter(getPhoto: (file: string) => Promise<Buffer>, log: (line: string) => void = () => {}) {
  let addedCategories = 0;
  let addedProducts = 0;

  for (const c of starterCategories) {
    const r = await categories.updateOne({ slug: c.slug }, { $setOnInsert: c }, { upsert: true });
    if (r.upsertedCount) addedCategories++;
    log(r.upsertedCount ? `+ category ${c.name}` : `= category ${c.name} (already there)`);
  }

  for (const [i, p] of starterProducts.entries()) {
    if (await products.findOne({ slug: p.slug })) {
      log(`= product ${p.name} (already there)`);
      continue;
    }
    const id = await storeImage(await getPhoto(p.file), p.file);
    const now = new Date();
    await products.insertOne({
      slug: p.slug, name: p.name, colour: p.colour, category: p.category, price: p.price,
      description: p.description, details: p.details,
      images: [{ id, alt: `${p.name}, ${p.colour}`, focus: p.focus }],
      isNew: p.isNew, soldOut: false, published: true, order: i + 1, createdAt: now, updatedAt: now,
    });
    addedProducts++;
    log(`+ product ${p.name}, ${p.colour}`);
  }
  return { addedCategories, addedProducts };
}
