import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { ASTATINE_URL } from "@/content/site";

export const metadata: Metadata = {
  title: "About & disclaimer",
  description: "What S.A. Mastatine is, and what it is not: a parody, not affiliated with S.A. Astatine or the University of Twente.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="A study association for things that are tall"
        intro="Mastatine is a joke that got out of hand. We collect masts, towers and pylons, and we let people vote on them."
      />

      <div className="container-prose prose-lite">
        <h2>What is Mastatine?</h2>
        <p>
          The name is a pun: a <em>mast</em> plus an <em>-atine</em> ending, in the style of the chemical elements. That is where the
          resemblance to any real organisation ends. We have no programme, no curriculum and no members’ register. We have a
          gallery of masts, a leaderboard and a Mast of the Month.
        </p>

        <section id="disclaimer" className="card not-prose scroll-mt-28 !border-accent/40 p-6 sm:p-8" aria-labelledby="disclaimer-title">
          <h2 id="disclaimer-title" className="!mt-0 text-2xl font-bold">
            Disclaimer: we are a parody
          </h2>
          <ul className="mt-4 list-disc space-y-2.5 pl-5 text-base">
            <li>
              <strong>S.A. Mastatine is not affiliated with, endorsed by or connected to S.A. Astatine</strong>, the study association of
              the University of Twente, or to the University of Twente itself.
            </li>
            <li>We are not a real study association. Nothing here grants study credits, discounts or any academic standing.</li>
            <li>Our name is a pun. Our logo, text and layout are our own and are not taken from anyone else.</li>
            <li>We do not use, copy or display the real association’s data, calendar, logo or content.</li>
            <li>Statements on this site are satire. Please do not mistake them for statements of fact, or of anyone else.</li>
          </ul>
          <p className="mt-5 text-sm text-muted">
            Looking for the real study association? Visit{" "}
            <a className="font-semibold text-accent-text underline underline-offset-2" href={ASTATINE_URL} target="_blank" rel="noopener noreferrer">
              astatine.utwente.nl
            </a>
            . If you represent them and have any concern about this site, please <Link className="font-semibold text-accent-text underline underline-offset-2" href="/contact">contact us</Link>{" "}
            and we will respond promptly.
          </p>
        </section>

        <h2>How it works</h2>
        <ul>
          <li>
            <strong>Submit a mast.</strong> Add a photo, a name and, if you know it, the height. We remove metadata such as GPS
            coordinates from every photo.
          </li>
          <li>
            <strong>Vote.</strong> Rate masts up or down. You do not need an account, and each browser gets one vote per mast.
          </li>
          <li>
            <strong>Mast of the Month.</strong> The mast with the best score over the current month is featured on the home page.
          </li>
        </ul>

        <h2>Safety</h2>
        <p>
          Masts are dangerous, often private property and sometimes live with high voltage. Photograph them from the ground and from
          a public place. <strong>Never climb a mast.</strong> A good photo is not worth it.
        </p>

        <h2>Moderation</h2>
        <p>
          Submissions are filtered for offensive language, and admins can edit or remove anything. If a photo shows you, or something
          that should not be public, tell us and we will take it down.
        </p>
      </div>
    </>
  );
}
