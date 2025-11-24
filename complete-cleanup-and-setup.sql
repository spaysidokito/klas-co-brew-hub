-- Complete cleanup and fresh setup for KlaséCo menu

-- Step 1: Clean up all duplicates
DELETE FROM public.menu_items;
DELETE FROM public.addons;

-- Step 2: Insert fresh menu items with images
WITH cat_ids AS (
  SELECT id, slug FROM public.categories
)
INSERT INTO public.menu_items (category_id, name, description, base_price, image_url, is_available)
-- Coffee items
SELECT id, 'Cafe Latte', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500', true FROM cat_ids WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Caramel Macchiato', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, 'https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=500', true FROM cat_ids WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Salted Caramel', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500', true FROM cat_ids WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Hazelnut', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, 'https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=500', true FROM cat_ids WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Mocha', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, 'https://images.unsplash.com/photo-1578894381163-e72c17f2d2f5?w=500', true FROM cat_ids WHERE slug = 'coffee'
UNION ALL
SELECT id, 'White Mocha', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500', true FROM cat_ids WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Spanish', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500', true FROM cat_ids WHERE slug = 'coffee'
UNION ALL
SELECT id, 'French Vanilla', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500', true FROM cat_ids WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Iced Americano', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500', true FROM cat_ids WHERE slug = 'coffee'
UNION ALL
SELECT id, 'White Chocolate', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500', true FROM cat_ids WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Biscoff Latte', 'Daily: ₱80 | Extra: ₱99', 80, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500', true FROM cat_ids WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Dirty Matcha', 'Daily: ₱80 | Extra: ₱99', 80, 'https://images.unsplash.com/photo-1536013564786-1e41da154e58?w=500', true FROM cat_ids WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Klaséco Coffee', 'Daily: ₱80 | Extra: ₱99', 80, 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500', true FROM cat_ids WHERE slug = 'coffee'
UNION ALL
-- Non-Coffee items
SELECT id, 'Matcha Latte', 'Daily: ₱70 | Extra: ₱90', 70, 'https://images.unsplash.com/photo-1536013564786-1e41da154e58?w=500', true FROM cat_ids WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Blueberry Latte', 'Daily: ₱70 | Extra: ₱90', 70, 'https://images.unsplash.com/photo-1553787434-6e5a6c6d1d3f?w=500', true FROM cat_ids WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Strawberry Latte', 'Daily: ₱70 | Extra: ₱90', 70, 'https://images.unsplash.com/photo-1553787434-6e5a6c6d1d3f?w=500', true FROM cat_ids WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Oreo Cream', 'Daily: ₱70 | Extra: ₱90', 70, 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=500', true FROM cat_ids WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Milo Dinosaur', 'Daily: ₱70 | Extra: ₱90', 70, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500', true FROM cat_ids WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Milky Biscoff', 'Daily: ₱70 | Extra: ₱90', 70, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500', true FROM cat_ids WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Milky Choco', 'Daily: ₱70 | Extra: ₱90', 70, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500', true FROM cat_ids WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Matcha Oreo', 'Daily: ₱80 | Extra: ₱99', 80, 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=500', true FROM cat_ids WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Matcha Biscoff', 'Daily: ₱80 | Extra: ₱99', 80, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500', true FROM cat_ids WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Matcha Caramel', 'Daily: ₱80 | Extra: ₱99', 80, 'https://images.unsplash.com/photo-1536013564786-1e41da154e58?w=500', true FROM cat_ids WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Blueberry Matcha', 'Daily: ₱80 | Extra: ₱99', 80, 'https://images.unsplash.com/photo-1553787434-6e5a6c6d1d3f?w=500', true FROM cat_ids WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Strawberry Matcha', 'Daily: ₱80 | Extra: ₱99', 80, 'https://images.unsplash.com/photo-1553787434-6e5a6c6d1d3f?w=500', true FROM cat_ids WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Strawberry Oreo', 'Daily: ₱80 | Extra: ₱99', 80, 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=500', true FROM cat_ids WHERE slug = 'non-coffee'
UNION ALL
-- Fruit Sodas
SELECT id, 'Lychee', 'Extra: ₱60', 60, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500', true FROM cat_ids WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Blueberry', 'Extra: ₱60', 60, 'https://images.unsplash.com/photo-1553787434-6e5a6c6d1d3f?w=500', true FROM cat_ids WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Green Apple', 'Extra: ₱60', 60, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500', true FROM cat_ids WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Strawberry', 'Extra: ₱60', 60, 'https://images.unsplash.com/photo-1553787434-6e5a6c6d1d3f?w=500', true FROM cat_ids WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Four Seasons', 'Extra: ₱60', 60, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500', true FROM cat_ids WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Blue Lemonade', 'Extra: ₱60', 60, 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=500', true FROM cat_ids WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Purple Soda', 'Extra: ₱70', 70, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500', true FROM cat_ids WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Purple Strawberry', 'Extra: ₱70', 70, 'https://images.unsplash.com/photo-1553787434-6e5a6c6d1d3f?w=500', true FROM cat_ids WHERE slug = 'fruit-sodas';

-- Step 3: Insert clean addons
INSERT INTO public.addons (name, price) VALUES
  ('Nata', 10),
  ('Oreo', 15),
  ('Biscoff', 15),
  ('Espresso Shot', 20);

-- Step 4: Verify counts
SELECT 'Categories' as table_name, COUNT(*) as count FROM public.categories
UNION ALL
SELECT 'Menu Items', COUNT(*) FROM public.menu_items
UNION ALL
SELECT 'Add-ons', COUNT(*) FROM public.addons;
