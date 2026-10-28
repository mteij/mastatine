import ConfirmButton from "@/components/admin/ConfirmButton";
import { formatGrade, formatQuoteDate, type Quote } from "@/lib/quotes";
import { deleteQuote, voteQuote } from "./actions";
import { TrashIcon } from "@/components/ui/icons";

interface QuoteCardProps {
  quote: Quote;
  canDelete: boolean;
}

export default function QuoteCard({ quote, canDelete }: QuoteCardProps) {
  return (
    <article className="card p-6">
      <header className="flex items-start justify-between gap-4">
        <p className="text-sm text-muted">
          <strong className="font-extrabold text-accent-text">{quote.author}</strong> · {formatQuoteDate(quote.said_on)}
        </p>
        {canDelete && (
          <form action={deleteQuote}>
            <input type="hidden" name="id" value={quote.id} />
            <ConfirmButton message="Delete this quote?" className="inline-flex cursor-pointer items-center gap-1.5 text-base font-bold text-muted transition-colors hover:text-danger">
              <TrashIcon />
              Delete
            </ConfirmButton>
          </form>
        )}
      </header>
      <blockquote className="mt-3 whitespace-pre-line text-lg leading-relaxed">{quote.body}</blockquote>
      <footer className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Grade <span className="badge text-sm">{formatGrade(quote.average)}</span>
          {quote.votes > 0 && <span> · {quote.votes} {quote.votes === 1 ? "vote" : "votes"}</span>}
        </p>
        <form action={voteQuote} className="flex items-center gap-2">
            <input type="hidden" name="quote_id" value={quote.id} />
            <label htmlFor={`grade-${quote.id}`} className="text-base font-bold">Your grade</label>
            <select id={`grade-${quote.id}`} name="score" aria-label={`Your grade for the quote by ${quote.author}`} defaultValue={quote.my_score ?? 8} className="input !w-auto !py-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <button type="submit" className="btn btn-primary">{quote.my_score ? "Update vote" : "Vote"}</button>
        </form>
      </footer>
    </article>
  );
}
