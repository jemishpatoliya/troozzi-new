import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/ui/status-badge';
import { Bell, Play } from 'lucide-react';
import { initializeMockData, getNotifications, setNotifications, Notification } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const NotificationsPage = () => {
  const { toast } = useToast();
  const [notifications, setNotificationsState] = useState<Notification[]>([]);

  useEffect(() => { initializeMockData(); setNotificationsState(getNotifications()); }, []);

  const handleToggle = (id: string) => {
    const updated = notifications.map((n) => n.id === id ? { ...n, enabled: !n.enabled } : n);
    setNotificationsState(updated); setNotifications(updated);
  };

  const handleTrigger = (notification: Notification) => {
    toast({ title: notification.title, description: notification.message });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-3xl font-bold tracking-tight">Notifications</h1><p className="text-muted-foreground">Manage notification preferences.</p></div>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className="glass">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${notification.type === 'warning' ? 'bg-warning/10' : notification.type === 'error' ? 'bg-destructive/10' : notification.type === 'success' ? 'bg-success/10' : 'bg-info/10'}`}>
                  <Bell className={`h-5 w-5 ${notification.type === 'warning' ? 'text-warning' : notification.type === 'error' ? 'text-destructive' : notification.type === 'success' ? 'text-success' : 'text-info'}`} />
                </div>
                <div><p className="font-medium">{notification.title}</p><p className="text-sm text-muted-foreground">{notification.message}</p></div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={notification.enabled ? 'active' : 'inactive'} />
                <Switch checked={notification.enabled} onCheckedChange={() => handleToggle(notification.id)} />
                <Button size="sm" variant="outline" onClick={() => handleTrigger(notification)}><Play className="h-4 w-4 mr-1" />Test</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
