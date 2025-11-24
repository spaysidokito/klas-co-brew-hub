import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useSmartPolling } from '@/hooks/useSmartPolling';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

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
    id: string;
    quantity: number;
    menu_items: { name: string };
  }>;
}

export default function CashierDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            menu_items (name)
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setOrders(data || []);
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
    fastInterval: 3000,
    slowInterval: 10000,
    hasActivity: orders.length > 0,
  });

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'accepted' })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Order accepted!');
      loadOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Order cancelled');
      loadOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Failed to cancel order');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/staff')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Cashier Dashboard</h1>
              <p className="text-sm text-muted-foreground">Pending Orders: {orders.length}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No pending orders</p>
            <p className="text-sm text-muted-foreground mt-2">
              New orders will appear here automatically
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => (
              <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-primary">
                    #{order.id.slice(0, 8)}
                  </h3>
                  <Badge variant={order.order_type === 'dine-in' ? 'default' : 'secondary'}>
                    {order.order_type}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customer_phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <p className="text-sm font-medium mb-2">Items:</p>
                  <ul className="space-y-1">
                    {order.order_items.map(item => (
                      <li key={item.id} className="text-sm text-muted-foreground">
                        {item.quantity}x {item.menu_items.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ₱{Number(order.total_amount).toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleAcceptOrder(order.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleRejectOrder(order.id)}
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
