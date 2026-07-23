import type { Metadata } from "next";
import Image from "next/image";
import { InstagramFeedSection } from "@/components/sections/InstagramFeedSection";
import { getDb } from "@/lib/db";
import {
  DEFAULT_INSTAGRAM_FEED,
  getInstagramFeedSettings,
  listCachedInstagramPosts,
} from "@/lib/instagram";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Photo Gallery",
  description:
    "Photos and Instagram moments from Family Hair Salon & Wellness Spa in Farmington, MI — salon atmosphere, hair, skin, and nails.",
  path: "/gallery",
});

const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&q=80",
    alt: "Salon styling chairs and warm lighting",
  },
  {
    src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80",
    alt: "Hair styling in progress",
  },
  {
    src: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=80",
    alt: "Facial skincare treatment setup",
  },
  {
    src: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=900&q=80",
    alt: "Manicure polish application",
  },
  {
    src: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=900&q=80",
    alt: "Hair wash station",
  },
  {
    src: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=900&q=80",
    alt: "Spa towels and calm treatment room",
  },
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

  const showFallbackGallery =
    !instagram.trustindex_widget_id.trim() && posts.length === 0;

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <h1 className="font-serif text-4xl md:text-5xl">Photo gallery</h1>
        <p className="mt-5 max-w-2xl text-salon-body">
          Atmosphere from the salon floor, plus live posts from{" "}
          <a
            href={instagram.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-salon-heading underline underline-offset-4 hover:text-salon-primary"
          >
            @{instagram.handle}
          </a>
          .
        </p>
        {showFallbackGallery && (
          <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {IMAGES.map((img) => (
              <div key={img.src} className="mb-4 break-inside-avoid">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <InstagramFeedSection settings={instagram} posts={posts} compact />
    </div>
  );
}
