import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR, encodeWebp, sniffImageExt } from "@/lib/uploads";
import { createRateLimiter } from "@/lib/rate-limit";
import { clientIp, isSameOrigin } from "@/lib/request";

const MAX_SIZE = 20 * 1024 * 1024; // generous ceiling; the client downsizes before sending
const uploadLimiter = createRateLimiter(10, 60 * 60 * 1000);

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!uploadLimiter.allow(clientIp(req))) {
    return NextResponse.json({ error: "Too many uploads. Please try again later." }, { status: 429 });
  }

  // Reject oversized bodies before buffering them.
  const declared = Number(req.headers.get("content-length"));
  if (declared > MAX_SIZE + 1024 * 1024) {
    return NextResponse.json({ error: "File too large — max 20 MB" }, { status: 413 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large — max 20 MB" }, { status: 413 });
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const invalid = () => NextResponse.json({ error: "Only JPG, PNG, WebP and GIF images are allowed" }, { status: 400 });
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
    console.error("Failed to store upload:", error);
    return NextResponse.json({ error: "Could not store the image" }, { status: 500 });
  }

  return NextResponse.json({ url: `/uploads/${filename}` });
}
