"use client";

import { useState } from "react";

// PLACEHOLDER: not connected to a mailing list yet (e.g. Mailchimp or Brevo).
export function Newsletter() {
  const [note, setNote] = useState("");

  return (
    <section className="subscribe" aria-labelledby="join-title">
      <div className="wrap">
        <p className="label" data-reveal="fade">Newsletter</p>
        <h2 id="join-title" data-reveal="fade">
          <em>Subscribe</em> to be first
          <br />
          to see new prints
        </h2>
        <form
          data-reveal="fade"
          onSubmit={(e) => {
            e.preventDefault();
            setNote("Thank you. Sign-ups will be saved once the mailing list is connected.");
            e.currentTarget.reset();
          }}
        >
          <label htmlFor="join-email" className="sr-only">
            Email address
          </label>
          <input id="join-email" type="email" placeholder="Email address" required />
          <button className="btn btn-clay label" type="submit">
            Subscribe
          </button>
        </form>
        <p className="note" aria-live="polite">
          {note}
        </p>
      </div>
    </section>
  );
}
