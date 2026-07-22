import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { getEnv } from "@/lib/db";
import { syncGoogleReviewsFromPlaces } from "@/lib/reviews";

export async function POST() {
  try {
    const user = await getCurrentUser();
    try {
      requireRole(user, ["owner", "manager"]);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const env = await getEnv();
    const result = await syncGoogleReviewsFromPlaces(env);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch {
    return NextResponse.json({ ok: false, message: "Sync failed" }, { status: 500 });
  }
}
