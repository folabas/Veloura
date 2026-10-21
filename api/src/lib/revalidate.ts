import { config } from "../config.js";

/**
 * Tells the website its catalogue changed so it refreshes now instead of within the minute.
 * Fire-and-forget: a failure here never blocks saving in the admin panel.
 */
export function notifyWebsite() {
  if (!config.revalidateUrl || !config.revalidateSecret) return;
  fetch(config.revalidateUrl, {
    method: "POST",
    headers: { "x-revalidate-secret": config.revalidateSecret },
  }).catch((err) => console.warn("Website refresh failed:", err.message));
}
