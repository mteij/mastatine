import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const voter_id = body.voter_id?.trim();

  if (!voter_id) {
    return NextResponse.json({ error: "voter_id is required" }, { status: 400 });
  }

  try {
    await sql`
      INSERT INTO votes (tower_id, voter_id) VALUES (${id}, ${voter_id})
    `;
  } catch (err: unknown) {
    // Unique constraint violation — already voted
    if ((err as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "Already voted" }, { status: 409 });
    }
    throw err;
  }

  await sql`
    UPDATE towers SET vote_count = vote_count + 1 WHERE id = ${id}
  `;

  return NextResponse.json({ success: true });
}
