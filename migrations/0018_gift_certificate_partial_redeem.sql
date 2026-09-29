-- Partial gift certificate redemption: remaining balance + per-use history
ALTER TABLE gift_certificates ADD COLUMN balance_cents INTEGER;

UPDATE gift_certificates
SET balance_cents = CASE WHEN status = 'redeemed' THEN 0 ELSE amount_cents END
WHERE balance_cents IS NULL;

CREATE TABLE IF NOT EXISTS gift_certificate_redemptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gift_certificate_id INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  redeemed_at TEXT NOT NULL,
  redeemed_by_user_id INTEGER NOT NULL,
  note TEXT,
  FOREIGN KEY (gift_certificate_id) REFERENCES gift_certificates(id),
  FOREIGN KEY (redeemed_by_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_gift_cert_redemptions_cert
  ON gift_certificate_redemptions(gift_certificate_id);
