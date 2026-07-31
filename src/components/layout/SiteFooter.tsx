import Link from "next/link";
import { SOCIAL_LABELS, type SocialLinks } from "@/lib/media";

export function SiteFooter({
  salonName,
  address,
  phonePrimary,
  phoneSecondary,
  hours,
  social,
}: {
  salonName: string;
  address: string;
  phonePrimary: string;
  phoneSecondary: string;
  hours: string;
  social: SocialLinks;
}) {
  const socialEntries = SOCIAL_LABELS.filter(({ key }) => social[key]?.trim());

  return (
    <footer className="mt-24 border-t border-salon-border bg-salon-panel">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-serif text-2xl text-salon-heading">{salonName}</p>
          <p className="mt-3 text-sm text-salon-body">{address}</p>
          {socialEntries.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium uppercase tracking-wide text-salon-heading">
                Follow us
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {socialEntries.map(({ key, label }) => (
                  <li key={key}>
                    <a
                      href={social[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-salon-primary hover:text-salon-hover"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-salon-heading">
            Appointments
          </p>
          <a
            href={`tel:${phonePrimary.replace(/\D/g, "")}`}
            className="mt-3 block text-salon-primary hover:text-salon-hover"
          >
            {phonePrimary}
          </a>
          <a
            href={`tel:${phoneSecondary.replace(/\D/g, "")}`}
            className="mt-1 block text-salon-primary hover:text-salon-hover"
          >
            {phoneSecondary}
          </a>
          <Link
            href="/appointments"
            className="mt-4 inline-block text-sm underline underline-offset-4"
          >
            Book or walk in
          </Link>
          <Link
            href="/gift-certificates"
            className="mt-2 block text-sm text-salon-body hover:text-salon-primary"
          >
            Gift certificates
          </Link>
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-salon-heading">
            Hours
          </p>
          <p className="mt-3 text-sm text-salon-body">{hours}</p>
          <div className="mt-8 flex flex-wrap gap-4 text-xs text-salon-body/50">
            <Link href="/staff/login" className="hover:text-salon-primary">
              Staff
            </Link>
            <Link href="/admin/login" className="hover:text-salon-primary">
              Admin
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-salon-border px-4 py-5 text-center text-xs text-salon-body/70">
        <p>
          &copy; {new Date().getFullYear()} {salonName}. Farmington, Michigan.
        </p>
        <p className="mt-2">
          Website designed, developed and managed by{" "}
          <a
            href="https://consultifyit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-salon-primary underline underline-offset-2 hover:text-salon-hover"
          >
            ConsultifyIT Technology Services (Cify)
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
