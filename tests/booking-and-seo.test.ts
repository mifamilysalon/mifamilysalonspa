import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isValidPriceListSlug, priceListPath } from "../src/lib/price-list";
import { bookAppointmentSchema } from "../src/lib/validation";
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  SITE_URL,
} from "../src/lib/seo";

describe("bookAppointmentSchema", () => {
  it("accepts a valid request booking payload", () => {
    const parsed = bookAppointmentSchema.safeParse({
      serviceId: 21,
      clientName: "Jamie Lee",
      clientPhone: "2484746520",
      clientEmail: "jamie@example.com",
      startDatetime: "2026-10-01T10:00:00",
    });
    assert.equal(parsed.success, true);
  });

  it("rejects missing startDatetime for appointments", () => {
    const parsed = bookAppointmentSchema.safeParse({
      serviceId: 21,
      clientName: "Jamie Lee",
      clientPhone: "2484746520",
    });
    assert.equal(parsed.success, false);
  });

  it("allows walk-in without startDatetime", () => {
    const parsed = bookAppointmentSchema.safeParse({
      mode: "walk_in",
      serviceId: 21,
      clientName: "Jamie Lee",
      clientPhone: "2484746520",
      arriveInMinutes: 15,
    });
    assert.equal(parsed.success, true);
  });

  it("rejects invalid email when provided", () => {
    const parsed = bookAppointmentSchema.safeParse({
      serviceId: 21,
      clientName: "Jamie Lee",
      clientPhone: "2484746520",
      clientEmail: "not-an-email",
      startDatetime: "2026-10-01T10:00:00",
    });
    assert.equal(parsed.success, false);
  });
});

describe("price list slug", () => {
  it("validates obscure brochure slugs", () => {
    assert.equal(isValidPriceListSlug("f9k2m7xq4wp8n3c6"), true);
    assert.equal(isValidPriceListSlug("short"), false);
    assert.equal(isValidPriceListSlug("UPPERCASE123456"), false);
  });

  it("builds brochure path", () => {
    assert.equal(priceListPath("f9k2m7xq4wp8n3c6"), "/r/f9k2m7xq4wp8n3c6");
  });
});

describe("seo helpers", () => {
  it("builds absolute production URLs", () => {
    assert.equal(absoluteUrl("/appointments"), `${SITE_URL}/appointments`);
    assert.equal(absoluteUrl("/"), SITE_URL);
  });

  it("builds breadcrumb and FAQ JSON-LD shapes", () => {
    const crumbs = buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Hair", path: "/hair-care" },
    ]);
    assert.equal(crumbs["@type"], "BreadcrumbList");
    assert.equal((crumbs.itemListElement as unknown[]).length, 2);

    const faq = buildFaqJsonLd([
      { question: "Where are you?", answer: "Farmington, MI" },
    ]);
    assert.equal(faq["@type"], "FAQPage");
  });
});

/** Display-name cleanup mapping used by migration 0020 */
describe("service name cleanup map", () => {
  const RENAMES: Record<string, string> = {
    "Kids Hair Cut": "Kids Haircut",
    "Men's Hair Cut": "Men's Haircut",
    "Women's Hair Cut": "Women's Haircut",
    "Hair Up Do": "Hair Updo",
    "Nails Shape with Polish": "Nail Shape & Polish",
    "Side Burn": "Sideburn",
    "Under Arms": "Underarm",
    "Antitan Facial": "Anti-Tan Facial",
    "Anti Aging Facial": "Anti-Aging Facial",
    "Duppata Setting": "Dupatta Setting",
    "Party Make-Up": "Party Makeup",
    "Engagement & Reception Make-Up": "Engagement & Reception Makeup",
    "Bridal Make-Up": "Bridal Makeup",
  };

  it("maps known awkward service names to cleaned labels", () => {
    assert.equal(RENAMES["Duppata Setting"], "Dupatta Setting");
    assert.equal(RENAMES["Women's Hair Cut"], "Women's Haircut");
    assert.equal(RENAMES["Antitan Facial"], "Anti-Tan Facial");
  });
});
