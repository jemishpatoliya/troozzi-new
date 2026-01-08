import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Save, User } from 'lucide-react';
import { initializeMockData, getContentSettings, setContentSettings, ContentSettings } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const ContentPage = () => {
  const { toast } = useToast();
  const [settings, setSettingsState] = useState<ContentSettings>(getContentSettings());

  useEffect(() => { initializeMockData(); setSettingsState(getContentSettings()); }, []);

  const handleSave = () => { setContentSettings(settings); toast({ title: 'Success', description: 'Content settings saved' }); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-3xl font-bold tracking-tight">Content Settings</h1><p className="text-muted-foreground">Configure profile and content display options.</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader><CardTitle>Profile Settings</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2"><Label>Default Avatar URL</Label><Input value={settings.defaultAvatarUrl} onChange={(e) => setSettingsState({ ...settings, defaultAvatarUrl: e.target.value })} /></div>
            <div className="space-y-2"><Label>Bio Max Length</Label><Input type="number" value={settings.bioMaxLength} onChange={(e) => setSettingsState({ ...settings, bioMaxLength: parseInt(e.target.value) || 500 })} /></div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50"><div><p className="font-medium">Show Order History</p><p className="text-sm text-muted-foreground">Display order history on profile</p></div><Switch checked={settings.showOrderHistory} onCheckedChange={(checked) => setSettingsState({ ...settings, showOrderHistory: checked })} /></div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50"><div><p className="font-medium">Show Wishlist Count</p><p className="text-sm text-muted-foreground">Display wishlist count</p></div><Switch checked={settings.showWishlistCount} onCheckedChange={(checked) => setSettingsState({ ...settings, showWishlistCount: checked })} /></div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50"><div><p className="font-medium">Enable Profile Editing</p><p className="text-sm text-muted-foreground">Allow users to edit profiles</p></div><Switch checked={settings.enableProfileEditing} onCheckedChange={(checked) => setSettingsState({ ...settings, enableProfileEditing: checked })} /></div>
            <Button onClick={handleSave} className="w-full gradient-primary text-primary-foreground"><Save className="mr-2 h-4 w-4" />Save Settings</Button>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="p-6 rounded-lg bg-muted/50 space-y-4">
              <div className="flex items-center gap-4"><Avatar className="h-16 w-16"><AvatarImage src={settings.defaultAvatarUrl} /><AvatarFallback><User className="h-8 w-8" /></AvatarFallback></Avatar><div><p className="font-semibold">Sample User</p><p className="text-sm text-muted-foreground">sample@email.com</p></div></div>
              <div className="space-y-2"><p className="text-sm text-muted-foreground">Bio (max {settings.bioMaxLength} chars)</p><div className="h-20 rounded bg-background/50 p-3 text-sm text-muted-foreground">This is a sample bio...</div></div>
              {settings.showOrderHistory && <div className="p-3 rounded bg-background/50"><p className="text-sm font-medium">Order History</p><p className="text-xs text-muted-foreground">12 orders</p></div>}
              {settings.showWishlistCount && <div className="p-3 rounded bg-background/50"><p className="text-sm font-medium">Wishlist</p><p className="text-xs text-muted-foreground">5 items</p></div>}
              {settings.enableProfileEditing && <Button size="sm" variant="outline">Edit Profile</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentPage;
