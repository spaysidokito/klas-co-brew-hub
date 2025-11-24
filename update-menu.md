# KlaséCo Menu Update Guide

## What's Updated

The migration file `supabase/migrations/20251124_update_klaseco_menu_prices.sql` contains:

### Categories
- **Coffee** - All espresso-based drinks
- **Non Coffee** - Matcha, milk-based drinks, and specialty beverages  
- **Fruit Sodas** - Refreshing fruit-flavored sodas

### Coffee Items (₱70 Daily / ₱90 Extra / ₱60 Hot)
- Cafe Latte, Caramel Macchiato, Salted Caramel, Hazelnut
- Mocha, White Mocha, Spanish, French Vanilla
- Iced Americano, White Chocolate

### Premium Coffee (₱80 Daily / ₱99 Extra)
- Biscoff Latte, Dirty Matcha, Klaséco Coffee

### Non Coffee Items (₱70 Daily / ₱90 Extra)
- Matcha Latte, Blueberry Latte, Strawberry Latte
- Oreo Cream, Milo Dinosaur, Milky Biscoff, Milky Choco

### Premium Non Coffee (₱80 Daily / ₱99 Extra)
- Matcha Oreo, Matcha Biscoff, Matcha Caramel
- Blueberry Matcha, Strawberry Matcha, Strawberry Oreo

### Fruit Sodas (₱60 Extra)
- Lychee, Blueberry, Green Apple, Strawberry
- Four Seasons, Blue Lemonade

### Premium Fruit Sodas (₱70 Extra)
- Purple Soda, Purple Strawberry

### Add-ons
- Nata (₱10)
- Oreo (₱15)
- Biscoff (₱15)
- Espresso Shot (₱20)

## How to Apply

### Option 1: Using Supabase CLI (Recommended)
```bash
supabase db reset
```

### Option 2: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20251124_update_klaseco_menu_prices.sql`
4. Paste and run the SQL

### Option 3: Push migration
```bash
supabase db push
```

## Notes
- Daily size = 16oz
- Extra size = 22oz  
- Hot option available for coffee items
- Base prices in the database reflect the Daily (16oz) size
