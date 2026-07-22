import { getDb } from "./db";
import type { PaletteId } from "./palettes";

export type BusinessInfo = {
  name: string;
  phone_primary: string;
  phone_secondary: string;
  address: string;
  hours: string;
};

export type Service = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
  booking_type: "instant" | "request";
  is_active: number;
};

export type StaffProfile = {
  id: number;
  display_name: string;
  bio: string | null;
  photo_url: string | null;
  is_bookable: number;
};

const DEFAULT_BUSINESS: BusinessInfo = {
  name: "Family Hair Salon & Wellness Spa",
  phone_primary: "(248) 474-6520",
  phone_secondary: "(248) 635-5127",
  address: "34777 Grand River Ave, Farmington, MI 48335",
  hours: "Mon-Fri 9am-6pm, Sat 9am-5pm, Sun Closed",
};

export async function getBusinessInfo(): Promise<BusinessInfo> {
  try {
    const db = await getDb();
    const row = await db
      .prepare("SELECT value_json FROM site_settings WHERE key = 'business'")
      .first<{ value_json: string }>();
    if (!row) return DEFAULT_BUSINESS;
    return { ...DEFAULT_BUSINESS, ...JSON.parse(row.value_json) };
  } catch {
    return DEFAULT_BUSINESS;
  }
}

export async function getActivePaletteId(): Promise<PaletteId> {
  try {
    const db = await getDb();
    const row = await db
      .prepare("SELECT value_json FROM site_settings WHERE key = 'palette'")
      .first<{ value_json: string }>();
    if (!row) return "farmington-rose-gold";
    return JSON.parse(row.value_json) as PaletteId;
  } catch {
    return "farmington-rose-gold";
  }
}

export async function getServices(category?: string): Promise<Service[]> {
  try {
    const db = await getDb();
    if (category) {
      const res = await db
        .prepare(
          "SELECT * FROM services WHERE is_active = 1 AND category = ? ORDER BY name",
        )
        .bind(category)
        .all<Service>();
      return res.results || [];
    }
    const res = await db
      .prepare("SELECT * FROM services WHERE is_active = 1 ORDER BY category, name")
      .all<Service>();
    return res.results || [];
  } catch {
    return [];
  }
}

export async function getBookableStaff(): Promise<StaffProfile[]> {
  try {
    const db = await getDb();
    const res = await db
      .prepare(
        "SELECT id, display_name, bio, photo_url, is_bookable FROM staff_profiles WHERE is_bookable = 1",
      )
      .all<StaffProfile>();
    return res.results || [];
  } catch {
    return [];
  }
}

export async function getSmsSettings(): Promise<{
  enabled: boolean;
  monthly_cap: number;
  sent_this_month: number;
}> {
  try {
    const db = await getDb();
    const row = await db
      .prepare("SELECT value_json FROM site_settings WHERE key = 'sms'")
      .first<{ value_json: string }>();
    if (!row) return { enabled: false, monthly_cap: 5000, sent_this_month: 0 };
    return JSON.parse(row.value_json);
  } catch {
    return { enabled: false, monthly_cap: 5000, sent_this_month: 0 };
  }
}
