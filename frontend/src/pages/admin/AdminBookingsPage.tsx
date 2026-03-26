import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingService } from '@/services/bookingService';
import { resourceService } from '@/services/resourceService';
import type { Booking } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { BookingCalendar } from '@/components/bookings/BookingCalendar';

const AdminBookingsPage = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resourceMap, setResourceMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [decisionId, setDecisionId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const load = async (status?: string) => {
    setLoading(true);
    try {
      const data = await bookingService.getAll(status && status !== 'all' ? { status } : undefined);
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    resourceService.getAll().then(res => {
      const map: Record<string, string> = {};
      res.forEach(r => { map[r.id] = r.name; });
      setResourceMap(map);
    });
  }, []);

  const approve = async (id: string) => {
    await bookingService.approve(id);
    toast({ title: 'Booking approved' });
    load(statusFilter);
  };

  const reject = async () => {
    if (!decisionId) return;
    await bookingService.reject(decisionId, reason || 'Rejected');
    toast({ title: 'Booking rejected' });
    setReason('');
    setDecisionId(null);
    load(statusFilter);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Manage Bookings" description="Review and approve booking requests" />

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); load(v); }}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground p-4">Loading bookings...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.id}</TableCell>
                    <TableCell className="font-medium">{b.resourceName || resourceMap[b.resourceId] || b.resourceId}</TableCell>
                    <TableCell>{b.requesterName || b.requesterEmail || b.userId}</TableCell>
                    <TableCell className="tabular-nums">{b.bookingDate}</TableCell>
                    <TableCell className="font-mono text-xs">{b.startTime}–{b.endTime}</TableCell>
                    <TableCell><StatusBadge status={b.status} /></TableCell>
                    <TableCell>
                      {b.status === 'PENDING' ? (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="text-success h-7 text-xs" onClick={() => approve(b.id)}>Approve</Button>
                          <Dialog open={decisionId === b.id} onOpenChange={open => setDecisionId(open ? b.id : null)}>
                            <DialogTrigger asChild><Button size="sm" variant="outline" className="text-destructive h-7 text-xs">Reject</Button></DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Reject Booking {b.id}</DialogTitle></DialogHeader>
                              <Textarea placeholder="Reason for rejection" value={reason} onChange={e => setReason(e.target.value)} />
                              <Button onClick={reject} className="bg-destructive text-destructive-foreground">Confirm Rejection</Button>
                            </DialogContent>
                          </Dialog>
                        </div>
                      ) : (
                        <StatusBadge status={b.status} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      <BookingCalendar bookings={bookings} title="Approved Bookings Calendar" />
    </div>
  );
};

export default AdminBookingsPage;
