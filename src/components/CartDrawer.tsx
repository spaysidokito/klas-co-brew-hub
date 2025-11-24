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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="sticky top-0 bg-gradient-to-r from-amber-800 to-amber-900 text-white p-5 md:p-6 shadow-lg z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold">Your Cart</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 rounded-full">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        <div className="p-5 md:p-6">

          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 bg-gradient-to-br from-amber-50 to-white rounded-2xl p-4 shadow-sm border border-amber-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-amber-900 truncate">{item.name}</h4>
                      {item.addons.length > 0 && (
                        <p className="text-xs text-amber-700 mt-1">
                          + {item.addons.map(a => a.name).join(', ')}
                        </p>
                      )}
                      <p className="font-bold text-amber-800 mt-2 text-lg">
                        ₱{((item.basePrice + item.addons.reduce((sum, a) => sum + a.price * a.quantity, 0)) * item.quantity).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-full border-amber-300 hover:bg-amber-100 hover:border-amber-400"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-full border-amber-300 hover:bg-amber-100 hover:border-amber-400"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 ml-auto text-red-600 hover:bg-red-50 rounded-full"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-amber-200 pt-6 space-y-5">
                <div>
                  <Label htmlFor="name" className="text-amber-900 font-semibold">Name</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Your name"
                    className="mt-2 border-amber-200 focus:border-amber-500 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-amber-900 font-semibold">Phone</Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="Your phone number"
                    className="mt-2 border-amber-200 focus:border-amber-500 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-amber-900 font-semibold">Order Type</Label>
                  <RadioGroup value={orderType} onValueChange={(v: any) => setOrderType(v)} className="mt-2">
                    <div className="flex items-center space-x-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
                      <RadioGroupItem value="dine-in" id="dine-in" className="border-amber-600" />
                      <Label htmlFor="dine-in" className="cursor-pointer flex-1">Dine In</Label>
                    </div>
                    <div className="flex items-center space-x-3 bg-amber-50 p-3 rounded-xl border border-amber-200 mt-2">
                      <RadioGroupItem value="takeout" id="takeout" className="border-amber-600" />
                      <Label htmlFor="takeout" className="cursor-pointer flex-1">Takeout</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-amber-900 font-semibold">Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)} className="mt-2">
                    <div className="flex items-center space-x-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
                      <RadioGroupItem value="cash" id="cash" className="border-amber-600" />
                      <Label htmlFor="cash" className="cursor-pointer flex-1">Cash</Label>
                    </div>
                    <div className="flex items-center space-x-3 bg-amber-50 p-3 rounded-xl border border-amber-200 mt-2">
                      <RadioGroupItem value="gcash" id="gcash" className="border-amber-600" />
                      <Label htmlFor="gcash" className="cursor-pointer flex-1">GCash</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between text-xl font-bold pt-4 border-t-2 border-amber-200 bg-amber-50 p-4 rounded-xl">
                  <span className="text-amber-900">Total</span>
                  <span className="text-amber-800">₱{totalAmount.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
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
