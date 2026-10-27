import sql from "@/lib/db";
import type { Tower } from "@/lib/types";

export const PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;
export const MAX_QUERY_LENGTH = 100;

export type SortKey = "rating" | "newest" | "height";

export function parseSort(value: unknown): SortKey {
  return value === "newest" || value === "height" ? value : "rating";
}

export function parseQuery(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_QUERY_LENGTH) : "";
}

interface ListOptions {
  sort: SortKey;
  q: string;
  offset: number;
  limit: number;
}

export interface TowerPage {
  towers: Tower[];
  hasMore: boolean;
}

/** One page of towers; fetches limit + 1 rows to know whether another page exists. */
export async function listTowers({ sort, q, offset, limit }: ListOptions): Promise<TowerPage> {
  // Escape LIKE wildcards so user input is matched literally.
  const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
  const where = q
    ? sql`WHERE title ILIKE ${pattern} OR description ILIKE ${pattern} OR submitter_name ILIKE ${pattern}`
    : sql``;
  const order =
    sort === "newest"
      ? sql`created_at DESC, id`
      : sort === "height"
        ? sql`height DESC NULLS LAST, vote_count DESC, id`
        : sql`vote_count DESC, created_at DESC, id`;

  const rows = await sql<Tower[]>`
    SELECT * FROM towers ${where} ORDER BY ${order} LIMIT ${limit + 1} OFFSET ${offset}
  `;
  return { towers: rows.slice(0, limit), hasMore: rows.length > limit };
}
