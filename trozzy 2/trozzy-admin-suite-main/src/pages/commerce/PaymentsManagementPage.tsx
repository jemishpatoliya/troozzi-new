import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Search, Filter, CreditCard, Calendar, User, DollarSign, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'razorpay';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
  };
}

const mockPayments: Payment[] = [];

const PaymentsManagementPage = () => {
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const payments = mockPayments;
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = payment.razorpayOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredPayments.length / 20);
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * 20, currentPage * 20);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  const handleRefresh = async () => {
    try {
      // TODO: Implement API call to refresh payments
      toast({
        title: 'Payments refreshed',
        description: 'Payment data has been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh payments.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'info';
      default: return 'pending';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payments Management</h1>
          <p className="text-muted-foreground">View and manage payment transactions</p>
        </div>
        <Button onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
                    'INR'
                  )}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {payments.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {payments.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">
                  {payments.filter(p => p.status === 'failed').length}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="grid gap-4">
        {paginatedPayments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No payments found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No payments match your search criteria.'
                  : 'No payment transactions available.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          paginatedPayments.map((payment) => (
            <Card key={payment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {formatCurrency(payment.amount, payment.currency)}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={getStatusColor(payment.status)} />
                      <span className="text-sm text-muted-foreground capitalize">
                        {payment.paymentMethod}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(payment)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Order ID</div>
                    <div className="font-mono text-sm">{payment.razorpayOrderId}</div>
                  </div>
                  {payment.razorpayPaymentId && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Payment ID</div>
                      <div className="font-mono text-sm">{payment.razorpayPaymentId}</div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Customer</div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{payment.user.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{payment.user.email}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {payment.order && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Order</div>
                        <div className="font-semibold">{payment.order.orderNumber}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Order Total</div>
                        <div className="font-semibold">
                          {formatCurrency(payment.order.total, 'INR')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Payment Details Modal */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Order ID</Label>
                  <div className="font-mono text-sm mt-1">{selectedPayment.razorpayOrderId}</div>
                </div>
                {selectedPayment.razorpayPaymentId && (
                  <div>
                    <Label>Payment ID</Label>
                    <div className="font-mono text-sm mt-1">{selectedPayment.razorpayPaymentId}</div>
                  </div>
                )}
                <div>
                  <Label>Amount</Label>
                  <div className="font-semibold mt-1">
                    {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <StatusBadge status={getStatusColor(selectedPayment.status)} />
                  </div>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <div className="capitalize mt-1">{selectedPayment.paymentMethod}</div>
                </div>
                <div>
                  <Label>Date</Label>
                  <div className="mt-1">
                    {new Date(selectedPayment.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Label>Customer Information</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div>{selectedPayment.user.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div>{selectedPayment.user.email}</div>
                  </div>
                </div>
              </div>
              
              {selectedPayment.order && (
                <div className="border-t pt-4">
                  <Label>Order Information</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Order Number</div>
                      <div>{selectedPayment.order.orderNumber}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Order Status</div>
                      <StatusBadge status={selectedPayment.order.status} />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Order Total</div>
                      <div className="font-semibold">
                        {formatCurrency(selectedPayment.order.total, 'INR')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsManagementPage;
