import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What S.A. Mastatine stores about you, why, and how to have it removed.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="Your data, plainly"
        intro="We collect as little as possible. This page lists everything, and how to get it deleted."
      />
      <div className="container-prose prose-lite">
        <h2>What we store</h2>
        <ul>
          <li>
            <strong>Votes.</strong> A random identifier generated in your browser (local storage) and the masts you voted on. It is not
            linked to your name or email.
          </li>
          <li>
            <strong>Submitted masts.</strong> The name you typed, the mast’s title, description and height, and the photo. Photo
            metadata, including GPS location, is removed on upload.
          </li>
          <li>
            <strong>Accounts.</strong> Your email address, an optional display name, and a session record (created when you open a
            sign-in link; includes your IP address and browser type for security).
          </li>
          <li>
            <strong>Newsletter.</strong> Your email address, when you asked for it and when you confirmed it. If you unsubscribe we keep
            the address marked as unsubscribed so we never email you again by accident; ask us if you want that removed too.
          </li>
        </ul>

        <h2>Cookies</h2>
        <p>
          We set one cookie, and only when you sign in: a secure session cookie. There are no advertising or analytics cookies and no
          third-party trackers.
        </p>

        <h2>Why, and on what basis</h2>
        <ul>
          <li>Votes and submissions: to run the gallery (legitimate interest).</li>
          <li>Accounts: to let you sign in (necessary to provide the service you asked for).</li>
          <li>Newsletter: only with your consent, confirmed by a link we email you. Withdraw it any time with the unsubscribe link in every email.</li>
          <li>Technical logs and rate limiting: to keep the site secure and stop abuse (legitimate interest). These are short-lived.</li>
        </ul>

        <h2>Who handles it</h2>
        <p>
          The site runs on a server we control. Emails (sign-in links, newsletter) are delivered through our mail provider, Purelymail.
          We do not sell or share your data with anyone else.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask to see, correct or delete what we hold about you. Signed-in users can delete their account from the{" "}
          <Link href="/account">account page</Link>. For anything else, use the <Link href="/contact">contact page</Link>. If you are
          unhappy with how we handle your data, you can also complain to the Dutch Data Protection Authority (Autoriteit
          Persoonsgegevens).
        </p>

        <h2>This is a parody</h2>
        <p>
          S.A. Mastatine is a parody and is not affiliated with S.A. Astatine or the University of Twente. See the{" "}
          <Link href="/about#disclaimer">disclaimer</Link>.
        </p>
      </div>
    </>
  );
}
