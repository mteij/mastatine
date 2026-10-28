import type { Metadata } from "next";
import Link from "next/link";
import AppFrame from "@/components/ui/AppFrame";
import { getQuotes, getVoter, parseSort, type QuoteSort } from "@/lib/quotes";
import { getSession } from "@/lib/session";
import QuoteCard from "./QuoteCard";

export const metadata: Metadata = {
  title: "Quotes",
  description: "Things members said, graded from 1 to 10.",
};
export const dynamic = "force-dynamic";

const SORTS: { value: QuoteSort; label: string }[] = [
  { value: "rating", label: "Rating" },
  { value: "date", label: "Date" },
];

export default async function QuotesPage(props: { searchParams: Promise<{ sort?: string }> }) {
  const sort = parseSort((await props.searchParams).sort);
  const session = await getSession();
  const quotes = await getQuotes(sort, await getVoter());
  const isAdmin = session?.user.role === "admin";

  return (
    <AppFrame title="Quotes" tagline="Things members said, graded from 1 to 10.">
      <nav aria-label="Sort quotes" className="tabs">
        <span className="tabs-label">Sort by</span>
        {SORTS.map((s) => (
          <Link key={s.value} href={`/mastapps/quotes?sort=${s.value}`} aria-current={sort === s.value ? "true" : undefined} className="tab">
            {s.label}
          </Link>
        ))}
      </nav>

      <ul className="mt-6 space-y-5">
        {quotes.map((quote) => (
          <li key={quote.id}>
            <QuoteCard quote={quote} canDelete={isAdmin || (!!session && quote.created_by === session.user.id)} />
          </li>
        ))}
        {quotes.length === 0 && <li className="py-10 text-center text-muted">No quotes yet. Be the first to add one.</li>}
      </ul>
    </AppFrame>
  );
}
