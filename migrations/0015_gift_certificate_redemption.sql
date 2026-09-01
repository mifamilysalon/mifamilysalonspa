-- Gift certificate redemption / void tracking (single-use validation)
ALTER TABLE gift_certificates ADD COLUMN redeemed_at TEXT;
ALTER TABLE gift_certificates ADD COLUMN redeemed_by_user_id INTEGER REFERENCES users(id);
ALTER TABLE gift_certificates ADD COLUMN redemption_note TEXT;
ALTER TABLE gift_certificates ADD COLUMN voided_at TEXT;
ALTER TABLE gift_certificates ADD COLUMN void_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_gift_certificates_code ON gift_certificates(code);
