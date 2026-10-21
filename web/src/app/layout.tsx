import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { CatalogProvider } from "@/components/CatalogProvider";
import { getCatalog } from "@/lib/catalog";
import { ImageCursor } from "@/components/ImageCursor";
import { Motion } from "@/components/Motion";
import { PageTransition } from "@/components/PageTransition";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Splash, splashBootScript } from "@/components/Splash";

const display = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
  variable: "--font-display",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
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
