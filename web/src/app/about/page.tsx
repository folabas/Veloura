import type { Metadata } from "next";
import { Photo } from "@/components/Photo";
import { RevealText } from "@/components/RevealText";
import { ScrollDown } from "@/components/ScrollDown";
import { PHONE_DISPLAY, socials, whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "About" };

const values = [
  {
    title: ["Modesty with", "individuality"],
    body: "Modesty doesn't mean giving up personal style. Dress modestly and still show your personality, preferences and creativity.",
  },
  {
    title: ["Effortless", "femininity"],
    body: "A soft, feminine look that isn't limited to one style. Understated, playful, elegant or expressive, depending on who wears it.",
  },
  {
    title: ["Accessible", "luxury"],
    body: "The elegance and simplicity of high-end fashion at accessible prices. Luxury is how a piece looks, how it makes you feel, and the care in how it's presented.",
  },
  {
    title: ["Self", "expression"],
    body: "Women aren't one-dimensional. Style changes with mood, lifestyle and experience, and Veloura makes room for that.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="about-hero">
        <div className="wrap">
          <p className="label muted" data-reveal="fade">About</p>
          <RevealText
            as="h1"
            className="display-caps left"
            lines={[
              <>We believe <em>in</em></>,
              <>modesty <em>and</em></>,
              "self-expression",
            ]}
          />
          <ScrollDown to="principles" className="about-scroll" />
        </div>
      </section>

      <section className="section" id="principles">
        <div className="wrap story-split">
          <div className="story-copy">
            <p className="label muted" data-reveal="fade">Values</p>
            <RevealText className="display" lines={["For the", <em key="i">woman you are</em>]} />
            <p className="muted" data-reveal="fade">
              Veloura is a contemporary modest fashion brand for the woman who wants to express herself through style while staying
              true to who she is. From scarves and everyday clothing to abaya sets and statement pieces, we make modest dressing feel
              stylish, effortless and personal.
            </p>
            <p className="muted" data-reveal="fade">
              You can be soft or bold, understated or expressive, traditional or contemporary. Veloura isn&apos;t here to tell you who
              to be. It&apos;s here to give you pieces that let you express who you already are.
            </p>
          </div>
          <div className="overlap overlap-right">
            <Photo src="/images/rose-print-brown-outdoor.webp" alt="Model outdoors in the cocoa rose print scarf" className="overlap-main" sizes="(max-width: 900px) 80vw, 36vw" focus="50% 40%" />
            <div className="overlap-inset" data-parallax="0.3">
              <Photo src="/images/polka-dot-white.webp" alt="Model in the ivory polka dot scarf" className="fill" sizes="20vw" focus="50% 30%" />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap principles">
          {values.map((v, i) => (
            <div key={v.body} data-reveal="fade">
              <span className="numeral">{String(i + 1).padStart(2, "0")}</span>
              <h3>
                {v.title[0]}
                <br />
                <em>{v.title[1]}</em>
              </h3>
              <p className="muted">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="contact" style={{ paddingTop: 0 }} aria-labelledby="contact-title">
        <div className="wrap center-stack">
          <RevealText className="display" lines={["Say", <em key="i">hello</em>]} />
          <p className="muted lead" data-reveal="fade">
            Questions about a piece, an order or styling? Message us on WhatsApp or find us on Instagram and TikTok.
          </p>
          <div className="contact-list" data-reveal="fade">
            <a href={whatsappLink("Hello Veloura, ")} target="_blank" rel="noopener noreferrer">
              <span className="label muted">WhatsApp</span>
              <span className="contact-value">{PHONE_DISPLAY}</span>
            </a>
            {socials.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer">
                <span className="label muted">{s.name}</span>
                <span className="contact-value">{s.handle}</span>
              </a>
            ))}
          </div>
          <a className="btn btn-clay label" href={whatsappLink("Hello Veloura, ")} target="_blank" rel="noopener noreferrer" data-reveal="fade">
            Message us on WhatsApp <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </>
  );
}
