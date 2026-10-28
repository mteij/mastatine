import NewsletterForm from "@/components/NewsletterForm";

/** Full-width "Stay in the loop" signup band shown above the footer. */
export default function NewsletterBand() {
  return (
    <section className="loop-band" aria-labelledby="loop-title">
      <div className="loop-band__inside">
        <span className="loop-band__icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
          </svg>
        </span>
        <div className="loop-band__copy">
          <h3 id="loop-title" className="loop-band__title">Stay in the loop</h3>
          <p className="loop-band__text">The best masts and news, four times a year.</p>
        </div>
        <div className="loop-band__form">
          <NewsletterForm layout="inline" compact />
        </div>
      </div>
    </section>
  );
}
