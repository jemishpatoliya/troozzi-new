import { useEffect, useMemo, useState } from 'react';
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import axios from 'axios';

type DashboardPeriod = 'today' | 'week' | 'month';

type DashboardPayload = {
  success: boolean;
  data?: {
    current: {
      products: number;
      orders: number;
      revenue: number;
      customers: number;
      currency?: string;
    };
    analytics: {
      sales: { date: string; amount: number }[];
      visitors: { date: string; count: number }[];
      topProducts: { name: string; sales: number; revenue: number }[];
      conversionRate: number;
      bounceRate: number;
      avgSessionDuration: number;
    };
    lowStockProducts: { name: string; stock: number }[];
    notifications: { id: string; title: string; message: string; type: 'info' | 'warning' | 'error' | 'success'; enabled: boolean }[];
  };
  message?: string;
  error?: string;
};

const Dashboard = () => {
  const [period, setPeriod] = useState<DashboardPeriod>('today');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardPayload['data'] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setData(null);
          setError('Please sign in to view dashboard.');
          return;
        }

        const response = await axios.get<DashboardPayload>(`/api/admin/dashboard?period=${period}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const payload = response.data;
        if (!payload?.success || !payload?.data) {
          throw new Error(payload?.message || payload?.error || 'Failed to load dashboard');
        }

        if (!cancelled) setData(payload.data);
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load dashboard';
        if (!cancelled) {
          setError(msg);
          setData(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [period]);

  const currentStats = data?.current;
  const analytics = data?.analytics;
  const notifications = data?.notifications ?? [];
  const lowStockProducts = data?.lowStockProducts ?? [];

  const currencyCode = currentStats?.currency || 'INR';
  const currencyFormatter = useMemo(() => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currencyCode,
      });
    } catch (_err) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    }
  }, [currencyCode]);

  const formatCurrency = (value: number) => currencyFormatter.format(value);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList className="glass">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={currentStats?.products ?? (isLoading ? '...' : 0)}
          change="+2"
          changeType="positive"
          icon={Package}
          iconColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Total Orders"
          value={currentStats?.orders ?? (isLoading ? '...' : 0)}
          change="+12%"
          changeType="positive"
          icon={ShoppingCart}
          iconColor="bg-info/10 text-info"
        />
        <StatCard
          title="Revenue"
          value={typeof currentStats?.revenue === 'number' ? formatCurrency(currentStats.revenue) : isLoading ? '...' : formatCurrency(0)}
          change="+8.5%"
          changeType="positive"
          icon={DollarSign}
          iconColor="bg-success/10 text-success"
        />
        <StatCard
          title="Customers"
          value={currentStats?.customers ?? (isLoading ? '...' : 0)}
          change="+5%"
          changeType="positive"
          icon={Users}
          iconColor="bg-warning/10 text-warning"
        />
      </div>

      {error && (
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="text-destructive font-medium">{error}</div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Sales Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.sales ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Visitor Traffic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.visitors ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(analytics?.topProducts ?? []).map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {index + 1}
                    </span>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <Badge variant="secondary">{product.sales} sales</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.length > 0 && (
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex items-center gap-2 text-warning font-medium text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Low Stock Warning
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lowStockProducts.length} product(s) running low on stock
                  </p>
                </div>
              )}
              {notifications.filter((n) => n.enabled).slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.type === 'warning'
                      ? 'bg-warning/10 border-warning/20'
                      : notification.type === 'error'
                      ? 'bg-destructive/10 border-destructive/20'
                      : notification.type === 'success'
                      ? 'bg-success/10 border-success/20'
                      : 'bg-info/10 border-info/20'
                  }`}
                >
                  <div className="font-medium text-sm">{notification.title}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analytics?.conversionRate ?? 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bounce Rate</p>
                <p className="text-2xl font-bold">{analytics?.bounceRate ?? 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Session</p>
                <p className="text-2xl font-bold">{Math.floor((analytics?.avgSessionDuration ?? 0) / 60)}m {(analytics?.avgSessionDuration ?? 0) % 60}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
