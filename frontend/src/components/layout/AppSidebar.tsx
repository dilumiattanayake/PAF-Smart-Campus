import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, CalendarDays, Wrench, Bell, User, Settings,
  ClipboardList, Users, ChevronLeft, GraduationCap, LogOut, Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const userNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Resources', href: '/resources', icon: Building2 },
  { label: 'Bookings', href: '/bookings', icon: CalendarDays },
  { label: 'Tickets', href: '/tickets', icon: Wrench },
  { label: 'Notifications', href: '/notifications', icon: Bell },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Resources', href: '/resources', icon: Building2 },
  { label: 'Manage Bookings', href: '/admin/bookings', icon: CalendarDays },
  { label: 'Manage Tickets', href: '/admin/tickets', icon: ClipboardList },
  { label: 'Notifications', href: '/notifications', icon: Bell },
];

const techNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Tasks', href: '/technician/tasks', icon: Wrench },
  { label: 'Tickets', href: '/technician/tickets', icon: ClipboardList },
  { label: 'Notifications', href: '/notifications', icon: Bell },
];

const bottomNav: NavItem[] = [
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export const AppSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = user?.role === 'ADMIN' ? adminNav : user?.role === 'TECHNICIAN' ? techNav : userNav;

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn(
      "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
      !mobile && (collapsed ? "w-16" : "w-60")
    )}>
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
          <GraduationCap className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        {(!collapsed || mobile) && (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-accent-foreground">Smart Campus</span>
            <span className="text-[10px] text-sidebar-muted">Operations Hub</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-3 overflow-y-auto">
        {navItems.map(item => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {(!collapsed || mobile) && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border px-2 py-3 space-y-1">
        {bottomNav.map(item => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {(!collapsed || mobile) && <span>{item.label}</span>}
          </Link>
        ))}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!collapsed || mobile) && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle (desktop only) */}
      {!mobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-10 items-center justify-center border-t border-sidebar-border text-sidebar-muted hover:text-sidebar-accent-foreground transition-colors"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar trigger is in AppTopbar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-3 left-3 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-60">
          <SidebarContent mobile />
        </SheetContent>
      </Sheet>
    </>
  );
};
