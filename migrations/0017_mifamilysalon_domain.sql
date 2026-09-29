-- Rebrand domain emails from familysalonspa.com → mifamilysalon.com (seed + demo staff)
UPDATE users
SET email = REPLACE(email, '@familysalonspa.com', '@mifamilysalon.com')
WHERE email LIKE '%@familysalonspa.com';
