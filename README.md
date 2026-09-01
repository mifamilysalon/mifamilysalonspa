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

Default admin and staff details live in **`local/credentials.md`** (gitignored — not in the repo). Create that file locally from your seed notes; do not commit passwords.

## Owner: self-serve promos

Salon owners can publish time-bound homepage/offers without a developer. See **[docs/owner-promos.md](docs/owner-promos.md)** (Admin → Promos).

## UX standards

UI work follows [Laws of UX](https://lawsofux.com/). Project mapping + 3D immersive analysis: **[docs/ux-laws.md](docs/ux-laws.md)**. Agent rule: `.cursor/rules/laws-of-ux.mdc`.

---

## In-salon price brochure (QR)

Prices are **not** on the public website. Guests at the desk scan a QR code to an **unguessable** URL (not `/menu`).

| Item | Detail |
|------|--------|
| Path shape | `/r/<random-slug>` (16+ characters) |
| Where to copy | Admin → Settings → In-salon price brochure |
| Preview host | `https://familysalonspa.consultifyit-forms.workers.dev` + path from Admin |
| Production | `https://familysalonspa.com` + same path |

- Hidden from nav, sitemap, and robots (`noindex`)
- Wrong or old slugs return 404 (including `/menu`)
- **Rotate brochure URL** in Admin if the link leaks — then reprint the QR
- Edit dollar amounts in **Admin → Services**
- Never post the brochure URL on social or the main site

Default slug (until rotated): see `src/lib/price-list.ts` / D1 `price_list` setting.

---

## Secrets & API keys (do not lose)

Store production values with Wrangler secrets (never commit real keys). Local: `.dev.vars` (gitignored). Template: `.dev.vars.example`.

| Name | Required? | Where used | Notes |
|------|-----------|------------|--------|
| `SESSION_SECRET` | **Yes** | Auth cookies | Long random string (≥32 chars). `wrangler secret put SESSION_SECRET` |
| `RESEND_API_KEY` | Optional fallback | Gift certificates + booking emails | Free at [resend.com](https://resend.com) if Cloudflare Email Sending is unavailable. |
| `GOOGLE_PLACES_API_KEY` | Optional | Nightly Google reviews sync (`worker.ts` cron `0 4 * * *`) | Free Places API quota. Without it, seeded/cached reviews stay. Set Place ID in Admin → Settings. |
| `TWILIO_ACCOUNT_SID` | Optional | SMS opt-in notifications | Keep SMS **OFF** in Admin until configured |
| `TWILIO_AUTH_TOKEN` | Optional | SMS | |
| `TWILIO_FROM_NUMBER` | Optional | SMS | E.164 format |

Email delivery uses the Worker `EMAIL` (`send_email`) binding first. Demo from-address is `appointments@consultifyit.com` (`MAIL_FROM` var) until `familysalonspa.com` is onboarded on Cloudflare. Optional `RESEND_API_KEY` is a fallback.

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
