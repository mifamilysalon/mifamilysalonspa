# Illustrations — clean vs watermarked

## Layout

| Path | Purpose |
|---|---|
| `backups/illustrations-clean/` | Master images without watermark (do not serve) |
| `public/illustrations/` | Live site images (small ConsultifyIT word mark) |
| `public/illustrations/hero.png` | **Client-owned** hero (no ConsultifyIT watermark) |

## Until client payment / client repo deploy

Keep the **watermarked** copies in `public/illustrations/`.

```bash
node scripts/watermark-illustrations.mjs
```

## After client payment (or deploying to the client-owned repo)

Restore the clean masters:

```bash
node scripts/watermark-illustrations.mjs --clean
npm run deploy
```

Prefer removing the watermark entirely once paid. A permanent signature is optional and usually unnecessary if the client owns the art.
