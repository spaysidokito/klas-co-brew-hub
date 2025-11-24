import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, DollarSign, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
  is_available: boolean;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  order_type: string;
  payment_method: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export default function AdminDashboard() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, todaySales: 0 });
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    category_id: '',
    image_url: '',
  });
  const navigate = useNavigate();

  const getOrderNumber = (id: string) => {
    const hex = id.replace(/-/g, '').substring(0, 8);
    const num = parseInt(hex, 16);
    return (num % 900000 + 100000).toString();
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadMenuItems(), loadCategories(), loadOrders(), loadStats()]);
  };

  const loadMenuItems = async () => {
    const { data } = await supabase.from('menu_items').select('*').order('name');
    setMenuItems(data || []);
  };

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setOrders(data || []);
  };

  const loadStats = async () => {
    const { data: allOrders } = await supabase
      .from('orders')
      .select('total_amount, created_at, status')
      .in('status', ['preparing', 'ready', 'served']);

    if (allOrders) {
      const total = allOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const today = allOrders
        .filter(o => new Date(o.created_at).toDateString() === new Date().toDateString())
        .reduce((sum, o) => sum + Number(o.total_amount), 0);
      
      setStats({
        totalSales: total,
        totalOrders: allOrders.length,
        todaySales: today,
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete item');
    } else {
      toast.success('Item deleted');
      loadMenuItems();
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: !item.is_available })
      .eq('id', item.id);
    
    if (error) {
      toast.error('Failed to update item');
    } else {
      toast.success(`Item ${!item.is_available ? 'enabled' : 'disabled'}`);
      loadMenuItems();
    }
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.base_price || !formData.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    const itemData = {
      name: formData.name,
      description: formData.description || null,
      base_price: parseFloat(formData.base_price),
      category_id: formData.category_id,
      image_url: formData.image_url || null,
      is_available: true,
    };

    if (editingItem) {
      const { error } = await supabase
        .from('menu_items')
        .update(itemData)
        .eq('id', editingItem.id);
      
      if (error) {
        toast.error('Failed to update item');
      } else {
        toast.success('Item updated successfully');
        setEditingItem(null);
        resetForm();
        loadMenuItems();
      }
    } else {
      const { error } = await supabase.from('menu_items').insert(itemData);
      
      if (error) {
        toast.error('Failed to add item');
      } else {
        toast.success('Item added successfully');
        setShowAddModal(false);
        resetForm();
        loadMenuItems();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      base_price: '',
      category_id: '',
      image_url: '',
    });
  };

  const openEditModal = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      base_price: item.base_price.toString(),
      category_id: item.category_id,
      image_url: item.image_url || '',
    });
    setEditingItem(item);
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all transaction history? This cannot be undone.')) return;
    
    const { error } = await supabase
      .from('orders')
      .delete()
      .in('status', ['served', 'cancelled']);
    
    if (error) {
      toast.error('Failed to clear history');
    } else {
      toast.success('Transaction history cleared');
      loadOrders();
      loadStats();
    }
  };

  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category_id === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
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
              <h1 className="text-xl md:text-2xl font-bold text-amber-900">Admin Dashboard</h1>
              <p className="text-xs md:text-sm text-amber-700">Full system control</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-3xl font-bold text-green-700">₱{stats.totalSales.toFixed(2)}</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-600 opacity-50" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-blue-700">{stats.totalOrders}</p>
              </div>
              <Package className="h-12 w-12 text-blue-600 opacity-50" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-white border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Sales</p>
                <p className="text-3xl font-bold text-amber-700">₱{stats.todaySales.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-amber-600 opacity-50" />
            </div>
          </Card>
        </div>

        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-amber-900">Menu Items</h2>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('all')}
                    className={selectedCategory === 'all' ? 'bg-amber-800' : ''}
                  >
                    All
                  </Button>
                  {categories.map(cat => (
                    <Button
                      key={cat.id}
                      size="sm"
                      variant={selectedCategory === cat.id ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={selectedCategory === cat.id ? 'bg-amber-800' : ''}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </div>
              <Button 
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="bg-amber-800 hover:bg-amber-900"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredMenuItems.map(item => (
                <Card key={item.id} className="p-4 md:p-6 bg-white border-amber-200">
                  <div className="flex flex-col md:flex-row gap-4">
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full md:w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-amber-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <p className="text-xl font-bold text-amber-800">₱{item.base_price}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleAvailability(item)}
                          className={item.is_available ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}
                        >
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(item)}
                          className="border-amber-500 text-amber-700"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteItem(item.id)}
                          className="border-red-500 text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber-900">Transaction History</h2>
              <Button
                onClick={handleClearHistory}
                variant="outline"
                className="border-red-500 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
            <div className="space-y-4">
              {orders.map(order => (
                <Card key={order.id} className="p-4 md:p-6 bg-white border-amber-200">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-amber-900">#{getOrderNumber(order.id)}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'served' ? 'bg-green-100 text-green-700' :
                          order.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{order.customer_name} • {order.customer_phone}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(order.created_at), 'MMM dd, yyyy hh:mm a')} • {order.order_type} • {order.payment_method}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-800">₱{Number(order.total_amount).toFixed(2)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => {
            setShowAddModal(false);
            setEditingItem(null);
            resetForm();
          }} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl bg-white rounded-2xl shadow-2xl z-50 p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-amber-900 font-semibold">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2"
                  placeholder="e.g., Caramel Macchiato"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-amber-900 font-semibold">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-2"
                  placeholder="e.g., Daily: ₱70 | Extra: ₱90 | Hot: ₱60"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="base_price" className="text-amber-900 font-semibold">Base Price *</Label>
                <Input
                  id="base_price"
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  className="mt-2"
                  placeholder="70"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-amber-900 font-semibold">Category *</Label>
                <select
                  id="category"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="mt-2 w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="image_url" className="text-amber-900 font-semibold">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="mt-2"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveItem}
                  className="flex-1 bg-amber-800 hover:bg-amber-900"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </Button>
                <Button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
