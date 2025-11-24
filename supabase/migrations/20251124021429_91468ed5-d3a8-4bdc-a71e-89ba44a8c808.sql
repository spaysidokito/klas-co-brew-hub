-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE TABLE public.addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table for staff
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cashier', 'barista')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
CREATE TABLE public.order_item_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- RLS Policies for public read access
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to menu_items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public read access to addons" ON public.addons FOR SELECT USING (true);

-- RLS Policies for orders (public can create and read their own)
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
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addons_updated_at BEFORE UPDATE ON public.addons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample categories
INSERT INTO public.categories (name, slug, image_url) VALUES
  ('Espresso Drinks', 'espresso-drinks', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400'),
  ('Cold Brew', 'cold-brew', 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400'),
  ('Specialty Coffee', 'specialty-coffee', 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=400'),
  ('Pastries', 'pastries', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'),
  ('Non-Coffee', 'non-coffee', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400');

-- Insert sample menu items
INSERT INTO public.menu_items (category_id, name, description, image_url, base_price) 
SELECT id, 'Americano', 'Classic espresso with hot water', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400', 120 FROM public.categories WHERE slug = 'espresso-drinks'
UNION ALL
SELECT id, 'Cappuccino', 'Espresso with steamed milk and foam', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', 150 FROM public.categories WHERE slug = 'espresso-drinks'
UNION ALL
SELECT id, 'Latte', 'Smooth espresso with steamed milk', 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400', 160 FROM public.categories WHERE slug = 'espresso-drinks'
UNION ALL
SELECT id, 'Cold Brew', 'Smooth cold-steeped coffee', 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400', 180 FROM public.categories WHERE slug = 'cold-brew'
UNION ALL
SELECT id, 'Iced Caramel Macchiato', 'Iced espresso with vanilla and caramel', 'https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=400', 190 FROM public.categories WHERE slug = 'cold-brew'
UNION ALL
SELECT id, 'Flat White', 'Velvety microfoam with double espresso', 'https://images.unsplash.com/photo-1545665225-b23b99e4d45e?w=400', 170 FROM public.categories WHERE slug = 'specialty-coffee'
UNION ALL
SELECT id, 'Mocha', 'Espresso with chocolate and steamed milk', 'https://images.unsplash.com/photo-1578894381163-e72c17f2d2f5?w=400', 175 FROM public.categories WHERE slug = 'specialty-coffee'
UNION ALL
SELECT id, 'Croissant', 'Buttery flaky pastry', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 80 FROM public.categories WHERE slug = 'pastries'
UNION ALL
SELECT id, 'Blueberry Muffin', 'Moist muffin with fresh blueberries', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400', 95 FROM public.categories WHERE slug = 'pastries'
UNION ALL
SELECT id, 'Chocolate Chip Cookie', 'Classic cookie with chocolate chips', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', 65 FROM public.categories WHERE slug = 'pastries'
UNION ALL
SELECT id, 'Matcha Latte', 'Premium Japanese green tea latte', 'https://images.unsplash.com/photo-1536013564786-1e41da154e58?w=400', 165 FROM public.categories WHERE slug = 'non-coffee'
UNION ALL
SELECT id, 'Hot Chocolate', 'Rich chocolate with steamed milk', 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400', 140 FROM public.categories WHERE slug = 'non-coffee';

-- Insert sample addons
INSERT INTO public.addons (name, price) VALUES
  ('Extra Shot', 30),
  ('Oat Milk', 25),
  ('Almond Milk', 25),
  ('Vanilla Syrup', 20),
  ('Caramel Drizzle', 15),
  ('Whipped Cream', 20),
  ('Hazelnut Syrup', 20),
  ('Cinnamon Powder', 10);

-- Insert sample users
INSERT INTO public.users (name, email, role) VALUES
  ('Admin User', 'admin@klaseco.com', 'admin'),
  ('Sarah Cashier', 'cashier@klaseco.com', 'cashier'),
  ('Mike Barista', 'barista@klaseco.com', 'barista');