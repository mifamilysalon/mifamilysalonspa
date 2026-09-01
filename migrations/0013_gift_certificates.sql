-- Gift certificates: staff requests need admin approval before emailing the customer
CREATE TABLE IF NOT EXISTS gift_certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  recipient_name TEXT NOT NULL,
  from_name TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  customer_email TEXT NOT NULL,
  issued_date TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending_approval',
  created_by_user_id INTEGER NOT NULL,
  approved_by_user_id INTEGER,
  sent_at TEXT,
  rejected_at TEXT,
  reject_reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_gift_certificates_status ON gift_certificates(status);
CREATE INDEX IF NOT EXISTS idx_gift_certificates_created_by ON gift_certificates(created_by_user_id);
