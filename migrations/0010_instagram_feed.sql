-- Instagram feed cache (synced free via Behold JSON feed, same idea as Google reviews)
CREATE TABLE IF NOT EXISTS instagram_posts (
  id TEXT PRIMARY KEY,
  permalink TEXT NOT NULL,
  media_type TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  posted_at TEXT,
  sort_order INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO site_settings (key, value_json) VALUES
  (
    'instagram_feed',
    '{"handle":"familysalonandspa","profile_url":"https://www.instagram.com/familysalonandspa/","behold_feed_url":"","trustindex_widget_id":"","last_synced_at":null}'
  );
