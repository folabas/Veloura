# Veloura content API and admin panel

Manages products (scarves, abayas, clothing), their photos, prices and shop categories.
The website reads from it; the owner edits through the admin panel at `/admin`.

- **Stack:** Node 22, Express, MongoDB Atlas. Photos are resized to WebP and stored in MongoDB (GridFS),
  because Render's disk is wiped on every deploy.
- **Public (read-only):** `GET /api/catalog` (categories + visible products), `GET /api/products/:slug`, `GET /images/:id`
- **Admin (username and password):** `/admin`, and `/api/admin/*` for products, categories and photo uploads.

## Deploy on Render

1. **MongoDB Atlas → Network Access:** add `0.0.0.0/0` (Render's free plan has no fixed IP address).
2. **Render → New → Blueprint →** choose the `folabas/Veloura` repo. Render reads `render.yaml` and creates
   the `veloura-api` service. Fill in:
   | Variable | Value |
   |---|---|
   | `MONGODB_URI` | Your Atlas connection string with the real password in place of `<db_password>` |
   | `ADMIN_USERNAME` | The admin panel username (at least 3 characters; capital letters don't matter) |
   | `ADMIN_PASSWORD` | The admin panel password (at least 10 characters) |
   | `PUBLIC_URL` | `https://veloura-api.onrender.com` (the service's address; check it on the service page) |
   | `FRONTEND_REVALIDATE_URL` | `https://<your-site>.vercel.app/api/revalidate` |
   | `REVALIDATE_SECRET` | Any long random string; use the same one on Vercel |

   `SESSION_SECRET` is generated for you.
3. **Load the starter products (once):** on your computer, copy `.env.example` to `.env`, fill in
   `MONGODB_URI`, then run `npm install` and `npm run seed`. It adds the four categories and the five
   sample scarves with their photos, and skips anything already there.
4. **Vercel → the website project → Settings → Environment Variables:** add
   `API_URL` = `https://veloura-api.onrender.com` and `REVALIDATE_SECRET` = the same value as on Render.
   Then redeploy the website.

The admin panel is then at `https://veloura-api.onrender.com/admin`.

**Free plan note:** Render's free services sleep after 15 minutes without visits and take up to a minute
to wake. Shoppers aren't affected (the website keeps its own copy of the catalogue), but the admin panel
can be slow to open the first time. Render's Starter plan keeps it awake.

## Run locally

```bash
npm install
cp .env.example .env   # fill in the values
npm run dev            # http://localhost:4000/admin
```
