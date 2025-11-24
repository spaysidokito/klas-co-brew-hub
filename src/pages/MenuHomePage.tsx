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
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coffee className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">KlaséCo</h1>
                <p className="text-sm text-muted-foreground">Premium Coffee Experience</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/staff')}
            >
              <span className="text-sm text-muted-foreground">Staff</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-4">Welcome to KlaséCo</h2>
          <p className="text-lg md:text-xl font-light opacity-90">
            Crafted with passion, served with excellence
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-3xl font-light mb-8 text-center">Our Menu</h3>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-lg overflow-hidden border border-border animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => navigate(`/category/${category.slug}`)}
                className="group bg-card rounded-lg overflow-hidden border border-border hover:border-primary transition-all duration-300 hover:shadow-lg text-left"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={category.image_url || ''}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors">
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
          className="fixed bottom-6 right-6 rounded-full shadow-lg h-16 w-16 z-50"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-7 w-7 flex items-center justify-center text-sm font-medium">
            {totalItems}
          </span>
        </Button>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
