-- Auth
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password_hash TEXT,
  pin_hash TEXT,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);

-- CMS
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  status TEXT DEFAULT 'draft',
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS page_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  block_type TEXT NOT NULL,
  content_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  r2_key TEXT NOT NULL,
  filename TEXT NOT NULL,
  alt_text TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Services and staff
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price REAL,
  booking_type TEXT NOT NULL DEFAULT 'request',
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS staff_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  is_bookable INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS staff_services (
  staff_id INTEGER NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

CREATE TABLE IF NOT EXISTS staff_availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id INTEGER NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS staff_time_off (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id INTEGER REFERENCES staff_profiles(id) ON DELETE CASCADE,
  start_datetime TEXT NOT NULL,
  end_datetime TEXT NOT NULL,
  reason TEXT
);

CREATE TABLE IF NOT EXISTS salon_holidays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  label TEXT,
  is_closed INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL REFERENCES services(id),
  staff_id INTEGER REFERENCES staff_profiles(id),
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT NOT NULL,
  start_datetime TEXT NOT NULL,
  end_datetime TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  booking_source TEXT NOT NULL,
  notes TEXT,
  sms_opt_in INTEGER DEFAULT 0,
  sms_opt_in_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_appointments_staff_date ON appointments(staff_id, start_datetime);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_page_blocks_page ON page_blocks(page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
