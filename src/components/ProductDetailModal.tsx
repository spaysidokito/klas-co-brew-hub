import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useCart, CartAddon } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  base_price: number;
}

interface Addon {
  id: string;
  name: string;
  price: number;
}

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductDetailModal = ({ product, onClose }: ProductDetailModalProps) => {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    loadAddons();
  }, []);

  const loadAddons = async () => {
    const { data } = await supabase.from('addons').select('*').order('name');
    if (data) setAddons(data);
  };

  const toggleAddon = (addonId: string) => {
    const newSelected = new Set(selectedAddons);
    if (newSelected.has(addonId)) {
      newSelected.delete(addonId);
    } else {
      newSelected.add(addonId);
    }
    setSelectedAddons(newSelected);
  };

  const handleAddToCart = () => {
    const cartAddons: CartAddon[] = addons
      .filter(addon => selectedAddons.has(addon.id))
      .map(addon => ({
        id: addon.id,
        name: addon.name,
        price: addon.price,
        quantity: 1,
      }));

    addItem({
      menuItemId: product.id,
      name: product.name,
      image: product.image_url || '',
      basePrice: product.base_price,
      quantity,
      addons: cartAddons,
      notes: notes.trim(),
    });

    toast.success('Added to cart!');
    onClose();
  };

  const totalPrice =
    (product.base_price +
      addons
        .filter(addon => selectedAddons.has(addon.id))
        .reduce((sum, addon) => sum + addon.price, 0)) *
    quantity;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card rounded-lg shadow-2xl z-50 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {product.image_url && (
            <div className="aspect-video overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <h2 className="text-3xl font-semibold mb-2">{product.name}</h2>
            {product.description && (
              <p className="text-muted-foreground mb-6">{product.description}</p>
            )}

            <div className="space-y-6">
              {addons.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Add-ons</h3>
                  <div className="space-y-3">
                    {addons.map(addon => (
                      <div key={addon.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={addon.id}
                          checked={selectedAddons.has(addon.id)}
                          onCheckedChange={() => toggleAddon(addon.id)}
                        />
                        <Label
                          htmlFor={addon.id}
                          className="flex-1 cursor-pointer flex items-center justify-between"
                        >
                          <span>{addon.name}</span>
                          <span className="text-primary font-medium">
                            +₱{addon.price.toFixed(2)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any special requests?"
                  rows={3}
                />
              </div>

              <div>
                <Label>Quantity</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-2xl font-medium w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-3xl font-semibold text-primary">
                    ₱{totalPrice.toFixed(2)}
                  </p>
                </div>
                <Button size="lg" onClick={handleAddToCart}>
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
