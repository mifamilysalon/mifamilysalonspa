import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileStickyCta } from "@/components/layout/MobileStickyCta";
import { PublicThemePicker } from "@/components/layout/PublicThemePicker";
import { getActivePaletteId, getBusinessInfo, getSocialLinks } from "@/lib/site";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getBusinessInfo();
  const siteDefaultPalette = await getActivePaletteId();
  const social = await getSocialLinks();

  return (
    <>
      <SiteHeader phone={business.phone_primary} salonName={business.name} />
      <main className="pb-16 md:pb-0">{children}</main>
      <SiteFooter
        salonName={business.name}
        address={business.address}
        phonePrimary={business.phone_primary}
        phoneSecondary={business.phone_secondary}
        hours={business.hours}
        social={social}
      />
      <MobileStickyCta phone={business.phone_primary} />
      <PublicThemePicker siteDefault={siteDefaultPalette} />
    </>
  );
}
