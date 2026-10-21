// All settings come from environment variables (set them in Render → Environment).

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. See api/.env.example.`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  isProduction: process.env.NODE_ENV === "production",

  mongoUri: required("MONGODB_URI"),
  dbName: process.env.MONGODB_DB ?? "veloura",

  /** Sign-in for the admin panel (checked at server start; the seed script doesn't need them). */
  adminUsername: (process.env.ADMIN_USERNAME ?? "").trim(),
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  /** Long random string used to sign admin sessions. */
  sessionSecret: process.env.SESSION_SECRET ?? "",

  /** Public address of this API, used to build image links (e.g. https://veloura-api.onrender.com). */
  publicUrl: (process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 4000}`).replace(/\/$/, ""),

  /** Website's revalidate endpoint, so edits show on the site straight away (optional). */
  revalidateUrl: process.env.FRONTEND_REVALIDATE_URL ?? "",
  revalidateSecret: process.env.REVALIDATE_SECRET ?? "",
};

/** The server refuses to start with a missing username, a weak password or a short session secret. */
export function checkServerSecrets() {
  if (config.adminUsername.length < 3) throw new Error("Set ADMIN_USERNAME to at least 3 characters.");
  if (config.adminPassword.length < 10) throw new Error("Set ADMIN_PASSWORD to at least 10 characters.");
  if (config.sessionSecret.length < 32) throw new Error("Set SESSION_SECRET to a random string of at least 32 characters.");
}
