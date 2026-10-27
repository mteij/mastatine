import type { Metadata } from "next";
import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "The S.A. Mastatine newsletter: about four emails a year, with one-click unsubscribe.",
};

const PROMISES = [
  "About four emails a year, never more than one a month.",
  "A confirmation link first. You are not subscribed until you click it.",
  "One-click unsubscribe in every email.",
  "We never share or sell your address.",
];

export default function NewsletterPage() {
  return (
    <>
      <PageHeader title="The quarterly Mast" intro="The best masts, the news, and the occasional bad pun. Four times a year." />
      <div className="container-prose">
        <div className="card p-6 sm:p-8">
          <NewsletterForm layout="stacked" />
        </div>
        <ul className="mt-8 space-y-3 text-sm text-muted">
          {PROMISES.map((promise) => (
            <li key={promise} className="flex gap-3">
              <span className="mt-0.5 text-accent-text" aria-hidden>✓</span>
              {promise}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted">
          See what we store in the <Link href="/privacy" className="font-semibold text-accent-text underline underline-offset-2">privacy notice</Link>.
        </p>
      </div>
    </>
  );
}
