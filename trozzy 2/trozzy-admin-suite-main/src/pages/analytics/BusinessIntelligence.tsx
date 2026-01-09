import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Target, Zap, MapPin, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '')
  .toString()
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

type BiPayload = {
  success: boolean;
  data?: {
    dateFilter: string;
    categoryFilter: string;
    topProducts: { name: string; sales: number; revenue: number }[];
    lowPerformers: { name: string; sales: number; stock: number }[];
    regionData: { region: string; sales: number; orders: number }[];
    profitData: { month: string; profit: number; loss: number }[];
    insights: { id: string; type: string; title: string; description: string; impact: string; action: string }[];
  };
  message?: string;
  error?: string;
};

const BusinessIntelligence = () => {
  const { toast } = useToast();
  const [dateFilter, setDateFilter] = useState('30d');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedInsights, setSelectedInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BiPayload['data'] | null>(null);

  // Load persisted insights from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('trozzy_bi_insights');
    if (saved) setSelectedInsights(JSON.parse(saved));
  }, []);


  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setData(null);
          setError('Please sign in to view analytics.');
          return;
        }

        const response = await axios.get<BiPayload>(
          `${API_BASE_URL}/api/admin/analytics/bi?dateFilter=${dateFilter}&categoryFilter=${categoryFilter}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const payload = response.data;
        if (!payload?.success || !payload?.data) {
          throw new Error(payload?.message || payload?.error || 'Failed to load business intelligence');
        }

        if (!cancelled) setData(payload.data);
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load business intelligence';
        if (!cancelled) {
          setError(msg);
          setData(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [dateFilter, categoryFilter]);

  const COLORS = ['hsl(262, 83%, 58%)', 'hsl(243, 75%, 59%)', 'hsl(199, 89%, 48%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)'];

  const topProducts = data?.topProducts ?? [];
  const lowPerformers = data?.lowPerformers ?? [];
  const regionData = data?.regionData ?? [];
  const profitData = data?.profitData ?? [];
  const insights = data?.insights ?? [];

  const handleInsightAction = (insight: typeof insights[0]) => {
    const updated = selectedInsights.includes(insight.id)
      ? selectedInsights.filter(id => id !== insight.id)
      : [...selectedInsights, insight.id];
    setSelectedInsights(updated);
    localStorage.setItem('trozzy_bi_insights', JSON.stringify(updated));
    toast({ title: 'Insight Saved', description: `${insight.title} marked as actioned` });
  };

  const handleExport = () => {
    const exportData = [
      ...topProducts.map(p => ({ type: 'Top Product', name: p.name, sales: p.sales, revenue: `$${p.revenue}` })),
      ...regionData.map(r => ({ type: 'Region', region: r.region, sales: `$${r.sales}`, orders: r.orders })),
      ...profitData.map(p => ({ type: 'Profit/Loss', month: p.month, profit: `$${p.profit}`, loss: `$${p.loss}` })),
    ];
    const today = new Date().toISOString().split('T')[0];
    exportToCSV(exportData, `business-intelligence-${today}.csv`);
    toast({ title: 'Exported', description: 'Business intelligence data exported' });
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Lightbulb className="h-5 w-5 text-primary" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-info" />;
      case 'success':
        return <Target className="h-5 w-5 text-success" />;
      default:
        return <Zap className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Intelligence</h1>
          <p className="text-muted-foreground">
            AI-powered insights and predictions for your business.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-32 glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32 glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="fashion">Fashion</SelectItem>
              <SelectItem value="home">Home</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Badge className="gradient-primary text-primary-foreground">
            <Brain className="mr-2 h-4 w-4" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Top Selling & Low Performing Products */}
      <div className="grid gap-6 lg:grid-cols-2">
        {error && (
          <Card className="glass lg:col-span-2">
            <CardContent className="pt-6">
              <div className="text-destructive font-medium">{error}</div>
            </CardContent>
          </Card>
        )}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                    </div>
                  </div>
                  <Badge variant="secondary">${product.revenue.toLocaleString()}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Performing Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowPerformers.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-destructive">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Only {product.sales} sales</p>
                    </div>
                  </div>
                  <Badge variant="outline">{product.stock} in stock</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Region-wise Sales */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            Region-wise Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="sales"
                  nameKey="region"
                >
                  {regionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {regionData.map((region, index) => (
                <div key={region.region} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="font-medium text-sm">{region.region}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(region.sales / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-muted-foreground">{region.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profit vs Loss */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Profit vs Loss Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`]}
              />
              <Bar dataKey="profit" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} name="Profit" />
              <Bar dataKey="loss" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="Loss" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Smart Insights */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-xl space-y-3 border ${selectedInsights.includes(insight.id) ? 'bg-success/10 border-success/30' : 'bg-muted/50 border-border/50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <span className="font-semibold">{insight.title}</span>
                  </div>
                  <Badge
                    variant={insight.impact === 'Critical' ? 'destructive' : insight.impact === 'High' ? 'default' : 'secondary'}
                  >
                    {insight.impact}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
                <Button size="sm" variant={selectedInsights.includes(insight.id) ? 'secondary' : 'outline'} className="w-full" onClick={() => handleInsightAction(insight)}>
                  {selectedInsights.includes(insight.id) ? '✓ Actioned' : insight.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessIntelligence;
