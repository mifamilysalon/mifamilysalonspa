import { NextResponse } from "next/server";
import { loginWithPin } from "@/lib/auth";
import { getAuthSettings } from "@/lib/site";
import { pinLoginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = pinLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid PIN login" }, { status: 400 });
    }

    const auth = await getAuthSettings();
    if (parsed.data.pin.length !== auth.pin_length) {
      return NextResponse.json(
        { error: `PIN must be ${auth.pin_length} digits` },
        { status: 400 },
      );
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
