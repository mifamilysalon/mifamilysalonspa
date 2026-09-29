import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { searchClientDirectory } from "@/lib/client-directory";
import { isStaffPortalRole } from "@/lib/gift-certificates";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffPortalRole(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const q = new URL(request.url).searchParams.get("q") || "";
    const clients = await searchClientDirectory(q);
    return NextResponse.json({ clients });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
