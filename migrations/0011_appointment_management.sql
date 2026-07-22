-- Appointment change history (transfer / reassign / reschedule / status)
CREATE TABLE IF NOT EXISTS appointment_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  actor_user_id INTEGER REFERENCES users(id),
  actor_role TEXT,
  event_type TEXT NOT NULL,
  from_staff_id INTEGER,
  to_staff_id INTEGER,
  from_status TEXT,
  to_status TEXT,
  from_start TEXT,
  to_start TEXT,
  from_end TEXT,
  to_end TEXT,
  note TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_appointment_events_appt
  ON appointment_events(appointment_id, created_at DESC);
