import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { isCommitteeMember } from "@/lib/committees";
import { getMeeting } from "@/lib/meetings";
import { createRateLimiter } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request";
import { getSession } from "@/lib/session";
import { UPLOAD_DIR, encodeWebp, sniffImageExt } from "@/lib/uploads";

export const dynamic = "force-dynamic";

const MAX_SIZE = 20 * 1024 * 1024;
const imageLimiter = createRateLimiter(40, 60 * 60 * 1000);

/** Adds a picture to a meeting's minutes. Only committee members of an unlocked meeting; the file is re-encoded as WebP. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const meeting = /^[0-9a-f-]{36}$/i.test(id) ? await getMeeting(id, session.user) : null;
  if (!meeting || !(await isCommitteeMember(session.user, meeting.committee_id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (meeting.minutes_status === "locked") return NextResponse.json({ error: "This meeting is locked" }, { status: 403 });
  if (!imageLimiter.allow(session.user.id)) {
    return NextResponse.json({ error: "Too many pictures. Please try again later." }, { status: 429 });
  }

  const declared = Number(req.headers.get("content-length"));
  if (declared > MAX_SIZE + 1024 * 1024) return NextResponse.json({ error: "Picture too large (max 20 MB)" }, { status: 413 });

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Picture too large (max 20 MB)" }, { status: 413 });

  const buffer = new Uint8Array(await file.arrayBuffer());
  const invalid = () => NextResponse.json({ error: "Only JPG, PNG, WebP and GIF pictures are allowed" }, { status: 400 });
  if (!sniffImageExt(buffer)) return invalid();

  let webp: Buffer;
  try {
    webp = await encodeWebp(buffer);
  } catch {
    return invalid();
  }

  const filename = `${Date.now()}-${randomUUID()}.webp`;
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, filename), webp);
  } catch (error) {
    console.error("Failed to store minutes picture:", error);
    return NextResponse.json({ error: "Could not store the picture" }, { status: 500 });
  }

  return NextResponse.json({ url: `/uploads/${filename}` });
}
