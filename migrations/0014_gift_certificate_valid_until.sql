-- Add expiration date to gift certificates
ALTER TABLE gift_certificates ADD COLUMN valid_until_date TEXT;

UPDATE gift_certificates
SET valid_until_date = date(issued_date, '+1 year')
WHERE valid_until_date IS NULL;
