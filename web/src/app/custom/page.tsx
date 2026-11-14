import type { Metadata } from "next";
import { CustomOrderForm } from "@/components/CustomOrderForm";
import { Photo } from "@/components/Photo";
import { RevealText } from "@/components/RevealText";

export const metadata: Metadata = {
  title: "Custom orders",
  description: "Tell us what you'd love to wear and we'll make it for you: abayas, dresses, sets, skirts and scarves, made to your style and size.",
};

const steps = [
  { title: "Share your idea", body: "Describe the piece and add any photos or screenshots that inspire you." },
  { title: "We talk it through", body: "We reply on WhatsApp with questions, fabric options, a price and a timeline." },
  { title: "Made for you", body: "Once you're happy, we make it to your measurements and deliver it to you." },
];

export default function CustomPage() {
  return (
    <div className="wrap custom">
      <header className="page-head">
        <p className="label muted">Custom orders</p>
        <RevealText as="h1" lines={[<>Made <em>for you</em></>]} />
        <p className="muted lead">
          Have something in mind that you can&apos;t find? Tell us what you&apos;d love to wear and we&apos;ll make it, in your style and
          your size.
        </p>
      </header>

      <div className="custom-layout">
        <CustomOrderForm />
        <aside className="custom-aside">
          <Photo src="/images/rose-print-brown-outdoor.webp" alt="Model outdoors in a Veloura rose print scarf" className="custom-photo" sizes="(max-width: 900px) 100vw, 30vw" focus="50% 40%" />
          <ol className="custom-steps">
            {steps.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p className="muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
