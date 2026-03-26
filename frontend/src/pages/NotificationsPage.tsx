import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockNotifications } from '@/data/mockData';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NotificationsPage = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'unread' ? notifications.filter(n => !n.isRead) : filter === 'read' ? notifications.filter(n => n.isRead) : notifications;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    toast({ title: 'All notifications marked as read' });
  };

  const markRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const typeIcon: Record<string, string> = { BOOKING: '📅', TICKET: '🔧', SYSTEM: '⚙️', RESOURCE: '🏛️' };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Notifications" description={`${notifications.filter(n => !n.isRead).length} unread`} actions={<Button size="sm" variant="outline" onClick={markAllRead}><CheckCheck className="h-3 w-3 mr-1" />Mark all read</Button>} />
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="unread">Unread</TabsTrigger><TabsTrigger value="read">Read</TabsTrigger></TabsList>
      </Tabs>
      <div className="space-y-3">
        {filtered.map(n => (
          <Card key={n.id} className={`cursor-pointer transition-colors ${!n.isRead ? 'border-primary/30 bg-primary/5' : ''}`} onClick={() => markRead(n.id)}>
            <CardContent className="flex items-start gap-3 py-4">
              <span className="text-xl">{typeIcon[n.type] || '📢'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">{n.title}</h4>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
