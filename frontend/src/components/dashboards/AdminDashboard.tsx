import { Building2, CalendarDays, Wrench, Users, ArrowRight, Plus, Ban } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import { resourceService } from '@/services/resourceService';
import { bookingService } from '@/services/bookingService';
import type { Booking, Resource } from '@/types';
import { BookingCalendar } from '@/components/bookings/BookingCalendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const resourceUsage = [
  { name: 'Lecture Halls', usage: 85 },
  { name: 'Labs', usage: 72 },
  { name: 'Study Rooms', usage: 91 },
  { name: 'Conference', usage: 60 },
  { name: 'Sports', usage: 45 },
];

const COLORS = ['hsl(210, 70%, 50%)', 'hsl(38, 92%, 50%)', 'hsl(152, 60%, 38%)', 'hsl(215, 12%, 50%)'];

export const AdminDashboard = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const [decisionId, setDecisionId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);

  const reloadBookings = async () => {
    const bks = await bookingService.getAll();
    setBookings(bks);
  };

  useEffect(() => {
    (async () => {
      const res = await resourceService.getAll();
      setResources(res);
      await reloadBookings();
    })();
  }, []);

  const ticketByStatus = []; // placeholder if ticket API needed later

  const approveBooking = async (id: string) => {
    setActingId(id);
    try {
      await bookingService.approve(id);
      toast({ title: 'Booking approved' });
      await reloadBookings();
    } catch {
      toast({ title: 'Unable to approve booking', variant: 'destructive' });
    } finally {
      setActingId(null);
    }
  };

  const rejectBooking = async () => {
    if (!decisionId) return;
    const trimmed = reason.trim();
    if (!trimmed) {
      toast({ title: 'Rejection reason is required', variant: 'destructive' });
      return;
    }

    setActingId(decisionId);
    try {
      await bookingService.reject(decisionId, trimmed);
      toast({ title: 'Booking rejected' });
      setReason('');
      setDecisionId(null);
      await reloadBookings();
    } catch {
      toast({ title: 'Unable to reject booking', variant: 'destructive' });
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 text-white p-5 shadow-md">
        <p className="text-xs uppercase tracking-wide opacity-80">Admin control center</p>
        <h2 className="text-2xl font-semibold mt-1">Approve bookings, track resources, oversee ops</h2>
      </div>
      <PageHeader
        title="Admin Dashboard"
        description="System overview and management controls"
        actions={<Link to="/admin/resources/new"><Button size="sm"><Plus className="h-3 w-3 mr-1" />Add Resource</Button></Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Resources" value={resources.length} icon={Building2} />
        <StatCard title="Pending Bookings" value={pendingBookings.length} icon={CalendarDays} description="Awaiting approval" />
        <StatCard title="Approved Bookings" value={bookings.filter(b => b.status === 'APPROVED').length} icon={Wrench} />
        <StatCard title="Rejected Bookings" value={bookings.filter(b => b.status === 'REJECTED').length} icon={Ban} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Bookings Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingCalendar bookings={bookings} />
        </CardContent>
      </Card>

      {/* Booking Approval Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Booking Approval Queue</CardTitle>
          <Link to="/admin/bookings"><Button variant="ghost" size="sm">Manage all <ArrowRight className="h-3 w-3 ml-1" /></Button></Link>
        </CardHeader>
        <CardContent>
          {pendingBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No pending bookings</p>
          ) : (
            <div className="space-y-3">
              {pendingBookings.map(b => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{b.resourceName}</p>
                    <p className="text-xs text-muted-foreground">{b.requesterName} • {b.bookingDate} {b.startTime}–{b.endTime}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-success border-success/30 hover:bg-success/10"
                      disabled={actingId === b.id}
                      onClick={() => approveBooking(b.id)}
                    >
                      Approve
                    </Button>
                    <Dialog open={decisionId === b.id} onOpenChange={open => setDecisionId(open ? b.id : null)}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          disabled={actingId === b.id}
                        >
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Reject Booking {b.id}</DialogTitle></DialogHeader>
                        <Textarea placeholder="Reason for rejection" value={reason} onChange={e => setReason(e.target.value)} />
                        <Button onClick={rejectBooking} className="bg-destructive text-destructive-foreground" disabled={actingId === b.id}>
                          Confirm Rejection
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent System Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { text: 'New ticket T005 created by Alex Johnson', time: '2 hours ago' },
            { text: 'Booking B003 approved for Conference Room 3B', time: '5 hours ago' },
            { text: 'Resource "Sports Hall" set to maintenance', time: '1 day ago' },
            { text: 'Ticket T004 resolved by Mike Torres', time: '2 days ago' },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span>{a.text}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{a.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
