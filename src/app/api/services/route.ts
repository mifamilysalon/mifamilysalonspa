import { NextResponse } from "next/server";
import { getServices } from "@/lib/site";

/** Public services list — prices omitted (desk brochure only). */
export async function GET() {
  try {
    const services = await getServices();
    const publicServices = services.map((s) => {
      const { price, ...rest } = s;
      void price;
      return rest;
    });
    return NextResponse.json({ services: publicServices });
  } catch {
    return NextResponse.json({ error: "Failed to load services" }, { status: 500 });
  }
}
