# Family Hair Salon & Wellness Spa

Luxury website and appointment system for Family Hair Salon & Wellness Spa (Farmington, MI).

## Stack

- Next.js 15 App Router
- Cloudflare Workers via `@opennextjs/cloudflare`
- D1, R2, KV on ConsultifyIT Cloudflare account

## Local development

```bash
npm install
npx wrangler d1 migrations apply familysalonspa-db --local
cp .dev.vars.example .dev.vars
npm run dev
```

## Deploy

```bash
npx wrangler secret put SESSION_SECRET
npm run deploy
```

## Credentials (seed)

- Admin: `admin@familysalonspa.com` / `SalonOwner2026!`
- Staff PIN: `1234` (Sarah Chen, Maria Lopez)

## Docs

See [docs/plans/01-master-plan.md](docs/plans/01-master-plan.md).
