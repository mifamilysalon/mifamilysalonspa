import { getDb } from "./db";

export type ClientDirectoryEntry = {
  client_name: string;
  client_email: string | null;
  client_phone: string;
  last_visit: string;
  booking_source: string | null;
};

/** Recent guests from appointments / walk-ins (not a CRM — latest row per phone). */
export async function searchClientDirectory(
  query: string,
  limit = 15,
): Promise<ClientDirectoryEntry[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const db = await getDb();
  const pattern = `%${q.replace(/%/g, "")}%`;
  const digits = q.replace(/\D/g, "");
  const phonePattern = digits.length >= 3 ? `%${digits}%` : pattern;

  const result = await db
    .prepare(
      `SELECT a.client_name, a.client_email, a.client_phone, a.created_at AS last_visit,
              a.booking_source
       FROM appointments a
       INNER JOIN (
         SELECT client_phone, MAX(id) AS max_id
         FROM appointments
         WHERE status NOT IN ('cancelled', 'no_show')
           AND (
             client_name LIKE ? COLLATE NOCASE
             OR client_phone LIKE ?
             OR COALESCE(client_email, '') LIKE ? COLLATE NOCASE
           )
         GROUP BY client_phone
       ) latest ON a.id = latest.max_id
       ORDER BY a.created_at DESC
       LIMIT ?`,
    )
    .bind(pattern, phonePattern, pattern, limit)
    .all<ClientDirectoryEntry>();

  return result.results || [];
}
