-- Update Coffee menu items with correct pricing
-- Daily, Extra, and Hot variations

-- First, add the size_prices column if it doesn't exist
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS size_prices JSONB;

-- Coffee drinks with 70/90/60 pricing
UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90, "Hot": 60}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60'
WHERE name = 'Cafe Latte' AND category_id = (SELECT id FROM categories WHERE slug = 'coffee');

UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90, "Hot": 60}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60'
WHERE name = 'Caramel Macchiato' AND category_id = (SELECT id FROM categories WHERE slug = 'coffee');

UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90, "Hot": 60}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60'
WHERE name = 'Salted Caramel' AND category_id = (SELECT id FROM categories WHERE slug = 'coffee');

UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90, "Hot": 60}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60'
WHERE name = 'Hazelnut' AND category_id = (SELECT id FROM categories WHERE slug = 'coffee');

UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90, "Hot": 60}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60'
WHERE name = 'Mocha' AND category_id = (SELECT id FROM categories WHERE slug = 'coffee');

UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90, "Hot": 60}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60'
WHERE name = 'White Mocha' AND category_id = (SELECT id FROM categories WHERE slug = 'coffee');

UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90, "Hot": 60}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60'
WHERE name = 'Spanish' AND category_id = (SELECT id FROM categories WHERE slug = 'coffee');

UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90, "Hot": 60}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60'
WHERE name = 'French Vanilla' AND category_id = (SELECT id FROM categories WHERE slug = 'coffee');

UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90, "Hot": 60}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60'
WHERE name = 'Iced Americano' AND category_id = (SELECT id FROM categories WHERE slug = 'coffee');

UPDATE menu_items 
SET base_price = 70, 
    size_prices = '{"Daily": 70, "Extra": 90, "Hot": 60}'::jsonb,
    description = 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60'
WHERE name = 'White Chocolate' AND category_id = (SELECT id FROM categories WHERE slug = 'coffee');

-- Coffee drinks with 80/99 pricing (no Hot option)
UPDATE menu_items 
SET base_price = 80, 
    size_prices = '{"Daily": 80, "Extra": 99}'::jsonb,
    description = 'Daily: ₱80 | Extra: ₱99'
WHERE name = 'Biscoff Latte' AND category_id = (SELECT id FROM categories WHERE slug = 'coffee');

UPDATE menu_items 
SET base_price = 80, 
    size_prices = '{"Daily": 80, "Extra": 99}'::jsonb,
    description = 'Daily: ₱80 | Extra: ₱99'
WHERE name = 'Dirty Matcha' AND category_id = (SELECT id FROM categories WHERE slug = 'coffee');

UPDATE menu_items 
SET base_price = 80, 
    size_prices = '{"Daily": 80, "Extra": 99}'::jsonb,
    description = 'Daily: ₱80 | Extra: ₱99'
WHERE name = 'Klaséco Coffee' AND category_id = (SELECT id FROM categories WHERE slug = 'coffee');

-- Verify the updates
SELECT m.name, m.base_price, m.description, m.size_prices, c.name as category
FROM menu_items m
JOIN categories c ON m.category_id = c.id
WHERE c.slug = 'coffee'
ORDER BY m.base_price, m.name;
