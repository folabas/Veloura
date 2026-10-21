import { ObjectId } from "mongodb";
import sharp from "sharp";
import { images } from "../db.js";
import { config } from "../config.js";

// Stored as the master copy; the website makes smaller versions for each screen from it.
// 2560px covers full-screen photos on high-resolution laptops and phones.
const MAX_EDGE = 2560;

/** Resizes and converts an upload to high-quality WebP, then stores it. Returns the new image id. */
export async function storeImage(buffer: Buffer, originalName: string) {
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
        metadata: { contentType: "image/webp", originalName },
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
