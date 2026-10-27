import path from "node:path";
import sharp from "sharp";

export const UPLOAD_DIR = path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR ?? "./uploads");

// Server-generated names only: lowercase alphanumerics and dashes, known extension.
export const UPLOAD_FILENAME_RE = /^[a-z0-9-]+\.(jpg|png|webp|gif)$/;

export const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

/** Detect the real image type from magic bytes instead of trusting the client's MIME type. */
export function sniffImageExt(buf: Uint8Array): "jpg" | "png" | "webp" | "gif" | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "gif";
  const ascii = (from: number, to: number) => String.fromCharCode(...buf.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}

const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 80;

/**
 * Re-encode any supported image as WebP: applies EXIF rotation, drops all metadata
 * (including GPS), caps the longest edge and keeps animation. Throws if the bytes
 * are not a decodable image.
 */
export function encodeWebp(input: Uint8Array): Promise<Buffer> {
  return sharp(input, { animated: true, limitInputPixels: 80_000_000 })
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 5 })
    .toBuffer();
}
