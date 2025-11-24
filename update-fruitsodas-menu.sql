-- Update Fruit Sodas menu items with correct pricing
-- Extra variation only (no size options, just one price)

-- First, add the size_prices column if it doesn't exist
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS size_prices JSONB;

-- Fruit Sodas with ₱60 pricing
UPDATE menu_items 
SET base_price = 60, 
    size_prices = '{"Extra": 60}'::jsonb,
    description = 'Extra: ₱60'
WHERE name = 'Lychee' AND category_id = (SELECT id FROM categories WHERE slug = 'fruit-sodas');

UPDATE menu_items 
SET base_price = 60, 
    size_prices = '{"Extra": 60}'::jsonb,
    description = 'Extra: ₱60'
WHERE name = 'Blueberry' AND category_id = (SELECT id FROM categories WHERE slug = 'fruit-sodas');

UPDATE menu_items 
SET base_price = 60, 
    size_prices = '{"Extra": 60}'::jsonb,
    description = 'Extra: ₱60'
WHERE name = 'Green Apple' AND category_id = (SELECT id FROM categories WHERE slug = 'fruit-sodas');

UPDATE menu_items 
SET base_price = 60, 
    size_prices = '{"Extra": 60}'::jsonb,
    description = 'Extra: ₱60'
WHERE name = 'Strawberry' AND category_id = (SELECT id FROM categories WHERE slug = 'fruit-sodas');

UPDATE menu_items 
SET base_price = 60, 
    size_prices = '{"Extra": 60}'::jsonb,
    description = 'Extra: ₱60'
WHERE name = 'Four Seasons' AND category_id = (SELECT id FROM categories WHERE slug = 'fruit-sodas');

UPDATE menu_items 
SET base_price = 60, 
    size_prices = '{"Extra": 60}'::jsonb,
    description = 'Extra: ₱60'
WHERE name = 'Blue Lemonade' AND category_id = (SELECT id FROM categories WHERE slug = 'fruit-sodas');

-- Fruit Sodas with ₱70 pricing
UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Extra": 70}'::jsonb,
    description = 'Extra: ₱70'
WHERE name = 'Purple Soda' AND category_id = (SELECT id FROM categories WHERE slug = 'fruit-sodas');

UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Extra": 70}'::jsonb,
    description = 'Extra: ₱70'
WHERE name = 'Purple Strawberry' AND category_id = (SELECT id FROM categories WHERE slug = 'fruit-sodas');

-- Verify the updates
SELECT m.name, m.base_price, m.description, m.size_prices, c.name as category
FROM menu_items m
JOIN categories c ON m.category_id = c.id
WHERE c.slug = 'fruit-sodas'
ORDER BY m.base_price, m.name;
