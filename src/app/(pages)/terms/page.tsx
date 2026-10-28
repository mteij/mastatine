import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { getLegalIdentity } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Site rules",
  description: "What you may post on S.A. Mastatine, how we moderate, and how to report content.",
};

// Reads the contact address at request time so it can change without a rebuild.
export const dynamic = "force-dynamic";

export default function TermsPage() {
  const { email } = getLegalIdentity();

  return (
    <>
      <PageHeader title="Site rules" intro="Short and fair. By posting here you agree to them." />
      <div className="container-prose prose-lite">
        <h2>What you may post</h2>
        <ul>
          <li>Masts, towers and pylons you photographed yourself or have the right to share.</li>
          <li>Quotes that are meant in good fun. Do not post anything hateful, threatening, defamatory or sexually explicit.</li>
          <li>Do not post personal data of others (addresses, phone numbers, private photos) or content that infringes someone’s rights.</li>
          <li>You keep your rights to what you post, and give us permission to display it on this site.</li>
        </ul>

        <h2>How we moderate</h2>
        <p>
          We do not check posts in advance. We remove content that breaks these rules or the law, and may block repeat offenders from
          posting or voting. We use an automatic word filter on some fields. If we remove your content or block your account for a
          reason other than a plain technical one, we tell you why and how to object, unless the law stops us.
        </p>

        <h2>Report content</h2>
        <p>
          Think something here is illegal or breaks these rules? Email{" "}
          {email ? <a href={`mailto:${email}`}>{email}</a> : <Link href="/contact">us</Link>} and include:
        </p>
        <ul>
          <li>the exact address (URL) of the content, or which mast or quote it is;</li>
          <li>why you think it is illegal or against these rules;</li>
          <li>your name and email address (unless the report is about child sexual abuse material), so we can reply;</li>
          <li>a statement that you are acting in good faith and the information is accurate.</li>
        </ul>
        <p>We confirm receipt, review every report carefully and tell you what we decided. If you are the person who posted the content, you can object the same way.</p>

        <h2>The site itself</h2>
        <p>
          S.A. Mastatine is a parody run by volunteers. We do our best to keep it running but give no guarantees. Nothing here is advice. Mandatory
          consumer and privacy rights are not affected; see our <Link href="/privacy">privacy page</Link>. Dutch law applies.
        </p>
      </div>
    </>
  );
}
