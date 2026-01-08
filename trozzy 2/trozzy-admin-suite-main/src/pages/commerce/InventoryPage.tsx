import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Search, AlertTriangle, Package, Plus, Minus } from 'lucide-react';
import { initializeMockData, getProducts, setProducts, Product, addAuditLog } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const InventoryPage = () => {
  const { toast } = useToast();
  const [products, setProductsState] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAmount, setBulkAmount] = useState('');

  useEffect(() => {
    initializeMockData();
    setProductsState(getProducts());
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  const handleStockUpdate = (productId: string, change: number) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock + change);
        return { ...p, stock: newStock };
      }
      return p;
    });
    setProductsState(updated);
    setProducts(updated);
    addAuditLog({ 
      user: 'Admin User', 
      action: 'Updated inventory', 
      module: 'Inventory', 
      timestamp: new Date().toISOString(), 
      details: `Changed stock by ${change > 0 ? '+' : ''}${change}` 
    });
    toast({ title: 'Success', description: 'Stock updated' });
  };

  const handleBulkUpdate = () => {
    const amount = parseInt(bulkAmount);
    if (isNaN(amount) || selectedIds.length === 0) {
      toast({ title: 'Error', description: 'Please select products and enter an amount', variant: 'destructive' });
      return;
    }

    const updated = products.map((p) => {
      if (selectedIds.includes(p.id)) {
        return { ...p, stock: Math.max(0, p.stock + amount) };
      }
      return p;
    });
    setProductsState(updated);
    setProducts(updated);
    setSelectedIds([]);
    setBulkAmount('');
    toast({ title: 'Success', description: `Updated ${selectedIds.length} products` });
  };

  const columns = [
    {
      key: 'image',
      header: 'Image',
      render: (product: Product) => (
        <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
      ),
    },
    { key: 'name', header: 'Product' },
    { key: 'sku', header: 'SKU' },
    { key: 'category', header: 'Category' },
    {
      key: 'stock',
      header: 'Stock',
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <span className={
            product.stock === 0 ? 'text-destructive font-medium' :
            product.stock <= 5 ? 'text-warning font-medium' :
            'text-foreground'
          }>
            {product.stock}
          </span>
          {product.stock === 0 && <Badge variant="destructive" className="text-xs">Out of Stock</Badge>}
          {product.stock > 0 && product.stock <= 5 && <Badge className="bg-warning text-warning-foreground text-xs">Low</Badge>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Quick Update',
      render: (product: Product) => (
        <div className="flex items-center gap-1">
          <Button 
            size="icon" 
            variant="outline" 
            className="h-8 w-8" 
            onClick={() => handleStockUpdate(product.id, -1)}
            disabled={product.stock === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleStockUpdate(product.id, 1)}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleStockUpdate(product.id, 10)}>+10</Button>
          <Button size="sm" variant="outline" onClick={() => handleStockUpdate(product.id, 50)}>+50</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Track and manage your stock levels.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-bold">{totalStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="glass border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map((product) => (
                <Badge key={product.id} variant="outline" className="border-warning text-warning">
                  {product.name} ({product.stock} left)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        {selectedIds.length > 0 && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
            <Input type="number" placeholder="Amount" value={bulkAmount} onChange={(e) => setBulkAmount(e.target.value)} className="w-24" />
            <Button onClick={handleBulkUpdate} variant="outline">Bulk Update</Button>
          </div>
        )}
      </div>

      <DataTable
        data={filteredProducts}
        columns={columns}
        selectable
        onSelectionChange={setSelectedIds}
        emptyMessage="No products found"
      />
    </div>
  );
};

export default InventoryPage;
