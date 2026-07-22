// Custom OpenNext worker: fetch + midnight Google reviews + Instagram sync
// @ts-expect-error generated at build time
import { default as handler } from "./.open-next/worker.js";
import type { AppEnv } from "./cloudflare-env";
import { syncInstagramFromBehold } from "./src/lib/instagram";
import { syncGoogleReviewsFromPlaces } from "./src/lib/reviews";

export default {
  fetch: handler.fetch,

  async scheduled(
    _controller: ScheduledController,
    env: AppEnv,
    ctx: ExecutionContext,
  ) {
    ctx.waitUntil(
      (async () => {
        const reviews = await syncGoogleReviewsFromPlaces(env);
        console.log("[cron] google reviews sync:", reviews.message, reviews.count ?? "");
        const instagram = await syncInstagramFromBehold(env);
        console.log("[cron] instagram sync:", instagram.message, instagram.count ?? "");
      })(),
    );
  },
} satisfies ExportedHandler<AppEnv>;

// @ts-expect-error generated at build time
export { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";
