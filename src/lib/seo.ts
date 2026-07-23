import type { Metadata } from "next";
import { DEFAULT_SOCIAL, type SocialLinks } from "@/lib/media";

/** Canonical production origin (also used for OG / sitemap / JSON-LD) */
export const SITE_URL = "https://familysalonspa.com";
export const SITE_NAME = "Family Hair Salon & Wellness Spa";
export const SITE_TAGLINE =
  "Hair, skin, nails, and wellness in Farmington, Michigan";

export const LOCAL_BUSINESS = {
  name: SITE_NAME,
  legalName: SITE_NAME,
  description:
    "Family Hair Salon & Wellness Spa offers hair care, skin care, nail care, wellness, and a private women's suite in Farmington, MI. Walk in or book online.",
  url: SITE_URL,
  telephone: ["+12484746520", "+12486355127"],
  telephoneDisplay: ["(248) 474-6520", "(248) 635-5127"],
  email: "info@familysalonspa.com",
  streetAddress: "34777 Grand River Ave",
  addressLocality: "Farmington",
  addressRegion: "MI",
  postalCode: "48335",
  addressCountry: "US",
  /** Approximate salon coordinates for LocalBusiness geo (Grand River Ave, Farmington) */
  latitude: 42.4645,
  longitude: -83.3763,
  priceRange: "$$",
  /** Schema.org OpeningHoursSpecification */
  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
    { days: ["Saturday"], opens: "09:00", closes: "17:00" },
  ],
  hoursDisplay: "Mon–Fri 9am–6pm, Sat 9am–5pm, Sun Closed",
  areaServed: [
    "Farmington, MI",
    "Farmington Hills, MI",
    "Livonia, MI",
    "West Bloomfield, MI",
    "Novi, MI",
  ],
  defaultImage: `${SITE_URL}/opengraph-image`,
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Family+Hair+Salon+%26+Wellness+Spa+34777+Grand+River+Ave+Farmington+MI",
} as const;

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
};

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function socialSameAs(social: SocialLinks = DEFAULT_SOCIAL): string[] {
  return [
    social.facebook,
    social.instagram,
    social.yelp,
    social.threads,
    social.tiktok,
  ].filter((u): u is string => !!u?.trim());
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  ogImage,
  noIndex,
}: PageSeo): Metadata {
  const url = absoluteUrl(path);
  const image = ogImage || LOCAL_BUSINESS.defaultImage;

  return {
    title,
    description,
    keywords: keywords?.join(", "),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
  };
}

export function buildLocalBusinessJsonLd(input?: {
  rating?: number;
  reviewCount?: number;
  social?: SocialLinks;
  image?: string;
}) {
  const sameAs = socialSameAs(input?.social);
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["HairSalon", "BeautySalon", "LocalBusiness"],
    "@id": `${SITE_URL}/#business`,
    name: LOCAL_BUSINESS.name,
    legalName: LOCAL_BUSINESS.legalName,
    description: LOCAL_BUSINESS.description,
    url: SITE_URL,
    telephone: LOCAL_BUSINESS.telephoneDisplay[0],
    image: input?.image || LOCAL_BUSINESS.defaultImage,
    priceRange: LOCAL_BUSINESS.priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: LOCAL_BUSINESS.streetAddress,
      addressLocality: LOCAL_BUSINESS.addressLocality,
      addressRegion: LOCAL_BUSINESS.addressRegion,
      postalCode: LOCAL_BUSINESS.postalCode,
      addressCountry: LOCAL_BUSINESS.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: LOCAL_BUSINESS.latitude,
      longitude: LOCAL_BUSINESS.longitude,
    },
    hasMap: LOCAL_BUSINESS.mapsUrl,
    areaServed: LOCAL_BUSINESS.areaServed.map((name) => ({
      "@type": "City",
      name,
    })),
    openingHoursSpecification: LOCAL_BUSINESS.openingHours.flatMap((block) =>
      block.days.map((day) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: day,
        opens: block.opens,
        closes: block.closes,
      })),
    ),
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: LOCAL_BUSINESS.telephone[0],
        contactType: "customer service",
        areaServed: "US",
        availableLanguage: ["English"],
      },
    ],
  };

  if (sameAs.length) schema.sameAs = sameAs;

  if (input?.rating && input?.reviewCount && input.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: input.rating,
      reviewCount: input.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_TAGLINE,
    publisher: { "@id": `${SITE_URL}/#business` },
    inLanguage: "en-US",
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/appointments`,
      },
      result: {
        "@type": "Reservation",
        name: "Salon appointment",
      },
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildFaqJsonLd(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** Shared FAQs tuned for AEO / voice / AI answer engines */
export const SITE_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "Where is Family Hair Salon & Wellness Spa located?",
    answer:
      "We are at 34777 Grand River Ave, Farmington, MI 48335. Call (248) 474-6520 or (248) 635-5127 for directions or to book.",
  },
  {
    question: "What are your hours?",
    answer:
      "Monday through Friday 9am to 6pm, Saturday 9am to 5pm. We are closed on Sunday.",
  },
  {
    question: "Do you take walk-ins in Farmington?",
    answer:
      "Yes. You can walk in for many hair, skin, and nail services, or book ahead online when you prefer a set time. Some specialty services are request-to-confirm.",
  },
  {
    question: "Do you have a private suite for women?",
    answer:
      "Yes. Our private women's suite is designed for female clientele who prefer complete privacy, including women who wear hijab.",
  },
  {
    question: "How do I book an appointment?",
    answer:
      "Book online at familysalonspa.com/appointments, or call (248) 474-6520 or (248) 635-5127. Instant-book services confirm immediately; request services are confirmed by our team.",
  },
  {
    question: "What services do you offer?",
    answer:
      "Hair care (cuts, color, highlights, extensions, perm, straightening), skin care (facials and face mapping), nail care (manicures, pedicures, shellac), wellness treatments, and gift certificates.",
  },
];
