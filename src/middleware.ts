import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_APEX_HOST, SITE_HOST } from "@/lib/seo";

/** 301 apex → www for production SEO (workers.dev and preview hosts unchanged). */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (host === SITE_APEX_HOST) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.host = SITE_HOST;
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Skip static assets and Next internals; still run on page routes.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon|opengraph-image|illustrations/).*)",
  ],
};
