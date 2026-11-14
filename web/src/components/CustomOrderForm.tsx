"use client";

import { useRef, useState } from "react";

const ITEM_TYPES = ["Abaya", "Dress", "Two-piece set", "Skirt", "Scarf", "Something else"];
const MAX_PHOTOS = 5;

type Photo = { key: string; preview: string; id?: string; error?: string };
type Result = { ref: string; whatsappLink?: string };

// Phone photos are shrunk before upload so they send quickly on mobile data.
async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88));
    return blob ?? file;
  } catch {
    return file; // e.g. HEIC on a browser that can't read it: the server converts it
  }
}

export function CustomOrderForm() {
  const [itemType, setItemType] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [name, setName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    const room = MAX_PHOTOS - photos.length;
    const chosen = [...files].filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name)).slice(0, room);
    if (!chosen.length) return;
    const added = chosen.map((f) => ({ key: `${f.name}-${f.size}-${Math.random()}`, preview: URL.createObjectURL(f) }));
    setPhotos((p) => [...p, ...added]);

    for (const [i, file] of chosen.entries()) {
      const key = added[i].key;
      try {
        const body = new FormData();
        body.append("photo", await shrink(file), file.name.replace(/\.[^.]+$/, "") + ".jpg");
        const res = await fetch("/api/requests/photos", { method: "POST", body });
        const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
        if (!res.ok || !data.id) throw new Error(data.error ?? "Upload failed");
        setPhotos((p) => p.map((x) => (x.key === key ? { ...x, id: data.id } : x)));
      } catch (err) {
        setPhotos((p) => p.map((x) => (x.key === key ? { ...x, error: err instanceof Error ? err.message : "Upload failed" } : x)));
      }
    }
  }

  function removePhoto(key: string) {
    setPhotos((p) => {
      const gone = p.find((x) => x.key === key);
      if (gone) URL.revokeObjectURL(gone.preview);
      return p.filter((x) => x.key !== key);
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!itemType) return setError("Choose what you'd like made.");
    if (photos.some((p) => !p.id && !p.error)) return setError("Your photos are still uploading. One moment.");
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();
    // Open the WhatsApp window now, while the tap still counts as the customer's own action
    // (browsers block windows opened later), then point it at the order once it's saved.
    const waWindow = window.open("", "_blank");
    setSending(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: get("name"),
          phone: get("phone"),
          itemType,
          description: get("description"),
          measurements: get("measurements"),
          budget: get("budget"),
          neededBy: get("neededBy"),
          photos: photos.filter((p) => p.id).map((p) => p.id),
          website: get("website"),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as Result & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "We couldn't send your request. Please try again.");
      if (waWindow && data.whatsappLink) waWindow.location.href = data.whatsappLink;
      else waWindow?.close();
      setName(get("name").split(" ")[0]);
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      waWindow?.close();
      setError(err instanceof Error ? err.message : "We couldn't send your request. Please try again.");
    } finally {
      setSending(false);
    }
  }

  // Back to an empty form for the next request (the form remounts, so every field starts blank).
  function startOver() {
    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    setPhotos([]);
    setItemType("");
    setError("");
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (result) {
    return (
      <div className="custom-done" role="status">
        <p className="label muted">Request {result.ref}</p>
        <h2 className="display-sm">
          Thank you{name && `, ${name}`}. <em>Now press send on WhatsApp.</em>
        </h2>
        <p className="muted lead">
          We&apos;ve saved your request{photos.some((p) => p.id) ? " and photos" : ""}, and WhatsApp has opened with your order already
          written. Just press send and we&apos;ll reply there to talk through the design, price and timing.
        </p>
        {result.whatsappLink && (
          <a className="btn btn-clay label" href={result.whatsappLink} target="_blank" rel="noopener noreferrer">
            WhatsApp didn&apos;t open? Tap here <span aria-hidden="true">→</span>
          </a>
        )}
        {photos.some((p) => p.id) && (
          <p className="muted">Your photos are already with us, so you don&apos;t need to send them again.</p>
        )}
        <button type="button" className="arrow-link label" onClick={startOver}>
          Request another piece
        </button>
      </div>
    );
  }

  const uploading = photos.some((p) => !p.id && !p.error);

  return (
    <form className="form custom-form" onSubmit={onSubmit} noValidate>
      <fieldset className="field">
        <legend className="label muted">What would you like made?</legend>
        <div className="chips" role="radiogroup" aria-label="Item type">
          {ITEM_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={itemType === t}
              className={`chip${itemType === t ? " is-on" : ""}`}
              onClick={() => setItemType(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label className="label muted" htmlFor="description">Describe your idea</label>
        <textarea
          id="description"
          name="description"
          rows={5}
          required
          minLength={10}
          maxLength={2000}
          placeholder="The style, colours, fabric, length, sleeves, the occasion… anything that helps us picture it."
        />
      </div>

      <div className="field">
        <span className="label muted">Inspiration photos (optional, up to {MAX_PHOTOS})</span>
        <div className="photo-picks">
          {photos.map((p) => (
            <figure key={p.key} className={`photo-pick${p.error ? " has-error" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the customer's own file */}
              <img src={p.preview} alt="" />
              {!p.id && !p.error && <span className="photo-pick-state">Uploading…</span>}
              {p.error && <span className="photo-pick-state">Didn&apos;t upload</span>}
              <button type="button" aria-label="Remove photo" onClick={() => removePhoto(p.key)}>
                ✕
              </button>
            </figure>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button type="button" className="photo-add" onClick={() => fileInput.current?.click()}>
              <span aria-hidden="true">+</span>
              Add photos
            </button>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            addPhotos(e.target.files);
            e.target.value = "";
          }}
        />
        <small className="muted">Screenshots, sketches or pictures of styles you love. Only our team can see them.</small>
      </div>

      <div className="field">
        <label className="label muted" htmlFor="measurements">Measurements or size (optional)</label>
        <textarea id="measurements" name="measurements" rows={2} maxLength={500} placeholder="e.g. Size 12, or bust 36in, waist 30in, length 56in. We can take them with you later too." />
      </div>

      <div className="form-row">
        <div className="field">
          <label className="label muted" htmlFor="budget">Budget (optional)</label>
          <input id="budget" name="budget" maxLength={60} placeholder="e.g. ₦60,000" />
        </div>
        <div className="field">
          <label className="label muted" htmlFor="neededBy">Needed by (optional)</label>
          <input id="neededBy" name="neededBy" type="date" />
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label className="label muted" htmlFor="name">Your name</label>
          <input id="name" name="name" autoComplete="name" required maxLength={80} />
        </div>
        <div className="field">
          <label className="label muted" htmlFor="phone">WhatsApp number</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" required maxLength={30} placeholder="0801 234 5678" />
        </div>
      </div>

      {/* Hidden from people; bots that fill every field get politely ignored. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn btn-solid label" type="submit" disabled={sending || uploading}>
        {sending ? "Opening WhatsApp…" : uploading ? "Uploading photos…" : "Send my request on WhatsApp"}
      </button>
      <p className="muted">This opens WhatsApp with your order already written. Press send, and we&apos;ll reply there to talk through the design, price and timing.</p>
    </form>
  );
}
