"use client";

import { createContext, useContext, useMemo } from "react";
import type { Catalog } from "@/lib/catalog";

type CatalogValue = Catalog & {
  getProduct: (slug: string) => Catalog["products"][number] | undefined;
  getCategory: (slug: string | undefined) => Catalog["categories"][number] | undefined;
};

const CatalogContext = createContext<CatalogValue | null>(null);

/** Shares the catalogue fetched on the server with client components (bag, checkout, cards). */
export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  const value = useMemo<CatalogValue>(() => {
    const bySlug = new Map(catalog.products.map((p) => [p.slug, p]));
    const cats = new Map(catalog.categories.map((c) => [c.slug, c]));
    return {
      ...catalog,
      getProduct: (slug) => bySlug.get(slug),
      getCategory: (slug) => (slug ? cats.get(slug) : undefined),
    };
  }, [catalog]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside CatalogProvider");
  return ctx;
}
