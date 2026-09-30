import type { Metadata } from "next";
import { DEFAULT_SOCIAL, type SocialLinks } from "@/lib/media";
import { BROCHURE_CATEGORIES } from "@/lib/service-categories";

/** Canonical production origin (always www — used for OG / sitemap / JSON-LD) */
export const SITE_URL = "https://www.mifamilysalon.com";
export const SITE_HOST = "www.mifamilysalon.com";
export const SITE_APEX_HOST = "mifamilysalon.com";

/** Staging / pre-domain Workers URL */
export const PREVIEW_SITE_URL =
  "https://familysalonspa.consultifyit-forms.workers.dev";

export const SITE_CONTACT_EMAIL = "info@mifamilysalon.com";
export const SITE_ADMIN_EMAIL = "admin@mifamilysalon.com";
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
  email: SITE_CONTACT_EMAIL,
  streetAddress: "34777 Grand River Ave",
  addressLocality: "Farmington",
  addressRegion: "MI",
  postalCode: "48335",
  addressCountry: "US",
  /** Approximate salon coordinates for LocalBusiness geo (Grand River Ave, Farmington) */
  latitude: 42.4645,
  longitude: -83.3763,
  /** Schema.org OpeningHoursSpecification */
  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "10:00", closes: "18:00" },
    { days: ["Saturday"], opens: "10:00", closes: "17:00" },
  ],
  hoursDisplay: "Mon-Fri 10am-6pm, Sat 10am-5pm, Sun Closed",
  priceRange: "$$",
  paymentAccepted: ["Cash", "Credit Card", "Debit Card"],
  currenciesAccepted: "USD",
  knowsAbout: [
    "Hair salon Farmington MI",
    "Hair coloring and highlights",
    "Facials and face mapping",
    "Manicure and pedicure",
    "Eyebrow threading",
    "Waxing",
    "Private women's salon suite",
    "Hijab-friendly salon Farmington",
  ],
  areaServed: [
    "Farmington, MI",
    "Farmington Hills, MI",
    "Livonia, MI",
    "West Bloomfield, MI",
    "Novi, MI",
  ],
  defaultImage: `${SITE_URL}/og-image.jpg`,
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
    telephone: LOCAL_BUSINESS.telephoneDisplay,
    email: LOCAL_BUSINESS.email,
    image: input?.image || LOCAL_BUSINESS.defaultImage,
    priceRange: LOCAL_BUSINESS.priceRange,
    paymentAccepted: [...LOCAL_BUSINESS.paymentAccepted],
    currenciesAccepted: LOCAL_BUSINESS.currenciesAccepted,
    knowsAbout: [...LOCAL_BUSINESS.knowsAbout],
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
    contactPoint: LOCAL_BUSINESS.telephone.map((tel, i) => ({
      "@type": "ContactPoint",
      telephone: tel,
      contactType: i === 0 ? "customer service" : "reservations",
      areaServed: "US",
      availableLanguage: ["English"],
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Salon & spa services",
      itemListElement: BROCHURE_CATEGORIES.map((cat, index) => ({
        "@type": "OfferCatalog",
        position: index + 1,
        name: cat.label,
        url: absoluteUrl(cat.href),
      })),
    },
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

/** Homepage WebPage + speakable passages for voice / answer engines */
export function buildHomeWebPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: `${SITE_NAME} | Farmington, MI`,
    description: LOCAL_BUSINESS.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#business` },
    primaryImageOfPage: LOCAL_BUSINESS.defaultImage,
    inLanguage: "en-US",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "#faq-heading", "section[aria-labelledby='faq-heading'] dt", "section[aria-labelledby='faq-heading'] dd"],
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
      "Monday through Friday 10am to 6pm, Saturday 10am to 5pm. We are closed on Sunday.",
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
      "Book online at www.mifamilysalon.com/appointments, or call (248) 474-6520 or (248) 635-5127. Instant-book services confirm immediately; request services are confirmed by our team.",
  },
  {
    question: "How much do services cost?",
    answer:
      "Current rates are available in the salon. Ask at the front desk for our pricing brochure. Your stylist will confirm pricing before your service begins.",
  },
  {
    question: "What services do you offer?",
    answer:
      "Hair care (cuts, color, highlights, extensions, perm, straightening), skin care (facials and face mapping), nail care (manicures, pedicures, shellac), wellness treatments, and gift certificates.",
  },
  {
    question: "Is Family Hair Salon & Wellness Spa hijab-friendly?",
    answer:
      "Yes. Our private women's suite in Farmington is designed for female clientele who prefer complete privacy, including women who wear hijab.",
  },
  {
    question: "Which cities near Farmington do you serve?",
    answer:
      "We serve clients from Farmington, Farmington Hills, Livonia, West Bloomfield, and Novi, Michigan, from our salon at 34777 Grand River Ave.",
  },
];
