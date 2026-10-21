import { Router } from "express";
import { ObjectId } from "mongodb";
import { categories, images, products, type ProductDoc } from "../db.js";
import { imageUrl } from "../lib/images.js";

// Read-only endpoints the website uses. Only published products are shown.
export const publicRoutes = Router();

export function toPublicProduct(p: ProductDoc) {
  return {
    slug: p.slug,
    name: p.name,
    colour: p.colour,
    category: p.category,
    price: p.price,
    description: p.description,
    details: p.details,
    images: p.images.map((img) => ({ src: imageUrl(img.id), alt: img.alt, focus: img.focus })),
    isNew: p.isNew,
    soldOut: p.soldOut,
  };
}

const sort = { order: 1, createdAt: -1 } as const;

publicRoutes.get("/api/catalog", async (_req, res) => {
  const [cats, prods] = await Promise.all([
    categories.find({}, { sort: { order: 1, name: 1 } }).toArray(),
    products.find({ published: true }, { sort }).toArray(),
  ]);
  res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=300");
  res.json({
    categories: cats.map((c) => ({ slug: c.slug, name: c.name })),
    products: prods.map(toPublicProduct),
  });
});

publicRoutes.get("/api/products/:slug", async (req, res) => {
  const p = await products.findOne({ slug: req.params.slug, published: true });
  if (!p) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(toPublicProduct(p));
});

// Photos never change once uploaded (a new upload gets a new id), so browsers can keep them for a year.
publicRoutes.get("/images/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).end();
    return;
  }
  const id = new ObjectId(req.params.id);
  const file = await images.find({ _id: id }).next();
  if (!file) {
    res.status(404).end();
    return;
  }
  res.set({
    "Content-Type": (file.metadata?.contentType as string) ?? "image/webp",
    "Content-Length": String(file.length),
    "Cache-Control": "public, max-age=31536000, immutable",
    "Cross-Origin-Resource-Policy": "cross-origin",
  });
  images.openDownloadStream(id).on("error", () => res.destroy()).pipe(res);
});
