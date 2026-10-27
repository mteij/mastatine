import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { FAQ, MEMBERSHIP_PERKS } from "@/content/site";

export const metadata: Metadata = {
  title: "Membership",
  description: "Membership of S.A. Mastatine is free and optional. Here is what you get.",
};

export default function MembershipPage() {
  return (
    <>
      <PageHeader
        title="Membership"
        intro="It is free, it is optional, and it is not a real study association membership. Here is what you get."
      />
      <div className="container-page">
        <ul className="grid gap-5 sm:grid-cols-2">
          {MEMBERSHIP_PERKS.map((perk) => (
            <li key={perk.title} className="card p-6">
              <h2 className="text-xl font-extrabold">{perk.title}</h2>
              <p className="mt-2 text-base text-muted">{perk.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="btn btn-primary">
            Create a free account
          </Link>
          <Link href="/newsletter" className="btn btn-secondary">
            Subscribe to the newsletter
          </Link>
        </div>
      </div>

      <section className="container-prose mt-20" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-2xl font-bold">
          Questions
        </h2>
        <dl className="mt-6 divide-y divide-line border-y border-line">
          {FAQ.map((item) => (
            <div key={item.q} className="py-5">
              <dt className="font-semibold">{item.q}</dt>
              <dd className="mt-1.5 text-muted">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
