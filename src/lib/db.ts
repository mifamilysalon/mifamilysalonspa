import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { AppEnv } from "../../cloudflare-env";

export async function getEnv(): Promise<AppEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env as AppEnv;
}

export async function getDb(): Promise<D1Database> {
  const env = await getEnv();
  if (!env.DB) {
    throw new Error("D1 database binding DB is not configured");
  }
  return env.DB;
}
