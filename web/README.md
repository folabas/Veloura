# Veloura

Online shop for Veloura, built with Next.js 15 (App Router). Customers build a bag and send the order
to Veloura on WhatsApp; payment and delivery are arranged in that chat.
Brand brief and design direction: [`../BRAND.md`](../BRAND.md).

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Where things live

| What | Where |
|---|---|
| Products (names, prices in naira, details, photos) | `src/lib/products.ts` |
| WhatsApp number, phone, Instagram and TikTok links | `src/lib/site.ts` |
| Lookbook photos and videos | `src/lib/looks.ts` |
| Photos | `public/images/` |
| Videos (create the folder) | `public/videos/` |
| Colours, fonts, layout | `src/app/globals.css` |
| Pages | `src/app/` (home, `shop`, `shop/[slug]`, `lookbook`, `about`, `cart`, `checkout`) |

## Orders

Set the shop's WhatsApp number in `src/lib/site.ts` (international format, e.g. `2348012345678`).
Until it is set, the checkout page shows "Online ordering opens soon".

At checkout the customer fills in their delivery details, and the site opens WhatsApp with the items,
total and address already written. Prices in that message come from `products.ts`, but always check the
total against your price list before confirming, since a customer can edit the message before sending.

## Not done yet

- Real products, prices and details (the current ones are samples)
- Delivery fees
- Online payment (left out for now)
- Mailing-list sign-up (the form shows a message but saves nothing)
