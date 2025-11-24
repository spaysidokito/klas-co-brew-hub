-- Update Non-Coffee menu items with correct pricing
-- Daily and Extra variations only

-- First, add the size_prices column if it doesn't exist
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS size_prices JSONB;

-- Non-Coffee drinks with 70/90 pricing
UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90'
WHERE name = 'Matcha Latte' AND category_id = (SELECT id FROM categories WHERE slug = 'non-coffee');

UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90'
WHERE name = 'Blueberry Latte' AND category_id = (SELECT id FROM categories WHERE slug = 'non-coffee');

UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90'
WHERE name = 'Strawberry Latte' AND category_id = (SELECT id FROM categories WHERE slug = 'non-coffee');

UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90'
WHERE name = 'Oreo Cream' AND category_id = (SELECT id FROM categories WHERE slug = 'non-coffee');

UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90'
WHERE name = 'Milo Dinosaur' AND category_id = (SELECT id FROM categories WHERE slug = 'non-coffee');

UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90'
WHERE name = 'Milky Biscoff' AND category_id = (SELECT id FROM categories WHERE slug = 'non-coffee');

UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90'
WHERE name = 'Milky Choco' AND category_id = (SELECT id FROM categories WHERE slug = 'non-coffee');

-- Non-Coffee drinks with 80/99 pricing
UPDATE menu_items 
SET base_price = 80, 
    size_prices = '{"Daily": 80, "Extra": 99}'::jsonb,
    description = 'Daily: ₱80 | Extra: ₱99'
WHERE name = 'Matcha Oreo' AND category_id = (SELECT id FROM categories WHERE slug = 'non-coffee');

UPDATE menu_items 
SET base_price = 80, 
    size_prices = '{"Daily": 80, "Extra": 99}'::jsonb,
    description = 'Daily: ₱80 | Extra: ₱99'
WHERE name = 'Matcha Biscoff' AND category_id = (SELECT id FROM categories WHERE slug = 'non-coffee');

UPDATE menu_items 
SET base_price = 80, 
    size_prices = '{"Daily": 80, "Extra": 99}'::jsonb,
    description = 'Daily: ₱80 | Extra: ₱99'
WHERE name = 'Matcha Caramel' AND category_id = (SELECT id FROM categories WHERE slug = 'non-coffee');

UPDATE menu_items 
SET base_price = 80, 
    size_prices = '{"Daily": 80, "Extra": 99}'::jsonb,
    description = 'Daily: ₱80 | Extra: ₱99'
WHERE name = 'Blueberry Matcha' AND category_id = (SELECT id FROM categories WHERE slug = 'non-coffee');

UPDATE menu_items 
SET base_price = 80, 
    size_prices = '{"Daily": 80, "Extra": 99}'::jsonb,
    description = 'Daily: ₱80 | Extra: ₱99'
WHERE name = 'Strawberry Matcha' AND category_id = (SELECT id FROM categories WHERE slug = 'non-coffee');

UPDATE menu_items 
SET base_price = 80, 
    size_prices = '{"Daily": 80, "Extra": 99}'::jsonb,
    description = 'Daily: ₱80 | Extra: ₱99'
WHERE name = 'Strawberry Oreo' AND category_id = (SELECT id FROM categories WHERE slug = 'non-coffee');

-- Verify the updates
SELECT m.name, m.base_price, m.description, m.size_prices, c.name as category
FROM menu_items m
JOIN categories c ON m.category_id = c.id
WHERE c.slug = 'non-coffee'
ORDER BY m.base_price, m.name;
