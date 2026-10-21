// Shop-wide settings and contact details.

// The WhatsApp number orders are sent to, in international format with no "+",
// spaces or leading zero. Ordering is switched off while this is empty.
export const WHATSAPP_NUMBER: string = "2349018490782";

export const PHONE_DISPLAY = "0901 849 0782";
export const PHONE_TEL = "+2349018490782";

export const socials = [
  { name: "Instagram", handle: "@_veloura.ng", href: "https://www.instagram.com/_veloura.ng" },
  { name: "TikTok", handle: "@_veloura.ng", href: "https://www.tiktok.com/@_veloura.ng" },
];

export const whatsappLink = (text?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
