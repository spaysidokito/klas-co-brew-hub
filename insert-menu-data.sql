-- Insert menu data only

-- Insert categories
INSERT INTO public.categories (name, slug, image_url) VALUES
  ('Coffee', 'coffee', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400'),
  ('Non Coffee', 'non-coffee', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'),
  ('Fruit Sodas', 'fruit-sodas', 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400')
ON CONFLICT (slug) DO NOTHING;

-- Get category IDs and insert menu items
WITH cat_ids AS (
  SELECT id, slug FROM public.categories
)
INSERT INTO public.menu_items (category_id, name, description, base_price, is_available)
SELECT 
  cat_ids.id,
  items.name,
  items.description,
  items.base_price,
  true
FROM cat_ids
CROSS JOIN LATERAL (
  VALUES
    -- Coffee items
    ('Cafe Latte', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70),
    ('Caramel Macchiato', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70),
    ('Salted Caramel', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70),
    ('Hazelnut', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70),
    ('Mocha', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70),
    ('White Mocha', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70),
    ('Spanish', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70),
    ('French Vanilla', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70),
    ('Iced Americano', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70),
    ('White Chocolate', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70),
    ('Biscoff Latte', 'Daily: ₱80 | Extra: ₱99', 80),
    ('Dirty Matcha', 'Daily: ₱80 | Extra: ₱99', 80),
    ('Klaséco Coffee', 'Daily: ₱80 | Extra: ₱99', 80)
) AS items(name, description, base_price)
WHERE cat_ids.slug = 'coffee'

UNION ALL

SELECT 
  cat_ids.id,
  items.name,
  items.description,
  items.base_price,
  true
FROM cat_ids
CROSS JOIN LATERAL (
  VALUES
    -- Non Coffee items
    ('Matcha Latte', 'Daily: ₱70 | Extra: ₱90', 70),
    ('Blueberry Latte', 'Daily: ₱70 | Extra: ₱90', 70),
    ('Strawberry Latte', 'Daily: ₱70 | Extra: ₱90', 70),
    ('Oreo Cream', 'Daily: ₱70 | Extra: ₱90', 70),
    ('Milo Dinosaur', 'Daily: ₱70 | Extra: ₱90', 70),
    ('Milky Biscoff', 'Daily: ₱70 | Extra: ₱90', 70),
    ('Milky Choco', 'Daily: ₱70 | Extra: ₱90', 70),
    ('Matcha Oreo', 'Daily: ₱80 | Extra: ₱99', 80),
    ('Matcha Biscoff', 'Daily: ₱80 | Extra: ₱99', 80),
    ('Matcha Caramel', 'Daily: ₱80 | Extra: ₱99', 80),
    ('Blueberry Matcha', 'Daily: ₱80 | Extra: ₱99', 80),
    ('Strawberry Matcha', 'Daily: ₱80 | Extra: ₱99', 80),
    ('Strawberry Oreo', 'Daily: ₱80 | Extra: ₱99', 80)
) AS items(name, description, base_price)
WHERE cat_ids.slug = 'non-coffee'

UNION ALL

SELECT 
  cat_ids.id,
  items.name,
  items.description,
  items.base_price,
  true
FROM cat_ids
CROSS JOIN LATERAL (
  VALUES
    -- Fruit Sodas
    ('Lychee', 'Extra: ₱60', 60),
    ('Blueberry', 'Extra: ₱60', 60),
    ('Green Apple', 'Extra: ₱60', 60),
    ('Strawberry', 'Extra: ₱60', 60),
    ('Four Seasons', 'Extra: ₱60', 60),
    ('Blue Lemonade', 'Extra: ₱60', 60),
    ('Purple Soda', 'Extra: ₱70', 70),
    ('Purple Strawberry', 'Extra: ₱70', 70)
) AS items(name, description, base_price)
WHERE cat_ids.slug = 'fruit-sodas';

-- Insert addons
INSERT INTO public.addons (name, price) VALUES
  ('Nata', 10),
  ('Oreo', 15),
  ('Biscoff', 15),
  ('Espresso Shot', 20)
ON CONFLICT DO NOTHING;

-- Insert sample users
INSERT INTO public.users (name, email, role) VALUES
  ('Admin User', 'admin@klaseco.com', 'admin'),
  ('Sarah Cashier', 'cashier@klaseco.com', 'cashier'),
  ('Mike Barista', 'barista@klaseco.com', 'barista')
ON CONFLICT (email) DO NOTHING;

-- Verify
SELECT 'Categories' as table_name, COUNT(*) as count FROM public.categories
UNION ALL
SELECT 'Menu Items', COUNT(*) FROM public.menu_items
UNION ALL
SELECT 'Add-ons', COUNT(*) FROM public.addons;
