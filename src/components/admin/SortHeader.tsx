import Link from "next/link";

export type SortDir = "asc" | "desc";

interface SortHeaderProps {
  label: string;
  column: string;
  /** Column and direction currently applied. */
  active: { column: string; dir: SortDir };
  /** Page path plus the other query params to keep (search, filter), without sort/dir/page. */
  basePath: string;
  keep?: Record<string, string>;
  className?: string;
  /** Direction used the first time this column is clicked. */
  defaultDir?: SortDir;
}

/** A link that sorts by its column; clicking the active column flips the direction. */
export function SortLink({ label, column, active, basePath, keep = {}, defaultDir = "asc" }: Omit<SortHeaderProps, "className">) {
  const isActive = active.column === column;
  const nextDir: SortDir = isActive ? (active.dir === "asc" ? "desc" : "asc") : defaultDir;
  const query = new URLSearchParams({ ...keep, sort: column, dir: nextDir });
  return (
    <Link href={`${basePath}?${query}`} className={`inline-flex items-center gap-1 hover:text-ink ${isActive ? "text-ink" : ""}`}>
      {label}
      <span aria-hidden="true" className="text-[10px]">{isActive ? (active.dir === "asc" ? "▲" : "▼") : "↕"}</span>
    </Link>
  );
}

/** A table header cell holding one sort link. */
export default function SortHeader({ className, ...link }: SortHeaderProps) {
  const isActive = link.active.column === link.column;
  return (
    <th className={className} aria-sort={isActive ? (link.active.dir === "asc" ? "ascending" : "descending") : undefined}>
      <SortLink {...link} />
    </th>
  );
}

/** Reads sort params against a whitelist so a query string can never reach the SQL. */
export function parseSort<K extends string>(params: { sort?: string; dir?: string }, allowed: readonly K[], fallback: { column: K; dir: SortDir }): { column: K; dir: SortDir } {
  const column = allowed.find((key) => key === params.sort) ?? fallback.column;
  const dir: SortDir = params.dir === "asc" || params.dir === "desc" ? params.dir : fallback.dir;
  return { column, dir: column === params.sort ? dir : fallback.dir };
}
