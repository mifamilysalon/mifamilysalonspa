-- Self-serve marketing promos (owner-managed, time-bound)
CREATE TABLE IF NOT EXISTS promos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  cta_label TEXT,
  cta_href TEXT,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_featured INTEGER NOT NULL DEFAULT 0,
  placement TEXT NOT NULL DEFAULT 'both',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_promos_active_dates
  ON promos(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_promos_sort ON promos(sort_order, id);
