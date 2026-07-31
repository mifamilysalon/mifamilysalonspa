# Family Hair Salon & Wellness Spa

Luxury website and appointment system for **Family Hair Salon & Wellness Spa** (Farmington, MI).

- Live preview: https://familysalonspa.consultifyit-forms.workers.dev  
- Production domain (canonical SEO): https://familysalonspa.com  

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
# optional secrets below
npm run deploy
npx wrangler d1 migrations apply familysalonspa-db --remote
```

## Credentials (seed)

- Admin: `admin@familysalonspa.com` / `SalonOwner2026!`
- Staff PIN: `1234` (all seeded stylists)

---

## In-salon price brochure (QR)

Prices are **not** shown on the public website. Guests at the desk scan a QR code:

| Environment | URL |
|-------------|-----|
| Production | `https://familysalonspa.com/menu` |
| Preview | `https://familysalonspa.consultifyit-forms.workers.dev/menu` |

- Hidden from nav, sitemap, and robots (`noindex`)
- Edit dollar amounts in **Admin → Services**
- QR tip: point the printed code at `/menu` only — do not put the link on social or the main site

---

## Secrets & API keys (do not lose)

Store production values with Wrangler secrets (never commit real keys). Local: `.dev.vars` (gitignored). Template: `.dev.vars.example`.

| Name | Required? | Where used | Notes |
|------|-----------|------------|--------|
| `SESSION_SECRET` | **Yes** | Auth cookies | Long random string (≥32 chars). `wrangler secret put SESSION_SECRET` |
| `GOOGLE_PLACES_API_KEY` | Optional | Nightly Google reviews sync (`worker.ts` cron `0 4 * * *`) | Free Places API quota. Without it, seeded/cached reviews stay. Set Place ID in Admin → Settings. |
| `TWILIO_ACCOUNT_SID` | Optional | SMS opt-in notifications | Keep SMS **OFF** in Admin until configured |
| `TWILIO_AUTH_TOKEN` | Optional | SMS | |
| `TWILIO_FROM_NUMBER` | Optional | SMS | E.164 format |

### Instagram feed (free — no Trustindex required)

Preferred: **[Behold](https://behold.so/)** JSON feed (custom grid + nightly sync).

1. Create free Behold account → connect [@familysalonandspa](https://www.instagram.com/familysalonandspa/)
2. Create a **JSON** feed → copy `https://feeds.behold.so/<feedId>`
3. Admin → Settings → Instagram feed → paste URL → Save → **Sync now**
4. Leave Trustindex widget ID blank unless you already use Trustindex

Optional alternate (what [City Side Cafe](https://citysidecafe.com/) uses): **[Trustindex](https://www.trustindex.io/widgets/instagram-feed-widget/)** free Instagram widget → paste widget ID only in Admin settings.

No Behold/Trustindex API key is stored in Wrangler — only the feed URL / widget ID in D1 `site_settings`.

### Confirmed social profiles

- Facebook: https://www.facebook.com/familysalonandspa/
- Instagram: https://www.instagram.com/familysalonandspa/
- Threads: https://www.threads.com/@familysalonandspa
- Yelp: https://www.yelp.com/biz/family-hair-salon-and-wellness-spa-farmington

### Google reviews

- Rating/count can be edited in Admin → Settings
- Optional Place ID + `GOOGLE_PLACES_API_KEY` for nightly refresh
- Cron: `0 4 * * *` UTC in `worker.ts`

---

## SEO / GEO / AEO

Implemented for local search + answer engines (desktop & mobile):

| Feature | Location |
|---------|----------|
| `metadataBase`, canonicals, Open Graph, Twitter cards | `src/app/layout.tsx`, `src/lib/seo.ts` |
| Dynamic OG image + favicon | `src/app/opengraph-image.tsx`, `src/app/icon.tsx` |
| `robots.txt` (blocks `/admin`, `/staff`, `/api`) | `src/app/robots.ts` |
| Sitemap | `src/app/sitemap.ts` → `/sitemap.xml` |
| LocalBusiness / HairSalon JSON-LD (NAP, geo, hours, sameAs, aggregateRating) | Home + Contact |
| FAQPage schema + visible FAQs (AEO) | Home, About, Private suite |
| BreadcrumbList | Key inner pages |
| Unique titles/descriptions per route | `(site)/*/page.tsx` |
| Admin/Staff `noindex` | `admin/layout.tsx`, `staff/layout.tsx` |
| Responsive UX | Sticky mobile Call/Book, hamburger `< lg`, fluid type |

### After domain cutover

1. Google Search Console → verify `familysalonspa.com` → submit `https://familysalonspa.com/sitemap.xml`
2. Align Google Business Profile NAP with site (address, phones, hours)
3. Optional: add `metadata.verification.google` in `src/app/layout.tsx` when GSC gives a meta tag
4. Optional: Cloudflare Web Analytics or GA4 (not bundled yet)

---

## Docs

See [docs/plans/01-master-plan.md](docs/plans/01-master-plan.md).
