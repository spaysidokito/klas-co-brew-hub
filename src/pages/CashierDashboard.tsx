import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Phone, User, Calculator, History, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    menu_items: { name: string };
  }>;
}

export default function CashierDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [calcTotal, setCalcTotal] = useState('');
  const [calcReceived, setCalcReceived] = useState('');
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

  const loadHistory = async () => {
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
        .in('status', ['preparing', 'ready', 'served', 'cancelled'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistoryOrders(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const getOrderNumber = (id: string) => {
    const hex = id.replace(/-/g, '').substring(0, 8);
    const num = parseInt(hex, 16);
    return (num % 900000 + 100000).toString();
  };

  const calculateChange = () => {
    const total = parseFloat(calcTotal) || 0;
    const received = parseFloat(calcReceived) || 0;
    return received - total;
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

  const handleOpenCalculator = (order: Order) => {
    // Open calculator with order details (don't accept yet)
    setCurrentOrder(order);
    setCalcTotal(order.total_amount.toString());
    setCalcReceived('');
    setShowCalculator(true);
  };

  const handleConfirmPayment = async () => {
    if (!currentOrder) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'preparing' })
        .eq('id', currentOrder.id);

      if (error) throw error;
      
      toast.success('Payment confirmed! Order is now preparing.');
      setShowCalculator(false);
      setCurrentOrder(null);
      setCalcTotal('');
      setCalcReceived('');
      loadOrders();
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
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
                <h1 className="text-xl md:text-2xl font-bold text-amber-900">Cashier Dashboard</h1>
                <p className="text-xs md:text-sm text-amber-700">Pending Orders: {orders.length}</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/barista')}
              variant="outline"
              className="border-amber-600 text-amber-800 hover:bg-amber-50"
              size="sm"
            >
              Switch to Barista
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <Tabs defaultValue="pending" className="w-full" onValueChange={(v) => v === 'history' && loadHistory()}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="pending">Pending Orders</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
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
                  <h3 className="text-2xl font-bold text-amber-800">
                    #{getOrderNumber(order.id)}
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
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleOpenCalculator(order)}
                  >
                    Accept Order
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
                          <Badge className={
                            order.status === 'served' ? 'bg-green-600' :
                            order.status === 'ready' ? 'bg-blue-600' :
                            order.status === 'preparing' ? 'bg-orange-600' :
                            order.status === 'cancelled' ? 'bg-red-600' :
                            'bg-amber-600'
                          }>
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

      {/* Calculator Modal */}
      {showCalculator && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowCalculator(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-xl bg-white rounded-3xl shadow-2xl z-50 p-6 md:p-8 max-h-[95vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentOrder?.payment_method === 'cash' ? 'Cash' : 'GCash'} Payment - Order #{currentOrder ? getOrderNumber(currentOrder.id) : ''}
            </h2>
            <p className="text-gray-400 mb-6">{currentOrder?.customer_name}</p>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order Total</span>
                <span className="text-3xl font-bold text-gray-800">₱{parseFloat(calcTotal || '0').toFixed(2)}</span>
              </div>

              <div>
                <p className="text-gray-600 mb-2">Amount Received</p>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-4xl font-bold text-gray-800">₱{calcReceived || '0'}</p>
                </div>
              </div>
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => setCalcReceived(calcReceived + num.toString())}
                  className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl p-6 md:p-8 text-2xl md:text-3xl font-semibold text-gray-700 transition-colors"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setCalcReceived(calcReceived + '.')}
                className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl p-6 md:p-8 text-2xl md:text-3xl font-semibold text-gray-700 transition-colors"
              >
                .
              </button>
              <button
                onClick={() => setCalcReceived(calcReceived + '0')}
                className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl p-6 md:p-8 text-2xl md:text-3xl font-semibold text-gray-700 transition-colors"
              >
                0
              </button>
              <button
                onClick={() => setCalcReceived(calcReceived + '00')}
                className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl p-6 md:p-8 text-2xl md:text-3xl font-semibold text-gray-700 transition-colors"
              >
                00
              </button>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-5 gap-2 md:gap-3 mb-4">
              {[20, 50, 100, 500, 1000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setCalcReceived((parseFloat(calcReceived || '0') + amount).toString())}
                  className="border-2 border-amber-600 text-amber-700 hover:bg-amber-50 active:bg-amber-100 rounded-lg py-3 md:py-4 font-semibold text-sm md:text-base transition-colors"
                >
                  ₱{amount}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => setCalcReceived('')}
                className="border-2 border-red-300 text-red-600 hover:bg-red-50 rounded-lg py-3 font-semibold transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setCalcReceived(calcReceived.slice(0, -1))}
                className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg py-3 font-semibold transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setShowCalculator(false)}
                className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg py-3 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Change Display & Confirm */}
            {calculateChange() >= 0 && calcReceived && (
              <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-4 text-center">
                <p className="text-sm text-green-700 font-medium mb-1">Change</p>
                <p className="text-3xl font-bold text-green-800">₱{calculateChange().toFixed(2)}</p>
              </div>
            )}

            <button
              onClick={handleConfirmPayment}
              disabled={!calcReceived || calculateChange() < 0}
              className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl py-4 text-lg font-bold transition-colors"
            >
              Accept Payment & Confirm Order
            </button>
          </div>
        </>
      )}
    </div>
  );
}
