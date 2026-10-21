import { Router } from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { ObjectId } from "mongodb";
import { categories, products, type ProductDoc } from "../db.js";
import { credentialsMatch, endSession, isAdmin, requireAdmin, startSession } from "../lib/auth.js";
import { deleteImage, imageUrl, storeImage } from "../lib/images.js";
import { notifyWebsite } from "../lib/revalidate.js";
import { categoryInput, firstIssue, productInput, slugify } from "../lib/validate.js";

export const adminRoutes = Router();

// ---------- Sign in ----------

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many attempts. Try again in 15 minutes." },
});

adminRoutes.post("/api/admin/login", loginLimiter, (req, res) => {
  const username = typeof req.body?.username === "string" ? req.body.username : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!username || !password || !credentialsMatch(username, password)) {
    res.status(401).json({ error: "That username or password isn't right." });
    return;
  }
  startSession(res);
  res.json({ ok: true });
});

adminRoutes.post("/api/admin/logout", (_req, res) => {
  endSession(res);
  res.json({ ok: true });
});

adminRoutes.get("/api/admin/me", (req, res) => {
  res.json({ signedIn: isAdmin(req) });
});

// Everything below needs a signed-in admin.
adminRoutes.use("/api/admin", requireAdmin);

// ---------- Categories ----------

adminRoutes.get("/api/admin/categories", async (_req, res) => {
  const list = await categories.find({}, { sort: { order: 1, name: 1 } }).toArray();
  const counts = await products.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$category", n: { $sum: 1 } } }]).toArray();
  const byCat = new Map(counts.map((c) => [c._id, c.n]));
  res.json(list.map((c) => ({ id: c._id!.toHexString(), slug: c.slug, name: c.name, order: c.order, productCount: byCat.get(c.slug) ?? 0 })));
});

adminRoutes.post("/api/admin/categories", async (req, res) => {
  const parsed = categoryInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssue(parsed.error) });
    return;
  }
  const { name, order } = parsed.data;
  const slug = parsed.data.slug ?? slugify(name);
  if (await categories.findOne({ slug })) {
    res.status(409).json({ error: `A category called "${slug}" already exists.` });
    return;
  }
  const { insertedId } = await categories.insertOne({ name, slug, order });
  notifyWebsite();
  res.status(201).json({ id: insertedId.toHexString(), name, slug, order });
});

adminRoutes.put("/api/admin/categories/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: "Category not found." });
    return;
  }
  const parsed = categoryInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssue(parsed.error) });
    return;
  }
  const _id = new ObjectId(req.params.id);
  const existing = await categories.findOne({ _id });
  if (!existing) {
    res.status(404).json({ error: "Category not found." });
    return;
  }
  // The link name (slug) stays fixed once created, so existing shop links keep working.
  await categories.updateOne({ _id }, { $set: { name: parsed.data.name, order: parsed.data.order } });
  notifyWebsite();
  res.json({ ok: true });
});

adminRoutes.delete("/api/admin/categories/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: "Category not found." });
    return;
  }
  const _id = new ObjectId(req.params.id);
  const existing = await categories.findOne({ _id });
  if (!existing) {
    res.status(404).json({ error: "Category not found." });
    return;
  }
  const inUse = await products.countDocuments({ category: existing.slug });
  if (inUse) {
    res.status(409).json({ error: `Move or delete the ${inUse} product${inUse === 1 ? "" : "s"} in "${existing.name}" first.` });
    return;
  }
  await categories.deleteOne({ _id });
  notifyWebsite();
  res.json({ ok: true });
});

// ---------- Products ----------

const toAdminProduct = (p: ProductDoc) => ({
  id: p._id!.toHexString(),
  ...p,
  _id: undefined,
  images: p.images.map((img) => ({ ...img, url: imageUrl(img.id) })),
});

adminRoutes.get("/api/admin/products", async (_req, res) => {
  const list = await products.find({}, { sort: { order: 1, createdAt: -1 } }).toArray();
  res.json(list.map(toAdminProduct));
});

adminRoutes.get("/api/admin/products/:id", async (req, res) => {
  const p = ObjectId.isValid(req.params.id) ? await products.findOne({ _id: new ObjectId(req.params.id) }) : null;
  if (!p) {
    res.status(404).json({ error: "Product not found." });
    return;
  }
  res.json(toAdminProduct(p));
});

async function uniqueSlug(base: string, exceptId?: ObjectId) {
  let slug = base || "product";
  for (let n = 2; ; n++) {
    const clash = await products.findOne({ slug, ...(exceptId ? { _id: { $ne: exceptId } } : {}) });
    if (!clash) return slug;
    slug = `${base}-${n}`;
  }
}

async function categoryExists(slug: string) {
  return Boolean(await categories.findOne({ slug }));
}

adminRoutes.post("/api/admin/products", async (req, res) => {
  const parsed = productInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssue(parsed.error) });
    return;
  }
  const data = parsed.data;
  if (!(await categoryExists(data.category))) {
    res.status(400).json({ error: "Choose a category that exists." });
    return;
  }
  const slug = await uniqueSlug(data.slug ?? slugify(`${data.name} ${data.colour}`));
  const now = new Date();
  const doc: ProductDoc = { ...data, slug, createdAt: now, updatedAt: now };
  const { insertedId } = await products.insertOne(doc);
  notifyWebsite();
  res.status(201).json(toAdminProduct({ ...doc, _id: insertedId }));
});

adminRoutes.put("/api/admin/products/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: "Product not found." });
    return;
  }
  const _id = new ObjectId(req.params.id);
  const existing = await products.findOne({ _id });
  if (!existing) {
    res.status(404).json({ error: "Product not found." });
    return;
  }
  const parsed = productInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssue(parsed.error) });
    return;
  }
  const data = parsed.data;
  if (!(await categoryExists(data.category))) {
    res.status(400).json({ error: "Choose a category that exists." });
    return;
  }
  const slug = data.slug && data.slug !== existing.slug ? await uniqueSlug(data.slug, _id) : existing.slug;
  await products.updateOne({ _id }, { $set: { ...data, slug, updatedAt: new Date() } });

  // Photos removed from the product are deleted from storage too.
  const kept = new Set(data.images.map((i) => i.id));
  await Promise.all(existing.images.filter((i) => !kept.has(i.id)).map((i) => deleteImage(i.id)));

  notifyWebsite();
  const updated = await products.findOne({ _id });
  res.json(toAdminProduct(updated!));
});

adminRoutes.delete("/api/admin/products/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: "Product not found." });
    return;
  }
  const _id = new ObjectId(req.params.id);
  const existing = await products.findOne({ _id });
  if (!existing) {
    res.status(404).json({ error: "Product not found." });
    return;
  }
  await products.deleteOne({ _id });
  await Promise.all(existing.images.map((i) => deleteImage(i.id)));
  notifyWebsite();
  res.json({ ok: true });
});

// ---------- Photo uploads ----------

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 12 },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp|heic|heif|avif)$/.test(file.mimetype)),
});

// Uploads return ids; they're attached to a product when the product is saved.
adminRoutes.post("/api/admin/images", upload.array("photos", 12), async (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (!files.length) {
    res.status(400).json({ error: "Choose JPG, PNG, WebP or HEIC photos under 15 MB." });
    return;
  }
  try {
    const stored = [];
    for (const f of files) {
      const id = await storeImage(f.buffer, f.originalname);
      stored.push({ id, url: imageUrl(id), alt: "" });
    }
    res.status(201).json(stored);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "One of those photos couldn't be read. Try saving it as JPG and uploading again." });
  }
});
