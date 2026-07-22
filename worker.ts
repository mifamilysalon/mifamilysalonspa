// Custom OpenNext worker: fetch + midnight Google reviews sync
// @ts-expect-error generated at build time
import { default as handler } from "./.open-next/worker.js";
import type { AppEnv } from "./cloudflare-env";
import { syncGoogleReviewsFromPlaces } from "./src/lib/reviews";

export default {
  fetch: handler.fetch,

  async scheduled(
    _controller: ScheduledController,
    env: AppEnv,
    ctx: ExecutionContext,
  ) {
    ctx.waitUntil(
      syncGoogleReviewsFromPlaces(env).then((result) => {
        console.log("[cron] google reviews sync:", result.message, result.count ?? "");
      }),
    );
  },
} satisfies ExportedHandler<AppEnv>;

// @ts-expect-error generated at build time
export { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";
