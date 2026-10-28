import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import sql from "@/lib/db";
import type { Tower } from "@/lib/types";
import { updateMast } from "../../actions";
import { requireAdmin } from "@/lib/session";

export default async function EditMastPage(props: { params: Promise<{ id: string }> }) {
  // Layouts do not re-run on client navigation, so each admin page checks the role itself.
  await requireAdmin();
  const { id } = await props.params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const [mast] = await sql<Tower[]>`SELECT * FROM towers WHERE id = ${id}`;
  if (!mast) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/masts" className="text-sm font-medium text-accent-text hover:underline">&larr; All masts</Link>
      <h2 className="mt-3 text-2xl font-bold">Edit mast</h2>

      <Image src={mast.image_url} alt={mast.title} width={640} height={400} quality={75} className="mt-6 max-h-72 w-full rounded-2xl border border-line object-contain" />

      <form action={updateMast} className="card mt-6 space-y-5 p-6">
        <input type="hidden" name="id" value={mast.id} />
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" name="title" className="input" defaultValue={mast.title} required maxLength={120} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="submitter_name">Submitted by</label>
            <input id="submitter_name" name="submitter_name" className="input" defaultValue={mast.submitter_name} required maxLength={80} />
          </div>
          <div>
            <label className="label" htmlFor="height">Height (m)</label>
            <input id="height" name="height" type="number" step="0.1" min="0" max="2000" className="input" defaultValue={mast.height ?? ""} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" name="description" className="input min-h-32" defaultValue={mast.description ?? ""} maxLength={1000} />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary">Save changes</button>
          <Link href="/admin/masts" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
