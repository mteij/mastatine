import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const LIMIT = 8;
const UUID = /^[0-9a-f-]{36}$/i;

interface Person {
  id: string;
  name: string;
  email: string;
}

/** Admin-only people search for the committee picker: matches name or email, leaves out people already in the committee. */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100);
  const committee = req.nextUrl.searchParams.get("committee") ?? "";
  if (!UUID.test(committee)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  if (q.length < 1) return NextResponse.json({ people: [] });

  const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
  const people = await sql<Person[]>`
    SELECT u.id, u.name, u.email FROM "user" u
    WHERE NOT u.banned AND (u.name ILIKE ${pattern} OR u.email ILIKE ${pattern})
      AND NOT EXISTS (SELECT 1 FROM committee_members m WHERE m.committee_id = ${committee} AND m.user_id = u.id)
    ORDER BY u.name, u.email LIMIT ${LIMIT}
  `;
  return NextResponse.json({ people });
}
