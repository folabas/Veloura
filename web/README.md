# Veloura

Online shop for Veloura, built with Next.js 15 (App Router). Customers build a bag and send the order
to Veloura on WhatsApp; payment and delivery are arranged in that chat.
Brand brief and design direction: [`../BRAND.md`](../BRAND.md).

Products, photos, prices and categories are managed in the admin panel of the content API
([`../api`](../api/README.md)). Changes show on the site within seconds.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. To use real content, create `.env.local` with `API_URL` pointing at the
API (e.g. `http://localhost:4000`). Without it, the site shows the built-in sample products.

## Environment variables (Vercel → Settings → Environment Variables)

| Name | Value |
|---|---|
| `API_URL` | The content API's address, e.g. `https://veloura-api.onrender.com` |
| `REVALIDATE_SECRET` | Same value as on Render; lets admin saves refresh the site immediately |

## Where things live

| What | Where |
|---|---|
| Products, prices, photos, categories | The admin panel (`<API address>/admin`) |
| Sample products used when no API is set | `src/lib/products.ts` |
| Reading the catalogue from the API | `src/lib/catalog.ts` |
| WhatsApp number, phone, Instagram and TikTok links | `src/lib/site.ts` |
| Collections (The Rose Edit) | `src/lib/collections.ts` |
| Lookbook chapters, photos and videos | `src/lib/looks.ts` |
| Site photos (hero, lookbook) | `public/images/` |
| Colours, fonts, layout | `src/app/globals.css` |

## Orders

At checkout the customer fills in their delivery details, and the site opens WhatsApp with the items,
total and address already written. Prices in that message come from the catalogue, but always check the
total against your price list before confirming, since a customer can edit the message before sending.

## Not done yet

- Real products, prices and details (the current ones are samples; edit them in the admin panel)
- Delivery fees
- Online payment (left out for now)
- Mailing-list sign-up (the form shows a message but saves nothing)
