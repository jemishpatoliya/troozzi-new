import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, TrendingUp, Users, Eye, ShoppingCart, Download } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import axios from 'axios';
import { exportToCSV } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type AnalyticsOverviewPayload = {
  success: boolean;
  data?: {
    pageViews: { date: string; views: number }[];
    sales: { date: string; amount: number }[];
    visitors: { date: string; count: number }[];
    topProducts: { name: string; sales: number; revenue: number }[];
    conversionRate: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  message?: string;
  error?: string;
};

const AnalyticsOverview = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverviewPayload['data'] | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(2024, 11, 9),
    to: new Date(2024, 11, 15),
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAnalytics(null);
          setError('Please sign in to view analytics.');
          return;
        }

        const from = dateRange.from ? dateRange.from.toISOString() : '';
        const to = dateRange.to ? dateRange.to.toISOString() : '';

        const response = await axios.get<AnalyticsOverviewPayload>(
          `/api/admin/analytics/overview?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const payload = response.data;
        if (!payload?.success || !payload?.data) {
          throw new Error(payload?.message || payload?.error || 'Failed to load analytics overview');
        }

        if (!cancelled) setAnalytics(payload.data);
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load analytics overview';
        if (!cancelled) {
          setError(msg);
          setAnalytics(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [dateRange.from, dateRange.to]);

  const COLORS = ['hsl(262, 83%, 58%)', 'hsl(243, 75%, 59%)', 'hsl(199, 89%, 48%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)'];

  const pieData = useMemo(() => {
    return (analytics?.topProducts ?? []).map((p) => ({
      name: p.name.split(' ').slice(0, 2).join(' '),
      value: p.sales,
    }));
  }, [analytics?.topProducts]);

  const handleExport = () => {
    if (!analytics) {
      toast({ title: 'Error', description: 'No analytics data available to export', variant: 'destructive' });
      return;
    }

    const exportData = [
      { metric: 'Page Views', value: analytics.pageViews.reduce((sum, p) => sum + p.views, 0) },
      { metric: 'Unique Visitors', value: analytics.visitors.reduce((sum, v) => sum + v.count, 0) },
      { metric: 'Conversion Rate', value: `${analytics.conversionRate}%` },
      { metric: 'Bounce Rate', value: `${analytics.bounceRate}%` },
      ...analytics.topProducts.map(p => ({ metric: `Top Product: ${p.name}`, value: p.sales })),
      ...analytics.sales.map(s => ({ metric: `Sales on ${s.date}`, value: `$${s.amount}` })),
    ];
    
    const today = new Date().toISOString().split('T')[0];
    exportToCSV(exportData, `analytics-report-${today}.csv`);
    toast({ title: 'Exported', description: `analytics-report-${today}.csv downloaded` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
          <p className="text-muted-foreground">
            Track your store's performance and key metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="glass justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleExport} className="gradient-primary text-primary-foreground">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold">
                  {analytics ? analytics.pageViews.reduce((sum, p) => sum + p.views, 0).toLocaleString() : isLoading ? '...' : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique Visitors</p>
                <p className="text-2xl font-bold">
                  {analytics ? analytics.visitors.reduce((sum, v) => sum + v.count, 0).toLocaleString() : isLoading ? '...' : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analytics ? `${analytics.conversionRate}%` : isLoading ? '...' : '0%'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bounce Rate</p>
                <p className="text-2xl font-bold">{analytics ? `${analytics.bounceRate}%` : isLoading ? '...' : '0%'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Traffic Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.pageViews ?? []}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(262, 83%, 58%)"
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Revenue by Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.sales ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              { (analytics?.topProducts ?? []).map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium">{product.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{product.sales} sales</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsOverview;
