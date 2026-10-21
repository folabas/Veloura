import { sampleCategories, sampleProducts, type Category, type Product } from "./products";

export type Catalog = { products: Product[]; categories: Category[] };

export const CATALOG_TAG = "catalog";
const sample: Catalog = { products: sampleProducts, categories: sampleCategories };

/**
 * Products and categories from the content API (the admin panel on Render).
 * Cached and refreshed at most once a minute, or immediately when the admin saves.
 * With no API_URL set, the site uses the built-in sample catalogue.
 */
export async function getCatalog(): Promise<Catalog> {
  const api = process.env.API_URL?.replace(/\/$/, "");
  if (!api) return sample;
  try {
    const res = await fetch(`${api}/api/catalog`, {
      next: { revalidate: 60, tags: [CATALOG_TAG] },
      // A sleeping free-tier Render service can take a while to wake up.
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) throw new Error(`Catalogue request failed with ${res.status}`);
    return (await res.json()) as Catalog;
  } catch (err) {
    // During a build, carry on with the samples rather than failing the deploy.
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.warn("Content API unreachable during build; using sample catalogue.", err);
      return sample;
    }
    // At runtime, failing keeps the last good cached page on screen instead of the samples.
    throw err;
  }
}

export const findProduct = (c: Catalog, slug: string) => c.products.find((p) => p.slug === slug);
export const findCategory = (c: Catalog, slug: string | undefined) => c.categories.find((x) => x.slug === slug);
export const productsIn = (c: Catalog, category?: string) =>
  category ? c.products.filter((p) => p.category === category) : c.products;
