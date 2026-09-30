# Hero / OG image — revert notes

## Current (2026-09-29)

Client-provided salon illustration replaced the previous illustrated hero and the purple dynamic OG graphic.

| Asset | Path |
|---|---|
| Live hero | `public/illustrations/hero.png` |
| Share / OG | `public/og-image.jpg` |
| Client source | `docs/familysalonfiles/WhatsApp Image 2026-09-29 at 10.48.25 PM.jpeg` |
| Clean master | `backups/illustrations-clean/hero.png` |

## Previous (pre-client image)

| Asset | Path |
|---|---|
| Previous hero PNG | `backups/illustrations-clean/hero-previous.png` |
| Previous OG | Git history — deleted `src/app/opengraph-image.tsx` (purple gradient `ImageResponse`) |

## Quick file restore (hero only)

```bash
cp backups/illustrations-clean/hero-previous.png public/illustrations/hero.png
npm run deploy:mifamilysalon
```

## Full git revert

Revert the commit that introduced the client hero / OG swap (message starts with “Replace homepage hero…”), then redeploy.
