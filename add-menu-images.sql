-- Add sample images to menu items

-- Coffee items
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500' WHERE name = 'Cafe Latte';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=500' WHERE name = 'Caramel Macchiato';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500' WHERE name = 'Salted Caramel';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=500' WHERE name = 'Hazelnut';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1578894381163-e72c17f2d2f5?w=500' WHERE name = 'Mocha';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500' WHERE name = 'White Mocha';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500' WHERE name = 'Spanish';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500' WHERE name = 'French Vanilla';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500' WHERE name = 'Iced Americano';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500' WHERE name = 'White Chocolate';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500' WHERE name = 'Biscoff Latte';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1536013564786-1e41da154e58?w=500' WHERE name = 'Dirty Matcha';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500' WHERE name = 'Klaséco Coffee';

-- Non-Coffee items
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1536013564786-1e41da154e58?w=500' WHERE name = 'Matcha Latte';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1553787434-6e5a6c6d1d3f?w=500' WHERE name = 'Blueberry Latte';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1553787434-6e5a6c6d1d3f?w=500' WHERE name = 'Strawberry Latte';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=500' WHERE name = 'Oreo Cream';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500' WHERE name = 'Milo Dinosaur';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500' WHERE name = 'Milky Biscoff';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=500' WHERE name = 'Milky Choco';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=500' WHERE name = 'Matcha Oreo';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500' WHERE name = 'Matcha Biscoff';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1536013564786-1e41da154e58?w=500' WHERE name = 'Matcha Caramel';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1553787434-6e5a6c6d1d3f?w=500' WHERE name = 'Blueberry Matcha';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1553787434-6e5a6c6d1d3f?w=500' WHERE name = 'Strawberry Matcha';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=500' WHERE name = 'Strawberry Oreo';

-- Fruit Sodas
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500' WHERE name = 'Lychee';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1553787434-6e5a6c6d1d3f?w=500' WHERE name = 'Blueberry';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500' WHERE name = 'Green Apple';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1553787434-6e5a6c6d1d3f?w=500' WHERE name = 'Strawberry';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500' WHERE name = 'Four Seasons';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=500' WHERE name = 'Blue Lemonade';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500' WHERE name = 'Purple Soda';
UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1553787434-6e5a6c6d1d3f?w=500' WHERE name = 'Purple Strawberry';

-- Verify
SELECT name, image_url FROM public.menu_items ORDER BY name LIMIT 10;
