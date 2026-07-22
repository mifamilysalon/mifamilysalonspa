# Family Salon & Spa — Project Plans

All planning documents for the familysalonspa.com rebuild.

## Documents

| File | Purpose | Status |
|------|---------|--------|
| [00-plan-comparison.md](./00-plan-comparison.md) | Gap analysis between all plans | Reference |
| [01-master-plan.md](./01-master-plan.md) | **Unified implementation plan** | **Source of truth** |
| [02-migration-agent-plan.md](./02-migration-agent-plan.md) | Original migration agent spec | Archived |
| [03-original-cloudflare-plan.md](./03-original-cloudflare-plan.md) | First Astro-based plan | Archived |

## Quick Summary

- **Stack:** Next.js 15 + `@opennextjs/cloudflare` on Cloudflare Workers
- **Data:** D1 (appointments, CMS) + R2 (images) + Email Service (notifications)
- **Portals:** Public site, `/admin` (owner CMS), `/staff` (PIN login schedule)
- **Booking:** Hybrid — instant slots + request-to-confirm per service
- **Notifications:** Email (free, always on) + SMS via Twilio (optional, ~$50–75/mo at 5k msgs)
- **Design:** World-class editorial salon aesthetic, 4 switchable palettes, humanized copy (no em dashes, no AI slop)

## Next Step

Approve [01-master-plan.md](./01-master-plan.md) and run:

```bash
npm create cloudflare@latest familysalonspa -- --framework=next --platform=workers
```
