import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ruler } from 'lucide-react';
import { useState } from 'react';

const SizeGuidesPage = () => {
  const [category, setCategory] = useState('apparel');
  const [sizes, setSizes] = useState([
    { size: 'S', chest: '34-36"', waist: '28-30"', hips: '34-36"' },
    { size: 'M', chest: '38-40"', waist: '32-34"', hips: '38-40"' },
    { size: 'L', chest: '42-44"', waist: '36-38"', hips: '42-44"' },
    { size: 'XL', chest: '46-48"', waist: '40-42"', hips: '46-48"' },
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-3xl font-bold tracking-tight">Size Guides</h1><p className="text-muted-foreground">Configure size charts for products.</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader><CardTitle className="flex items-center gap-2"><Ruler className="h-5 w-5 text-primary" />Edit Size Guide</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="apparel">Apparel</SelectItem><SelectItem value="shoes">Shoes</SelectItem><SelectItem value="accessories">Accessories</SelectItem></SelectContent></Select>
            <Table>
              <TableHeader><TableRow><TableHead>Size</TableHead><TableHead>Chest</TableHead><TableHead>Waist</TableHead><TableHead>Hips</TableHead></TableRow></TableHeader>
              <TableBody>
                {sizes.map((size, i) => (
                  <TableRow key={size.size}>
                    <TableCell className="font-medium">{size.size}</TableCell>
                    <TableCell><Input value={size.chest} onChange={(e) => { const newSizes = [...sizes]; newSizes[i].chest = e.target.value; setSizes(newSizes); }} /></TableCell>
                    <TableCell><Input value={size.waist} onChange={(e) => { const newSizes = [...sizes]; newSizes[i].waist = e.target.value; setSizes(newSizes); }} /></TableCell>
                    <TableCell><Input value={size.hips} onChange={(e) => { const newSizes = [...sizes]; newSizes[i].hips = e.target.value; setSizes(newSizes); }} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-4 capitalize">{category} Size Guide</h3>
              <Table>
                <TableHeader><TableRow><TableHead>Size</TableHead><TableHead>Chest</TableHead><TableHead>Waist</TableHead><TableHead>Hips</TableHead></TableRow></TableHeader>
                <TableBody>{sizes.map((size) => (<TableRow key={size.size}><TableCell className="font-medium">{size.size}</TableCell><TableCell>{size.chest}</TableCell><TableCell>{size.waist}</TableCell><TableCell>{size.hips}</TableCell></TableRow>))}</TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SizeGuidesPage;
