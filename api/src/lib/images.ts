import { ObjectId } from "mongodb";
import sharp from "sharp";
import { imageFiles, images } from "../db.js";
import { config } from "../config.js";

// Stored as the master copy; the website makes smaller versions for each screen from it.
// 2560px covers full-screen photos on high-resolution laptops and phones.
const MAX_EDGE = 2560;

/**
 * Product photos are public. Customers' custom-order reference photos are "request" photos:
 * only the admin can view them, and they're attached to a request once it's submitted.
 */
export type ImageKind = "product" | "request";

/** Resizes and converts an upload to high-quality WebP, then stores it. Returns the new image id. */
export async function storeImage(buffer: Buffer, originalName: string, kind: ImageKind = "product") {
  // Re-encoding also drops the photo's hidden details (camera, location), which matters for customer uploads.
  const webp = await sharp(buffer)
    .rotate() // respect the phone's orientation flag
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true, kernel: "lanczos3" })
    // Quality 92 with full colour detail keeps prints and fabric texture crisp.
    .webp({ quality: 92, smartSubsample: true, effort: 5 })
    .toBuffer();

  const id = new ObjectId();
  await new Promise<void>((resolve, reject) => {
    images
      .openUploadStreamWithId(id, originalName.replace(/\.[^.]+$/, "") + ".webp", {
        metadata: { contentType: "image/webp", originalName, kind, ...(kind === "request" ? { attached: false } : {}) },
      })
      .on("error", reject)
      .on("finish", () => resolve())
      .end(webp);
  });
  return id.toHexString();
}

export async function deleteImage(id: string) {
  if (!ObjectId.isValid(id)) return;
  try {
    await images.delete(new ObjectId(id));
  } catch {
    // Already gone.
  }
}

export const imageUrl = (id: string) => `${config.publicUrl}/images/${id}`;

/** Marks request photos as belonging to a submitted request, so the clean-up leaves them alone. */
export async function attachRequestPhotos(ids: string[]) {
  await imageFiles.updateMany(
    { _id: { $in: ids.map((id) => new ObjectId(id)) }, "metadata.kind": "request" },
    { $set: { "metadata.attached": true } },
  );
}

/** Deletes request photos that were uploaded but never sent (someone abandoned the form) after a day. */
export async function cleanUpAbandonedRequestPhotos() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const stale = await images.find({ "metadata.kind": "request", "metadata.attached": false, uploadDate: { $lt: cutoff } }).toArray();
  await Promise.all(stale.map((f) => images.delete(f._id).catch(() => {})));
}
