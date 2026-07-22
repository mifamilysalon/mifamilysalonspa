"use client";

import { useEffect, useState } from "react";
import {
  PALETTE_IDS,
  PALETTES,
  PUBLIC_THEME_STORAGE_KEY,
  applyPaletteToDocument,
  isPaletteId,
  paletteDisplayName,
  type PaletteId,
} from "@/lib/palettes";

export function PublicThemePicker({
  siteDefault,
}: {
  siteDefault: PaletteId;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<PaletteId>(siteDefault);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PUBLIC_THEME_STORAGE_KEY);
      if (saved && isPaletteId(saved)) {
        setActive(saved);
        applyPaletteToDocument(saved);
        return;
      }
    } catch {
      // ignore storage errors
    }
    applyPaletteToDocument(siteDefault);
  }, [siteDefault]);

  function select(id: PaletteId) {
    setActive(id);
    applyPaletteToDocument(id);
    try {
      localStorage.setItem(PUBLIC_THEME_STORAGE_KEY, id);
    } catch {
      // ignore
    }
    setOpen(false);
  }

  function resetToSiteDefault() {
    try {
      localStorage.removeItem(PUBLIC_THEME_STORAGE_KEY);
    } catch {
      // ignore
    }
    setActive(siteDefault);
    applyPaletteToDocument(siteDefault);
    setOpen(false);
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6">
      {open && (
        <div className="editorial-panel mb-2 max-h-[70vh] w-72 overflow-y-auto p-3 shadow-none">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-salon-heading">Theme preview</p>
              <p className="text-xs text-salon-body">
                Temporary for you only. Owner default is set in Admin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-10 px-2 text-sm text-salon-body"
              aria-label="Close theme picker"
            >
              Close
            </button>
          </div>
          <div className="space-y-2">
            {PALETTE_IDS.map((id) => {
              const p = PALETTES[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => select(id)}
                  className={`flex min-h-12 w-full items-center gap-3 border px-3 py-2 text-left text-sm transition ${
                    active === id
                      ? "border-salon-primary bg-salon-light"
                      : "border-salon-border hover:border-salon-primary"
                  }`}
                >
                  <span className="flex shrink-0 gap-0.5">
                    <span
                      className="h-5 w-5 border border-salon-border"
                      style={{ background: p.colors.bg_main }}
                    />
                    <span
                      className="h-5 w-5 border border-salon-border"
                      style={{ background: p.colors.accent_primary }}
                    />
                  </span>
                  <span className="leading-snug text-salon-heading">
                    {paletteDisplayName(id)}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={resetToSiteDefault}
            className="mt-3 w-full border border-salon-border py-2 text-xs text-salon-body hover:border-salon-primary"
          >
            Reset to site default
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="min-h-12 border border-salon-border bg-salon-panel px-4 text-sm font-medium text-salon-heading shadow-none"
        aria-expanded={open}
      >
        Themes
      </button>
    </div>
  );
}
