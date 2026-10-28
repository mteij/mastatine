import type { Metadata } from "next";
import AppFrame from "@/components/ui/AppFrame";
import { membersOnlyGate } from "@/components/MembersOnly";
import { formatGrade, formatQuoteDate, getAuthorStats, getQuoteStats, getTopQuotes, NO_VOTER } from "@/lib/quotes";

export const metadata: Metadata = { title: "Quote statistics" };
export const dynamic = "force-dynamic";

export default async function QuoteStatisticsPage() {
  const gate = await membersOnlyGate("Quote statistics", "/mastapps/quotes/statistics");
  if (gate) return gate;
  const [stats, authors, top] = await Promise.all([getQuoteStats(), getAuthorStats(), getTopQuotes(NO_VOTER)]);
  const tiles = [
    { label: "Quotes", value: stats.quotes },
    { label: "Votes", value: stats.votes },
    { label: "People quoted", value: stats.authors },
    { label: "Average grade", value: stats.average === null ? "–" : stats.average.toFixed(1) },
  ];

  return (
    <AppFrame title="Quote statistics" tagline="Who says the most, and who says it best.">

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="card p-4 text-center">
            <dd className="text-3xl font-extrabold tabular-nums text-accent-text">{t.value}</dd>
            <dt className="mt-1 text-sm text-muted">{t.label}</dt>
          </div>
        ))}
      </dl>

      <section aria-labelledby="top-title" className="mt-10">
        <h2 id="top-title" className="text-xl font-bold">Highest graded</h2>
        <ol className="mt-4 space-y-3">
          {top.map((q) => (
            <li key={q.id} className="card p-4">
              <p className="whitespace-pre-line">{q.body}</p>
              <p className="mt-2 text-sm text-muted">
                <strong className="text-accent-text">{q.author}</strong> · {formatQuoteDate(q.said_on)} · <span className="badge">{formatGrade(q.average)}</span>
              </p>
            </li>
          ))}
          {top.length === 0 && <li className="text-muted">Nothing graded yet.</li>}
        </ol>
      </section>

      <section aria-labelledby="authors-title" className="mt-10">
        <h2 id="authors-title" className="text-xl font-bold">Most quoted</h2>
        <div className="table-wrap mt-4">
          <table className="table">
            <thead><tr><th>Person</th><th className="text-right">Quotes</th><th className="text-right">Average grade</th></tr></thead>
            <tbody>
              {authors.map((a) => (
                <tr key={a.author}>
                  <td className="font-medium">{a.author}</td>
                  <td className="text-right tabular-nums">{a.quotes}</td>
                  <td className="text-right tabular-nums">{a.average === null ? "–" : a.average.toFixed(1)}</td>
                </tr>
              ))}
              {authors.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-muted">No quotes yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </AppFrame>
  );
}
