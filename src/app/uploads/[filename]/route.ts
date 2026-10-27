import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { CONTENT_TYPES, UPLOAD_DIR, UPLOAD_FILENAME_RE } from "@/lib/uploads";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!UPLOAD_FILENAME_RE.test(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const data = await readFile(path.join(UPLOAD_DIR, filename));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": CONTENT_TYPES[filename.split(".").pop()!],
        // Filenames are unique and never rewritten, so cache forever.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
