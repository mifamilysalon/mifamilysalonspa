import type { Metadata } from "next";
import { GiftCertificatesLanding } from "@/components/gift/GiftCertificatesLanding";
import { buildPageMetadata } from "@/lib/seo";
import { getBusinessInfo } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Gift Certificates",
  description:
    "Purchase salon gift certificates in person or by phone at Family Hair Salon & Wellness Spa in Farmington, MI. Call (248) 474-6520.",
  path: "/gift-certificates",
});

export default async function GiftCertificatesPage() {
  const business = await getBusinessInfo();
  return <GiftCertificatesLanding business={business} />;
}
