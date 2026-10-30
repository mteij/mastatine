import type { Metadata } from "next";
import Link from "next/link";
import AppFrame from "@/components/ui/AppFrame";
import { getCommitteesFor } from "@/lib/committees";
import { hasMeetingFilters, parseMeetingFilters, searchMeetings, type MeetingFilters } from "@/lib/meetings";
import { requireUser } from "@/lib/session";
import MeetingRow from "../MeetingRow";

export const metadata: Metadata = { title: "Meetings", robots: { index: false } };
export const dynamic = "force-dynamic";

const PAGE = "/mastapps/minutes/meetings";
const MAX_RESULTS = 200;

/** Filters beyond the search box: when any is set, the panel starts open so it is clear why the list is short. */
const hasAdvanced = (f: MeetingFilters): boolean => Boolean(f.committeeId || f.status || f.from || f.to || f.when || f.openActions || f.sort !== "newest");

export default async function MeetingsPage(props: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { user } = await requireUser();
  const filters = parseMeetingFilters(await props.searchParams);
  const [meetings, committees] = await Promise.all([searchMeetings(user, filters, MAX_RESULTS), getCommitteesFor(user)]);
  const filtered = hasMeetingFilters(filters);

  return (
    <AppFrame title="Meetings" tagline="Every meeting of your committees.">
      <Link href="/mastapps/minutes/meetings/new" className="btn btn-primary mb-4">New meeting</Link>

      <form action={PAGE} role="search" className="admin-compact card mb-4 p-3">
        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="meeting-q">Search meetings</label>
          <input id="meeting-q" name="q" defaultValue={filters.q} placeholder="Search title, place, agenda or minutes" className="input min-w-0 flex-1 basis-60" />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </div>

        <details className="mt-2" open={hasAdvanced(filters)}>
          <summary className="cursor-pointer text-sm font-bold text-accent-text">Advanced filters</summary>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label" htmlFor="meeting-committee">Committee</label>
              <select id="meeting-committee" name="committee" defaultValue={filters.committeeId} className="input">
                <option value="">All committees</option>
                {committees.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="meeting-status">Minutes status</label>
              <select id="meeting-status" name="status" defaultValue={filters.status} className="input">
                <option value="">Any status</option>
                <option value="open">Open</option>
                <option value="done">Done</option>
                <option value="locked">Locked</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="meeting-when">When</label>
              <select id="meeting-when" name="when" defaultValue={filters.when} className="input">
                <option value="">Past and upcoming</option>
                <option value="upcoming">Today and upcoming</option>
                <option value="past">Past only</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="meeting-from">From</label>
              <input id="meeting-from" name="from" type="date" defaultValue={filters.from} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="meeting-to">Until</label>
              <input id="meeting-to" name="to" type="date" defaultValue={filters.to} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="meeting-sort">Order</label>
              <select id="meeting-sort" name="sort" defaultValue={filters.sort} className="input">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="actions" value="open" defaultChecked={filters.openActions} />
            Only meetings with open action points
          </label>
          <div className="mt-3 flex gap-2">
            <button type="submit" className="btn btn-primary btn-sm">Apply filters</button>
            {filtered && <Link href={PAGE} className="btn btn-ghost btn-sm">Clear all</Link>}
          </div>
        </details>
      </form>

      <p className="mb-2 text-sm text-muted" role="status">
        {meetings.length === 0 ? "No meetings found." : `${meetings.length}${meetings.length === MAX_RESULTS ? "+" : ""} meeting${meetings.length === 1 ? "" : "s"}`}
        {filtered && meetings.length === 0 && <> <Link href={PAGE} className="font-bold text-accent-text underline">Clear the filters</Link></>}
      </p>
      {meetings.length > 0 && <ul className="card divide-y divide-line">{meetings.map((m) => <MeetingRow key={m.id} meeting={m} />)}</ul>}
    </AppFrame>
  );
}
