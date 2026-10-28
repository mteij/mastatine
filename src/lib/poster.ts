import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR, encodeWebp, sniffImageExt } from "@/lib/uploads";

const MAX_POSTER_BYTES = 10 * 1024 * 1024;

/** Validates, re-encodes and stores an uploaded poster. Returns its /uploads URL, or an error message for the form. */
export async function storePoster(file: File): Promise<{ url: string } | { error: string }> {
  if (file.size > MAX_POSTER_BYTES) return { error: "The poster is too large (max 10 MB)." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!sniffImageExt(bytes)) return { error: "The poster must be a JPG, PNG, WebP or GIF image." };

  let webp: Buffer;
  try {
    webp = await encodeWebp(bytes);
  } catch {
    return { error: "The poster could not be read as an image." };
  }

  const filename = `${Date.now()}-${randomUUID()}.webp`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), webp);
  return { url: `/uploads/${filename}` };
}
