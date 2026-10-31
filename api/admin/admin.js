// Veloura Studio: a small admin panel for products, photos, prices and categories.
// Plain browser JavaScript; it talks to this same server's /api/admin endpoints.

const $ = (sel) => document.querySelector(sel);
const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

// ---------- Sale helpers ----------
const salePrice = (price, percent) => Math.round((price * (100 - percent)) / 100);
/** "live", "soon", "ended" or null (no sale). */
function saleState(sale, now = Date.now()) {
  if (!sale) return null;
  const start = new Date(sale.startsAt).getTime();
  const end = new Date(sale.endsAt).getTime();
  if (now >= end) return "ended";
  return now >= start ? "live" : "soon";
}
const when = new Intl.DateTimeFormat("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const formatWhen = (iso) => when.format(new Date(iso));
/** ISO date → value for <input type="datetime-local"> in the admin's own time zone. */
function toLocalInput(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const fromLocalInput = (value) => (value ? new Date(value).toISOString() : "");
const roundedNow = () => {
  const d = new Date();
  d.setSeconds(0, 0);
  return d;
};

/** Tiny element builder; text always goes in via textContent, never as HTML. */
function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k in el && typeof v !== "string") el[k] = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) if (c != null && c !== false && c !== "") el.append(c);
  return el;
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: options.body instanceof FormData ? {} : { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (res.status === 401 && !path.endsWith("/login")) {
    showLogin();
    throw new Error("Please sign in again.");
  }
  if (!res.ok) throw new Error(data?.error || "Something went wrong. Please try again.");
  return data;
}

let toastTimer;
function toast(message, isError = false) {
  const t = $("#toast");
  t.textContent = message;
  t.classList.toggle("is-error", isError);
  t.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("is-on"), isError ? 5000 : 2600);
}

// ---------- State ----------
const state = { products: [], categories: [], editing: null, photos: [], dirty: false };

// ---------- Sign in ----------
function showLogin() {
  $("#app").hidden = true;
  $("#login").hidden = false;
  $("#login-username").focus();
}

$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#login-error").textContent = "";
  try {
    await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ username: $("#login-username").value, password: $("#login-password").value }),
    });
    $("#login-password").value = "";
    await startApp();
  } catch (err) {
    $("#login-error").textContent = err.message;
  }
});

$("#logout").addEventListener("click", async () => {
  await api("/api/admin/logout", { method: "POST" }).catch(() => {});
  showLogin();
});

async function startApp() {
  $("#login").hidden = true;
  $("#app").hidden = false;
  await Promise.all([loadCategories(), loadProducts()]);
  route();
}

// ---------- Routing (#products, #categories, #product/<id>, #product/new) ----------
let currentHash = location.hash;
let restoring = false;
window.addEventListener("hashchange", () => {
  if (restoring) {
    restoring = false;
    return;
  }
  if (state.dirty && !confirm("You have unsaved changes. Leave without saving?")) {
    restoring = true;
    location.hash = currentHash; // stay on the editor
    return;
  }
  currentHash = location.hash;
  state.dirty = false;
  route();
});

function route() {
  const hash = location.hash.replace(/^#/, "") || "products";
  const [view, id] = hash.split("/");
  for (const v of ["products", "editor", "sales", "categories"]) $(`#view-${v}`).hidden = true;
  document.querySelectorAll(".tabs a").forEach((a) => a.removeAttribute("aria-current"));

  if (view === "product") {
    openEditor(id === "new" ? null : id);
    $("#view-editor").hidden = false;
    document.querySelector('[data-tab="products"]').setAttribute("aria-current", "page");
  } else if (view === "sales") {
    renderSales();
    $("#view-sales").hidden = false;
    document.querySelector('[data-tab="sales"]').setAttribute("aria-current", "page");
  } else if (view === "categories") {
    renderCategories();
    $("#view-categories").hidden = false;
    document.querySelector('[data-tab="categories"]').setAttribute("aria-current", "page");
  } else {
    renderProducts();
    $("#view-products").hidden = false;
    document.querySelector('[data-tab="products"]').setAttribute("aria-current", "page");
  }
  window.scrollTo(0, 0);
}

// ---------- Products list ----------
async function loadProducts() {
  state.products = await api("/api/admin/products");
}

const categoryName = (slug) => state.categories.find((c) => c.slug === slug)?.name ?? slug;

function renderProducts() {
  const q = $("#search").value.trim().toLowerCase();
  const cat = $("#filter-category").value;
  const status = $("#filter-status").value;
  const list = state.products.filter((p) => {
    if (q && !`${p.name} ${p.colour}`.toLowerCase().includes(q)) return false;
    if (cat && p.category !== cat) return false;
    if (status === "new" && !p.isNew) return false;
    if (status === "soldout" && !p.soldOut) return false;
    if (status === "hidden" && p.published) return false;
    if (status === "sale" && !["live", "soon"].includes(saleState(p.sale))) return false;
    return true;
  });

  $("#product-count").textContent = `(${state.products.length})`;
  const grid = $("#product-grid");
  grid.replaceChildren(
    ...list.map((p) => {
      const thumb = h("div", { class: "product-thumb" },
        h("div", { class: "badges" },
          p.isNew && h("span", { class: "badge new", text: "New" }),
          p.soldOut && h("span", { class: "badge sold", text: "Sold out" }),
          !p.published && h("span", { class: "badge hidden", text: "Hidden" }),
          saleState(p.sale) === "live" && h("span", { class: "badge sale", text: `−${p.sale.percent}%` }),
          saleState(p.sale) === "soon" && h("span", { class: "badge soon", text: "Sale soon" }),
        ),
      );
      const onSale = saleState(p.sale) === "live";
      if (p.images[0]) thumb.style.backgroundImage = `url("${p.images[0].url}")`;
      return h("button", { class: "product-card", type: "button", onclick: () => (location.hash = `product/${p.id}`) },
        thumb,
        h("div", { class: "product-meta" },
          h("span", { class: "label muted", text: categoryName(p.category) }),
          h("strong", { text: p.colour ? `${p.name}, ${p.colour}` : p.name }),
          onSale
            ? h("span", { class: "price" },
                h("s", { class: "was", text: naira.format(p.price) }), " ",
                h("span", { class: "now", text: naira.format(salePrice(p.price, p.sale.percent)) }))
            : h("span", { class: "price", text: naira.format(p.price) }),
        ),
      );
    }),
  );
  const empty = $("#product-empty");
  empty.hidden = list.length > 0;
  empty.textContent = state.products.length ? "No products match those filters." : "No products yet. Add your first one, or load the starter products below.";
  $("#starter").hidden = state.products.length > 0;
}

$("#load-starter").addEventListener("click", async (e) => {
  const button = e.currentTarget;
  button.disabled = true;
  button.textContent = "Loading… this can take a minute";
  try {
    const r = await api("/api/admin/starter", { method: "POST" });
    await Promise.all([loadCategories(), loadProducts()]);
    renderProducts();
    toast(`Added ${r.addedProducts} products and ${r.addedCategories} categories.`);
  } catch (err) {
    toast(err.message, true);
  } finally {
    button.disabled = false;
    button.textContent = "Load starter products";
  }
});

$("#search").addEventListener("input", renderProducts);
$("#filter-category").addEventListener("change", renderProducts);
$("#filter-status").addEventListener("change", renderProducts);
$("#new-product").addEventListener("click", () => (location.hash = "product/new"));

// ---------- Product editor ----------
function detailRow(label = "", value = "") {
  const row = h("div", { class: "detail-row" },
    h("input", { value: label, placeholder: "Label, e.g. Fabric", maxLength: 40, "aria-label": "Detail label" }),
    h("input", { value, placeholder: "e.g. Soft woven chiffon", maxLength: 200, "aria-label": "Detail value" }),
    h("button", { class: "link-btn", type: "button", text: "Remove", onclick: () => { row.remove(); state.dirty = true; } }),
  );
  return row;
}

$("#add-detail").addEventListener("click", () => {
  $("#details").append(detailRow());
  state.dirty = true;
});

function renderPhotos() {
  $("#photos").replaceChildren(
    ...state.photos.map((photo, i) => {
      const img = h("div", { class: "photo-img" },
        h("div", { class: "photo-tools" },
          i > 0 && h("button", { class: "icon-btn", type: "button", title: "Move earlier", "aria-label": "Move earlier", text: "←", onclick: () => movePhoto(i, -1) }),
          i < state.photos.length - 1 && h("button", { class: "icon-btn", type: "button", title: "Move later", "aria-label": "Move later", text: "→", onclick: () => movePhoto(i, 1) }),
          h("button", { class: "icon-btn", type: "button", title: "Remove photo", "aria-label": "Remove photo", text: "✕", onclick: () => removePhoto(i) }),
        ),
      );
      img.style.backgroundImage = `url("${photo.url}")`;
      return h("div", { class: "photo" },
        img,
        h("input", {
          value: photo.alt || "",
          placeholder: "Describe the photo",
          maxLength: 200,
          "aria-label": "Photo description",
          oninput: (e) => { photo.alt = e.target.value; state.dirty = true; },
        }),
      );
    }),
  );
}

function movePhoto(i, dir) {
  const [p] = state.photos.splice(i, 1);
  state.photos.splice(i + dir, 0, p);
  state.dirty = true;
  renderPhotos();
}

function removePhoto(i) {
  state.photos.splice(i, 1);
  state.dirty = true;
  renderPhotos();
}

// Phone photos can be 5–10 MB. They're prepared here at high quality, just big enough for the
// stored 2560px master, and kept under the size the website can pass through (about 4 MB).
const MAX_EDGE = 2560;
const MAX_BYTES = 3.8 * 1024 * 1024;
async function shrink(file) {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    // Already small enough and a format the server reads: send the original untouched.
    if (scale === 1 && file.size <= MAX_BYTES && /^image\/(jpeg|png|webp)$/.test(file.type)) {
      bitmap.close?.();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    // Start near-lossless and only step down if the file would be too big to send.
    for (const quality of [0.95, 0.92, 0.88, 0.84]) {
      const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
      if (blob && (blob.size <= MAX_BYTES || quality === 0.84)) {
        return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
      }
    }
    return file;
  } catch {
    return file; // e.g. HEIC on a browser that can't read it: the server converts it instead
  }
}

async function uploadPhotos(files) {
  const images = [...files].filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
  if (!images.length) return;
  const status = $("#upload-status");
  const altBase = () => {
    const name = $("#f-name").value.trim();
    const colour = $("#f-colour").value.trim();
    return name ? `${name}${colour ? ", " + colour : ""}` : "";
  };
  let done = 0;
  try {
    // One at a time, so a slow connection shows progress and one bad photo doesn't sink the rest.
    for (const file of images) {
      status.textContent = `Uploading photo ${done + 1} of ${images.length}…`;
      const body = new FormData();
      body.append("photos", await shrink(file));
      const [stored] = await api("/api/admin/images", { method: "POST", body });
      state.photos.push({ ...stored, alt: altBase() });
      done++;
      state.dirty = true;
      renderPhotos();
    }
    status.textContent = `${done} photo${done === 1 ? "" : "s"} added. Remember to save.`;
  } catch (err) {
    status.textContent = done ? `${done} of ${images.length} added.` : "";
    toast(err.message, true);
  }
}

$("#photo-input").addEventListener("change", (e) => {
  uploadPhotos(e.target.files);
  e.target.value = "";
});
const dz = $("#dropzone");
["dragenter", "dragover"].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.add("is-over"); }));
["dragleave", "drop"].forEach((t) => dz.addEventListener(t, () => dz.classList.remove("is-over")));
dz.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadPhotos(e.dataTransfer.files);
});

function fillCategorySelect(select, withAll) {
  select.replaceChildren(
    ...(withAll ? [h("option", { value: "", text: "All categories" })] : []),
    ...state.categories.map((c) => h("option", { value: c.slug, text: c.name })),
  );
}

async function openEditor(id) {
  let p = null;
  if (id) {
    p = state.products.find((x) => x.id === id) ?? (await api(`/api/admin/products/${id}`).catch(() => null));
    if (!p) {
      toast("That product no longer exists.", true);
      location.hash = "products";
      return;
    }
  }
  state.editing = p;
  state.photos = p ? p.images.map((i) => ({ ...i })) : [];
  fillCategorySelect($("#f-category"), false);

  $("#editor-title").textContent = p ? (p.colour ? `${p.name}, ${p.colour}` : p.name) : "New product";
  $("#f-name").value = p?.name ?? "";
  $("#f-colour").value = p?.colour ?? "";
  $("#f-category").value = p?.category ?? state.categories[0]?.slug ?? "";
  $("#f-price").value = p?.price ?? "";
  $("#f-order").value = p?.order ?? 0;
  $("#f-description").value = p?.description ?? "";
  $("#f-published").checked = p ? p.published : true;
  $("#f-new").checked = p ? p.isNew : true;
  $("#f-soldout").checked = p?.soldOut ?? false;
  $("#f-slug").value = p?.slug ?? "";
  $("#details").replaceChildren(...(p?.details ?? []).map((d) => detailRow(d.label, d.value)));
  $("#delete-product").hidden = !p;
  $("#upload-status").textContent = "";
  renderPhotos();
  fillSale(p?.sale && saleState(p.sale) !== "ended" ? p.sale : null);
  state.dirty = false;

  if (!state.categories.length) toast("Add a category first, under Categories.", true);
}

// ---------- Sale panel in the editor ----------
function fillSale(sale) {
  $("#s-on").checked = Boolean(sale);
  $("#sale-fields").hidden = !sale;
  const start = sale ? sale.startsAt : roundedNow().toISOString();
  const end = sale ? sale.endsAt : new Date(roundedNow().getTime() + 7 * 864e5).toISOString();
  $("#s-percent").value = sale?.percent ?? "";
  $("#s-start").value = toLocalInput(start);
  $("#s-end").value = toLocalInput(end);
  updateSalePreview();
}

function updateSalePreview() {
  const price = Number($("#f-price").value);
  const percent = Number($("#s-percent").value);
  $("#s-preview").textContent =
    price > 0 && percent >= 1 && percent <= 90 ? `${naira.format(salePrice(price, percent))}  (was ${naira.format(price)})` : "—";
  const sale = { startsAt: fromLocalInput($("#s-start").value), endsAt: fromLocalInput($("#s-end").value) };
  const status = $("#s-status");
  if (!$("#s-on").checked || !sale.startsAt || !sale.endsAt) status.textContent = "";
  else if (new Date(sale.endsAt) <= new Date(sale.startsAt)) status.textContent = "The end must be after the start.";
  else {
    const s = saleState(sale);
    status.textContent =
      s === "live" ? `On sale now, until ${formatWhen(sale.endsAt)}.` :
      s === "soon" ? `Starts ${formatWhen(sale.startsAt)}, ends ${formatWhen(sale.endsAt)}.` :
      "Those dates are in the past, so the sale won't show.";
  }
}

$("#s-on").addEventListener("change", (e) => {
  $("#sale-fields").hidden = !e.target.checked;
  if (e.target.checked && !$("#s-percent").value) $("#s-percent").focus();
  updateSalePreview();
});
["#s-percent", "#s-start", "#s-end", "#f-price"].forEach((sel) => $(sel).addEventListener("input", updateSalePreview));

/** The sale to save, null for none, or an error message string. */
function readSale() {
  if (!$("#s-on").checked) return null;
  const percent = Number($("#s-percent").value);
  if (!Number.isInteger(percent) || percent < 1 || percent > 90) return "Set a sale discount between 1% and 90%.";
  const startsAt = fromLocalInput($("#s-start").value);
  const endsAt = fromLocalInput($("#s-end").value);
  if (!startsAt || !endsAt) return "Choose when the sale starts and ends.";
  if (new Date(endsAt) <= new Date(startsAt)) return "The sale must end after it starts.";
  return { percent, startsAt, endsAt };
}

$("#product-form").addEventListener("input", () => (state.dirty = true));

$("#product-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = $("#f-name").value.trim();
  const price = $("#f-price").value;
  if (!name) return toast("Give the product a name.", true);
  if (price === "" || Number(price) < 0) return toast("Add a price in naira.", true);
  if (!$("#f-category").value) return toast("Choose a category. Add one under Categories first.", true);
  const sale = readSale();
  if (typeof sale === "string") return toast(sale, true);

  const details = [...$("#details").children]
    .map((row) => {
      const [l, v] = row.querySelectorAll("input");
      return { label: l.value.trim(), value: v.value.trim() };
    })
    .filter((d) => d.label && d.value);

  const body = {
    name,
    colour: $("#f-colour").value.trim(),
    category: $("#f-category").value,
    price: Math.round(Number(price)),
    order: Number($("#f-order").value) || 0,
    description: $("#f-description").value.trim(),
    details,
    images: state.photos.map(({ id, alt, focus }) => ({ id, alt: alt || "", ...(focus ? { focus } : {}) })),
    isNew: $("#f-new").checked,
    soldOut: $("#f-soldout").checked,
    published: $("#f-published").checked,
    sale,
    ...($("#f-slug").value.trim() ? { slug: $("#f-slug").value.trim() } : {}),
  };

  const button = e.submitter;
  button.disabled = true;
  try {
    const saved = state.editing
      ? await api(`/api/admin/products/${state.editing.id}`, { method: "PUT", body: JSON.stringify(body) })
      : await api("/api/admin/products", { method: "POST", body: JSON.stringify(body) });
    await loadProducts();
    state.dirty = false;
    toast("Saved. The website updates within a minute.");
    if (!state.editing) location.hash = `product/${saved.id}`;
    else openEditor(saved.id);
  } catch (err) {
    toast(err.message, true);
  } finally {
    button.disabled = false;
  }
});

$("#delete-product").addEventListener("click", async () => {
  const p = state.editing;
  if (!p || !confirm(`Delete "${p.name}" and its photos? This can't be undone.`)) return;
  try {
    await api(`/api/admin/products/${p.id}`, { method: "DELETE" });
    await loadProducts();
    state.dirty = false;
    toast("Deleted.");
    location.hash = "products";
  } catch (err) {
    toast(err.message, true);
  }
});

// ---------- Sales tab ----------
const picked = new Set();

function renderSales() {
  // Defaults: starts now, runs a week.
  if (!$("#b-start").value) $("#b-start").value = toLocalInput(roundedNow().toISOString());
  if (!$("#b-end").value) $("#b-end").value = toLocalInput(new Date(roundedNow().getTime() + 7 * 864e5).toISOString());

  const catSelect = $("#b-category");
  catSelect.replaceChildren(
    h("option", { value: "", text: "Select a category…" }),
    ...state.categories.map((c) => h("option", { value: c.slug, text: `All ${c.name}` })),
  );

  const percent = Number($("#b-percent").value);
  $("#b-products").replaceChildren(
    ...state.products.map((p) => {
      const s = saleState(p.sale);
      const box = h("input", {
        type: "checkbox",
        checked: picked.has(p.id),
        onchange: (e) => {
          e.target.checked ? picked.add(p.id) : picked.delete(p.id);
          updateSaleSummary();
        },
      });
      const thumb = h("span", { class: "pick-thumb" });
      if (p.images[0]) thumb.style.backgroundImage = `url("${p.images[0].url}")`;
      return h("label", { class: "pick" },
        box,
        thumb,
        h("span", { class: "pick-name", text: p.colour ? `${p.name}, ${p.colour}` : p.name }),
        h("span", { class: "pick-price muted",
          text: percent >= 1 && percent <= 90 ? `${naira.format(p.price)} → ${naira.format(salePrice(p.price, percent))}` : naira.format(p.price) }),
        s === "live" && h("span", { class: "badge sale", text: `−${p.sale.percent}% now` }),
        s === "soon" && h("span", { class: "badge soon", text: "Sale soon" }),
      );
    }),
  );
  updateSaleSummary();
  renderSaleLists();
}

function updateSaleSummary() {
  const n = picked.size;
  const percent = Number($("#b-percent").value);
  $("#b-summary").textContent = n
    ? `${n} product${n === 1 ? "" : "s"} selected${percent ? `, ${percent}% off` : ""}.` +
      (state.products.some((p) => picked.has(p.id) && ["live", "soon"].includes(saleState(p.sale))) ? " This replaces any sale they already have." : "")
    : "Choose products to discount.";
}

function renderSaleLists() {
  const withSale = state.products.filter((p) => ["live", "soon"].includes(saleState(p.sale)));
  const row = (p) =>
    h("div", { class: "sale-row" },
      h("span", { class: "sale-row-name", text: p.colour ? `${p.name}, ${p.colour}` : p.name }),
      h("span", { class: "badge sale", text: `−${p.sale.percent}%` }),
      h("span", { class: "price" },
        h("s", { class: "was", text: naira.format(p.price) }), " ",
        h("span", { class: "now", text: naira.format(salePrice(p.price, p.sale.percent)) })),
      h("span", { class: "muted sale-row-when",
        text: saleState(p.sale) === "live" ? `Ends ${formatWhen(p.sale.endsAt)}` : `${formatWhen(p.sale.startsAt)} – ${formatWhen(p.sale.endsAt)}` }),
      h("button", {
        class: "btn btn-line danger", type: "button", text: saleState(p.sale) === "live" ? "End now" : "Cancel",
        onclick: async () => {
          try {
            await api("/api/admin/sales/end", { method: "POST", body: JSON.stringify({ productIds: [p.id] }) });
            await loadProducts();
            renderSales();
            toast("Sale ended.");
          } catch (err) { toast(err.message, true); }
        },
      }),
    );
  const live = withSale.filter((p) => saleState(p.sale) === "live");
  const soon = withSale.filter((p) => saleState(p.sale) === "soon");
  $("#sales-live").replaceChildren(...(live.length ? live.map(row) : [h("p", { class: "muted", text: "No sales running." })]));
  $("#sales-soon").replaceChildren(...(soon.length ? soon.map(row) : [h("p", { class: "muted", text: "Nothing scheduled." })]));
}

$("#b-percent").addEventListener("input", renderSales);
$("#b-all").addEventListener("click", () => { state.products.forEach((p) => picked.add(p.id)); renderSales(); });
$("#b-none").addEventListener("click", () => { picked.clear(); renderSales(); });
$("#b-category").addEventListener("change", (e) => {
  state.products.filter((p) => p.category === e.target.value).forEach((p) => picked.add(p.id));
  e.target.value = "";
  renderSales();
});
document.querySelectorAll(".chip[data-days]").forEach((chip) =>
  chip.addEventListener("click", () => {
    const start = $("#b-start").value ? new Date($("#b-start").value) : roundedNow();
    $("#b-end").value = toLocalInput(new Date(start.getTime() + Number(chip.dataset.days) * 864e5).toISOString());
  }),
);

$("#sale-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const percent = Number($("#b-percent").value);
  const startsAt = fromLocalInput($("#b-start").value);
  const endsAt = fromLocalInput($("#b-end").value);
  if (!picked.size) return toast("Choose at least one product.", true);
  if (!Number.isInteger(percent) || percent < 1 || percent > 90) return toast("Set a discount between 1% and 90%.", true);
  if (!startsAt || !endsAt || new Date(endsAt) <= new Date(startsAt)) return toast("The sale must end after it starts.", true);
  if (new Date(endsAt) <= new Date()) return toast("That end time has already passed.", true);
  const button = e.submitter;
  button.disabled = true;
  try {
    const r = await api("/api/admin/sales", {
      method: "POST",
      body: JSON.stringify({ productIds: [...picked], sale: { percent, startsAt, endsAt } }),
    });
    picked.clear();
    await loadProducts();
    renderSales();
    toast(`${percent}% off applied to ${r.updated} product${r.updated === 1 ? "" : "s"}.`);
  } catch (err) {
    toast(err.message, true);
  } finally {
    button.disabled = false;
  }
});

// ---------- Categories ----------
async function loadCategories() {
  state.categories = await api("/api/admin/categories");
  fillCategorySelect($("#filter-category"), true);
}

function renderCategories() {
  $("#category-list").replaceChildren(
    ...state.categories.map((c) => {
      const name = h("input", { value: c.name, maxLength: 60, "aria-label": "Category name" });
      const order = h("input", { type: "number", min: 0, value: c.order, "aria-label": "Order" });
      return h("div", { class: "category-row" },
        name,
        h("span", { class: "slug", text: `/shop?category=${c.slug}` }),
        order,
        h("span", { class: "n muted", text: `${c.productCount} item${c.productCount === 1 ? "" : "s"}` }),
        h("div", { class: "row-actions" },
          h("button", {
            class: "btn btn-line", type: "button", text: "Save",
            onclick: async () => {
              try {
                await api(`/api/admin/categories/${c.id}`, { method: "PUT", body: JSON.stringify({ name: name.value, order: order.value }) });
                await loadCategories();
                renderCategories();
                toast("Category saved.");
              } catch (err) { toast(err.message, true); }
            },
          }),
          h("button", {
            class: "btn btn-line danger", type: "button", text: "Delete",
            onclick: async () => {
              if (!confirm(`Delete the "${c.name}" category?`)) return;
              try {
                await api(`/api/admin/categories/${c.id}`, { method: "DELETE" });
                await loadCategories();
                renderCategories();
                toast("Category deleted.");
              } catch (err) { toast(err.message, true); }
            },
          }),
        ),
      );
    }),
  );
}

$("#category-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await api("/api/admin/categories", { method: "POST", body: JSON.stringify({ name: $("#c-name").value, order: $("#c-order").value }) });
    $("#c-name").value = "";
    $("#c-order").value = 0;
    await loadCategories();
    renderCategories();
    toast("Category added.");
  } catch (err) {
    toast(err.message, true);
  }
});

window.addEventListener("beforeunload", (e) => {
  if (state.dirty) e.preventDefault();
});

// ---------- Start ----------
api("/api/admin/me")
  .then((me) => (me.signedIn ? startApp() : showLogin()))
  .catch(() => showLogin());
