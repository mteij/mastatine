import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { createRateLimiter } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";

const readLimiter = createRateLimiter(120, 60 * 1000);

export async function GET(req: NextRequest) {
  if (!readLimiter.allow(clientIp(req))) return NextResponse.json({ error: "Slow down a little." }, { status: 429 });

  const voter_id = req.nextUrl.searchParams.get("voter_id");

  if (!voter_id || voter_id.length > 100) {
    return NextResponse.json({ tower_votes: [] });
  }

  const votes = await sql`
    SELECT tower_id, direction FROM votes WHERE voter_id = ${voter_id}
  `;

  return NextResponse.json({
    tower_votes: votes.map((v) => ({ tower_id: v.tower_id, direction: v.direction ?? "up" })),
  });
}
