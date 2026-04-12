import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCheck, Trash2, Bell, AlertCircle, Calendar, Zap, Filter, ArrowUpDown, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { StatCard } from '@/components/shared/StatCard';
import { notificationService } from '@/services/notificationService';
import type { Notification } from '@/types';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : filter === 'read'
      ? notifications.filter(n => n.isRead)
      : notifications;

  const typeFilteredAndRead = typeFilter === 'all'
    ? filtered
    : filtered.filter(n => {
        const baseType = n.type?.includes('BOOKING') ? 'BOOKING' :
                        n.type?.includes('TICKET') ? 'TICKET' :
                        n.type === 'COMMENT' ? 'COMMENT' :
                        n.type === 'SYSTEM' ? 'SYSTEM' : 'OTHER';
        return baseType === typeFilter;
      });

  const sorted = [...typeFilteredAndRead].sort((a, b) => {
    switch (sortOrder) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'unread-first':
        const aUnread = !a.isRead ? 0 : 1;
        const bUnread = !b.isRead ? 0 : 1;
        if (aUnread !== bUnread) return aUnread - bUnread;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'priority':
        const priorityMap: Record<string, number> = {
          'TICKET_ASSIGNED': 1,
          'BOOKING_STATUS': 2,
          'TICKET_STATUS': 3,
          'COMMENT': 4,
          'BOOKING': 5,
          'TICKET': 5,
          'SYSTEM': 6,
          'RESOURCE': 7,
        };
        const aPriority = priorityMap[a.type] || 10;
        const bPriority = priorityMap[b.type] || 10;
        if (aPriority !== bPriority) return aPriority - bPriority;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const markAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    notificationService.markAllAsRead().catch(() => {});
    toast({ title: 'All notifications marked as read' });
  };

  const markRead = async (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    notificationService.markAsRead(id).catch(() => {});
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    try {
      await notificationService.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast({ title: 'Notification deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete notification', variant: 'destructive' });
    }
  };

  const deleteAllNotifications = async () => {
    if (notifications.length === 0) return;
    try {
      await notificationService.deleteAll();
      setNotifications([]);
      setSelected(new Set());
      toast({ title: 'All notifications deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete all notifications', variant: 'destructive' });
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const toggleSelectAll = () => {
    if (selected.size === sorted.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sorted.map(n => n.id)));
    }
  };

  const markSelectedAsRead = async () => {
    try {
      for (const id of selected) {
        await notificationService.markAsRead(id);
      }
      setNotifications(notifications.map(n => 
        selected.has(n.id!) ? { ...n, isRead: true } : n
      ));
      setSelected(new Set());
      toast({ title: `${selected.size} notification(s) marked as read` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to mark as read', variant: 'destructive' });
    }
  };

  const deleteSelected = async () => {
    try {
      for (const id of selected) {
        await notificationService.delete(id);
      }
      setNotifications(notifications.filter(n => !selected.has(n.id!)));
      setSelected(new Set());
      toast({ title: `${selected.size} notification(s) deleted` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete notifications', variant: 'destructive' });
    }
  };

  const goToNotification = (n: Notification) => {
    const base = n.type?.toString();
    if (base?.startsWith('TICKET') || base === 'COMMENT') {
      if (n.referenceId) navigate(`/tickets/${n.referenceId}`);
      else navigate('/tickets');
    } else if (base?.startsWith('BOOKING')) {
      if (n.referenceId) navigate(`/bookings/${n.referenceId}`);
      else navigate('/bookings');
    } else {
      navigate('/notifications');
    }
    markRead(n.id);
  };

  const typeIcon: Record<string, string> = {
    BOOKING: '📅',
    BOOKING_STATUS: '📅',
    TICKET: '🔧',
    TICKET_STATUS: '🔧',
    TICKET_ASSIGNED: '👷',
    COMMENT: '💬',
    SYSTEM: '⚙️',
    RESOURCE: '🏛️',
  };

  const isToday = (date: string) => {
    const notifDate = new Date(date).toDateString();
    const today = new Date().toDateString();
    return notifDate === today;
  };

  const isTicketNotification = (type: string) => {
    return ['TICKET_ASSIGNED', 'TICKET_STATUS', 'TICKET'].includes(type);
  };

  const getTicketPriority = (type: string) => {
    switch (type) {
      case 'TICKET_ASSIGNED':
        return 'HIGH';
      case 'TICKET_STATUS':
        return 'MEDIUM';
      case 'TICKET':
      default:
        return 'LOW';
    }
  };

  const getPriorityColor = (type: string) => {
    if (!isTicketNotification(type)) return '';
    const priority = getTicketPriority(type);
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500';
      case 'MEDIUM':
        return 'bg-amber-500';
      case 'LOW':
      default:
        return 'bg-green-500';
    }
  };

  const getPriorityLabel = (type: string) => {
    if (!isTicketNotification(type)) return '';
    return getTicketPriority(type);
  };

  const todayCount = notifications.filter(n => isToday(n.createdAt)).length;
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriorityCount = notifications.filter(n => 
    isTicketNotification(n.type) && getTicketPriority(n.type) === 'HIGH'
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Notifications"
        description="Stay updated with all system activities and alerts"
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={markAllRead} disabled={!notifications.length}>
              <CheckCheck className="h-3 w-3 mr-1" />Mark all read
            </Button>
            <Button size="sm" variant="default" onClick={deleteAllNotifications} disabled={!notifications.length}>
              <Trash2 className="h-3 w-3 mr-1" />Clear all
            </Button>
          </div>
        }
      />
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={notifications.length} icon={Bell} />
        <StatCard title="Unread" value={unreadCount} icon={AlertCircle} />
        <StatCard title="Today" value={todayCount} icon={Calendar} />
        <StatCard title="High Priority" value={highPriorityCount} icon={Zap} />
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="BOOKING">📅 Booking</SelectItem>
            <SelectItem value="TICKET">🔧 Ticket</SelectItem>
            <SelectItem value="COMMENT">💬 Comment</SelectItem>
            <SelectItem value="SYSTEM">⚙️ System</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-full sm:w-48">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="unread-first">Unread First</SelectItem>
            <SelectItem value="priority">High Priority First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            <X className="h-3 w-3 mr-1" />Clear
          </Button>
          <div className="flex-1" />
          <Button size="sm" variant="outline" onClick={markSelectedAsRead}>
            <CheckCheck className="h-3 w-3 mr-1" />Mark as read
          </Button>
          <Button size="sm" variant="default" onClick={deleteSelected}>
            <Trash2 className="h-3 w-3 mr-1" />Delete
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Loading notifications...</p>}
        {!loading && sorted.length === 0 && <p className="text-sm text-muted-foreground">No notifications.</p>}
        {!loading && sorted.length > 0 && (
          <div className="mb-3 flex items-center gap-3 px-3 py-2">
            <Checkbox
              checked={selected.size > 0 && selected.size === sorted.length}
              onCheckedChange={toggleSelectAll}
              title="Select all"
            />
            <span className="text-xs text-muted-foreground">Select all ({sorted.length})</span>
          </div>
        )}
        {!loading && sorted.map(n => (
          <Card key={n.id} className={`transition-colors ${!n.isRead ? 'border-primary/30 bg-primary/5' : ''} ${selected.has(n.id!) ? 'border-primary bg-primary/10' : 'cursor-pointer'}`}>
            <CardContent className="flex items-start gap-3 py-4">
              <Checkbox
                checked={selected.has(n.id!)}
                onCheckedChange={() => toggleSelect(n.id!)}
                className="mt-1"
              />
              <div className="flex items-center gap-2">
                {isTicketNotification(n.type) && (
                  <span className={`h-3 w-3 rounded-full ${getPriorityColor(n.type)}`} title={`Priority: ${getPriorityLabel(n.type)}`} />
                )}
                <span className="text-xl">{typeIcon[n.type] || '📢'}</span>
              </div>
              <div className="flex-1 min-w-0" onClick={() => selected.size === 0 && goToNotification(n)}>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">{n.title}</h4>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <Button 
                size="sm" 
                variant="default"
                onClick={(e) => deleteNotification(n.id, e)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
