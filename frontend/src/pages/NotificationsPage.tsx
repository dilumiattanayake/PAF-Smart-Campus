import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCheck, Trash2, Bell, AlertCircle, Calendar, Zap, Filter, ArrowUpDown, X, Send, Search } from 'lucide-react';
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
import { EmptyState } from '@/components/shared/EmptyState';
import { notificationService } from '@/services/notificationService';
import type { Notification } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/authService';

const NotificationsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastRoles, setBroadcastRoles] = useState<string[]>(['USER']);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  
  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';

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

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim() || broadcastRoles.length === 0) {
      toast({ title: 'Error', description: 'Please fill in all fields and select at least one role', variant: 'destructive' });
      return;
    }

    setSendingBroadcast(true);
    try {
      const response = await api.post('/api/notifications/broadcast', {
        title: broadcastTitle,
        message: broadcastMessage,
        targetRoles: broadcastRoles,
      });

      toast({ title: 'Success', description: `Broadcast sent to ${response.data.notificationsSent} user(s)` });
      setShowBroadcastModal(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setBroadcastRoles(['USER']);
      
      // Reload notifications
      await load();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send broadcast notification', variant: 'destructive' });
    } finally {
      setSendingBroadcast(false);
    }
  };

  const toggleBroadcastRole = (role: string) => {
    setBroadcastRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

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
                        n.type === 'BROADCAST' ? 'BROADCAST' :
                        n.type === 'SYSTEM' ? 'SYSTEM' : 'OTHER';
        return baseType === typeFilter;
      });

  const searched = !searchQuery.trim()
    ? typeFilteredAndRead
    : typeFilteredAndRead.filter(n => {
        const q = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          n.type.toLowerCase().includes(q)
        );
      });

  const sorted = [...searched].sort((a, b) => {
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
    BROADCAST: '📢',
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

  const getTypeLabel = (type: string) => type.replace(/_/g, ' ');

  const todayCount = notifications.filter(n => isToday(n.createdAt)).length;
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriorityCount = notifications.filter(n => 
    isTicketNotification(n.type) && getTicketPriority(n.type) === 'HIGH'
  ).length;
  const technicianActionCount = notifications.filter(n => !n.isRead && isTicketNotification(n.type)).length;
  const pageTitle = isTechnician ? 'Technician Notifications' : 'Notifications';
  const pageDescription = isTechnician
    ? 'Track ticket assignments, status updates, and comments in one focused inbox.'
    : 'Stay updated with all system activities and alerts. Filter, search, and take action quickly.';

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={markAllRead} disabled={!notifications.length}>
              <CheckCheck className="h-3 w-3 mr-1" />Mark all read
            </Button>
            {(isAdmin || isTechnician) && (
              <Button size="sm" variant="destructive" onClick={deleteAllNotifications} disabled={!notifications.length}>
                <Trash2 className="h-3 w-3 mr-1" />Clear all
              </Button>
            )}
          </div>
        }
      />
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={notifications.length} icon={Bell} />
        <StatCard title="Unread" value={unreadCount} icon={AlertCircle} />
        <StatCard title={isTechnician ? 'Action Required' : 'Today'} value={isTechnician ? technicianActionCount : todayCount} icon={Calendar} />
        <StatCard title="High Priority" value={highPriorityCount} icon={Zap} />
      </div>

      {isTechnician && (
        <Card className="border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900/30">
          <CardContent className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Technician Inbox</p>
              <p className="text-xs text-muted-foreground">Prioritize assigned tickets and unread updates first.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFilter('unread');
                  setTypeFilter('TICKET');
                  setSortOrder('priority');
                }}
              >
                Focus on Ticket Alerts
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFilter('all');
                  setTypeFilter('all');
                  setSortOrder('newest');
                  setSearchQuery('');
                }}
              >
                Reset View
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>
      </Tabs>

      {isAdmin && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Admin Broadcast Tools</p>
              <p className="text-xs text-muted-foreground">
                Send targeted announcements to users, technicians, or admins from one place.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Broadcast</Badge>
              <Button size="sm" className="gap-2" onClick={() => setShowBroadcastModal(true)}>
                <Send className="h-3 w-3" />New Broadcast
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search notifications by title, message, or type"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

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
              <SelectItem value="BROADCAST">📢 Broadcast</SelectItem>
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

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTypeFilter('all');
                setSortOrder('newest');
                setSearchQuery('');
                setFilter('all');
              }}
              className="self-start"
            >
              Reset filters
            </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Showing {sorted.length} of {notifications.length} notifications
        </p>

        {!isAdmin && !isTechnician && (
          <p className="text-xs text-muted-foreground">Tip: Click a notification to open the related booking or ticket.</p>
        )}
        {isTechnician && (
          <p className="text-xs text-muted-foreground">Tip: Use "Focus on Ticket Alerts" to quickly triage assigned work.</p>
        )}
      </div>

      {(isAdmin || isTechnician) && selected.size > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            <X className="h-3 w-3 mr-1" />Clear
          </Button>
          <div className="flex-1" />
          <Button size="sm" variant="outline" onClick={markSelectedAsRead}>
            <CheckCheck className="h-3 w-3 mr-1" />Mark as read
          </Button>
          <Button size="sm" variant="destructive" onClick={deleteSelected}>
            <Trash2 className="h-3 w-3 mr-1" />Delete
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {loading && <p className="text-sm text-muted-foreground">Loading notifications...</p>}
        {!loading && sorted.length === 0 && (
          <EmptyState
            title="No notifications found"
            description={
              notifications.length > 0
                ? 'Try adjusting filters or search to find what you need.'
                : 'You are all caught up. New updates will appear here.'
            }
            action={
              notifications.length > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTypeFilter('all');
                    setSortOrder('newest');
                    setSearchQuery('');
                    setFilter('all');
                  }}
                >
                  Reset filters
                </Button>
              ) : undefined
            }
            className="py-10"
          />
        )}
        {(isAdmin || isTechnician) && !loading && sorted.length > 0 && (
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
          <Card key={n.id} className={`transition-colors ${!n.isRead ? 'border-primary/30 bg-primary/5' : ''} ${selected.has(n.id!) ? 'border-primary bg-primary/10' : 'cursor-pointer hover:border-primary/30'}`}>
            <CardContent className="flex items-start gap-3 py-4">
              {(isAdmin || isTechnician) && (
                <Checkbox
                  checked={selected.has(n.id!)}
                  onCheckedChange={() => toggleSelect(n.id!)}
                  className="mt-1"
                />
              )}
              <div className="flex items-center gap-2">
                {isTicketNotification(n.type) && (
                  <span className={`h-3 w-3 rounded-full ${getPriorityColor(n.type)}`} title={`Priority: ${getPriorityLabel(n.type)}`} />
                )}
                <span className="text-xl">{typeIcon[n.type] || '📢'}</span>
              </div>
              <div className="flex-1 min-w-0" onClick={() => ((isAdmin || isTechnician) ? selected.size === 0 : true) && goToNotification(n)}>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">{n.title}</h4>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide">{getTypeLabel(n.type)}</Badge>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!isAdmin && !isTechnician && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNotification(n);
                  }}
                >
                  Open
                </Button>
              )}
              {isTechnician && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNotification(n);
                  }}
                >
                  Open
                </Button>
              )}
              {(isAdmin || isTechnician) && (
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={(e) => deleteNotification(n.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Broadcast Notification Modal */}
      <AlertDialog open={showBroadcastModal} onOpenChange={setShowBroadcastModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Send Broadcast Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Send a message to specific user roles across the system
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Notification title"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                disabled={sendingBroadcast}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Notification message"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                disabled={sendingBroadcast}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Keep it concise and action-focused for better engagement.</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Send to</label>
              <div className="space-y-2 border rounded-lg p-3 bg-muted/50">
                {['USER', 'TECHNICIAN', 'ADMIN'].map(role => (
                  <div key={role} className="flex items-center gap-2">
                    <Checkbox
                      id={`role-${role}`}
                      checked={broadcastRoles.includes(role)}
                      onCheckedChange={() => toggleBroadcastRole(role)}
                      disabled={sendingBroadcast}
                    />
                    <label
                      htmlFor={`role-${role}`}
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {role === 'USER' ? 'All Users' : role === 'TECHNICIAN' ? 'Technicians' : 'Admins'}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Audience selected: <span className="font-medium text-foreground">{broadcastRoles.length}</span>
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <AlertDialogCancel disabled={sendingBroadcast}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendBroadcast}
              disabled={sendingBroadcast || !broadcastTitle.trim() || !broadcastMessage.trim()}
            >
              {sendingBroadcast ? 'Sending...' : 'Send'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotificationsPage;
