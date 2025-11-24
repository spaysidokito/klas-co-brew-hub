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
  status: string;
  total_amount: number;
  created_at: string;
  order_items: Array<{
    quantity: number;
    menu_items: { name: string };
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
            menu_items (name)
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
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">Order #{order.id.slice(0, 8)}</h2>
                  <p className="text-muted-foreground">{order.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-primary">
                    ₱{Number(order.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Items:</p>
                <ul className="space-y-1">
                  {order.order_items.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      {item.quantity}x {item.menu_items.name}
                    </li>
                  ))}
                </ul>
              </div>
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
