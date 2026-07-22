-- Owner: admin@familysalonspa.com / SalonOwner2026!
-- Staff PIN demo: 1234
INSERT OR IGNORE INTO users (id, email, password_hash, pin_hash, role, name, is_active) VALUES
  (1, 'admin@familysalonspa.com', 'pbkdf2$25000$J4FdxaOUdIjh7ZType/gPA==$A27ajkizGoYw826sP0OsUjlBftN8LPTb33/aoMdWhAk=', NULL, 'owner', 'Salon Owner', 1),
  (2, 'stylist@familysalonspa.com', NULL, 'pbkdf2$25000$/W16Vuzsw6W7c+Vyn7WZzg==$yJhdH5IrVeeajeAymfABLb3EZc0F9MIOy2jK9xlIlC8=', 'stylist', 'Sarah Chen', 1),
  (3, 'nails@familysalonspa.com', NULL, 'pbkdf2$25000$/W16Vuzsw6W7c+Vyn7WZzg==$yJhdH5IrVeeajeAymfABLb3EZc0F9MIOy2jK9xlIlC8=', 'stylist', 'Maria Lopez', 1);

INSERT OR IGNORE INTO staff_profiles (id, user_id, display_name, bio, is_bookable) VALUES
  (1, 2, 'Sarah Chen', 'Hair stylist specializing in color, cuts, and styling.', 1),
  (2, 3, 'Maria Lopez', 'Nail technician for manicures, pedicures, and shellac.', 1);

INSERT OR IGNORE INTO services (id, name, category, description, duration_minutes, price, booking_type, is_active) VALUES
  (1, 'Creative Cut and Style', 'hair', 'Consultation, wash, precision cut, and finish style.', 60, 55, 'instant', 1),
  (2, 'Full Color', 'hair', 'Single-process color with toner and style.', 120, 95, 'request', 1),
  (3, 'Highlights', 'hair', 'Partial or full foil highlights with toner.', 150, 140, 'request', 1),
  (4, 'Extensions Consultation', 'hair', 'Discuss length, density, and maintenance for extensions.', 30, 0, 'request', 1),
  (5, 'Permanent Wave', 'hair', 'Perm waving for lasting texture and body.', 120, 110, 'request', 1),
  (6, 'Straightening / Rebonding', 'hair', 'Chemical straightening for long-lasting smooth hair.', 180, 200, 'request', 1),
  (7, 'Dermatological Facial', 'skin', 'Custom facial based on face mapping skin analysis.', 75, 85, 'instant', 1),
  (8, 'Face Mapping Analysis', 'skin', 'Skin assessment to plan treatments for your skin type.', 30, 40, 'instant', 1),
  (9, 'Classic Manicure', 'nails', 'Shape, cuticle care, massage, and polish.', 45, 30, 'instant', 1),
  (10, 'Classic Pedicure', 'nails', 'Soak, care, massage, and polish for feet.', 60, 45, 'instant', 1),
  (11, 'Shellac Manicure', 'nails', 'Long-wear gel polish manicure.', 60, 45, 'instant', 1),
  (12, 'Polish Change', 'nails', 'Quick polish refresh on existing nails.', 20, 18, 'instant', 1),
  (13, 'Body Wax', 'wellness', 'Professional body waxing services.', 45, 50, 'request', 1),
  (14, 'Relaxation Massage', 'wellness', 'Therapeutic massage for stress relief.', 60, 75, 'request', 1),
  (15, 'Private Suite Service', 'hair', 'Hair or beauty service in our private women''s suite.', 60, 65, 'request', 1);

INSERT OR IGNORE INTO staff_services (staff_id, service_id) VALUES
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 15),
  (2, 9), (2, 10), (2, 11), (2, 12), (2, 13);

-- Mon-Sat 9:00-18:00 for both staff
INSERT OR IGNORE INTO staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
  (1, 1, '09:00', '18:00'), (1, 2, '09:00', '18:00'), (1, 3, '09:00', '18:00'),
  (1, 4, '09:00', '18:00'), (1, 5, '09:00', '18:00'), (1, 6, '09:00', '17:00'),
  (2, 1, '09:00', '18:00'), (2, 2, '09:00', '18:00'), (2, 3, '09:00', '18:00'),
  (2, 4, '09:00', '18:00'), (2, 5, '09:00', '18:00'), (2, 6, '09:00', '17:00');

INSERT OR IGNORE INTO site_settings (key, value_json) VALUES
  ('palette', '"farmington-rose-gold"'),
  ('business', '{"name":"Family Hair Salon & Wellness Spa","phone_primary":"(248) 474-6520","phone_secondary":"(248) 635-5127","address":"34777 Grand River Ave, Farmington, MI 48335","hours":"Mon-Fri 9am-6pm, Sat 9am-5pm, Sun Closed"}'),
  ('sms', '{"enabled":false,"monthly_cap":5000,"sent_this_month":0}'),
  ('booking', '{"buffer_minutes":15,"slot_minutes":15}');

INSERT OR IGNORE INTO pages (id, slug, title, seo_title, seo_description, status) VALUES
  (1, 'home', 'Home', 'Family Hair Salon & Wellness Spa | Farmington, MI', 'Hair, skin, nail, and wellness services in Farmington, MI. Book online or call (248) 474-6520.', 'published'),
  (2, 'hair-care', 'Hair Care', 'Hair Care | Family Hair Salon & Wellness Spa', 'Cuts, color, extensions, perms, and straightening in Farmington, MI.', 'published'),
  (3, 'skin-care', 'Skin Care', 'Skin Care | Family Hair Salon & Wellness Spa', 'Dermatological facials and face mapping skin analysis.', 'published'),
  (4, 'nail-care', 'Nail Care', 'Nail Care | Family Hair Salon & Wellness Spa', 'Manicures, pedicures, shellac, and polish changes.', 'published'),
  (5, 'wellness', 'Wellness', 'Wellness | Family Hair Salon & Wellness Spa', 'Massage, body wax, and wellness treatments.', 'published'),
  (6, 'about', 'About', 'About Us | Family Hair Salon & Wellness Spa', 'About Family Hair Salon & Wellness Spa in Farmington, MI.', 'published'),
  (7, 'contact', 'Contact', 'Contact | Family Hair Salon & Wellness Spa', 'Visit us at 34777 Grand River Ave, Farmington, MI 48335.', 'published'),
  (8, 'private-area', 'Private Area', 'Private Women''s Suite | Family Hair Salon & Wellness Spa', 'A private suite for women who prefer complete privacy, including clients who wear hijab.', 'published'),
  (9, 'gift-certificates', 'Gift Certificates', 'Gift Certificates | Family Hair Salon & Wellness Spa', 'Gift certificates available in person or by phone.', 'published'),
  (10, 'gallery', 'Photo Gallery', 'Gallery | Family Hair Salon & Wellness Spa', 'Photos from Family Hair Salon & Wellness Spa.', 'published'),
  (11, 'products', 'Products', 'Products | Family Hair Salon & Wellness Spa', 'Professional hair and skin products available at the salon.', 'published');

INSERT OR IGNORE INTO page_blocks (page_id, sort_order, block_type, content_json) VALUES
  (1, 1, 'hero', '{"headline":"Family Hair Salon & Wellness Spa","subhead":"Hair, skin, nails, and wellness for Farmington. Walk in for a cut, color, facial, or manicure - or book time in our private suite if you prefer a quieter setting.","cta_primary":"Book an appointment","cta_primary_href":"/appointments","cta_secondary":"Call (248) 474-6520","cta_secondary_href":"tel:2484746520","image":"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=80"}'),
  (1, 2, 'text', '{"title":"What we offer","body":"Our team provides creative styling, coloring, extensions, permanent waving, straightening, and rebonding. Skin therapists plan facials after examining your skin type. Nail technicians offer manicures, pedicures, shellac, and polish changes."}'),
  (1, 3, 'cta', '{"title":"Private women''s suite","body":"We created a private area for women who require or prefer services in a complete private setting, including women who wear hijab.","cta":"Learn more","href":"/private-area"}');
