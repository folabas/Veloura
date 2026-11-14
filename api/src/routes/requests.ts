import { Router, type Request } from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { ObjectId } from "mongodb";
import sharp from "sharp";
import { config } from "../config.js";
import { images, requests, type RequestDoc } from "../db.js";
import { requireAdmin } from "../lib/auth.js";
import { attachRequestPhotos, cleanUpAbandonedRequestPhotos, deleteImage, storeImage } from "../lib/images.js";
import { firstIssue, requestInput, requestUpdateInput, toWhatsAppDigits } from "../lib/validate.js";

export const requestRoutes = Router();

// Customers reach this through the website's address, so the visitor's own IP is the first entry
// in X-Forwarded-For (the last one would be the website's server, shared by everyone).
const visitor = (req: Request) => String(req.headers["x-forwarded-for"] ?? req.ip ?? "").split(",")[0].trim() || "unknown";
const limiter = (limit: number, windowMinutes: number, message: string) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    keyGenerator: visitor,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { error: message },
  });

// ---------- Public: the custom-order form ----------

const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp|heic|heif|avif)$/.test(file.mimetype)),
});

requestRoutes.post(
  "/api/requests/photos",
  limiter(40, 60, "Too many photos uploaded. Please try again in an hour."),
  photoUpload.single("photo"),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "Choose a JPG, PNG or HEIC photo under 12 MB." });
      return;
    }
    try {
      const id = await storeImage(req.file.buffer, req.file.originalname, "request");
      cleanUpAbandonedRequestPhotos().catch(() => {});
      res.status(201).json({ id });
    } catch {
      res.status(400).json({ error: "That photo couldn't be read. Try a different one, or save it as JPG." });
    }
  },
);

/** The pre-written WhatsApp message for the fallback link (photos can't travel in a link). */
function whatsappText(r: RequestDoc, ref: string) {
  return [
    `Hello Veloura, I'd like a custom-made ${r.itemType.toLowerCase()}.`,
    "",
    r.description,
    ...(r.measurements ? ["", `Measurements: ${r.measurements}`] : []),
    ...(r.budget ? [`Budget: ${r.budget}`] : []),
    ...(r.neededBy ? [`Needed by: ${r.neededBy}`] : []),
    "",
    `Name: ${r.name}`,
    ...(r.photos.length ? [`I've uploaded ${r.photos.length} inspiration photo${r.photos.length === 1 ? "" : "s"} with my request.`] : []),
    `Request ref: ${ref}`,
  ].join("\n");
}

requestRoutes.post("/api/requests", limiter(8, 60, "You've sent several requests already. Please try again in an hour, or message us on WhatsApp."), async (req, res) => {
  const parsed = requestInput.safeParse(req.body);
  if (!parsed.success) {
    // A filled-in hidden field means a bot: pretend it worked so it doesn't retry.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) {
      res.status(201).json({ ref: "OK" });
      return;
    }
    res.status(400).json({ error: firstIssue(parsed.error) });
    return;
  }
  const { website: _honeypot, ...data } = parsed.data;

  // Only accept photos that really are fresh, unattached request uploads.
  const photoIds = data.photos.filter((id) => ObjectId.isValid(id));
  const found = photoIds.length
    ? await images.find({ _id: { $in: photoIds.map((id) => new ObjectId(id)) }, "metadata.kind": "request", "metadata.attached": false }).toArray()
    : [];
  const photos = photoIds.filter((id) => found.some((f) => f._id.toString() === id));

  const doc: RequestDoc = {
    ...data,
    photos,
    whatsapp: toWhatsAppDigits(data.phone),
    status: "new",
    notes: "",
    createdAt: new Date(),
  };
  const { insertedId } = await requests.insertOne(doc);
  await attachRequestPhotos(photos);
  const ref = insertedId.toHexString().slice(-6).toUpperCase();

  // The website opens this link so the customer can send the pre-written order to the shop's WhatsApp.
  res.status(201).json({
    ref,
    whatsappLink: `https://wa.me/${config.shopWhatsApp}?text=${encodeURIComponent(whatsappText(doc, ref))}`,
  });
});

// ---------- Admin: the Requests tab ----------

requestRoutes.use("/api/admin/requests", requireAdmin);

const toAdmin = (r: RequestDoc) => ({
  ...r,
  _id: undefined,
  id: r._id!.toHexString(),
  ref: r._id!.toHexString().slice(-6).toUpperCase(),
  photos: r.photos.map((p) => ({ id: p, url: `/api/admin/requests/${r._id!.toHexString()}/photos/${p}` })),
});

requestRoutes.get("/api/admin/requests", async (_req, res) => {
  const list = await requests.find({}, { sort: { createdAt: -1 }, limit: 500 }).toArray();
  res.json(list.map(toAdmin));
});

requestRoutes.get("/api/admin/requests/:id/photos/:photoId", async (req, res) => {
  const { id, photoId } = req.params;
  if (!ObjectId.isValid(id) || !ObjectId.isValid(photoId)) {
    res.status(404).end();
    return;
  }
  const r = await requests.findOne({ _id: new ObjectId(id), photos: photoId });
  if (!r) {
    res.status(404).end();
    return;
  }
  // ?download=1 saves it as a JPEG (opens anywhere, unlike WebP on some phones), named after the request.
  if (req.query.download) {
    const chunks: Buffer[] = [];
    for await (const chunk of images.openDownloadStream(new ObjectId(photoId))) chunks.push(chunk as Buffer);
    const jpeg = await sharp(Buffer.concat(chunks)).jpeg({ quality: 92 }).toBuffer();
    const ref = id.slice(-6).toUpperCase();
    const n = r.photos.indexOf(photoId) + 1;
    res.set({
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="veloura-request-${ref}-${n}.jpg"`,
      "Cache-Control": "private, no-store",
    });
    res.send(jpeg);
    return;
  }
  res.set({ "Content-Type": "image/webp", "Cache-Control": "private, max-age=86400" });
  images.openDownloadStream(new ObjectId(photoId)).on("error", () => res.destroy()).pipe(res);
});

requestRoutes.patch("/api/admin/requests/:id", async (req, res) => {
  const parsed = requestUpdateInput.safeParse(req.body);
  if (!parsed.success || !ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: parsed.success ? "Request not found." : firstIssue(parsed.error) });
    return;
  }
  const r = await requests.findOneAndUpdate({ _id: new ObjectId(req.params.id) }, { $set: parsed.data }, { returnDocument: "after" });
  if (!r) {
    res.status(404).json({ error: "Request not found." });
    return;
  }
  res.json(toAdmin(r));
});

requestRoutes.delete("/api/admin/requests/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: "Request not found." });
    return;
  }
  const r = await requests.findOneAndDelete({ _id: new ObjectId(req.params.id) });
  if (!r) {
    res.status(404).json({ error: "Request not found." });
    return;
  }
  await Promise.all(r.photos.map(deleteImage));
  res.json({ ok: true });
});
