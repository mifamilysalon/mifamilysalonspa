# Deploy to the client Cloudflare account (Mi Family Salon)

Two ways to publish: **GitHub Actions** (recommended) or **direct Wrangler** from your machine.

| Target | Config | Account |
|--------|--------|---------|
| ConsultifyIT preview | `wrangler.jsonc` | `9c767ec1…` (consultifyit@gmail.com) |
| **Client production** | `wrangler.mifamilysalon.jsonc` | `b51ded38…` (Familysalonspa@gmail.com) |

GitHub repo for the client: **https://github.com/mifamilysalon/mifamilysalonspa** (`origin` remote).

---

## One-time: client Cloudflare setup

Already done on the client account (Familysalonspa@gmail.com):

| Resource | Status |
|----------|--------|
| D1 `familysalonspa-db` | Created — id `28a7d7aa-7558-4aab-8370-502517ca5375` |
| KV `CACHE` | Created — id `b5bde43a058d411283500560970aefa0` |

R2 bucket `familysalonspa-media` is bound as `MEDIA` for admin image uploads
(`/api/admin/media`) and public serving (`/api/media/...`).

### Enable Workers.dev (first deploy on this account)

The client Cloudflare account must register a **workers.dev** subdomain once:

https://dash.cloudflare.com/b51ded38b292d1a89fdd26e99e1bb7e9/workers/onboarding

Then re-run `npm run deploy:mifamilysalon`. Alternatively, attach **www.mifamilysalon.com** as a Worker custom domain first (see below) and deploy to that route.

### Email Sending (optional but recommended)

On the **client** account: onboard **mifamilysalon.com** for Email Sending (same steps as ConsultifyIT).

---

## One-time: Worker secrets (client account)

Run each command (paste values when prompted). Uses client config:

```bash
npx wrangler secret put SESSION_SECRET --config wrangler.mifamilysalon.jsonc
npx wrangler secret put GOOGLE_PLACES_API_KEY --config wrangler.mifamilysalon.jsonc
# optional fallbacks:
npx wrangler secret put RESEND_API_KEY --config wrangler.mifamilysalon.jsonc
npx wrangler secret put BREVO_API_KEY --config wrangler.mifamilysalon.jsonc
npx wrangler secret put CLOUDFLARE_API_TOKEN --config wrangler.mifamilysalon.jsonc
```

Use the **same** Places key after **Places API (New)** is enabled on the Google project.

---

## Option A — GitHub Actions (client repo)

1. Push this repo to **`mifamilysalon/mifamilysalonspa`** (`git push origin master`).
2. On GitHub → **Settings → Secrets and variables → Actions**, add:
   - `CLOUDFLARE_API_TOKEN` — API token with **Workers + D1 + KV** edit (Account → Cloudflare Workers → Edit, D1, etc.)
   - `CLOUDFLARE_ACCOUNT_ID` — `b51ded38b292d1a89fdd26e99e1bb7e9`
3. **Actions → Deploy to Cloudflare (Mi Family Salon) → Run workflow** (or push to `master`).

Workflow file: `.github/workflows/deploy-mifamilysalon.yml`

---

## Option B — Direct deploy from your PC

Log in with an account that can access **Familysalonspa@gmail.com** (`npx wrangler whoami`).

```bash
npm install
npm run db:migrate:mifamilysalon
npm run deploy:mifamilysalon
```

Worker name: **`mifamilysalonspa`**. Default URL after deploy:

`https://mifamilysalonspa.<subdomain>.workers.dev`

(Exact subdomain is shown at the end of `deploy`.)

---

## Custom domain (www.mifamilysalon.com)

Zone `mifamilysalon.com` is on the **client** Cloudflare account. Wrangler
attaches Worker custom domains for `www.mifamilysalon.com` (canonical) and
`mifamilysalon.com` (apex). Apex and the production `*.workers.dev` host both
301 to https://www.mifamilysalon.com via app middleware.

Deploy with `npm run deploy:mifamilysalon` creates/updates those custom domains
and DNS automatically.

---

## After first deploy

1. **Admin → Settings** → Google Place ID `ChIJY5sJBbCxJIgRljxES6_nwbQ` → Save → **Sync now**.
2. Confirm homepage reviews and booking flow.
3. Rotate default seed passwords (see `local/credentials.md` pattern — not in git).

---

## ConsultifyIT preview (unchanged)

```bash
npm run deploy
npm run db:migrate:remote
```

Uses `wrangler.jsonc` and ConsultifyIT account `9c767ec1…`.
