# Client Site Migration & Upgrade Technical Specification
## Target Client: Family Hair Salon & Wellness Spa (`familysalonspa.com`)

---

## 1. Scraped Client Audit & Metadata

| Attribute | Details |
|---|---|
| **Business Name** | Family Hair Salon & Wellness Spa |
| **Address** | 34777 Grand River Ave, Farmington, MI 48335 |
| **Phone Contact** | (248) 474-6520 / (248) 635-5127 |
| **Current Domain** | `familysalonspa.com` (Registered on GoDaddy) |
| **Current Platform** | GoDaddy Website Builder (Broken Appointment System) |
| **Target Infrastructure** | Cloudflare Pages + Cloudflare Workers + Cloudflare D1 (SQL) + Cloudflare Registrar |
| **Expected Volume** | < 1,000 appointments/month (~30-50 daily transactions, ~5 MB/year storage) |
| **Core Service Menu** | **Hair Care:** Creative styling, coloring, extensions, perm waving, straightening, rebonding.<br>**Skin Care:** Dermatological facials, face mapping skin analysis.<br>**Nail Care:** Manicures, pedicures, shellac, polish changes.<br>**Wellness:** Grooming, body wax, massage, wellness treatments. |

---

## 2. Color Palettes & Design Constraints

### Design Mandate: Editorial WordPress Aesthetic (No Glassmorphism)
* **Zero Transparency:** Strictly prohibit glassmorphism, blurred overlays, or translucent card containers.
* **Solid Card Containers:** Cards must feature solid, opaque backgrounds (e.g., `#FFFFFF` on `#FAF8F5`) with crisp 1px borders (`#E2DCD5`) and elevated whitespace rather than drop shadows.
* **Typography System:** High-contrast Serif headings (*Playfair Display* / *Cormorant Garamond*) paired with clean geometric Sans-Serif body text (*Plus Jakarta Sans* / *Inter*).

---

### Palette 0: "Farmington Rose Gold & Alabaster" (Original Brand Revamped)
> *Unique Name:* **Farmington Rose Gold & Alabaster**
> *Description:* Modernized version of the client's existing GoDaddy visual identity. Retains the familiar warm, welcoming gold and blush tones while establishing high-contrast readability.

```json
{
  "palette_name": "Farmington Rose Gold & Alabaster",
  "is_default": true,
  "colors": {
    "bg_main": "#FAF8F5",
    "bg_card": "#FFFFFF",
    "border_subtle": "#E8E2D9",
    "text_heading": "#1C1917",
    "text_body": "#44403C",
    "accent_primary": "#B88E4C",
    "accent_hover": "#9A7336",
    "accent_subtle": "#F4ECE1"
  }
}
```

---

### Palette A: "Warm Earth Spa" (Organic & Calming)
> *Description:* Deep natural sage and soft sand tones, perfect for highlighting organic skin care and holistic wellness treatments.

```json
{
  "palette_name": "Warm Earth Spa",
  "colors": {
    "bg_main": "#F4F0EB",
    "bg_card": "#EAE4DC",
    "border_subtle": "#D5CE3B",
    "text_heading": "#2C2825",
    "text_body": "#4A443F",
    "accent_primary": "#5A6B5C",
    "accent_hover": "#465448",
    "accent_subtle": "#DFE5E0"
  }
}
```

---

### Palette B: "Noir Salon Luxe" (High-Contrast Editorial)
> *Description:* Bold charcoal backdrop with warm champagne highlights. Gives an ultra-premium, high-fashion salon aesthetic.

```json
{
  "palette_name": "Noir Salon Luxe",
  "colors": {
    "bg_main": "#121212",
    "bg_card": "#1E1E1E",
    "border_subtle": "#2A2A2A",
    "text_heading": "#F5F5F5",
    "text_body": "#D4D4D4",
    "accent_primary": "#C5A059",
    "accent_hover": "#DAA520",
    "accent_subtle": "#2C2518"
  }
}
```

---

### Palette C: "Terracotta & Cashmere" (Modern Feminine Boutique)
> *Description:* Warm terracotta paired with rich cashmere backgrounds for a modern, inviting boutique feel.

```json
{
  "palette_name": "Terracotta & Cashmere",
  "colors": {
    "bg_main": "#FBF7F5",
    "bg_card": "#F3ECE7",
    "border_subtle": "#E5DCD5",
    "text_heading": "#332219",
    "text_body": "#594338",
    "accent_primary": "#A65E46",
    "accent_hover": "#8B4A34",
    "accent_subtle": "#F2E3DD"
  }
}
```

---

## 3. Tailwind CSS Configuration Code

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        salon: {
          bg: "#FAF8F5",
          card: "#FFFFFF",
          border: "#E8E2D9",
          heading: "#1C1917",
          body: "#44403C",
          primary: "#B88E4C",
          hover: "#9A7336",
          light: "#F4ECE1",
        }
      },
      fontFamily: {
        serif: ["'Playfair Display'", "serif"],
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
}
```

---

## 4. Architecture & Cloudflare Setup Strategy

### Domain Transfer Strategy (`familysalonspa.com`)
1. **DO NOT buy a new domain.** Transfer existing `familysalonspa.com` from GoDaddy to Cloudflare Registrar.
2. **Cost:** $10.44/year (at-cost wholesale pricing, zero markup, free WHOIS privacy).
3. **Execution Steps:**
   - Add `familysalonspa.com` to Cloudflare (Free Plan).
   - Unlock domain in GoDaddy & generate EPP Transfer Authorization Code.
   - Initiate Transfer in Cloudflare Registrar using EPP Code.
   - Manually approve "Transfer Out" in GoDaddy Dashboard under `Domains > Transfers` to bypass 5-day wait.

---

### Cloudflare D1 Database Schema (`schema.sql`)

```sql
-- Service Catalog Table
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- Hair, Skin, Nails, Massage
    duration_minutes INTEGER NOT NULL,
    price REAL NOT NULL,
    description TEXT
);

-- Staff Members Table (Includes Role & Passcode/Auth)
CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL, -- 'owner', 'stylist', 'receptionist'
    pin_code TEXT NOT NULL, -- Hashed or 4-6 digit PIN for quick staff login
    phone TEXT,
    is_active INTEGER DEFAULT 1
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    service_id INTEGER NOT NULL,
    staff_id INTEGER,
    appointment_date TEXT NOT NULL, -- YYYY-MM-DD
    start_time TEXT NOT NULL,      -- HH:MM
    status TEXT DEFAULT 'pending',  -- pending, confirmed, cancelled, completed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(service_id) REFERENCES services(id),
    FOREIGN KEY(staff_id) REFERENCES staff(id)
);
```

---

## 5. Portal Architecture & Access Control

### 1. Admin Console (`/admin`)
* **Target Users:** Owner & Salon Manager.
* **Capabilities:**
  * Manage services, pricing, and duration.
  * Add, edit, or deactivate staff accounts.
  * Overview of daily/weekly/monthly booking analytics.
  * Adjust working hours and holiday schedules.

### 2. Staff View Portal (`/staff` or `/schedule`)
* **Target Users:** Hair stylists, estheticians, nail technicians.
* **Authentication:** Lightweight PIN authentication or magic link for mobile phone access.
* **Capabilities:**
  * **Daily Schedule View:** Filter by logged-in staff member or view full salon schedule.
  * **Client Details:** View customer name, phone number, requested service, and appointment status (`confirmed`, `in-progress`, `completed`).
  * **Status Toggles:** Stylists can tap a button to mark an appointment as "Completed" or "No-Show."

---

## 6. Agent Execution Roadmap Checklist

- [ ] **Task 1: Environment Setup**
  - Initialize Next.js App Router project with Tailwind CSS.
  - Install `@cloudflare/next-on-pages` deployment adapter.
  - Configure Google Fonts (`Playfair Display` and `Plus Jakarta Sans`).

- [ ] **Task 2: Design System Setup**
  - Implement dynamic palette switching capability using CSS variables or Tailwind theme tokens.
  - Construct solid-card components (`ServiceCard`, `BookingStepModal`, `ReviewTile`).

- [ ] **Task 3: Backend & D1 Database Wiring**
  - Provision Cloudflare D1 database: `npx wrangler d1 create familysalon-db`.
  - Apply `schema.sql` migration.
  - Create API routes for `/api/services`, `/api/availability`, `/api/book`, and `/api/staff/schedule`.

- [ ] **Task 4: Booking System UI & Auth Build**
  - Customer booking portal with real-time slot selection.
  - Lightweight PIN/Session auth for `/staff` and `/admin` routes.
  - Daily schedule UI for staff with mobile-first card list.

- [ ] **Task 5: Domain Cutover & Launch**
  - Complete GoDaddy -> Cloudflare Registrar domain transfer.
  - Point DNS records to Cloudflare Pages deployment.
  - Verify SSL certificate and perform live booking test.
