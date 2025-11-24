import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { CartDrawer } from '@/components/CartDrawer';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

export default function MenuHomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Reorder: Coffee, Non Coffee, Fruit Sodas
      const orderedCategories = (data || []).sort((a, b) => {
        const order = ['Coffee', 'Non Coffee', 'Fruit Sodas'];
        return order.indexOf(a.name) - order.indexOf(b.name);
      });
      
      setCategories(orderedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-amber-50/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3">
                <img 
                  src="/klaseco-logo.png" 
                  alt="KlaséCo Logo" 
                  className="h-12 w-12 md:h-16 md:w-16 object-contain"
                />
                <img 
                  src="/bsit-logo.png" 
                  alt="BSIT Logo" 
                  className="h-12 w-12 md:h-16 md:w-16 object-contain"
                />
                <img 
                  src="/stacl-logo.png" 
                  alt="St. Anne College of Lucena Logo" 
                  className="h-12 w-12 md:h-16 md:w-16 object-contain"
                />
              </div>
              <div className="border-l-2 border-amber-300 pl-2 md:pl-3">
                <h1 className="text-xl md:text-2xl font-bold text-amber-900">KlaséCo</h1>
                <p className="text-xs md:text-sm text-amber-700 hidden sm:block">Where Ideas Brew</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-amber-800 border-amber-300 hover:bg-amber-100 hover:border-amber-400 font-semibold"
              onClick={() => navigate('/track-order')}
            >
              Track Order
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnpNNiAzNGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTM2IDM0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Welcome to KlaséCo
          </h2>
          <p className="text-3xl md:text-5xl font-serif italic tracking-wide text-amber-100">
            Where Ideas Brew
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h3 className="text-3xl md:text-4xl font-bold mb-10 text-center text-foreground">Our Menu</h3>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-md animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-5">
                  <div className="h-6 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => navigate(`/category/${category.slug}`)}
                className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-amber-100 to-amber-50">
                  <img
                    src={category.image_url ? `${category.image_url}?t=${Date.now()}` : ''}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    key={category.image_url}
                  />
                </div>
                <div className="p-5 md:p-6 bg-gradient-to-br from-white to-amber-50/30">
                  <h4 className="text-xl md:text-2xl font-semibold text-foreground group-hover:text-amber-800 transition-colors">
                    {category.name}
                  </h4>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Floating Cart Button */}
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

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
