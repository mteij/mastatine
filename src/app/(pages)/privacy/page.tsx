import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { getLegalIdentity } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What S.A. Mastatine stores about you, why, how long, and how to have it removed.",
};

// Reads the controller details at request time so they can change without a rebuild.
export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  const legal = getLegalIdentity();

  return (
    <>
      <PageHeader
        title="Your data, plainly"
        intro="We collect as little as possible. This page lists everything, and how to get it deleted."
      />
      <div className="container-prose prose-lite">
        <h2>Who is responsible</h2>
        <p>
          {legal.name ? <strong>{legal.name}</strong> : <strong>S.A. Mastatine</strong>}
          {legal.address ? `, ${legal.address}` : ""}
          {legal.kvk ? ` (KvK ${legal.kvk})` : ""} runs this site and decides what is done with your data (the “controller” under the
          GDPR/AVG).{" "}
          {legal.email ? (
            <>
              Reach us at <a href={`mailto:${legal.email}`}>{legal.email}</a> or via the <Link href="/contact">contact page</Link>.
            </>
          ) : (
            <>
              Reach us via the <Link href="/contact">contact page</Link>.
            </>
          )}
        </p>

        <h2>What we store</h2>
        <ul>
          <li>
            <strong>Mast votes.</strong> A random identifier generated in your browser (local storage, key{" "}
            <code>mastatine_voter_id</code>) and the masts you voted on. It is not linked to your name or email. It stays in your browser
            until you clear your site data.
          </li>
          <li>
            <strong>Submitted masts.</strong> The name you typed, the mast’s title, description and height, and the photo. These are
            shown publicly. Photo metadata, including GPS location, is removed on upload. Only submit photos you took or may share, and
            avoid recognisable people.
          </li>
          <li>
            <strong>Quotes.</strong> The quote, the name of the person who said it, the date, and (if you were signed in) which account
            added it. The name of the person quoted is shown publicly, and may not be the person who submitted it. If you were quoted and
            want it removed or changed, tell us and we will do so.
          </li>
          <li>
            <strong>Quote ratings.</strong> Your score and either your account or a random identifier stored in a cookie (see below).
          </li>
          <li>
            <strong>Accounts.</strong> Your email address, an optional display name, and session records (created when you open a sign-in
            link; each includes your IP address and browser type, for security).
            If an administrator adds you to a committee, your display name (never your email address) is shown on the public committees page.
          </li>
          <li>
            <strong>Newsletter.</strong> Your email address, when you asked for it and when you confirmed it. If you unsubscribe we keep
            the address marked as unsubscribed so we never email you again by accident; ask us if you want that removed too.
          </li>
          <li>
            <strong>Server logs and rate limiting.</strong> Your IP address is used briefly to stop abuse, such as repeated votes or
            sign-in requests.
          </li>
        </ul>

        <h2>Cookies and local storage</h2>
        <p>
          We only use storage that the site needs to work. We do not use advertising or analytics cookies and there are no third-party
          trackers, so there is no cookie banner. Fonts are served from this site, not from Google.
        </p>
        <ul>
          <li>
            <strong>Session cookie.</strong> Set when you sign in, to keep you signed in. Removed when you sign out or it expires.
          </li>
          <li>
            <strong><code>quote_voter</code> cookie.</strong> Set the first time you rate a quote without being signed in, so one browser
            counts once per quote. Random identifier, valid for one year.
          </li>
          <li>
            <strong><code>mastatine_voter_id</code> (local storage).</strong> Same purpose for votes on masts. Stays until you clear it.
          </li>
          <li>
            <strong><code>mastatine_dismissed_announcement</code> (local storage).</strong> Remembers that you closed the news banner, so it
            does not return until there is new news. Stays until you clear it.
          </li>
        </ul>

        <h2>Why, and on what basis</h2>
        <ul>
          <li>Votes, ratings, submitted masts and quotes: to run the gallery (legitimate interest).</li>
          <li>Accounts: to let you sign in (necessary to provide the service you asked for).</li>
          <li>Newsletter: only with your consent, either confirmed by a link we email you or given with the box on the sign-in form (shown ticked, and you can untick it) once your sign-in link proves the address is yours. Withdraw it any time with the unsubscribe link in every email.</li>
          <li>Technical logs and rate limiting: to keep the site secure and stop abuse (legitimate interest).</li>
        </ul>

        <h2>Who handles it</h2>
        <p>
          The site runs on a server we control. Emails (sign-in links, newsletter) are delivered through our mail provider,
          Purelymail, which is based in the United States. That means your email address and the emails themselves can be processed
          outside the EU/EEA. We do not sell your data or share it with anyone else.
        </p>

        <h2>How long we keep it</h2>
        <ul>
          <li>Accounts, until you delete your account (<Link href="/account">account page</Link>) or ask us to.</li>
          <li>Sign-in sessions (with IP address and browser type) and sign-in links: removed automatically once they expire, at most 30 days after you sign in.</li>
          <li>Newsletter sign-ups you never confirmed: removed automatically after 7 days.</li>
          <li>Submitted masts, quotes and votes, until removed by you, by us on request, or by an administrator.</li>
          <li>Newsletter addresses, until you ask us to remove them. Unsubscribed addresses are kept only to avoid emailing you again.</li>
        </ul>

        <h2>Your rights</h2>
        <p>
          You can ask us to show what we hold about you, correct it, delete it, restrict its use or hand it over in a usable format. You can
          object to processing based on legitimate interest, and withdraw consent (for example for the newsletter) at any time. Signed-in
          users can download their data and delete their account from the <Link href="/account">account page</Link>. For anything else, use the{" "}
          <Link href="/contact">contact page</Link>; we answer within one month. If you are unhappy with how we handle your data, you can
          complain to the Dutch Data Protection Authority (Autoriteit Persoonsgegevens).
        </p>

        <h2>This is a parody</h2>
        <p>
          S.A. Mastatine is a parody and is not affiliated with S.A. Astatine or the University of Twente. See the{" "}
          <Link href="/about#disclaimer">disclaimer</Link> and our <Link href="/terms">site rules</Link>.
        </p>
      </div>
    </>
  );
}
