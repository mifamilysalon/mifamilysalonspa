import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  assertImageWithinLimit,
  buildUploadKey,
  getMediaBucket,
  isAllowedImageType,
  mediaPublicPath,
} from "@/lib/r2-media";

export async function GET() {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const res = await db
      .prepare(
        `SELECT id, r2_key, filename, alt_text, mime_type, size_bytes, created_at
         FROM media_assets
         ORDER BY id DESC
         LIMIT 50`,
      )
      .all<{
        id: number;
        r2_key: string;
        filename: string;
        alt_text: string | null;
        mime_type: string | null;
        size_bytes: number | null;
        created_at: string;
      }>();

    const assets = (res.results || []).map((row) => ({
      ...row,
      url: mediaPublicPath(row.r2_key),
    }));

    return NextResponse.json({ assets });
  } catch (err) {
    console.error("media list failed", err);
    return NextResponse.json({ error: "Failed to list media" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    let admin;
    try {
      admin = requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const mime = file.type || "application/octet-stream";
    if (!isAllowedImageType(mime)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, or GIF images are allowed" },
        { status: 400 },
      );
    }

    try {
      assertImageWithinLimit(file.size);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Invalid file size" },
        { status: 400 },
      );
    }

    const altText = String(form.get("alt") || "").trim().slice(0, 200);
    const key = buildUploadKey(file.name || "upload.jpg");
    const bytes = await file.arrayBuffer();
    const bucket = await getMediaBucket();

    await bucket.put(key, bytes, {
      httpMetadata: { contentType: mime },
      customMetadata: {
        originalName: file.name || "upload",
        uploadedBy: String(admin.id),
      },
    });

    const db = await getDb();
    const inserted = await db
      .prepare(
        `INSERT INTO media_assets (r2_key, filename, alt_text, mime_type, size_bytes, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?)
         RETURNING id, r2_key, filename, alt_text, mime_type, size_bytes, created_at`,
      )
      .bind(
        key,
        file.name || key,
        altText || null,
        mime,
        file.size,
        admin.id,
      )
      .first<{
        id: number;
        r2_key: string;
        filename: string;
        alt_text: string | null;
        mime_type: string | null;
        size_bytes: number | null;
        created_at: string;
      }>();

    if (!inserted) {
      return NextResponse.json({ error: "Upload saved but metadata failed" }, { status: 500 });
    }

    return NextResponse.json(
      {
        asset: {
          ...inserted,
          url: mediaPublicPath(inserted.r2_key),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("media upload failed", err);
    return NextResponse.json({ error: "Failed to upload media" }, { status: 500 });
  }
}
