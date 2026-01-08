import { useState } from 'react';
import { Bell, Search, Moon, Sun, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface TopHeaderProps {
  onToggleSidebar: () => void;
}

export function TopHeader({ onToggleSidebar }: TopHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({ title: 'Search', description: `Searching for "${searchQuery}"...` });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('trozzy_auth_user');
    localStorage.removeItem('trozzy_logged_in_user');
    toast({ title: 'Logged Out', description: 'You have been logged out successfully' });
    navigate('/sign-in');
  };

  const handleProfile = () => {
    navigate('/settings');
    toast({ title: 'Profile', description: 'Opening profile settings...' });
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-4 gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-9 w-9" />
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search anything..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-80 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary" />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="relative">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">3</Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-popover">
              <div className="p-3 border-b"><h3 className="font-semibold">Notifications</h3></div>
              <div className="max-h-80 overflow-auto">
                <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                  <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-warning" /><span className="font-medium text-sm">Low Stock Alert</span></div>
                  <span className="text-xs text-muted-foreground mt-1">Smart Watch Pro is running low on stock</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                  <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-success" /><span className="font-medium text-sm">New Order</span></div>
                  <span className="text-xs text-muted-foreground mt-1">New order received from John Smith</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start p-3 cursor-pointer">
                  <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-destructive" /><span className="font-medium text-sm">Payment Failed</span></div>
                  <span className="text-xs text-muted-foreground mt-1">Payment failed for order ORD-2024-007</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary cursor-pointer" onClick={() => navigate('/content/notifications')}>View all notifications</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">Admin User</span>
                  <span className="text-xs text-muted-foreground">admin@trozzy.com</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover">
              <DropdownMenuItem className="cursor-pointer" onClick={handleProfile}>
                <User className="mr-2 h-4 w-4" />Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={handleSettings}>
                <Settings className="mr-2 h-4 w-4" />Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
