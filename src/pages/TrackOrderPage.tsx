import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Coffee, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useSmartPolling } from '@/hooks/useSmartPolling';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  order_type: string;
  payment_method: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: Array<{
    quantity: number;
    unit_price: number;
    subtotal: number;
    menu_items: { name: string };
    order_item_addons: Array<{
      quantity: number;
      price: number;
      addons: { name: string };
    }>;
  }>;
}

const statusSteps = [
  { key: 'pending', label: 'Order Received', icon: Clock },
  { key: 'accepted', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'preparing', label: 'Preparing', icon: Coffee },
  { key: 'ready', label: 'Ready', icon: Bell },
  { key: 'served', label: 'Served', icon: CheckCircle2 },
];

export default function TrackOrderPage() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  const loadOrder = async () => {
    if (!orderId) return;

    try {
      // Remove # if present
      const cleanOrderId = orderId.replace('#', '').trim();
      
      // Check if it's a UUID or simple number
      const isUUID = cleanOrderId.includes('-') || cleanOrderId.length > 10;
      
      let foundOrder = null;
      
      if (isUUID) {
        // Search by UUID directly
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              quantity,
              unit_price,
              subtotal,
              menu_items (name),
              order_item_addons (
                quantity,
                price,
                addons (name)
              )
            )
          `)
          .eq('id', cleanOrderId)
          .single();
        
        if (!error) foundOrder = data;
      } else {
        // Search by simple number - get all orders and match
        const { data: allOrders } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              quantity,
              unit_price,
              subtotal,
              menu_items (name),
              order_item_addons (
                quantity,
                price,
                addons (name)
              )
            )
          `)
          .order('created_at', { ascending: false })
          .limit(1000);
        
        if (allOrders) {
          foundOrder = allOrders.find(o => getOrderNumber(o.id) === cleanOrderId);
        }
      }

      if (foundOrder) {
        setOrder(foundOrder);
        setNotFound(false);
      } else {
        setNotFound(true);
        setOrder(null);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      setNotFound(true);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      loadOrder();
    }
  }, [orderId]);

  useSmartPolling(loadOrder, {
    enabled: !!order && order.status !== 'served' && order.status !== 'cancelled',
    fastInterval: 5000,
    slowInterval: 10000,
  });

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    loadOrder();
  };

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    return statusSteps.findIndex(step => step.key === order.status);
  };

  const currentStepIndex = getCurrentStepIndex();

  // Generate simple order number from UUID
  const getOrderNumber = (id: string) => {
    // Convert first 8 chars of UUID to a number
    const hex = id.replace(/-/g, '').substring(0, 8);
    const num = parseInt(hex, 16);
    return (num % 900000 + 100000).toString(); // 6-digit number
  };

  const markAsComplete = async () => {
    if (!order) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'served' })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Order marked as complete!');
      loadOrder(); // Reload to show updated status
    } catch (error) {
      console.error('Error marking order as complete:', error);
      toast.error('Failed to mark order as complete');
    }
  };

  const printReceipt = () => {
    if (!order) return;
    
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${getOrderNumber(order.id)}</title>
        <style>
          body { font-family: 'Courier New', monospace; max-width: 300px; margin: 20px auto; padding: 20px; }
          h1 { text-align: center; font-size: 24px; margin-bottom: 5px; }
          .subtitle { text-align: center; font-size: 14px; margin-bottom: 20px; }
          .divider { border-top: 2px dashed #000; margin: 15px 0; }
          .row { display: flex; justify-content: space-between; margin: 5px 0; }
          .total { font-weight: bold; font-size: 18px; margin-top: 10px; }
          .center { text-align: center; }
          .small { font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>KlaséCo</h1>
        <div class="subtitle">Where Ideas Brew</div>
        <div class="divider"></div>
        <div class="row"><span>Order #:</span><span>${getOrderNumber(order.id)}</span></div>
        <div class="row"><span>Date:</span><span>${new Date(order.created_at).toLocaleString()}</span></div>
        <div class="row"><span>Customer:</span><span>${order.customer_name}</span></div>
        <div class="row"><span>Phone:</span><span>${order.customer_phone}</span></div>
        <div class="row"><span>Type:</span><span>${order.order_type === 'dine-in' ? 'Dine In' : 'Takeout'}</span></div>
        <div class="divider"></div>
        ${order.order_items.map(item => `
          <div class="row">
            <span>${item.quantity}x ${item.menu_items.name}</span>
            <span>₱${item.subtotal.toFixed(2)}</span>
          </div>
          ${item.order_item_addons.map(addon => `
            <div class="row small">
              <span>&nbsp;&nbsp;+ ${addon.addons.name}</span>
              <span>₱${(addon.price * addon.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
        `).join('')}
        <div class="divider"></div>
        <div class="row total">
          <span>TOTAL:</span>
          <span>₱${order.total_amount.toFixed(2)}</span>
        </div>
        <div class="row"><span>Payment:</span><span>${order.payment_method === 'cash' ? 'Cash' : 'GCash'}</span></div>
        <div class="divider"></div>
        <div class="center small">Thank you for your order!</div>
        <div class="center small">Visit us again soon!</div>
      </body>
      </html>
    `;

    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
    setTimeout(() => {
      receiptWindow.print();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
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
            <h1 className="text-xl md:text-2xl font-bold text-amber-900">Track Order</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <form onSubmit={handleTrack} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="orderId" className="sr-only">
                Order ID
              </Label>
              <Input
                id="orderId"
                placeholder="Enter your order ID"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                className="h-12 text-lg border-amber-300 focus:border-amber-500 rounded-xl"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="h-12 px-8 bg-amber-800 hover:bg-amber-900 rounded-xl font-semibold"
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </Button>
          </div>
        </form>

        {notFound && (
          <Card className="p-12 text-center bg-white border-amber-200 rounded-2xl shadow-lg">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-gray-700 text-lg">
              Order not found. Please check your order ID and try again.
            </p>
          </Card>
        )}

        {order && (
          <div className="space-y-8">
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-white border-amber-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-amber-900">Order #{getOrderNumber(order.id)}</h2>
                  <p className="text-amber-700 font-medium">{order.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-amber-700">Total</p>
                  <p className="text-3xl font-bold text-amber-800">
                    ₱{Number(order.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t border-amber-200 pt-4">
                <p className="text-sm font-semibold mb-3 text-amber-900">Items:</p>
                <ul className="space-y-2">
                  {order.order_items.map((item, idx) => (
                    <li key={idx} className="text-sm">
                      <div className="flex justify-between text-amber-900">
                        <span className="font-medium">{item.quantity}x {item.menu_items.name}</span>
                        <span>₱{item.subtotal.toFixed(2)}</span>
                      </div>
                      {item.order_item_addons.map((addon, addonIdx) => (
                        <div key={addonIdx} className="text-xs text-amber-700 ml-4">
                          + {addon.addons.name}
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>

            </Card>

            <Card className="p-6 md:p-8 bg-white border-amber-200 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold mb-8 text-center text-amber-900">Order Status</h3>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-8 md:left-10 top-10 w-1 bg-amber-200 rounded-full" style={{ height: 'calc(100% - 80px)' }} />
                <div
                  className="absolute left-8 md:left-10 top-10 w-1 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full transition-all duration-500"
                  style={{
                    height: currentStepIndex === statusSteps.length - 1 
                      ? 'calc(100% - 80px)' 
                      : `calc((100% - 80px) * ${currentStepIndex / (statusSteps.length - 1)})`,
                  }}
                />

                {/* Steps */}
                <div className="relative space-y-6 md:space-y-8">
                  {statusSteps.map((step, idx) => {
                    const isComplete = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex items-center gap-4 md:gap-6">
                        <div
                          className={cn(
                            'w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg',
                            isComplete
                              ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                              : 'bg-gray-200 text-gray-400',
                            isCurrent && order.status !== 'served' && 'ring-4 ring-amber-300 scale-110 animate-pulse'
                          )}
                        >
                          <Icon className="h-7 w-7 md:h-9 md:w-9" />
                        </div>
                        <div className="flex-1">
                          <p
                            className={cn(
                              'font-semibold text-base md:text-lg transition-colors',
                              isComplete ? 'text-amber-900' : 'text-gray-400'
                            )}
                          >
                            {step.label}
                          </p>
                          {isCurrent && order.status !== 'served' && (
                            <p className="text-sm text-amber-700 font-medium animate-pulse">In progress...</p>
                          )}
                          {isComplete && !isCurrent && (
                            <p className="text-xs text-amber-600">✓ Completed</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Action Buttons at Bottom */}
            {order.status === 'ready' && (
              <Card className="p-6 bg-white border-amber-200 rounded-2xl shadow-lg">
                <Button 
                  onClick={markAsComplete}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 rounded-xl shadow-lg text-lg"
                >
                  Mark Order as Complete
                </Button>
              </Card>
            )}

            {order.status === 'served' && (
              <Card className="p-6 bg-white border-amber-200 rounded-2xl shadow-lg space-y-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="text-green-800 font-bold text-xl">Order Completed!</p>
                  <p className="text-green-700 text-base mt-1">Thank you for your order</p>
                </div>
                <Button 
                  onClick={printReceipt}
                  className="w-full bg-amber-800 hover:bg-amber-900 py-6 rounded-xl font-bold text-lg"
                >
                  Print Receipt
                </Button>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
