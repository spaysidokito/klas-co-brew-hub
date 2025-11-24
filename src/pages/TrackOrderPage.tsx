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
        .eq('id', orderId)
        .single();

      if (error) {
        setNotFound(true);
        setOrder(null);
      } else {
        setOrder(data);
        setNotFound(false);
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Track Order</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <form onSubmit={handleTrack} className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="orderId" className="sr-only">
                Order ID
              </Label>
              <Input
                id="orderId"
                placeholder="Enter your order ID"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Tracking...' : 'Track Order'}
            </Button>
          </div>
        </form>

        {notFound && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
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

              {order.status === 'served' && (
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <Button 
                    onClick={printReceipt}
                    className="w-full bg-amber-800 hover:bg-amber-900"
                  >
                    Print Receipt
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-6 text-center">Order Status</h3>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border" />
                <div
                  className="absolute left-8 top-8 w-0.5 bg-primary transition-all duration-500"
                  style={{
                    height: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                  }}
                />

                {/* Steps */}
                <div className="relative space-y-8">
                  {statusSteps.map((step, idx) => {
                    const isComplete = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex items-center gap-4">
                        <div
                          className={cn(
                            'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300',
                            isComplete
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground',
                            isCurrent && 'ring-4 ring-primary/20 scale-110'
                          )}
                        >
                          <Icon className="h-7 w-7" />
                        </div>
                        <div>
                          <p
                            className={cn(
                              'font-medium transition-colors',
                              isComplete ? 'text-foreground' : 'text-muted-foreground'
                            )}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-primary">In progress...</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
