import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import { checkServerSecrets, config } from "./config.js";
import { connect } from "./db.js";
import { adminRoutes } from "./routes/admin.js";
import { publicRoutes } from "./routes/public.js";

checkServerSecrets();

const here = path.dirname(fileURLToPath(import.meta.url));
const adminDir = path.resolve(here, "../admin");

const app = express();
app.set("trust proxy", 1); // Render sits in front of the app
app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: "same-site" },
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/healthz", (_req, res) => {
  res.json({ ok: true });
});

// The website (any origin) may read the public catalogue; nothing else is shared cross-site.
app.use(["/api/catalog", "/api/products"], cors({ methods: ["GET"] }));
app.use(publicRoutes);
app.use(adminRoutes);

app.use("/admin", express.static(adminDir, { index: "index.html", maxAge: config.isProduction ? "1h" : 0 }));
app.get("/", (_req, res) => res.redirect("/admin/"));

const onError: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our side. Please try again." });
};
app.use(onError);

await connect();
app.listen(config.port, () => {
  console.log(`Veloura API on ${config.publicUrl} (admin at /admin)`);
});
