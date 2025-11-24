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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center gap-3 md:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="text-amber-800 hover:text-amber-900 hover:bg-amber-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl md:text-2xl font-bold text-amber-900">{category?.name || 'Menu'}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-md animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-6 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No items available in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedProduct(item)}
                className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left"
              >
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-amber-100 to-amber-50">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="p-5 md:p-6 bg-gradient-to-br from-white to-amber-50/30">
                  <h3 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-amber-800 transition-colors">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-xs md:text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xl md:text-2xl font-bold text-amber-800">
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
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 rounded-full shadow-2xl h-14 w-14 md:h-16 md:w-16 z-50 bg-amber-800 hover:bg-amber-900 transition-all duration-300 hover:scale-110"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
          <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-600 text-white rounded-full h-6 w-6 md:h-7 md:w-7 flex items-center justify-center text-xs md:text-sm font-bold shadow-lg">
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
