import Link from "next/link";
import Image from "next/image";
import { HeroSection } from "@/components/sections/HeroSection";
import { GoogleReviewsSection } from "@/components/sections/GoogleReviewsSection";
import { InstagramFeedSection } from "@/components/sections/InstagramFeedSection";
import { FaqSection } from "@/components/seo/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDb } from "@/lib/db";
import {
  DEFAULT_INSTAGRAM_FEED,
  listCachedInstagramPosts,
  getInstagramFeedSettings,
} from "@/lib/instagram";
import { getGoogleReviewsMeta, listCachedGoogleReviews } from "@/lib/reviews";
import {
  buildLocalBusinessJsonLd,
  buildWebsiteJsonLd,
  buildPageMetadata,
} from "@/lib/seo";
import { getBusinessInfo, getMediaSettings, getSocialLinks } from "@/lib/site";

export const metadata = buildPageMetadata({
  title: "Hair Salon & Spa in Farmington, MI",
  description:
    "Family Hair Salon & Wellness Spa in Farmington, MI — hair, skin, nails, wellness, and a private women's suite. Walk in or book online. Call (248) 474-6520.",
  path: "/",
  keywords: [
    "hair salon Farmington MI",
    "spa Farmington Michigan",
    "walk in haircut Farmington",
    "private suite salon Farmington",
  ],
});

export default async function HomePage() {
  const business = await getBusinessInfo();
  const media = await getMediaSettings();
  const social = await getSocialLinks();
  let reviewsMeta = {
    place_id: "",
    maps_url:
      "https://www.google.com/maps/search/?api=1&query=Family+Hair+Salon+%26+Wellness+Spa+34777+Grand+River+Ave+Farmington+MI",
    rating: 4.4,
    review_count: 1012,
    last_synced_at: null as string | null,
  };
  let reviews: Awaited<ReturnType<typeof listCachedGoogleReviews>> = [];
  let instagram = DEFAULT_INSTAGRAM_FEED;
  let instagramPosts: Awaited<ReturnType<typeof listCachedInstagramPosts>> = [];
  try {
    const db = await getDb();
    reviewsMeta = await getGoogleReviewsMeta(db);
    reviews = await listCachedGoogleReviews(db);
    instagram = await getInstagramFeedSettings(db);
    instagramPosts = await listCachedInstagramPosts(db, 8);
  } catch {
    // D1 unavailable during build - section omitted
  }
  const featured = [
    {
      title: "Hair Care",
      href: "/hair-care",
      body: "Creative styling, coloring, extensions, permanent waving, straightening, and rebonding.",
      image:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80",
    },
    {
      title: "Skin Care",
      href: "/skin-care",
      body: "Dermatological facials planned after face mapping skin analysis for your skin type.",
      image:
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=80",
    },
    {
      title: "Nail Care",
      href: "/nail-care",
      body: "Manicures, pedicures, shellac, and polish changes from Farmington nail technicians.",
      image:
        "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=900&q=80",
    },
  ];

  return (
    <>
      <HeroSection
        headline="Family Hair Salon & Wellness Spa"
        subhead="Hair, skin, nails, and wellness for Farmington. Walk in for a cut, color, facial, or manicure - or book time in our private suite if you prefer a quieter setting."
        image={media.hero_image}
        tone={media.hero_tone}
        ctaPrimary="Book an appointment"
        ctaPrimaryHref="/appointments"
        ctaSecondary={`Call ${business.phone_primary}`}
        ctaSecondaryHref={`tel:${business.phone_primary.replace(/\D/g, "")}`}
      />

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="fade-in max-w-2xl">
          <p className="text-sm uppercase tracking-[0.18em] text-salon-primary">
            On Grand River Ave
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">
            Established care for your hair, skin, and nails
          </h2>
          <p className="mt-5 text-salon-body">
            Our wide range of services includes the latest trends and techniques
            in creative styling, coloring, extensions, permanent waving,
            straightening, and rebonding. Skin therapists suggest treatments
            only after examining your skin type. Nail technicians offer
            manicures, pedicures, shellac, and polish changes.
          </p>
        </div>
      </section>

      <hr className="gold-rule mx-auto max-w-6xl" />

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <h2 className="font-serif text-3xl md:text-4xl">Services</h2>
        <div className="mt-12 space-y-16">
          {featured.map((item, i) => (
            <article
              key={item.href}
              className={`fade-in grid items-center gap-8 md:grid-cols-2 ${
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div>
                <h3 className="font-serif text-2xl md:text-3xl">{item.title}</h3>
                <p className="mt-4 text-salon-body">{item.body}</p>
                <Link
                  href={item.href}
                  className="mt-6 inline-block text-sm font-medium text-salon-primary underline underline-offset-4 hover:text-salon-hover"
                >
                  View {item.title.toLowerCase()}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {reviews.length > 0 && (
        <GoogleReviewsSection meta={reviewsMeta} reviews={reviews} />
      )}

      <InstagramFeedSection settings={instagram} posts={instagramPosts} />

      <section className="bg-salon-light">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <div className="editorial-panel max-w-3xl p-8 md:p-12">
            <p className="text-sm uppercase tracking-[0.18em] text-salon-primary">
              Private women&apos;s suite
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              A private area for female clientele
            </h2>
            <p className="mt-5 text-salon-body">
              This area was designed to accommodate women who require or prefer
              services in a complete private setting, such as women who wear
              hijab.
            </p>
            <Link
              href="/private-area"
              className="mt-8 inline-block bg-salon-primary px-6 py-3 text-sm font-medium text-white hover:bg-salon-hover"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center md:px-6">
        <h2 className="font-serif text-3xl md:text-4xl">Ready to book?</h2>
        <p className="mx-auto mt-4 max-w-xl text-salon-body">
          Choose a service online or call {business.phone_primary} or{" "}
          {business.phone_secondary}. We are at {business.address}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/appointments"
            className="bg-salon-primary px-6 py-3 text-sm font-medium text-white hover:bg-salon-hover"
          >
            Book an appointment
          </Link>
          <Link
            href="/contact"
            className="border border-salon-border px-6 py-3 text-sm font-medium text-salon-heading hover:border-salon-primary"
          >
            Contact us
          </Link>
        </div>
      </section>

      <FaqSection />

      <JsonLd
        data={[
          buildLocalBusinessJsonLd({
            rating: reviewsMeta.rating,
            reviewCount: reviewsMeta.review_count,
            social,
            image: media.hero_image,
          }),
          buildWebsiteJsonLd(),
        ]}
      />
    </>
  );
}
