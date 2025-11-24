import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useSmartPolling } from '@/hooks/useSmartPolling';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Order {
  id: string;
  customer_name: string;
  order_type: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: Array<{
    id: string;
    quantity: number;
    notes: string | null;
    menu_items: { name: string };
  }>;
}

export default function BaristaDashboard() {
  const [preparingOrders, setPreparingOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadOrders = async () => {
    try {
      // Load preparing orders
      const { data: preparing, error: preparingError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            notes,
            menu_items (name)
          )
        `)
        .in('status', ['accepted', 'preparing'])
        .order('created_at', { ascending: true });

      if (preparingError) throw preparingError;

      // Load ready orders
      const { data: ready, error: readyError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            notes,
            menu_items (name)
          )
        `)
        .eq('status', 'ready')
        .order('created_at', { ascending: true });

      if (readyError) throw readyError;

      setPreparingOrders(preparing || []);
      setReadyOrders(ready || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useSmartPolling(loadOrders, {
    enabled: true,
    fastInterval: 5000,
    slowInterval: 10000,
    hasActivity: preparingOrders.length > 0,
  });

  const handleMarkReady = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'ready' })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Order marked as ready!');
      loadOrders();
    } catch (error) {
      console.error('Error marking order ready:', error);
      toast.error('Failed to update order');
    }
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-3xl font-bold text-primary">
          #{order.id.slice(0, 8)}
        </h3>
        <Badge variant={order.order_type === 'dine-in' ? 'default' : 'secondary'}>
          {order.order_type}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{order.customer_name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      <div className="border-t pt-4 mb-4">
        <p className="text-sm font-medium mb-2">Items:</p>
        <ul className="space-y-2">
          {order.order_items.map(item => (
            <li key={item.id} className="text-sm">
              <div className="flex items-start gap-2">
                <span className="font-medium">{item.quantity}x</span>
                <div>
                  <p>{item.menu_items.name}</p>
                  {item.notes && (
                    <p className="text-muted-foreground italic text-xs mt-1">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {order.status !== 'ready' && (
        <Button className="w-full" onClick={() => handleMarkReady(order.id)}>
          Mark as Ready
        </Button>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/staff')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Barista Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Preparing: {preparingOrders.length} | Ready: {readyOrders.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="preparing">
          <TabsList className="mb-6">
            <TabsTrigger value="preparing">
              Preparing ({preparingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="ready">
              Ready ({readyOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preparing">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/3 mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-5/6" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : preparingOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No orders to prepare</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {preparingOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ready">
            {readyOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No ready orders</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {readyOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
