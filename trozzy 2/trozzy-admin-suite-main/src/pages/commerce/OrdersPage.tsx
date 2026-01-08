import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Search, Eye, Package, Clock, Truck, CheckCircle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ordersAPI } from '@/api/support';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  total: number;
  items: number;
  date: string;
  paymentMethod: string;
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'returned';
}

const OrdersPage = () => {
  const { toast } = useToast();
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tabFilter, setTabFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getAllOrders();
      if (response.success) {
        setOrdersState(response.data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to load orders',
        variant: 'destructive'
      });
    }
  };

  const getFilteredOrders = () => {
    return orders.filter((order) => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesTab = tabFilter === 'all' || order.status === tabFilter;
      return matchesSearch && matchesStatus && matchesTab;
    });
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await ordersAPI.updateOrderStatus(orderId, { status: newStatus });
      if (response.success) {
        const updated = orders.map((o) => o.id === orderId ? { ...o, status: newStatus } : o);
        setOrdersState(updated);
        toast({ title: 'Success', description: `Order status updated to ${newStatus}` });
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update order status',
        variant: 'destructive'
      });
    }
  };

  const getStatusCounts = () => ({
    all: orders.length,
    new: orders.filter((o) => o.status === 'new').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    returned: orders.filter((o) => o.status === 'returned').length,
  });

  const counts = getStatusCounts();

  const columns = [
    { key: 'orderNumber', header: 'Order #' },
    { key: 'customer', header: 'Customer' },
    { key: 'email', header: 'Email' },
    {
      key: 'total',
      header: 'Total',
      render: (order: Order) => `$${order.total.toFixed(2)}`,
    },
    {
      key: 'items',
      header: 'Items',
      render: (order: Order) => order.items,
    },
    { key: 'date', header: 'Date' },
    { key: 'paymentMethod', header: 'Payment' },
    {
      key: 'status',
      header: 'Status',
      render: (order: Order) => <StatusBadge status={order.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (order: Order) => (
        <Button size="icon" variant="ghost" onClick={() => setSelectedOrder(order)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const filteredOrders = getFilteredOrders();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and track your orders.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New</p>
                <p className="text-2xl font-bold">{counts.new}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{counts.processing}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shipped</p>
                <p className="text-2xl font-bold">{counts.shipped}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{counts.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <RotateCcw className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Returned</p>
                <p className="text-2xl font-bold">{counts.returned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tabFilter} onValueChange={setTabFilter}>
        <TabsList className="glass">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="new">New ({counts.new})</TabsTrigger>
          <TabsTrigger value="shipped">Shipped ({counts.shipped})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({counts.delivered})</TabsTrigger>
          <TabsTrigger value="returned">Returned ({counts.returned})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable data={filteredOrders} columns={columns} emptyMessage="No orders found" />

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-medium">{selectedOrder.orderNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedOrder.date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.customer}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedOrder.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-medium">${selectedOrder.total.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Update Status</p>
                <Select value={selectedOrder.status} onValueChange={(v: Order['status']) => {
                  handleStatusChange(selectedOrder.id, v);
                  setSelectedOrder({ ...selectedOrder, status: v });
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
