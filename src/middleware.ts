import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_APEX_HOST, SITE_HOST, SITE_URL } from "@/lib/seo";

/** Production workers.dev hostname — always bounce to the canonical www site. */
const PRODUCTION_WORKERS_HOST = "mifamilysalonspa.familysalonspa.workers.dev";

/**
 * Canonical host is always https://www.mifamilysalon.com
 * - apex → www (301)
 * - production workers.dev → www (301)
 * Preview / local hosts are left unchanged.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (host === SITE_APEX_HOST || host === PRODUCTION_WORKERS_HOST) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = SITE_HOST;
    // Ensure absolute redirect target uses SITE_URL origin for clarity
    const dest = new URL(
      `${url.pathname}${url.search}${url.hash}`,
      SITE_URL,
    );
    return NextResponse.redirect(dest, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|opengraph-image|illustrations/).*)",
  ],
};
