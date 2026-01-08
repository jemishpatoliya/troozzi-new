import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image, Upload, Trash2, Eye } from 'lucide-react';
import { initializeMockData, getMediaItems, setMediaItems, MediaItem, generateId } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const MediaLibraryPage = () => {
  const { toast } = useToast();
  const [media, setMediaState] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { initializeMockData(); setMediaState(getMediaItems()); }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newItem: MediaItem = {
          id: generateId(),
          name: file.name,
          url: base64,
          type: file.type,
          size: file.size,
          usageCount: 0,
          uploadedAt: new Date().toISOString().split('T')[0]
        };
        setMediaState(prev => {
          const updated = [newItem, ...prev];
          setMediaItems(updated);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });

    toast({ title: 'Uploaded', description: `${files.length} file(s) uploaded successfully` });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string) => {
    const updated = media.filter((m) => m.id !== id);
    setMediaState(updated);
    setMediaItems(updated);
    toast({ title: 'Deleted', description: 'File deleted successfully' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight">Media Library</h1><p className="text-muted-foreground">Manage your images and files.</p></div>
        <div>
          <input ref={fileInputRef} type="file" accept="image/*,application/pdf" multiple onChange={handleFileUpload} className="hidden" />
          <Button onClick={() => fileInputRef.current?.click()} className="gradient-primary text-primary-foreground">
            <Upload className="mr-2 h-4 w-4" />Upload Files
          </Button>
        </div>
      </div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {media.map((item) => (
          <Card key={item.id} className="glass group overflow-hidden">
            <div className="aspect-square relative">
              {item.type.startsWith('image/') ? (
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-2xl">📄</span>
                </div>
              )}
              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary" onClick={() => setSelectedItem(item)}><Eye className="h-4 w-4" /></Button>
                <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <CardContent className="p-2">
              <p className="text-xs truncate">{item.name}</p>
              <Badge variant="secondary" className="text-xs mt-1">{item.usageCount} uses</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>File Preview</DialogTitle></DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.type.startsWith('image/') ? (
                <img src={selectedItem.url} alt={selectedItem.name} className="w-full rounded-lg" />
              ) : (
                <div className="p-8 bg-muted rounded-lg text-center">
                  <span className="text-4xl">📄</span>
                  <p className="mt-2">{selectedItem.name}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Name:</span> {selectedItem.name}</div>
                <div><span className="text-muted-foreground">Size:</span> {(selectedItem.size / 1024).toFixed(0)} KB</div>
                <div><span className="text-muted-foreground">Type:</span> {selectedItem.type}</div>
                <div><span className="text-muted-foreground">Uploaded:</span> {selectedItem.uploadedAt}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaLibraryPage;
