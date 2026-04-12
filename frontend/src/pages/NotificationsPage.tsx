import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCheck, Trash2, Bell, AlertCircle, Calendar, Zap } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);

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
      toast({ title: 'All notifications deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete all notifications', variant: 'destructive' });
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

  const todayCount = notifications.filter(n => isToday(n.createdAt)).length;
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriorityCount = notifications.filter(n => 
    ['TICKET_ASSIGNED', 'TICKET_STATUS', 'BOOKING_STATUS'].includes(n.type)
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
            <Button size="sm" variant="destructive" onClick={deleteAllNotifications} disabled={!notifications.length}>
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
      <div className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Loading notifications...</p>}
        {!loading && filtered.length === 0 && <p className="text-sm text-muted-foreground">No notifications.</p>}
        {!loading && filtered.map(n => (
          <Card key={n.id} className={`cursor-pointer transition-colors ${!n.isRead ? 'border-primary/30 bg-primary/5' : ''}`}>
            <CardContent className="flex items-start gap-3 py-4">
              <span className="text-xl">{typeIcon[n.type] || '📢'}</span>
              <div className="flex-1 min-w-0" onClick={() => goToNotification(n)}>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">{n.title}</h4>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-destructive hover:bg-destructive/10"
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
