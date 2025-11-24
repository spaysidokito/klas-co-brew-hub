import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { useCart } from '@/contexts/CartContext';
import { CartDrawer } from '@/components/CartDrawer';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  base_price: number;
  is_available: boolean;
}

interface Category {
  name: string;
}

export default function CategoryDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    loadCategoryAndItems();
  }, [slug]);

  const loadCategoryAndItems = async () => {
    try {
      // Load category
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('name')
        .eq('slug', slug)
        .single();

      if (categoryError) throw categoryError;
      setCategory(categoryData);

      // Load menu items
      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('*, categories!inner(slug)')
        .eq('categories.slug', slug)
        .eq('is_available', true)
        .order('name');

      if (itemsError) throw itemsError;
      setMenuItems(itemsData || []);
    } catch (error) {
      console.error('Error loading category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">{category?.name || 'Menu'}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-lg overflow-hidden border border-border animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-6 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items available in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedProduct(item)}
                className="group bg-card rounded-lg overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:shadow-lg text-left"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xl font-semibold text-primary">
                    ₱{Number(item.base_price).toFixed(2)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {totalItems > 0 && (
        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-full shadow-lg h-16 w-16 z-50"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-7 w-7 flex items-center justify-center text-sm font-medium">
            {totalItems}
          </span>
        </Button>
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
