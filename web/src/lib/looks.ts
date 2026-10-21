// Lookbook chapters, in display order. Each chapter is one editorial spread on /lookbook.
// To add a video, put the file in /public/videos and set `video` on a chapter (it replaces the big photo).

export type Look = { src: string; alt: string; product?: string; focus?: string };

export type Chapter = {
  /** Big statement lines; wrap a line in an array [before, italic, after] to set part of it in italic */
  lines: (string | [string, string, string])[];
  main: Look;
  side: Look;
  caption: string;
  circle?: string;
  video?: string;
  tint: string;
};

export const lookbookHero = {
  src: "/images/rose-print-brown-outdoor.webp",
  alt: "Model outdoors by the water in the cocoa rose print scarf",
  // PLACEHOLDER: set to "/videos/<file>.mp4" to play a film behind the lookbook title
  video: "",
};

export const chapters: Chapter[] = [
  {
    lines: ["Soft prints", ["", "and", " quiet neutrals"], "for the everyday"],
    main: { src: "/images/polka-dot-white.webp", alt: "Ivory polka dot scarf", product: "polka-dot-scarf-ivory", focus: "50% 30%" },
    side: { src: "/images/leopard-print-grey.webp", alt: "Dove grey leopard print scarf", product: "leopard-print-scarf-dove", focus: "50% 40%" },
    caption: "Ivory dots and dove-grey leopard: gentle prints that go with everything you already own.",
    circle: "Effortless · Everyday · ",
    tint: "#efe6dc",
  },
  {
    lines: ["Bold colour", ["", "for the days", ""], "you want to be seen"],
    main: { src: "/images/bow-print-pink.webp", alt: "Rose pink bow print scarf", product: "bow-print-scarf-rose-pink", focus: "50% 30%" },
    side: { src: "/images/bamboo-print-black.webp", alt: "Ink bamboo print scarf", product: "bamboo-print-scarf-ink", focus: "50% 30%" },
    caption: "Rose pink bows and ink bamboo leaves: statement prints that carry the whole outfit.",
    tint: "#ece0dc",
  },
  {
    lines: ["Deep cocoa", ["", "and", " soft rose"], "out in the open"],
    main: { src: "/images/rose-print-brown-outdoor.webp", alt: "Cocoa rose print scarf outdoors", product: "rose-print-scarf-cocoa", focus: "50% 45%" },
    side: { src: "/images/rose-print-brown-outdoor.webp", alt: "Close-up of the cocoa rose print", product: "rose-print-scarf-cocoa", focus: "40% 70%" },
    caption: "The Rose Edit: full-blown blooms on cocoa satin, made for long days outside.",
    circle: "Fashion driven · Modest · ",
    tint: "#e4e2da",
  },
];
