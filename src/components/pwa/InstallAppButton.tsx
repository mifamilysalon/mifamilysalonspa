"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const notOther = !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return iOS && webkit && notOther;
}

type Props = {
  /** Compact text link style for side nav / header. */
  className?: string;
};

/**
 * Chrome/Edge: shows when beforeinstallprompt is available.
 * iOS Safari: short Add to Home Screen hint when not already installed.
 */
export function InstallAppButton({ className = "" }: Props) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [iosDismissed, setIosDismissed] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay()) {
      setInstalled(true);
      return;
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);

    try {
      if (sessionStorage.getItem("pwa-ios-hint-dismissed") === "1") {
        setIosDismissed(true);
      }
    } catch {
      /* private mode */
    }

    if (isIosSafari()) {
      setShowIosHint(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  if (deferred) {
    return (
      <button
        type="button"
        className={
          className ||
          "min-h-12 px-4 py-2 text-sm text-salon-body transition hover:text-salon-primary"
        }
        onClick={async () => {
          await deferred.prompt();
          const choice = await deferred.userChoice;
          if (choice.outcome === "accepted") {
            setInstalled(true);
          }
          setDeferred(null);
        }}
      >
        Install app
      </button>
    );
  }

  if (showIosHint && !iosDismissed) {
    return (
      <p
        className={`max-w-[14rem] text-xs leading-snug text-salon-body ${className}`}
        role="note"
      >
        Add to Home Screen via Share{" "}
        <button
          type="button"
          className="underline hover:text-salon-primary"
          onClick={() => {
            setIosDismissed(true);
            try {
              sessionStorage.setItem("pwa-ios-hint-dismissed", "1");
            } catch {
              /* private mode */
            }
          }}
          aria-label="Dismiss install hint"
        >
          Dismiss
        </button>
      </p>
    );
  }

  return null;
}
