-- Fix RLS policies to allow admin operations

-- Allow public to update menu items (for availability toggle)
DROP POLICY IF EXISTS "Allow public update menu_items" ON public.menu_items;
CREATE POLICY "Allow public update menu_items" ON public.menu_items FOR UPDATE USING (true);

-- Allow public to insert menu items (for adding new items)
DROP POLICY IF EXISTS "Allow public insert menu_items" ON public.menu_items;
CREATE POLICY "Allow public insert menu_items" ON public.menu_items FOR INSERT WITH CHECK (true);

-- Allow public to delete menu items (for admin delete)
DROP POLICY IF EXISTS "Allow public delete menu_items" ON public.menu_items;
CREATE POLICY "Allow public delete menu_items" ON public.menu_items FOR DELETE USING (true);

-- Allow public to delete orders (for clearing history)
DROP POLICY IF EXISTS "Allow public delete orders" ON public.orders;
CREATE POLICY "Allow public delete orders" ON public.orders FOR DELETE USING (true);

-- Verify policies
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('menu_items', 'orders')
ORDER BY tablename, policyname;
