import type { Metadata } from "next";
import {
  IllustrationPanel,
  type IllustrationId,
} from "@/components/illustrations";
import { InstagramFeedSection } from "@/components/sections/InstagramFeedSection";
import { getDb } from "@/lib/db";
import {
  DEFAULT_INSTAGRAM_FEED,
  getInstagramFeedSettings,
  listCachedInstagramPosts,
} from "@/lib/instagram";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Gallery",
  description:
    "Salon looks and Instagram moments from Family Hair Salon & Wellness Spa in Farmington, MI. Hair, skin, nails, and wellness.",
  path: "/gallery",
});

const SCENES: { id: IllustrationId; alt: string }[] = [
  { id: "interior", alt: "Salon floor with styling chairs" },
  { id: "cut", alt: "Creative cut and style" },
  { id: "color", alt: "Full color service" },
  { id: "highlights", alt: "Highlights" },
  { id: "facial", alt: "Dermatological facial" },
  { id: "manicure", alt: "Classic manicure" },
  { id: "pedicure", alt: "Classic pedicure" },
  { id: "massage", alt: "Relaxation massage" },
  { id: "private", alt: "Private women's suite" },
  { id: "spa", alt: "Spa treatment room" },
];

export default async function GalleryPage() {
  let instagram = DEFAULT_INSTAGRAM_FEED;
  let posts: Awaited<ReturnType<typeof listCachedInstagramPosts>> = [];
  try {
    const db = await getDb();
    instagram = await getInstagramFeedSettings(db);
    posts = await listCachedInstagramPosts(db, 12);
  } catch {
    // D1 unavailable during build
  }

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <h1 className="font-serif text-4xl md:text-5xl">Gallery</h1>
        <p className="mt-5 max-w-2xl text-salon-body">
          Hair, skin, nails, and wellness from our Farmington salon. Follow{" "}
          <a
            href={instagram.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-salon-heading underline underline-offset-4 hover:text-salon-primary"
          >
            @{instagram.handle}
          </a>{" "}
          for more.
        </p>
        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {SCENES.map((scene) => (
            <div key={scene.id} className="mb-4 break-inside-avoid">
              <IllustrationPanel
                id={scene.id}
                title={scene.alt}
                aspect="3/4"
              />
            </div>
          ))}
        </div>
      </div>
      {instagram.enabled ? (
        <InstagramFeedSection settings={instagram} posts={posts} compact />
      ) : null}
    </div>
  );
}
