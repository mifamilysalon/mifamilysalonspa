-- Cleanup service display names for public catalog + in-salon brochure.
-- Does not change prices or booking_type.

UPDATE services SET name = 'Kids Haircut' WHERE name = 'Kids Hair Cut';
UPDATE services SET name = 'Men''s Haircut' WHERE name = 'Men''s Hair Cut';
UPDATE services SET name = 'Women''s Haircut' WHERE name = 'Women''s Hair Cut';
UPDATE services SET name = 'Hair Updo' WHERE name = 'Hair Up Do';
UPDATE services SET name = 'Nail Shape & Polish' WHERE name = 'Nails Shape with Polish';
UPDATE services SET name = 'Sideburn' WHERE name = 'Side Burn';
UPDATE services SET name = 'Underarm' WHERE name = 'Under Arms';
UPDATE services SET name = 'Anti-Tan Facial' WHERE name = 'Antitan Facial';
UPDATE services SET name = 'Anti-Aging Facial' WHERE name = 'Anti Aging Facial';
UPDATE services SET name = 'Dupatta Setting' WHERE name = 'Duppata Setting';
UPDATE services SET name = 'Party Makeup' WHERE name = 'Party Make-Up';
UPDATE services SET name = 'Engagement & Reception Makeup' WHERE name = 'Engagement & Reception Make-Up';
UPDATE services SET name = 'Bridal Makeup' WHERE name = 'Bridal Make-Up';
