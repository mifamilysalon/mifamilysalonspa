"use client";

import { useEffect } from "react";

/** City Side Cafe–style free Trustindex Instagram feed embed */
export function TrustindexInstagramEmbed({ widgetId }: { widgetId: string }) {
  const id = widgetId.trim();
  const containerId = `trustindex-feed-container-instagram-${id}`;

  useEffect(() => {
    if (!id || typeof document === "undefined") return;

    const existing = document.querySelector(
      `script[data-trustindex-feed="${id}"]`,
    ) as HTMLScriptElement | null;
    if (existing) {
      // Re-trigger load if navigating client-side
      existing.remove();
    }

    const script = document.createElement("script");
    script.src = `https://cdn.trustindex.io/loader-feed.js?${id}`;
    script.defer = true;
    script.async = true;
    script.dataset.trustindexFeed = id;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [id]);

  if (!id) return null;

  return (
    <div className="w-full overflow-hidden">
      <div id={containerId} />
    </div>
  );
}
