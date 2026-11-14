import { z } from "zod";

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const slug = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only");

export const categoryInput = z.object({
  name: z.string().trim().min(1, "Give the category a name").max(60),
  slug: slug.optional(),
  order: z.coerce.number().int().min(0).max(999).default(0),
});

/** A timed discount: percent off between two moments (ISO dates from the admin's browser). */
export const saleInput = z
  .object({
    percent: z.coerce.number().int("Use a whole-number percentage").min(1, "The discount must be at least 1%").max(90, "The discount can be at most 90%"),
    startsAt: z.coerce.date({ message: "Choose when the sale starts" }),
    endsAt: z.coerce.date({ message: "Choose when the sale ends" }),
  })
  .refine((s) => s.endsAt > s.startsAt, { message: "The sale must end after it starts", path: ["endsAt"] });

export type SaleInput = z.infer<typeof saleInput>;

export const productInput = z.object({
  name: z.string().trim().min(1, "Give the product a name").max(120),
  slug: slug.optional(),
  colour: z.string().trim().max(60).default(""),
  category: slug,
  price: z.coerce.number().int("Price must be a whole number of naira").min(0).max(100_000_000),
  description: z.string().trim().max(2000).default(""),
  details: z
    .array(z.object({ label: z.string().trim().min(1).max(40), value: z.string().trim().min(1).max(200) }))
    .max(12)
    .default([]),
  images: z
    .array(
      z.object({
        id: z.string().regex(/^[a-f0-9]{24}$/),
        alt: z.string().trim().max(200).default(""),
        focus: z
          .string()
          .regex(/^\d{1,3}% \d{1,3}%$/)
          .optional(),
      }),
    )
    .max(12)
    .default([]),
  isNew: z.boolean().default(false),
  soldOut: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.coerce.number().int().min(0).max(9999).default(0),
  sale: saleInput.nullable().default(null),
});

/** Apply one sale to many products at once (the Sales tab). */
export const bulkSaleInput = z.object({
  productIds: z.array(z.string().regex(/^[a-f0-9]{24}$/)).min(1, "Choose at least one product").max(500),
  sale: saleInput,
});

export const bulkEndInput = z.object({
  productIds: z.array(z.string().regex(/^[a-f0-9]{24}$/)).min(1, "Choose at least one product").max(500),
});

/** A customer's custom-order request from the website. */
export const requestInput = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  phone: z
    .string()
    .trim()
    .min(7, "Add your WhatsApp number so we can reply")
    .max(30)
    .regex(/^[+\d][\d\s().-]{6,}$/, "That doesn't look like a phone number"),
  itemType: z.string().trim().min(1, "Choose what you'd like made").max(60),
  description: z.string().trim().min(10, "Describe what you'd like in a sentence or two").max(2000),
  measurements: z.string().trim().max(500).default(""),
  budget: z.string().trim().max(60).default(""),
  neededBy: z.string().trim().max(40).default(""),
  photos: z.array(z.string().regex(/^[a-f0-9]{24}$/)).max(5, "You can add up to 5 photos").default([]),
  // Hidden field real people leave empty; simple bots fill it in.
  website: z.string().max(0).optional(),
});

export const requestUpdateInput = z.object({
  status: z.enum(["new", "in-progress", "done"]).optional(),
  notes: z.string().trim().max(2000).optional(),
});

/** Turns a Nigerian or international number into digits for wa.me links (080… → 23480…). */
export function toWhatsAppDigits(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) return `234${digits.slice(1)}`;
  return digits;
}

export type ProductInput = z.infer<typeof productInput>;

/** First validation message, phrased for the admin panel. */
export function firstIssue(error: z.ZodError) {
  const issue = error.issues[0];
  const field = issue.path.join(".");
  return field ? `${field}: ${issue.message}` : issue.message;
}
