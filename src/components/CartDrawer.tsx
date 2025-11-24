import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeout'>('dine-in');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash'>('cash');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('Please fill in your name and phone number');
      return;
    }

    setSubmitting(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName,
          customer_phone: customerPhone,
          order_type: orderType,
          payment_method: paymentMethod,
          status: 'pending',
          total_amount: totalAmount,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      for (const item of items) {
        const { data: orderItem, error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            menu_item_id: item.menuItemId,
            quantity: item.quantity,
            unit_price: item.basePrice,
            subtotal: item.basePrice * item.quantity,
            notes: item.notes,
          })
          .select()
          .single();

        if (itemError) throw itemError;

        // Create order item addons
        if (item.addons.length > 0) {
          const addonInserts = item.addons.map(addon => ({
            order_item_id: orderItem.id,
            addon_id: addon.id,
            quantity: addon.quantity,
            price: addon.price,
          }));

          const { error: addonError } = await supabase
            .from('order_item_addons')
            .insert(addonInserts);

          if (addonError) throw addonError;
        }
      }

      toast.success('Order placed successfully!');
      clearCart();
      onClose();
      navigate(`/track-order?id=${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Your Cart</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 bg-secondary/50 rounded-lg p-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.addons.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          + {item.addons.map(a => a.name).join(', ')}
                        </p>
                      )}
                      <p className="font-medium text-primary mt-1">
                        ₱{((item.basePrice + item.addons.reduce((sum, a) => sum + a.price * a.quantity, 0)) * item.quantity).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 ml-auto text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="Your phone number"
                  />
                </div>

                <div>
                  <Label>Order Type</Label>
                  <RadioGroup value={orderType} onValueChange={(v: any) => setOrderType(v)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dine-in" id="dine-in" />
                      <Label htmlFor="dine-in">Dine In</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="takeout" id="takeout" />
                      <Label htmlFor="takeout">Takeout</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash">Cash</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gcash" id="gcash" />
                      <Label htmlFor="gcash">GCash</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between text-lg font-semibold pt-4 border-t">
                  <span>Total</span>
                  <span className="text-primary">₱{totalAmount.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
