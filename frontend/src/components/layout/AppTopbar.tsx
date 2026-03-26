import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEffect, useState } from 'react';
import { notificationService } from '@/services/notificationService';
import type { Notification } from '@/types';

export const AppTopbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    (async () => {
      try {
        const data = await notificationService.getAll();
        setNotifications(data);
      } catch {
        // silently ignore for topbar
      }
    })();
  }, []);

  const getBreadcrumb = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    return segments.map((s, i) => ({
      label: s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '),
      href: '/' + segments.slice(0, i + 1).join('/'),
    }));
  };

  const breadcrumbs = getBreadcrumb();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 md:px-6">
      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((b, i) => (
          <span key={b.href} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-muted-foreground">/</span>}
            <Link
              to={b.href}
              className={i === breadcrumbs.length - 1 ? 'font-medium' : 'text-muted-foreground hover:text-foreground'}
            >
              {b.label}
            </Link>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="w-64 pl-9 h-9 bg-muted/50 border-0" />
        </div>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h4 className="text-sm font-semibold">Notifications</h4>
              <Link to="/notifications" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.slice(0, 5).map(n => (
                <div key={n.id} className={`px-4 py-3 border-b last:border-0 ${!n.isRead ? 'bg-primary/5' : ''}`}>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.name}</span>
                <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
