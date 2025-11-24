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

type SizeOption = 'daily' | 'extra' | 'hot';

export const ProductDetailModal = ({ product, onClose }: ProductDetailModalProps) => {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [selectedSize, setSelectedSize] = useState<SizeOption>('daily');
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

  // Parse size prices from description
  const getSizePrice = () => {
    const desc = product.description || '';
    const dailyMatch = desc.match(/Daily:\s*₱(\d+)/);
    const extraMatch = desc.match(/Extra:\s*₱(\d+)/);
    const hotMatch = desc.match(/Hot:\s*₱(\d+)/);
    
    const prices = {
      daily: dailyMatch ? parseInt(dailyMatch[1]) : product.base_price,
      extra: extraMatch ? parseInt(extraMatch[1]) : product.base_price + 20,
      hot: hotMatch ? parseInt(hotMatch[1]) : product.base_price - 10,
    };
    
    return prices[selectedSize];
  };

  const hasSizeOptions = () => {
    const desc = product.description || '';
    return desc.includes('Daily:') || desc.includes('Extra:') || desc.includes('Hot:');
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

    const sizePrice = getSizePrice();
    const sizeName = selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1);

    addItem({
      menuItemId: product.id,
      name: `${product.name} (${sizeName})`,
      image: product.image_url || '',
      basePrice: sizePrice,
      quantity,
      addons: cartAddons,
      notes: notes.trim(),
    });

    toast.success('Added to cart!');
    onClose();
  };

  const sizePrice = getSizePrice();
  const totalPrice =
    (sizePrice +
      addons
        .filter(addon => selectedAddons.has(addon.id))
        .reduce((sum, addon) => sum + addon.price, 0)) *
    quantity;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-white/90 hover:bg-white rounded-full shadow-lg"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-700" />
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

          <div className="p-5 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-amber-900">{product.name}</h2>
            <p className="text-2xl md:text-3xl font-bold text-amber-800 mb-6">
              ₱{sizePrice.toFixed(0)}
            </p>

            <div className="space-y-5 md:space-y-6">
              {hasSizeOptions() && (
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-3 text-amber-900">Size</h3>
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {product.description?.includes('Daily:') && (
                      <button
                        onClick={() => setSelectedSize('daily')}
                        className={`p-3 md:p-4 border-2 rounded-xl transition-all shadow-sm ${
                          selectedSize === 'daily'
                            ? 'border-amber-600 bg-amber-50 shadow-md'
                            : 'border-gray-200 hover:border-amber-400 hover:shadow-md'
                        }`}
                      >
                        <div className="font-semibold text-sm md:text-base">Daily</div>
                        <div className="text-xs md:text-sm text-muted-foreground">16oz</div>
                        <div className="text-amber-800 font-bold mt-1 text-sm md:text-base">
                          ₱{product.description.match(/Daily:\s*₱(\d+)/)?.[1] || '70'}
                        </div>
                      </button>
                    )}
                    {product.description?.includes('Extra:') && (
                      <button
                        onClick={() => setSelectedSize('extra')}
                        className={`p-3 md:p-4 border-2 rounded-xl transition-all shadow-sm ${
                          selectedSize === 'extra'
                            ? 'border-amber-600 bg-amber-50 shadow-md'
                            : 'border-gray-200 hover:border-amber-400 hover:shadow-md'
                        }`}
                      >
                        <div className="font-semibold text-sm md:text-base">Extra</div>
                        <div className="text-xs md:text-sm text-muted-foreground">22oz</div>
                        <div className="text-amber-800 font-bold mt-1 text-sm md:text-base">
                          ₱{product.description.match(/Extra:\s*₱(\d+)/)?.[1] || '90'}
                        </div>
                      </button>
                    )}
                    {product.description?.includes('Hot:') && (
                      <button
                        onClick={() => setSelectedSize('hot')}
                        className={`p-3 md:p-4 border-2 rounded-xl transition-all shadow-sm ${
                          selectedSize === 'hot'
                            ? 'border-amber-600 bg-amber-50 shadow-md'
                            : 'border-gray-200 hover:border-amber-400 hover:shadow-md'
                        }`}
                      >
                        <div className="font-semibold text-sm md:text-base">Hot</div>
                        <div className="text-xs md:text-sm text-muted-foreground">12oz</div>
                        <div className="text-amber-800 font-bold mt-1 text-sm md:text-base">
                          ₱{product.description.match(/Hot:\s*₱(\d+)/)?.[1] || '60'}
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}
              {addons.length > 0 && (
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-3 text-amber-900">Add-ons</h3>
                  <div className="space-y-2 md:space-y-3">
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

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-amber-200">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl md:text-3xl font-bold text-amber-800">
                    ₱{totalPrice.toFixed(0)}
                  </p>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleAddToCart}
                  className="bg-amber-800 hover:bg-amber-900 text-white font-semibold py-6 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
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
