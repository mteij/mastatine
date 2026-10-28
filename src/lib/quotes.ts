import sql from "@/lib/db";
import { getSession } from "@/lib/session";

/** Who is looking. Quotes are members-only, so this is always a signed-in member (or nobody, for aggregate views). */
export interface Voter {
  userId: string | null;
  anonId: string | null;
}

export const NO_VOTER: Voter = { userId: null, anonId: null };

export async function getVoter(): Promise<Voter> {
  const session = await getSession();
  return session ? { userId: session.user.id, anonId: null } : NO_VOTER;
}

export type QuoteSort = "rating" | "date";

export interface Quote {
  id: string;
  body: string;
  author: string;
  said_on: string; // YYYY-MM-DD
  created_by: string | null;
  average: number | null;
  votes: number;
  my_score: number | null;
}

export interface QuoteStats {
  quotes: number;
  votes: number;
  authors: number;
  average: number | null;
}

export interface AuthorStat {
  author: string;
  quotes: number;
  average: number | null;
}

const LIST_LIMIT = 200;

export const parseSort = (value: string | undefined): QuoteSort => (value === "date" ? "date" : "rating");

export function formatQuoteDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export const formatGrade = (average: number | null): string => (average === null ? "No votes yet" : average.toFixed(1));

const quoteColumns = (voter: Voter) => sql`
  q.id, q.body, q.author, q.said_on::text AS said_on, q.created_by,
  AVG(v.score)::float8 AS average, COUNT(v.score)::int AS votes,
  MAX(v.score) FILTER (WHERE v.user_id = ${voter.userId ?? ""} OR v.voter_id = ${voter.anonId ?? ""})::int AS my_score
`;

export function getQuotes(sort: QuoteSort, voter: Voter) {
  const order =
    sort === "rating"
      ? sql`average DESC NULLS LAST, votes DESC, q.said_on DESC, q.created_at DESC`
      : sql`q.said_on DESC, q.created_at DESC`;
  return sql<Quote[]>`
    SELECT ${quoteColumns(voter)}
    FROM quotes q LEFT JOIN quote_votes v ON v.quote_id = q.id
    GROUP BY q.id ORDER BY ${order} LIMIT ${LIST_LIMIT}
  `;
}

export function getTopQuotes(voter: Voter, limit = 5) {
  return sql<Quote[]>`
    SELECT ${quoteColumns(voter)}
    FROM quotes q JOIN quote_votes v ON v.quote_id = q.id
    GROUP BY q.id ORDER BY average DESC, votes DESC, q.said_on DESC LIMIT ${limit}
  `;
}

export async function getQuoteStats(): Promise<QuoteStats> {
  const [row] = await sql<QuoteStats[]>`
    SELECT
      (SELECT COUNT(*) FROM quotes)::int AS quotes,
      (SELECT COUNT(*) FROM quote_votes)::int AS votes,
      (SELECT COUNT(DISTINCT lower(author)) FROM quotes)::int AS authors,
      (SELECT AVG(score) FROM quote_votes)::float8 AS average
  `;
  return row;
}

/** People ranked by how often they are quoted; the grade is the mean of the grades their quotes received. */
export function getAuthorStats(limit = 10) {
  return sql<AuthorStat[]>`
    SELECT MIN(q.author) AS author, COUNT(DISTINCT q.id)::int AS quotes, AVG(v.score)::float8 AS average
    FROM quotes q LEFT JOIN quote_votes v ON v.quote_id = q.id
    GROUP BY lower(q.author)
    ORDER BY quotes DESC, average DESC NULLS LAST, author LIMIT ${limit}
  `;
}
