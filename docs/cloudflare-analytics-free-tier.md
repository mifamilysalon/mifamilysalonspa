# Cloudflare analytics & free-tier maintenance

Client Cloudflare account: **Familysalonspa@gmail.com**  
Account ID: `b51ded38b292d1a89fdd26e99e1bb7e9`  
Zone: `mifamilysalon.com` (Free Website)  
Worker: `mifamilysalonspa`

## Visitor analytics (free)

1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com) as Familysalonspa@gmail.com.
2. Open **Web Analytics** → **Add a site** → select `www.mifamilysalon.com` (or enable automatic setup for the proxied hostname).
3. Optional: copy the site **token** from Manage site.
4. In the salon admin → **System** → paste the token → enable the beacon → Save.

Dashboards also linked from **Admin → System**:

| Dashboard | Use |
|-----------|-----|
| Web Analytics | Visits, page views, top URLs |
| Traffic (zone) | Requests / bandwidth / threats |
| Worker metrics | Stay under 100k Worker requests/day |
| Workers overview | KV / D1 / R2 at a glance |
| R2 bucket | Media storage (≤ 10 GB free) |
| D1 | Database usage |

## Cache maintenance

- **Admin → System → Clear page cache** deletes OpenNext KV keys if a page looks stale after deploy.
- Do not clear every day — Free KV allows **1,000 writes/day**.
- Nightly cron (`0 4 * * *` UTC) refreshes Google reviews + Instagram into D1 (capped), so the Worker does not call Google on every visit.

## Staying on Workers Free

See allowances and tips on **Admin → System**. A Farmington salon site typically stays well under free limits without a paid Workers subscription.
