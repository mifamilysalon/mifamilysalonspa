-- Owner-verified: salon opens at 10am. Align public hours, booking windows, Place ID.
-- Keep existing price brochure slug (QR) unchanged.

UPDATE site_settings
SET value_json = json_set(
  value_json,
  '$.hours',
  'Mon-Fri 10am-6pm, Sat 10am-5pm, Sun Closed'
)
WHERE key = 'business';

UPDATE site_settings
SET value_json = json_set(
  value_json,
  '$.place_id',
  'ChIJY5sJBbCxJIgRljxES6_nwbQ'
)
WHERE key = 'google_reviews';

UPDATE staff_availability
SET start_time = '10:00'
WHERE start_time = '09:00';

-- Instagram section stays off until owner enables it in Admin → Settings.
INSERT INTO site_settings (key, value_json)
VALUES (
  'instagram_feed',
  '{"enabled":false,"handle":"familysalonandspa","profile_url":"https://www.instagram.com/familysalonandspa/","behold_feed_url":"","trustindex_widget_id":"","last_synced_at":null}'
)
ON CONFLICT(key) DO UPDATE SET value_json = json_set(
  site_settings.value_json,
  '$.enabled',
  json('false')
);

-- Ensure desk QR brochure slug remains the known default if missing.
INSERT INTO site_settings (key, value_json)
VALUES ('price_list', '{"slug":"f9k2m7xq4wp8n3c6"}')
ON CONFLICT(key) DO NOTHING;
