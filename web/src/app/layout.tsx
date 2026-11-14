import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { CatalogProvider } from "@/components/CatalogProvider";
import { getCatalog } from "@/lib/catalog";
import { ImageCursor } from "@/components/ImageCursor";
import { Motion } from "@/components/Motion";
import { PageTransition } from "@/components/PageTransition";
import { SiteHeader } from "@/components/SiteHeader";
import { SaleBanner } from "@/components/SaleBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { Splash, splashBootScript } from "@/components/Splash";

// Fonts ship with the site (src/fonts) instead of being downloaded from Google at build time,
// so a change on Google's side can't break a deploy. Both are variable fonts covering every weight.
const display = localFont({
  src: [
    { path: "../fonts/bodoni-moda-latin-normal.woff2", weight: "400 900", style: "normal" },
    { path: "../fonts/bodoni-moda-latin-italic.woff2", weight: "400 900", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["Didot", "Bodoni 72", "Georgia", "serif"],
});

const body = localFont({
  src: [{ path: "../fonts/jost-latin.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-body",
  display: "swap",
  fallback: ["Futura", "Century Gothic", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: { default: "Veloura — For the Woman You Are", template: "%s · Veloura" },
  description:
    "Contemporary modest fashion. Scarves, everyday pieces, abaya sets and statement pieces for every side of you.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#f4eee6",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const catalog = await getCatalog();
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: splashBootScript }} />
      </head>
      <body>
        <Splash />
        <CatalogProvider catalog={catalog}>
          <CartProvider>
            <SaleBanner />
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter categories={catalog.categories} />
            <PageTransition />
            <ImageCursor />
            <Motion />
          </CartProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
