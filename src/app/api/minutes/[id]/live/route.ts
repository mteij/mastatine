import { NextRequest, NextResponse } from "next/server";
import { getLiveItems, getMeeting } from "@/lib/meetings";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Polled by the minutes editor: the current notes, who is editing which item, and the minutes status. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const meeting = /^[0-9a-f-]{36}$/i.test(id) ? await getMeeting(id, session.user) : null;
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = await getLiveItems(meeting.id, session.user.id);
  return NextResponse.json({ status: meeting.minutes_status, items }, { headers: { "Cache-Control": "no-store" } });
}
