import { getDb } from "./db";
import {
  DEFAULT_INSTAGRAM_FEED,
  getInstagramFeedSettings,
  type InstagramFeedSettings,
} from "./instagram";
import {
  DEFAULT_MEDIA,
  DEFAULT_SOCIAL,
  isHeroToneId,
  type MediaSettings,
  type SocialLinks,
} from "./media";
import { isPaletteId, type PaletteId } from "./palettes";

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
    const parsed = JSON.parse(row.value_json) as string;
    return isPaletteId(parsed) ? parsed : "farmington-rose-gold";
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
        "SELECT id, display_name, bio, photo_url, is_bookable FROM staff_profiles WHERE is_bookable = 1 ORDER BY display_name",
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

export async function getAuthSettings(): Promise<{ pin_length: 4 | 6 }> {
  try {
    const db = await getDb();
    const row = await db
      .prepare("SELECT value_json FROM site_settings WHERE key = 'auth'")
      .first<{ value_json: string }>();
    if (!row) return { pin_length: 4 };
    const parsed = JSON.parse(row.value_json) as { pin_length?: number };
    return { pin_length: parsed.pin_length === 6 ? 6 : 4 };
  } catch {
    return { pin_length: 4 };
  }
}

export async function getMediaSettings(): Promise<MediaSettings> {
  try {
    const db = await getDb();
    const row = await db
      .prepare("SELECT value_json FROM site_settings WHERE key = 'media'")
      .first<{ value_json: string }>();
    if (!row) return DEFAULT_MEDIA;
    const parsed = JSON.parse(row.value_json) as Partial<MediaSettings>;
    return {
      hero_image: parsed.hero_image || DEFAULT_MEDIA.hero_image,
      hero_tone: isHeroToneId(parsed.hero_tone || "")
        ? parsed.hero_tone!
        : DEFAULT_MEDIA.hero_tone,
    };
  } catch {
    return DEFAULT_MEDIA;
  }
}

export async function getSocialLinks(): Promise<SocialLinks> {
  try {
    const db = await getDb();
    const row = await db
      .prepare("SELECT value_json FROM site_settings WHERE key = 'social'")
      .first<{ value_json: string }>();
    if (!row) return DEFAULT_SOCIAL;
    return { ...DEFAULT_SOCIAL, ...JSON.parse(row.value_json) };
  } catch {
    return DEFAULT_SOCIAL;
  }
}

export async function getInstagramFeedConfig(): Promise<InstagramFeedSettings> {
  try {
    const db = await getDb();
    return await getInstagramFeedSettings(db);
  } catch {
    return DEFAULT_INSTAGRAM_FEED;
  }
}
