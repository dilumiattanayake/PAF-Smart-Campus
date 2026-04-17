import { CalendarDays, CheckCircle, Bell, Plus, ArrowRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/bookingService';
import { notificationService } from '@/services/notificationService';
import { BookingCalendar } from '@/components/bookings/BookingCalendar';
import type { Booking, Notification } from '@/types';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    (async () => {
      const [bks, notifs] = await Promise.all([
        bookingService.getMyBookings(),
        notificationService.getAll().catch(() => []),
      ]);
      setMyBookings(bks);
      setNotifications(notifs);
    })();
  }, []);

  const unread = notifications.filter(n => !n.isRead).length;
  const recentNotifications = useMemo(
    () => [...notifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3),
    [notifications],
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-white p-5 shadow-md">
        <p className="text-xs uppercase tracking-wide opacity-80">Student / User view</p>
        <h2 className="text-2xl font-semibold mt-1">Stay on top of your bookings & tickets</h2>
      </div>
      <PageHeader title={`Welcome back, ${user?.name?.split(' ')[0]}`} description="Here's what's happening with your campus activities." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Bookings" value={myBookings.length} icon={CalendarDays} trend={{ value: 12, positive: true }} />
        <StatCard title="Approved" value={myBookings.filter(b => b.status === 'APPROVED').length} icon={CheckCircle} />
        <StatCard title="Rejected" value={myBookings.filter(b => b.status === 'REJECTED').length} icon={CheckCircle} />
        <StatCard title="Unread Notifications" value={unread} icon={Bell} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Upcoming Bookings</CardTitle>
            <Link to="/bookings"><Button variant="ghost" size="sm">View all <ArrowRight className="h-3 w-3 ml-1" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {myBookings.filter(b => b.status !== 'CANCELLED').slice(0, 3).map(b => (
              <Link key={b.id} to={`/bookings/${b.id}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{b.resourceName}</p>
                  <p className="text-xs text-muted-foreground">{b.bookingDate} • {b.startTime}–{b.endTime}</p>
                  {b.status === 'REJECTED' && b.rejectionReason && (
                    <p className="text-xs text-destructive mt-1 line-clamp-2">
                      Rejected: {b.rejectionReason}
                    </p>
                  )}
                </div>
                <StatusBadge status={b.status} />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Notifications</CardTitle>
            <Link to="/notifications"><Button variant="ghost" size="sm">View all <ArrowRight className="h-3 w-3 ml-1" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNotifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            ) : recentNotifications.map(n => (
              <Link key={n.id} to="/notifications" className="flex items-start justify-between gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                </div>
                {!n.isRead && <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">My Booking Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingCalendar bookings={myBookings} filterToUserId={user?.id} />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link to="/bookings/new"><Button size="sm"><Plus className="h-3 w-3 mr-1" />New Booking</Button></Link>
          <Link to="/tickets/new"><Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" />Report Issue</Button></Link>
          <Link to="/resources"><Button size="sm" variant="outline">Browse Resources</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
};
