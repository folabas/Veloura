// Loads the starter categories and the five sample scarves (with their photos) into MongoDB.
// Run once after setting MONGODB_URI:  npm run seed
// It skips anything that already exists, so running it twice is safe.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { categories, connect, disconnect, products } from "../src/db.js";
import { storeImage } from "../src/lib/images.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const photoDir = path.resolve(here, "../../web/public/images");

const starterCategories = [
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

// Sample products, matching the website's built-in fallback. Replace them in the admin panel.
const starterProducts = [
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

await connect();

for (const c of starterCategories) {
  const r = await categories.updateOne({ slug: c.slug }, { $setOnInsert: c }, { upsert: true });
  console.log(r.upsertedCount ? `+ category ${c.name}` : `= category ${c.name} (already there)`);
}

for (const [i, p] of starterProducts.entries()) {
  if (await products.findOne({ slug: p.slug })) {
    console.log(`= product ${p.name} (already there)`);
    continue;
  }
  const id = await storeImage(await readFile(path.join(photoDir, p.file)), p.file);
  const now = new Date();
  await products.insertOne({
    slug: p.slug, name: p.name, colour: p.colour, category: p.category, price: p.price,
    description: p.description, details: p.details,
    images: [{ id, alt: `${p.name}, ${p.colour}`, focus: p.focus }],
    isNew: p.isNew, soldOut: false, published: true, order: i + 1, createdAt: now, updatedAt: now,
  });
  console.log(`+ product ${p.name}, ${p.colour}`);
}

await disconnect();
console.log("Done.");
