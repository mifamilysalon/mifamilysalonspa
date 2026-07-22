import type { InstagramFeedSettings, InstagramPost } from "@/lib/instagram";
import { TrustindexInstagramEmbed } from "@/components/sections/TrustindexInstagramEmbed";

function InstagramGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
      />
    </svg>
  );
}

export function InstagramFeedSection({
  settings,
  posts,
  compact = false,
}: {
  settings: InstagramFeedSettings;
  posts: InstagramPost[];
  compact?: boolean;
}) {
  const handle = settings.handle.replace(/^@/, "");
  const profileUrl = settings.profile_url || `https://www.instagram.com/${handle}/`;
  const hasTrustindex = !!settings.trustindex_widget_id.trim();
  const hasPosts = posts.length > 0;

  return (
    <section className="border-y border-salon-border">
      <div
        className={`relative mx-auto max-w-6xl px-4 md:px-6 ${
          compact ? "py-14 md:py-16" : "py-20 md:py-28"
        }`}
      >
        <div className="fade-in max-w-2xl">
          <div className="flex items-center gap-2.5 text-salon-primary">
            <InstagramGlyph />
            <p className="text-sm uppercase tracking-[0.18em]">Instagram</p>
          </div>
          <h2 className="mt-3 font-serif text-3xl md:text-5xl">
            Moments from the salon
          </h2>
          <p className="mt-4 text-salon-body">
            Cuts, color, skin, and nails from the chair. Follow{" "}
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-salon-heading underline underline-offset-4 hover:text-salon-primary"
            >
              @{handle}
            </a>{" "}
            for daily updates.
          </p>
        </div>

        {hasTrustindex ? (
          <div className="mt-10">
            <TrustindexInstagramEmbed widgetId={settings.trustindex_widget_id} />
          </div>
        ) : hasPosts ? (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {posts.map((post) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden bg-salon-panel"
                aria-label={post.caption || "View Instagram post"}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image_url}
                  alt={post.caption || "Instagram post from Family Hair Salon & Wellness Spa"}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-10 border border-dashed border-salon-border bg-salon-panel/60 px-6 py-12 text-center">
            <p className="text-salon-body">
              Live posts appear here after the free Instagram feed is connected in
              Admin → Settings.
            </p>
          </div>
        )}

        <div className="mt-10">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 border border-salon-border bg-salon-panel px-5 py-3 text-sm font-medium text-salon-heading transition hover:border-salon-primary"
          >
            <InstagramGlyph className="text-salon-primary" />
            Follow @{handle} on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
