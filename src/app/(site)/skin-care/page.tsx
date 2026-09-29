import { redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Skin Care & Facials",
  description:
    "Facials and skin care at Family Hair Salon & Wellness Spa in Farmington, MI.",
  path: "/skin-care",
});

/** Legacy URL — facials menu now at /facials */
export default function SkinCareRedirect() {
  redirect("/facials");
}
