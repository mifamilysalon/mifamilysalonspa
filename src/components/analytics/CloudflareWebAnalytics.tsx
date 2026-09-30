import Script from "next/script";
import { getDb } from "@/lib/db";
import { getWebAnalyticsSettings } from "@/lib/system-health";

/** Privacy-friendly Cloudflare Web Analytics beacon (token from Admin → System). */
export async function CloudflareWebAnalytics() {
  let token = "";
  try {
    const db = await getDb();
    const settings = await getWebAnalyticsSettings(db);
    if (settings.enabled && settings.token) token = settings.token;
  } catch {
    return null;
  }
  if (!token) return null;

  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      defer
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
