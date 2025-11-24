-- Update category images to use local public folder images
-- Make sure you've uploaded the images to the public folder first

-- Update Coffee category image
UPDATE categories 
SET image_url = '/coffee-category.jpg'
WHERE slug = 'coffee';

-- Update Non Coffee category image
UPDATE categories 
SET image_url = '/noncoffee-category.jpg'
WHERE slug = 'non-coffee';

-- Update Fruit Sodas category image
UPDATE categories 
SET image_url = '/fruitsodas-category.jpg'
WHERE slug = 'fruit-sodas';

-- Verify the updates
SELECT name, slug, image_url 
FROM categories 
ORDER BY name;
