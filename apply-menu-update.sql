-- ============================================
-- KlaséCo Menu Update - Apply this in Supabase SQL Editor
-- ============================================

-- Update/Create categories to match the menu structure
INSERT INTO public.categories (name, slug, image_url) VALUES
  ('Coffee', 'coffee', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400'),
  ('Non Coffee', 'non-coffee', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'),
  ('Fruit Sodas', 'fruit-sodas', 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Clear existing menu items to start fresh
DELETE FROM public.menu_items;

-- Insert COFFEE items (Daily: 70, Extra: 90, Hot: 60)
INSERT INTO public.menu_items (category_id, name, description, base_price, is_available) 
SELECT id, 'Cafe Latte', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, true FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Caramel Macchiato', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, true FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Salted Caramel', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, true FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Hazelnut', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, true FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Mocha', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, true FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'White Mocha', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, true FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Spanish', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, true FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'French Vanilla', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, true FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Iced Americano', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, true FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'White Chocolate', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, true FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Biscoff Latte', 'Daily: ₱80 | Extra: ₱99', 80, true FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Dirty Matcha', 'Daily: ₱80 | Extra: ₱99', 80, true FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Klaséco Coffee', 'Daily: ₱80 | Extra: ₱99', 80, true FROM public.categories WHERE slug = 'coffee'
UNION ALL
-- NON COFFEE items
SELECT id, 'Matcha Latte', 'Daily: ₱70 | Extra: ₱90', 70, true FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Blueberry Latte', 'Daily: ₱70 | Extra: ₱90', 70, true FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Strawberry Latte', 'Daily: ₱70 | Extra: ₱90', 70, true FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Oreo Cream', 'Daily: ₱70 | Extra: ₱90', 70, true FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Milo Dinosaur', 'Daily: ₱70 | Extra: ₱90', 70, true FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Milky Biscoff', 'Daily: ₱70 | Extra: ₱90', 70, true FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Milky Choco', 'Daily: ₱70 | Extra: ₱90', 70, true FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Matcha Oreo', 'Daily: ₱80 | Extra: ₱99', 80, true FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Matcha Biscoff', 'Daily: ₱80 | Extra: ₱99', 80, true FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Matcha Caramel', 'Daily: ₱80 | Extra: ₱99', 80, true FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Blueberry Matcha', 'Daily: ₱80 | Extra: ₱99', 80, true FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Strawberry Matcha', 'Daily: ₱80 | Extra: ₱99', 80, true FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Strawberry Oreo', 'Daily: ₱80 | Extra: ₱99', 80, true FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
-- FRUIT SODAS items
SELECT id, 'Lychee', 'Extra: ₱60', 60, true FROM public.categories WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Blueberry', 'Extra: ₱60', 60, true FROM public.categories WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Green Apple', 'Extra: ₱60', 60, true FROM public.categories WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Strawberry', 'Extra: ₱60', 60, true FROM public.categories WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Four Seasons', 'Extra: ₱60', 60, true FROM public.categories WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Blue Lemonade', 'Extra: ₱60', 60, true FROM public.categories WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Purple Soda', 'Extra: ₱70', 70, true FROM public.categories WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Purple Strawberry', 'Extra: ₱70', 70, true FROM public.categories WHERE slug = 'fruit-sodas';

-- Update ADD ONS with new prices
DELETE FROM public.addons;
INSERT INTO public.addons (name, price) VALUES
  ('Nata', 10),
  ('Oreo', 15),
  ('Biscoff', 15),
  ('Espresso Shot', 20);

-- Verify the update
SELECT 'Categories' as table_name, COUNT(*) as count FROM public.categories
UNION ALL
SELECT 'Menu Items', COUNT(*) FROM public.menu_items
UNION ALL
SELECT 'Add-ons', COUNT(*) FROM public.addons;
