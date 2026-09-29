import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileStickyCta } from "@/components/layout/MobileStickyCta";
import { getBusinessInfo, getSocialLinks } from "@/lib/site";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getBusinessInfo();
  const social = await getSocialLinks();

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader
        phone={business.phone_primary}
        salonName={business.name}
        address={business.address}
        hours={business.hours}
      />
      <main id="main-content" className="pb-16 md:pb-0">
        {children}
      </main>
      <SiteFooter
        salonName={business.name}
        address={business.address}
        phonePrimary={business.phone_primary}
        phoneSecondary={business.phone_secondary}
        hours={business.hours}
        social={social}
      />
      <MobileStickyCta phone={business.phone_primary} />
    </>
  );
}
