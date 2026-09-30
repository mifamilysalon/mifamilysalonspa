"use client";

import { useEffect } from "react";

/** Registers the lightweight app-shell service worker (staff/admin only). */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          // Pick up a waiting worker from a prior deploy without requiring a second visit.
          if (reg.waiting) {
            reg.waiting.postMessage({ type: "SKIP_WAITING" });
          }
          reg.update().catch(() => {});
        })
        .catch(() => {
          /* install still works via manifest on supporting browsers */
        });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}
