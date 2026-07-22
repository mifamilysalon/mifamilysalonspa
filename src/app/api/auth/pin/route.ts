import { NextResponse } from "next/server";
import { loginWithPin } from "@/lib/auth";
import { pinLoginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = pinLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid PIN login" }, { status: 400 });
    }

    const user = await loginWithPin(parsed.data.staffId, parsed.data.pin);
    if (!user) {
      return NextResponse.json({ error: "Invalid staff or PIN" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
