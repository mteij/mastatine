import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { Filter } from "bad-words";
import { MAX_PAGE_SIZE, PAGE_SIZE, listTowers, parseQuery, parseSort } from "@/lib/towers";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const limit = Math.min(Math.max(Number(params.get("limit")) || PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const offset = Math.min(Math.max(Number(params.get("offset")) || 0, 0), 100_000);

  const page = await listTowers({
    sort: parseSort(params.get("sort")),
    q: parseQuery(params.get("q")),
    offset,
    limit,
  });
  return NextResponse.json(page);
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

  if (typeof image_url !== "string" || !/^\/uploads\/[a-z0-9-]+\.(jpg|png|webp|gif)$/.test(image_url)) {
    return NextResponse.json({ error: "image_url must be an uploaded image" }, { status: 400 });
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
