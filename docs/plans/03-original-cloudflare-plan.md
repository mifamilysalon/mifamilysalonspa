# Family Salon & Spa — Original Cloudflare Plan (Astro)

> **Archived reference** — Superseded by [01-master-plan.md](./01-master-plan.md). Kept for historical comparison. Astro was replaced with Next.js 15 + OpenNext per developer-experience feedback.

---

## Goals

Replace [familysalonspa.com](https://familysalonspa.com/) with a modern, elegant site that feels like a premium WordPress theme (editorial layouts, rich typography, full-width imagery) while running entirely on Cloudflare free-tier primitives.

**Confirmed scope:**
- Hybrid booking (some services = instant slots, others = request-to-confirm)
- No online payments (gift certificates remain in-person/phone)

---

## Original Stack (Superseded)

| Layer | Choice | Why |
|-------|--------|-----|
| Public site | **Astro 5** on Cloudflare Pages | Fast, SEO-friendly, WordPress-like page structure, minimal JS |
| API | **Hono** Worker | Lightweight, typed, great D1/R2 integration |
| Database | **D1** (SQLite) | Relational data for CMS, users, appointments |
| Media | **R2** | Image uploads from admin |
| Auth | **Custom session auth** | HTTP-only cookies + D1 sessions |
| Email | **Cloudflare Email Service** | Booking confirmations |
| Styling | **Tailwind CSS** + custom design tokens | Section-based, not card-based |

---

## Design Direction (Retained in Master Plan)

- **Primary:** deep espresso brown `#3D2B1F`
- **Accent:** antique gold `#C9A96E`
- **Background:** warm ivory `#FAF7F2`
- **Typography:** Cormorant Garamond + Source Sans 3

**Layout patterns:** Full-bleed hero, alternating editorial rows, bordered sections (no floating cards), pull-quote testimonials, sticky mobile CTA.

---

## Data Model (Partial — Extended in Master Plan)

Original tables: `users`, `sessions`, `pages`, `page_blocks`, `site_settings`, `services`, `staff_profiles`, `staff_services`, `staff_availability`, `staff_time_off`, `appointments`.

---

## Project Structure (Superseded)

```
familysalonspa/
├── apps/
│   ├── web/                  # Astro public site + admin/staff UI
│   └── api/                  # Hono Worker
├── packages/
│   └── shared/               # Shared types, validation (Zod)
├── migrations/
└── wrangler.jsonc
```

**Replaced with:** Single Next.js 15 app (see master plan §10).

---

## Why Astro Was Dropped

| Issue | Impact |
|-------|--------|
| Islands + separate API worker | Two mental models, harder debugging |
| Heavy interactivity (CMS, booking, staff) | Fights Astro's static-first model |
| Developer experience | Reported as not developer-friendly |
| Cloudflare alignment | OpenNext + Next.js is Cloudflare's preferred path |

---

## Items Carried Forward to Master Plan

- Hybrid appointment booking flow
- Full CMS with block editor
- Cloudflare Email Service notifications
- Editorial section-based design (no glass, no card grids)
- D1 security model (CSRF, rate limiting, Zod)
- 4-phase implementation timeline
- Private area page for hijab-friendly services
