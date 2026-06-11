import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(req: NextRequest) {
  const voter_id = req.nextUrl.searchParams.get("voter_id");

  if (!voter_id) {
    return NextResponse.json({ tower_ids: [] });
  }

  const votes = await sql`
    SELECT tower_id FROM votes WHERE voter_id = ${voter_id}
  `;

  return NextResponse.json({ tower_ids: votes.map((v) => v.tower_id) });
}
