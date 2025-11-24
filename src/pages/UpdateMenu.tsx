import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UpdateMenu() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateMenu = async () => {
    setLoading(true);
    setStatus('Starting update...');

    try {
      // Step 1: Delete old categories (Pastries, Specialty Coffee, etc.)
      setStatus('Removing old categories...');
      await supabase.from('categories').delete().not('slug', 'in', '("coffee","non-coffee","fruit-sodas")');

      // Step 2: Create/Update categories
      setStatus('Creating categories...');
      const categories = [
        { name: 'Coffee', slug: 'coffee', image_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400' },
        { name: 'Non Coffee', slug: 'non-coffee', image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
        { name: 'Fruit Sodas', slug: 'fruit-sodas', image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400' }
      ];

      for (const cat of categories) {
        await supabase.from('categories').upsert(cat, { onConflict: 'slug' });
      }

      // Step 3: Get category IDs
      const { data: categoriesData } = await supabase.from('categories').select('id, slug');
      const categoryMap = Object.fromEntries(categoriesData?.map(c => [c.slug, c.id]) || []);

      // Step 4: Delete old menu items
      setStatus('Clearing old menu items...');
      await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Step 5: Insert new menu items
      setStatus('Adding new menu items...');
      const menuItems = [
        // Coffee items
        { category_id: categoryMap['coffee'], name: 'Cafe Latte', description: 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', base_price: 70 },
        { category_id: categoryMap['coffee'], name: 'Caramel Macchiato', description: 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', base_price: 70 },
        { category_id: categoryMap['coffee'], name: 'Salted Caramel', description: 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', base_price: 70 },
        { category_id: categoryMap['coffee'], name: 'Hazelnut', description: 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', base_price: 70 },
        { category_id: categoryMap['coffee'], name: 'Mocha', description: 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', base_price: 70 },
        { category_id: categoryMap['coffee'], name: 'White Mocha', description: 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', base_price: 70 },
        { category_id: categoryMap['coffee'], name: 'Spanish', description: 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', base_price: 70 },
        { category_id: categoryMap['coffee'], name: 'French Vanilla', description: 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', base_price: 70 },
        { category_id: categoryMap['coffee'], name: 'Iced Americano', description: 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', base_price: 70 },
        { category_id: categoryMap['coffee'], name: 'White Chocolate', description: 'Daily: ₱70 | Extra: ₱90 | Hot: ₱60', base_price: 70 },
        { category_id: categoryMap['coffee'], name: 'Biscoff Latte', description: 'Daily: ₱80 | Extra: ₱99', base_price: 80 },
        { category_id: categoryMap['coffee'], name: 'Dirty Matcha', description: 'Daily: ₱80 | Extra: ₱99', base_price: 80 },
        { category_id: categoryMap['coffee'], name: 'Klaséco Coffee', description: 'Daily: ₱80 | Extra: ₱99', base_price: 80 },
        // Non Coffee items
        { category_id: categoryMap['non-coffee'], name: 'Matcha Latte', description: 'Daily: ₱70 | Extra: ₱90', base_price: 70 },
        { category_id: categoryMap['non-coffee'], name: 'Blueberry Latte', description: 'Daily: ₱70 | Extra: ₱90', base_price: 70 },
        { category_id: categoryMap['non-coffee'], name: 'Strawberry Latte', description: 'Daily: ₱70 | Extra: ₱90', base_price: 70 },
        { category_id: categoryMap['non-coffee'], name: 'Oreo Cream', description: 'Daily: ₱70 | Extra: ₱90', base_price: 70 },
        { category_id: categoryMap['non-coffee'], name: 'Milo Dinosaur', description: 'Daily: ₱70 | Extra: ₱90', base_price: 70 },
        { category_id: categoryMap['non-coffee'], name: 'Milky Biscoff', description: 'Daily: ₱70 | Extra: ₱90', base_price: 70 },
        { category_id: categoryMap['non-coffee'], name: 'Milky Choco', description: 'Daily: ₱70 | Extra: ₱90', base_price: 70 },
        { category_id: categoryMap['non-coffee'], name: 'Matcha Oreo', description: 'Daily: ₱80 | Extra: ₱99', base_price: 80 },
        { category_id: categoryMap['non-coffee'], name: 'Matcha Biscoff', description: 'Daily: ₱80 | Extra: ₱99', base_price: 80 },
        { category_id: categoryMap['non-coffee'], name: 'Matcha Caramel', description: 'Daily: ₱80 | Extra: ₱99', base_price: 80 },
        { category_id: categoryMap['non-coffee'], name: 'Blueberry Matcha', description: 'Daily: ₱80 | Extra: ₱99', base_price: 80 },
        { category_id: categoryMap['non-coffee'], name: 'Strawberry Matcha', description: 'Daily: ₱80 | Extra: ₱99', base_price: 80 },
        { category_id: categoryMap['non-coffee'], name: 'Strawberry Oreo', description: 'Daily: ₱80 | Extra: ₱99', base_price: 80 },
        // Fruit Sodas
        { category_id: categoryMap['fruit-sodas'], name: 'Lychee', description: 'Extra: ₱60', base_price: 60 },
        { category_id: categoryMap['fruit-sodas'], name: 'Blueberry', description: 'Extra: ₱60', base_price: 60 },
        { category_id: categoryMap['fruit-sodas'], name: 'Green Apple', description: 'Extra: ₱60', base_price: 60 },
        { category_id: categoryMap['fruit-sodas'], name: 'Strawberry', description: 'Extra: ₱60', base_price: 60 },
        { category_id: categoryMap['fruit-sodas'], name: 'Four Seasons', description: 'Extra: ₱60', base_price: 60 },
        { category_id: categoryMap['fruit-sodas'], name: 'Blue Lemonade', description: 'Extra: ₱60', base_price: 60 },
        { category_id: categoryMap['fruit-sodas'], name: 'Purple Soda', description: 'Extra: ₱70', base_price: 70 },
        { category_id: categoryMap['fruit-sodas'], name: 'Purple Strawberry', description: 'Extra: ₱70', base_price: 70 },
      ];

      const { error: itemsError } = await supabase.from('menu_items').insert(menuItems);
      if (itemsError) throw itemsError;

      // Step 6: Update add-ons
      setStatus('Updating add-ons...');
      await supabase.from('addons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      const addons = [
        { name: 'Nata', price: 10 },
        { name: 'Oreo', price: 15 },
        { name: 'Biscoff', price: 15 },
        { name: 'Espresso Shot', price: 20 }
      ];

      const { error: addonsError } = await supabase.from('addons').insert(addons);
      if (addonsError) throw addonsError;

      setStatus('✅ Menu updated successfully! You can now go back to the home page.');
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="bg-card p-8 rounded-lg border">
          <h1 className="text-3xl font-bold mb-4">Update Menu</h1>
          <p className="text-muted-foreground mb-6">
            Click the button below to update your menu with the new KlaséCo prices and items.
          </p>

          <Button 
            onClick={updateMenu} 
            disabled={loading}
            size="lg"
            className="w-full mb-4"
          >
            {loading ? 'Updating...' : 'Update Menu Now'}
          </Button>

          {status && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{status}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
