-- Simple database setup for KlaséCo

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create addons table
CREATE TABLE IF NOT EXISTS public.addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table for staff
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cashier', 'barista')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('dine-in', 'takeout')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'gcash')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'preparing', 'ready', 'served', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  cashier_id UUID REFERENCES public.users(id),
  barista_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_item_addons table
CREATE TABLE IF NOT EXISTS public.order_item_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE,
  addon_id UUID REFERENCES public.addons(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_addons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public read access to menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow public read access to addons" ON public.addons;
DROP POLICY IF EXISTS "Allow public to create orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public to read all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public to update order status" ON public.orders;
DROP POLICY IF EXISTS "Allow public to create order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public to read order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public to create order_item_addons" ON public.order_item_addons;
DROP POLICY IF EXISTS "Allow public to read order_item_addons" ON public.order_item_addons;
DROP POLICY IF EXISTS "Allow public read access to users" ON public.users;

-- RLS Policies for public read access
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to menu_items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public read access to addons" ON public.addons FOR SELECT USING (true);

-- RLS Policies for orders
CREATE POLICY "Allow public to create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to read all orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public to update order status" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Allow public to create order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to read order_items" ON public.order_items FOR SELECT USING (true);

CREATE POLICY "Allow public to create order_item_addons" ON public.order_item_addons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public to read order_item_addons" ON public.order_item_addons FOR SELECT USING (true);

-- Allow public read access to users table
CREATE POLICY "Allow public read access to users" ON public.users FOR SELECT USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
DROP TRIGGER IF EXISTS update_addons_updated_at ON public.addons;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addons_updated_at BEFORE UPDATE ON public.addons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert categories (only Coffee, Non-Coffee, Fruit Sodas)
INSERT INTO public.categories (name, slug, image_url) VALUES
  ('Coffee', 'coffee', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400'),
  ('Non Coffee', 'non-coffee', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'),
  ('Fruit Sodas', 'fruit-sodas', 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400')
ON CONFLICT (slug) DO NOTHING;

-- Insert COFFEE menu items
INSERT INTO public.menu_items (category_id, name, description, base_price) 
SELECT id, 'Cafe Latte', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70 FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Caramel Macchiato', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70 FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Salted Caramel', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70 FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Hazelnut', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70 FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Mocha', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70 FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'White Mocha', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70 FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Spanish', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70 FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'French Vanilla', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70 FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Iced Americano', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70 FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'White Chocolate', 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', 70 FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Biscoff Latte', 'Daily: ₱80 | Extra: ₱99', 80 FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Dirty Matcha', 'Daily: ₱80 | Extra: ₱99', 80 FROM public.categories WHERE slug = 'coffee'
UNION ALL
SELECT id, 'Klaséco Coffee', 'Daily: ₱80 | Extra: ₱99', 80 FROM public.categories WHERE slug = 'coffee'
UNION ALL
-- NON COFFEE items
SELECT id, 'Matcha Latte', 'Daily: ₱70 | Extra: ₱90', 70 FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Blueberry Latte', 'Daily: ₱70 | Extra: ₱90', 70 FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Strawberry Latte', 'Daily: ₱70 | Extra: ₱90', 70 FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Oreo Cream', 'Daily: ₱70 | Extra: ₱90', 70 FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Milo Dinosaur', 'Daily: ₱70 | Extra: ₱90', 70 FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Milky Biscoff', 'Daily: ₱70 | Extra: ₱90', 70 FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Milky Choco', 'Daily: ₱70 | Extra: ₱90', 70 FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Matcha Oreo', 'Daily: ₱80 | Extra: ₱99', 80 FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Matcha Biscoff', 'Daily: ₱80 | Extra: ₱99', 80 FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Matcha Caramel', 'Daily: ₱80 | Extra: ₱99', 80 FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Blueberry Matcha', 'Daily: ₱80 | Extra: ₱99', 80 FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Strawberry Matcha', 'Daily: ₱80 | Extra: ₱99', 80 FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Strawberry Oreo', 'Daily: ₱80 | Extra: ₱99', 80 FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
-- FRUIT SODAS items
SELECT id, 'Lychee', 'Extra: ₱60', 60 FROM public.categories WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Blueberry', 'Extra: ₱60', 60 FROM public.categories WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Green Apple', 'Extra: ₱60', 60 FROM public.categories WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Strawberry', 'Extra: ₱60', 60 FROM public.categories WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Four Seasons', 'Extra: ₱60', 60 FROM public.categories WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Blue Lemonade', 'Extra: ₱60', 60 FROM public.categories WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Purple Soda', 'Extra: ₱70', 70 FROM public.categories WHERE slug = 'fruit-sodas'
UNION ALL
SELECT id, 'Purple Strawberry', 'Extra: ₱70', 70 FROM public.categories WHERE slug = 'fruit-sodas';

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
