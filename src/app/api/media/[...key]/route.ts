import { NextResponse } from "next/server";
import { getMediaBucket } from "@/lib/r2-media";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  try {
    const { key: parts } = await context.params;
    if (!parts?.length) {
      return NextResponse.json({ error: "Missing media key" }, { status: 400 });
    }

    const key = parts.map(decodeURIComponent).join("/");
    if (key.includes("..") || key.startsWith("/")) {
      return NextResponse.json({ error: "Invalid media key" }, { status: 400 });
    }

    const bucket = await getMediaBucket();
    const object = await bucket.get(key);
    if (!object) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set(
      "Cache-Control",
      "public, max-age=86400, stale-while-revalidate=604800",
    );
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/octet-stream");
    }

    return new NextResponse(object.body, { headers });
  } catch (err) {
    console.error("media serve failed", err);
    return NextResponse.json({ error: "Media unavailable" }, { status: 500 });
  }
}
