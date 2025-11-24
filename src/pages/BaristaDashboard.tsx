import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, History, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useSmartPolling } from '@/hooks/useSmartPolling';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';

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
    notes: string | null;
    menu_items: { name: string };
  }>;
}

export default function BaristaDashboard() {
  const [preparingOrders, setPreparingOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getOrderNumber = (id: string) => {
    const hex = id.replace(/-/g, '').substring(0, 8);
    const num = parseInt(hex, 16);
    return (num % 900000 + 100000).toString();
  };

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
        .eq('status', 'preparing')
        .order('created_at', { ascending: true});

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

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
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
        .in('status', ['ready', 'served'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistoryOrders(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
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
    <Card className="p-6 bg-white border-amber-200 hover:shadow-lg transition-shadow rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-3xl font-bold text-amber-800">
          #{getOrderNumber(order.id)}
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
        <Button className="w-full bg-green-600 hover:bg-green-700 py-6 rounded-xl font-semibold" onClick={() => handleMarkReady(order.id)}>
          Mark as Ready
        </Button>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/staff')}
                className="text-amber-800 hover:bg-amber-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-amber-900">Barista Dashboard</h1>
                <p className="text-xs md:text-sm text-amber-700">
                  Preparing: {preparingOrders.length} | Ready: {readyOrders.length}
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/cashier')}
              variant="outline"
              className="border-amber-600 text-amber-800 hover:bg-amber-50"
              size="sm"
            >
              Switch to Cashier
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <Tabs defaultValue="preparing" onValueChange={(v) => v === 'history' && loadHistory()}>
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-6">
            <TabsTrigger value="preparing">
              Preparing ({preparingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="ready">
              Ready ({readyOrders.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History
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
                <p className="text-xl text-gray-500">No ready orders</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {readyOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {historyOrders.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-xl text-gray-500">No order history</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyOrders.map(order => (
                  <Card key={order.id} className="p-4 md:p-6 bg-white border-amber-200 rounded-2xl">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-2xl font-bold text-amber-900">#{getOrderNumber(order.id)}</h3>
                          <Badge className={order.status === 'served' ? 'bg-green-600' : 'bg-blue-600'}>
                            {order.status}
                          </Badge>
                          <Badge variant="outline">{order.order_type}</Badge>
                        </div>
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{order.customer_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{order.customer_phone}</span>
                          </div>
                          <p className="text-xs text-gray-500">{format(new Date(order.created_at), 'MMM dd, yyyy hh:mm a')}</p>
                        </div>
                        <div className="border-t border-amber-200 pt-3">
                          <p className="text-sm font-semibold text-amber-900 mb-2">Items:</p>
                          <ul className="space-y-1">
                            {order.order_items.map(item => (
                              <li key={item.id} className="text-sm">
                                <span className="font-medium">{item.quantity}x {item.menu_items.name}</span>
                                {item.notes && (
                                  <p className="text-xs text-gray-600 italic ml-4">Note: {item.notes}</p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="text-right md:text-left md:w-32">
                        <p className="text-2xl font-bold text-amber-800">₱{Number(order.total_amount).toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">{order.payment_method}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
