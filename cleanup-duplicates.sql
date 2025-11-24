-- Clean up duplicate menu items, keep only one of each
DELETE FROM public.menu_items
WHERE id::text NOT IN (
  SELECT MIN(id::text)
  FROM public.menu_items
  GROUP BY category_id, name
);

-- Clean up duplicate addons
DELETE FROM public.addons
WHERE id::text NOT IN (
  SELECT MIN(id::text)
  FROM public.addons
  GROUP BY name
);

-- Verify counts
SELECT 'Categories' as table_name, COUNT(*) as count FROM public.categories
UNION ALL
SELECT 'Menu Items', COUNT(*) FROM public.menu_items
UNION ALL
SELECT 'Add-ons', COUNT(*) FROM public.addons;
