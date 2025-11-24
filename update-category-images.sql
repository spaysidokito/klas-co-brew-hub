-- Update category images with your own images
-- Replace the URLs below with your actual image URLs from Supabase Storage

-- Update Coffee category image
UPDATE categories 
SET image_url = 'YOUR_COFFEE_IMAGE_URL_HERE'
WHERE slug = 'coffee';

-- Update Non Coffee category image
UPDATE categories 
SET image_url = 'YOUR_NON_COFFEE_IMAGE_URL_HERE'
WHERE slug = 'non-coffee';

-- Update Fruit Sodas category image
UPDATE categories 
SET image_url = 'YOUR_FRUIT_SODAS_IMAGE_URL_HERE'
WHERE slug = 'fruit-sodas';

-- Verify the updates
SELECT name, slug, image_url 
FROM categories 
ORDER BY name;
