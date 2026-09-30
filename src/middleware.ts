import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_APEX_HOST, SITE_URL } from "@/lib/seo";

/**
 * Canonical host is always https://www.mifamilysalon.com
 * - apex (mifamilysalon.com) → www (301)
 * Preview / workers.dev / local hosts are left unchanged so the site stays
 * reachable while DNS for www is still propagating on some networks.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (host === SITE_APEX_HOST) {
    const dest = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}${request.nextUrl.hash}`,
      SITE_URL,
    );
    return NextResponse.redirect(dest, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|opengraph-image|og-image\\.jpg|illustrations/).*)",
  ],
};
