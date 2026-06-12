import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const voter_id = body.voter_id?.trim();
  const direction: "up" | "down" = body.direction === "down" ? "down" : "up";

  if (!voter_id) {
    return NextResponse.json({ error: "voter_id is required" }, { status: 400 });
  }

  const existing = await sql<{ id: string; direction: string }[]>`
    SELECT id, direction FROM votes WHERE tower_id = ${id} AND voter_id = ${voter_id}
  `;

  if (existing.length === 0) {
    await sql`INSERT INTO votes (tower_id, voter_id, direction) VALUES (${id}, ${voter_id}, ${direction})`;
    const delta = direction === "up" ? 1 : -1;
    await sql`UPDATE towers SET vote_count = vote_count + ${delta} WHERE id = ${id}`;
    return NextResponse.json({ success: true, action: "voted", direction });
  }

  if (existing[0].direction === direction) {
    await sql`DELETE FROM votes WHERE id = ${existing[0].id}`;
    const delta = direction === "up" ? -1 : 1;
    await sql`UPDATE towers SET vote_count = vote_count + ${delta} WHERE id = ${id}`;
    return NextResponse.json({ success: true, action: "unvoted" });
  }

  await sql`UPDATE votes SET direction = ${direction} WHERE id = ${existing[0].id}`;
  const delta = direction === "up" ? 2 : -2;
  await sql`UPDATE towers SET vote_count = vote_count + ${delta} WHERE id = ${id}`;
  return NextResponse.json({ success: true, action: "changed", direction });
}
