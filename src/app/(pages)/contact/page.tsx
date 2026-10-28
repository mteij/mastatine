import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { getLegalIdentity } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with S.A. Mastatine: questions, takedown requests, press, or concerns.",
};

// Reads CONTACT_EMAIL at request time so the address can change without a rebuild.
export const dynamic = "force-dynamic";

const TOPICS = [
  { title: "Remove a photo or submission", text: "If something shows you, or should not be public, tell us which mast and we will take it down." },
  { title: "Delete your data", text: "Ask us to delete your account, newsletter subscription or anything else we hold about you." },
  { title: "Concerns about this site", text: "If you represent another organisation and think this parody goes too far, write to us. We respond promptly and in good faith." },
  { title: "Everything else", text: "Mast tips, ideas for committees, or press." },
];

export default function ContactPage() {
  const legal = getLegalIdentity();
  const email = legal.email;

  return (
    <>
      <PageHeader title="Get in touch" intro="A real person reads these, usually within a few days." />
      <div className="container-page">
        <div className="card mx-auto max-w-3xl p-6 sm:p-8">
          {email ? (
            <>
              <p className="text-base text-muted">Email</p>
              <a href={`mailto:${email}`} className="mt-1 block break-all text-2xl font-bold text-accent-text hover:underline">
                {email}
              </a>
            </>
          ) : (
            <p className="text-muted">The contact address has not been configured yet.</p>
          )}
        </div>

        {legal.name || legal.address || legal.kvk ? (
          <div className="card mx-auto mt-6 max-w-3xl p-6 sm:p-8">
            <h2 className="text-lg font-bold">Who runs this site</h2>
            <dl className="mt-2 space-y-1 text-base">
              {legal.name && <div><dt className="inline font-semibold">Name: </dt><dd className="inline">{legal.name}</dd></div>}
              {legal.address && <div><dt className="inline font-semibold">Address: </dt><dd className="inline">{legal.address}</dd></div>}
              {legal.kvk && <div><dt className="inline font-semibold">KvK number: </dt><dd className="inline">{legal.kvk}</dd></div>}
            </dl>
          </div>
        ) : null}

        <ul className="mx-auto mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
          {TOPICS.map((topic) => (
            <li key={topic.title} className="rounded-2xl border border-line p-5">
              <h2 className="text-lg font-bold">{topic.title}</h2>
              <p className="mt-1.5 text-base text-muted">{topic.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
