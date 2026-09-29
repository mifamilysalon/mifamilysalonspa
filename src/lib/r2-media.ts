import { getEnv } from "./db";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 8 * 1024 * 1024;

export function mediaPublicPath(r2Key: string): string {
  return `/api/media/${r2Key.split("/").map(encodeURIComponent).join("/")}`;
}

export function isAllowedImageType(mime: string): boolean {
  return ALLOWED_TYPES.has(mime.toLowerCase());
}

export function assertImageWithinLimit(size: number): void {
  if (size <= 0 || size > MAX_BYTES) {
    throw new Error("Image must be between 1 byte and 8 MB");
  }
}

export async function getMediaBucket(): Promise<R2Bucket> {
  const env = await getEnv();
  if (!env.MEDIA) {
    throw new Error("R2 MEDIA binding is not configured");
  }
  return env.MEDIA;
}

export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "upload";
}

export function buildUploadKey(filename: string): string {
  const safe = sanitizeFilename(filename);
  const stamp = Date.now().toString(36);
  const rand = crypto.randomUUID().slice(0, 8);
  return `uploads/${stamp}-${rand}-${safe}`;
}
