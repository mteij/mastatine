import Image from "next/image";
import Link from "next/link";
import sql from "@/lib/db";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteMast } from "../actions";
import { requireAdmin } from "@/lib/session";

const PAGE_SIZE = 25;

interface Row {
  id: string;
  title: string;
  submitter_name: string;
  image_url: string;
  vote_count: number;
  height: number | null;
  created_at: Date;
}

export default async function AdminMasts(props: { searchParams: Promise<{ q?: string; page?: string }> }) {
  // Layouts do not re-run on client navigation, so each admin page checks the role itself.
  await requireAdmin();
  const { q = "", page = "1" } = await props.searchParams;
  const pageNumber = Math.max(1, Math.min(Number(page) || 1, 10_000));
  const query = q.trim().slice(0, 100);
  const pattern = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
  const where = query ? sql`WHERE title ILIKE ${pattern} OR submitter_name ILIKE ${pattern}` : sql``;

  const rows = await sql<Row[]>`
    SELECT id, title, submitter_name, image_url, vote_count, height, created_at
    FROM towers ${where} ORDER BY created_at DESC LIMIT ${PAGE_SIZE + 1} OFFSET ${(pageNumber - 1) * PAGE_SIZE}
  `;
  const hasMore = rows.length > PAGE_SIZE;
  const masts = rows.slice(0, PAGE_SIZE);
  const link = (p: number) => `/admin/masts?${new URLSearchParams({ ...(query && { q: query }), page: String(p) })}`;

  return (
    <>
      <form className="mb-6 flex gap-3" role="search">
        <label className="sr-only" htmlFor="admin-mast-search">Search masts</label>
        <input id="admin-mast-search" name="q" defaultValue={query} placeholder="Search title or submitter" className="input max-w-sm" />
        <button className="btn btn-secondary" type="submit">Search</button>
      </form>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Mast</th><th>Submitted by</th><th className="text-right">Votes</th><th>Added</th><th><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {masts.map((mast) => (
              <tr key={mast.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <Image src={mast.image_url} alt="" width={96} height={72} quality={60} className="h-10 w-14 rounded-md object-cover" />
                    <span className="font-medium">{mast.title}</span>
                  </div>
                </td>
                <td>{mast.submitter_name}</td>
                <td className="text-right tabular-nums">{mast.vote_count}</td>
                <td className="whitespace-nowrap text-muted">{new Date(mast.created_at).toLocaleDateString("en-GB")}</td>
                <td>
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/masts/${mast.id}`} className="btn btn-secondary btn-sm">Edit</Link>
                    <form action={deleteMast}>
                      <input type="hidden" name="id" value={mast.id} />
                      <ConfirmButton message={`Delete “${mast.title}” and its photo? This cannot be undone.`} className="btn btn-danger btn-sm">Delete</ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {masts.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-muted">No masts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between text-sm">
        {pageNumber > 1 ? <Link href={link(pageNumber - 1)} className="btn btn-secondary btn-sm">&larr; Newer</Link> : <span />}
        {hasMore && <Link href={link(pageNumber + 1)} className="btn btn-secondary btn-sm">Older &rarr;</Link>}
      </div>
    </>
  );
}
