import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { Filter } from "bad-words";

export async function GET() {
  const towers = await sql`
    SELECT * FROM towers ORDER BY vote_count DESC
  `;
  return NextResponse.json(towers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, submitter_name, image_url, height } = body;

  if (!title?.trim() || !submitter_name?.trim() || !image_url?.trim()) {
    return NextResponse.json(
      { error: "title, submitter_name and image_url are required" },
      { status: 400 }
    );
  }

  const filter = new Filter();

  // Clean inputs from profanity/bad words
  const cleanTitle = filter.clean(title.trim());
  const cleanDescription = description ? filter.clean(description.trim()) : null;
  const cleanSubmitter = filter.clean(submitter_name.trim());
  const cleanHeight = typeof height === "number" && !isNaN(height) ? height : null;

  const [tower] = await sql`
    INSERT INTO towers (title, description, submitter_name, image_url, height)
    VALUES (${cleanTitle}, ${cleanDescription}, ${cleanSubmitter}, ${image_url}, ${cleanHeight})
    RETURNING *
  `;

  return NextResponse.json(tower, { status: 201 });
}
