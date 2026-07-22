INSERT OR IGNORE INTO site_settings (key, value_json) VALUES
  ('media', '{"hero_image":"https://images.unsplash.com/photo-1633681926022-84c23e8cb2d7?w=1600&q=80","hero_tone":"color"}'),
  ('social', '{"facebook":"https://www.facebook.com/familysalonandspa/","instagram":"https://www.instagram.com/familysalonandspa/","yelp":"https://www.yelp.com/biz/family-hair-salon-and-wellness-spa-farmington","threads":"https://www.threads.com/@familysalonandspa","tiktok":""}');

UPDATE site_settings
SET value_json = '{"hero_image":"https://images.unsplash.com/photo-1633681926022-84c23e8cb2d7?w=1600&q=80","hero_tone":"color"}'
WHERE key = 'media';

UPDATE site_settings
SET value_json = '{"facebook":"https://www.facebook.com/familysalonandspa/","instagram":"https://www.instagram.com/familysalonandspa/","yelp":"https://www.yelp.com/biz/family-hair-salon-and-wellness-spa-farmington","threads":"https://www.threads.com/@familysalonandspa","tiktok":""}'
WHERE key = 'social';
