-- Expand to 10 bookable staff (demo PIN: 1234 for all)
-- Same pin_hash as existing stylists
INSERT OR IGNORE INTO users (id, email, password_hash, pin_hash, role, name, is_active) VALUES
  (4, 'amina@familysalonspa.com', NULL, 'pbkdf2$25000$/W16Vuzsw6W7c+Vyn7WZzg==$yJhdH5IrVeeajeAymfABLb3EZc0F9MIOy2jK9xlIlC8=', 'stylist', 'Amina Hassan', 1),
  (5, 'jessica@familysalonspa.com', NULL, 'pbkdf2$25000$/W16Vuzsw6W7c+Vyn7WZzg==$yJhdH5IrVeeajeAymfABLb3EZc0F9MIOy2jK9xlIlC8=', 'stylist', 'Jessica Park', 1),
  (6, 'david@familysalonspa.com', NULL, 'pbkdf2$25000$/W16Vuzsw6W7c+Vyn7WZzg==$yJhdH5IrVeeajeAymfABLb3EZc0F9MIOy2jK9xlIlC8=', 'stylist', 'David Kim', 1),
  (7, 'sofia@familysalonspa.com', NULL, 'pbkdf2$25000$/W16Vuzsw6W7c+Vyn7WZzg==$yJhdH5IrVeeajeAymfABLb3EZc0F9MIOy2jK9xlIlC8=', 'stylist', 'Sofia Rivera', 1),
  (8, 'fatima@familysalonspa.com', NULL, 'pbkdf2$25000$/W16Vuzsw6W7c+Vyn7WZzg==$yJhdH5IrVeeajeAymfABLb3EZc0F9MIOy2jK9xlIlC8=', 'stylist', 'Fatima Noor', 1),
  (9, 'emily@familysalonspa.com', NULL, 'pbkdf2$25000$/W16Vuzsw6W7c+Vyn7WZzg==$yJhdH5IrVeeajeAymfABLb3EZc0F9MIOy2jK9xlIlC8=', 'stylist', 'Emily Watson', 1),
  (10, 'layla@familysalonspa.com', NULL, 'pbkdf2$25000$/W16Vuzsw6W7c+Vyn7WZzg==$yJhdH5IrVeeajeAymfABLb3EZc0F9MIOy2jK9xlIlC8=', 'stylist', 'Layla Okonkwo', 1),
  (11, 'noah@familysalonspa.com', NULL, 'pbkdf2$25000$/W16Vuzsw6W7c+Vyn7WZzg==$yJhdH5IrVeeajeAymfABLb3EZc0F9MIOy2jK9xlIlC8=', 'stylist', 'Noah Brooks', 1);

INSERT OR IGNORE INTO staff_profiles (id, user_id, display_name, bio, is_bookable) VALUES
  (3, 4, 'Amina Hassan', 'Hair stylist for cuts, color, and private suite appointments.', 1),
  (4, 5, 'Jessica Park', 'Skin therapist specializing in dermatological facials and face mapping.', 1),
  (5, 6, 'David Kim', 'Hair stylist focused on precision cuts and modern styling.', 1),
  (6, 7, 'Sofia Rivera', 'Nail technician for manicures, pedicures, shellac, and waxing.', 1),
  (7, 8, 'Fatima Noor', 'Wellness specialist for massage and body treatments.', 1),
  (8, 9, 'Emily Watson', 'Color specialist for highlights, full color, and corrective work.', 1),
  (9, 10, 'Layla Okonkwo', 'Hair and skin services with a calm, detail-focused approach.', 1),
  (10, 11, 'Noah Brooks', 'Nails and wellness support for pedicures, polish, and waxing.', 1);

INSERT OR IGNORE INTO staff_services (staff_id, service_id) VALUES
  (3, 1), (3, 2), (3, 3), (3, 15),
  (4, 7), (4, 8),
  (5, 1), (5, 4), (5, 5), (5, 6),
  (6, 9), (6, 10), (6, 11), (6, 12), (6, 13),
  (7, 13), (7, 14),
  (8, 2), (8, 3), (8, 5),
  (9, 1), (9, 7), (9, 8), (9, 15),
  (10, 9), (10, 10), (10, 12), (10, 13);

INSERT OR IGNORE INTO staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
  (3, 1, '09:00', '18:00'), (3, 2, '09:00', '18:00'), (3, 3, '09:00', '18:00'),
  (3, 4, '09:00', '18:00'), (3, 5, '09:00', '18:00'), (3, 6, '09:00', '17:00'),
  (4, 1, '09:00', '18:00'), (4, 2, '09:00', '18:00'), (4, 3, '09:00', '18:00'),
  (4, 4, '09:00', '18:00'), (4, 5, '09:00', '18:00'), (4, 6, '09:00', '17:00'),
  (5, 1, '09:00', '18:00'), (5, 2, '09:00', '18:00'), (5, 3, '09:00', '18:00'),
  (5, 4, '09:00', '18:00'), (5, 5, '09:00', '18:00'), (5, 6, '09:00', '17:00'),
  (6, 1, '09:00', '18:00'), (6, 2, '09:00', '18:00'), (6, 3, '09:00', '18:00'),
  (6, 4, '09:00', '18:00'), (6, 5, '09:00', '18:00'), (6, 6, '09:00', '17:00'),
  (7, 1, '09:00', '18:00'), (7, 2, '09:00', '18:00'), (7, 3, '09:00', '18:00'),
  (7, 4, '09:00', '18:00'), (7, 5, '09:00', '18:00'), (7, 6, '09:00', '17:00'),
  (8, 1, '09:00', '18:00'), (8, 2, '09:00', '18:00'), (8, 3, '09:00', '18:00'),
  (8, 4, '09:00', '18:00'), (8, 5, '09:00', '18:00'), (8, 6, '09:00', '17:00'),
  (9, 1, '09:00', '18:00'), (9, 2, '09:00', '18:00'), (9, 3, '09:00', '18:00'),
  (9, 4, '09:00', '18:00'), (9, 5, '09:00', '18:00'), (9, 6, '09:00', '17:00'),
  (10, 1, '09:00', '18:00'), (10, 2, '09:00', '18:00'), (10, 3, '09:00', '18:00'),
  (10, 4, '09:00', '18:00'), (10, 5, '09:00', '18:00'), (10, 6, '09:00', '17:00');

-- Auth: staff PIN length (4 or 6)
INSERT OR IGNORE INTO site_settings (key, value_json) VALUES
  ('auth', '{"pin_length":4}');

-- Google reviews cache settings (Place ID optional; sync uses Places API free monthly quota when key is set)
INSERT OR IGNORE INTO site_settings (key, value_json) VALUES
  ('google_reviews', '{"place_id":"","maps_url":"https://www.google.com/maps/search/?api=1&query=Family+Hair+Salon+%26+Wellness+Spa+34777+Grand+River+Ave+Farmington+MI","rating":4.4,"review_count":1012,"last_synced_at":null}');

CREATE TABLE IF NOT EXISTS google_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  text TEXT NOT NULL,
  relative_time TEXT,
  publish_time TEXT,
  profile_photo_url TEXT,
  sort_order INTEGER DEFAULT 0,
  source TEXT DEFAULT 'seed',
  updated_at TEXT DEFAULT (datetime('now'))
);

DELETE FROM google_reviews WHERE source = 'seed';

INSERT INTO google_reviews (author_name, rating, text, relative_time, sort_order, source) VALUES
  ('Priya M.', 5, 'Came in for highlights and left feeling taken care of. The stylist explained every step and the color looks natural.', '2 weeks ago', 1, 'seed'),
  ('James T.', 5, 'Great cut and easy booking. The team is friendly and the salon feels calm, not rushed.', 'a month ago', 2, 'seed'),
  ('Nadia H.', 5, 'Used the private suite for my appointment. Privacy was respected and the service was excellent.', '3 weeks ago', 3, 'seed'),
  ('Elena R.', 4, 'Manicure and pedicure were thorough. Shellac held up well through a busy week.', 'a month ago', 4, 'seed'),
  ('Omar K.', 5, 'Facial after face mapping made a real difference for my skin. Will book again.', '2 months ago', 5, 'seed'),
  ('Sarah B.', 5, 'Walked in for a trim and got a thoughtful consultation. Fair pricing and clear communication.', '5 days ago', 6, 'seed'),
  ('Layla S.', 4, 'Waxing was quick and professional. Front desk helped me find the right time slot.', '6 weeks ago', 7, 'seed'),
  ('Chris W.', 5, 'Color correction was done carefully over the right amount of time. Very happy with the result.', '3 months ago', 8, 'seed');

-- Spread seed appointments across the expanded team by service type
UPDATE appointments SET staff_id = 3 WHERE notes = 'seed-demo' AND service_id IN (1, 15) AND id % 2 = 0;
UPDATE appointments SET staff_id = 5 WHERE notes = 'seed-demo' AND service_id IN (1, 4, 5, 6) AND id % 3 = 1;
UPDATE appointments SET staff_id = 8 WHERE notes = 'seed-demo' AND service_id IN (2, 3, 5) AND id % 2 = 1;
UPDATE appointments SET staff_id = 4 WHERE notes = 'seed-demo' AND service_id IN (7, 8);
UPDATE appointments SET staff_id = 6 WHERE notes = 'seed-demo' AND service_id IN (9, 10, 11, 12) AND id % 2 = 0;
UPDATE appointments SET staff_id = 10 WHERE notes = 'seed-demo' AND service_id IN (9, 10, 12) AND id % 2 = 1;
UPDATE appointments SET staff_id = 7 WHERE notes = 'seed-demo' AND service_id IN (13, 14);
UPDATE appointments SET staff_id = 9 WHERE notes = 'seed-demo' AND service_id IN (1, 7, 15) AND id % 5 = 0;
