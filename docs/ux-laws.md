# Laws of UX — Family Salon & Spa

Reference: [Laws of UX](https://lawsofux.com/) by Jon Yablonski.  
Project rule: `.cursor/rules/laws-of-ux.mdc` (agents apply when editing UI).

## How we adopt them here

| Law | Adoption on this site |
|-----|------------------------|
| **Aesthetic-Usability Effect** | Editorial layout, flat vector illustrations, Playfair + Jakarta — beauty must not hide clarity. |
| **Choice Overload / Hick’s Law** | Appointments open with **two** intents; service lists stay scannable; avoid mega-menus of equal weight. |
| **Chunking / Miller’s Law** | Booking wizard steps; confirm summary; category pages per service family. |
| **Cognitive Bias / Load** | Plain language (“Instant book” vs “Request”); loading states; limited motion. |
| **Doherty Threshold** | Fetch feedback on booking, admin, staff; target snappy perceived response. |
| **Fitts’s Law** | Large Book/Call targets; sticky mobile CTA; `min-h-12`+ controls. |
| **Flow** | Wizard keeps one decision per step; don’t interrupt with upsells mid-book. |
| **Goal-Gradient Effect** | Visible “Step X of Y” + progress bar on booking. |
| **Jakob’s Law** | Familiar salon patterns: call, book, walk-in, category pages. |
| **Common Region / Proximity / Similarity / Uniform Connectedness** | Editorial panels group forms; shared borders for related rows. |
| **Law of Prägnanz** | Flat spot illustrations + simple shapes over busy collage. |
| **Mental Model** | “Walk-in today” vs “Book ahead” matches how guests already think. |
| **Occam’s Razor** | Prefer fewer chrome layers; no dashboard cards on marketing pages. |
| **Paradox of the Active User** | Booking works without a manual; short inline hints only. |
| **Pareto Principle** | Optimize Book + Walk-in + Call paths first. |
| **Parkinson’s Law** | Keep forms short; don’t invent fields “because we might need them.” |
| **Peak-End Rule** | Confirmation / request-received screens are calm and explicit. |
| **Postel’s Law** | Normalize phones; tolerate common email typos at edges where safe. |
| **Selective Attention** | One primary CTA; promo banner below hero, not over it. |
| **Serial Position Effect** | Brand + Book in header; Book again in sticky footer on mobile. |
| **Tesler’s Law** | Complexity lives in admin/staff (handoffs, slots), not guest booking. |
| **Von Restorff Effect** | Primary fill CTA vs ghost/outline secondary. |
| **Working Memory** | Confirm step restates service, time, contact before submit. |
| **Zeigarnik Effect** | Incomplete booking progress stays visible until done. |

## Already in product (baseline)

- Two-path appointments chooser + multi-step wizard with progress
- Large sticky Call / Book bar on mobile
- Editorial sections (one job per block), illustration panels
- Admin/staff full-width shells for dense operational work

## Lightweight adoptions shipped with this doc

- Skip link → main content
- Clear `:focus-visible` rings
- Broader `prefers-reduced-motion` for `.fade-in`
- Menu `aria-expanded` / `aria-controls`
- Booking progress `role="progressbar"`
- Walk-in visually emphasized as the common same-day path (Von Restorff + mental model)

---

## 3D immersive designs — pros & cons for *this* project

### Current visual system

- **Flat vector spot illustrations** (2D brand art), white/simple grounds
- Editorial typography, restrained CSS motion (`fade-in`)
- Cloudflare Workers + Next.js; performance and mobile trust matter for a local salon

### Pros of upgrading toward 3D / immersive

| Pro | Why it might matter |
|-----|---------------------|
| Differentiation | Could feel more “premium” vs GoDaddy/template competitors |
| Spatial storytelling | Private suite / salon floor tour without a photo shoot |
| Engagement | Scroll/WebGL moments can increase time-on-page for portfolio-like brands |
| Future reel reuse | 3D assets can feed motion content if production is planned |

### Cons / risks (weighted heavier for this salon)

| Con | Why it hurts here |
|-----|-------------------|
| **Cognitive load** | Immersive scenes compete with Book/Call — Selective Attention & Cognitive Load |
| **Performance** | WebGL/3D hurts LCP/INP on mid-range phones; Doherty & SEO local search suffer |
| **Jakob’s Law** | Guests expect a salon site: phone, book, hours — not a game-like lobby |
| **Maintenance** | Owner cannot self-serve 3D the way she can promos/services; needs a developer |
| **Brand fit** | Current flat art is warm and human; generic 3D “spa blobs” often look AI-template |
| **Accessibility** | Motion/parallax conflicts with vestibular needs and `prefers-reduced-motion` |
| **Cost / complexity** | Tesler: complexity moves into the guest experience instead of staff tools |
| **Illustration investment** | You already have a coherent 2D system; replacing it doubles asset cost |

### Recommendation

**Do not adopt full-page 3D immersive as the default** for Family Salon & Spa.

Stay on **flat vector + editorial layout**. If you want a taste of depth later:

1. Optional **lightweight** depth only (subtle CSS perspective on one marketing section), always with reduced-motion fallback  
2. Or a **single optional** “virtual peek” page (e.g. private suite), never blocking Book/Walk-in  
3. Prefer **real photos / short Reels** over WebGL for social proof  

3D makes sense for product configurators, architecture, or entertainment brands — not for a walk-in-heavy neighborhood salon where **Fitts + Hick + Peak-End** on booking beat spectacle.
