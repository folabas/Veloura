import { ObjectId } from "mongodb";
import sharp from "sharp";
import { images } from "../db.js";
import { config } from "../config.js";

const MAX_EDGE = 1800; // px; plenty for full-screen photos, small enough to load fast

/** Resizes and converts an upload to WebP, then stores it. Returns the new image id. */
export async function storeImage(buffer: Buffer, originalName: string) {
  const webp = await sharp(buffer)
    .rotate() // respect the phone's orientation flag
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
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
