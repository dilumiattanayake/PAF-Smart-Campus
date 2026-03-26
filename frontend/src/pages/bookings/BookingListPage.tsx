import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/bookingService';
import { resourceService } from '@/services/resourceService';
import type { Booking } from '@/types';
import { BookingCalendar } from '@/components/bookings/BookingCalendar';
import { useToast } from '@/hooks/use-toast';

const BookingListPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tab, setTab] = useState<'all' | 'mine'>(user?.role === 'ADMIN' ? 'all' : 'mine');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [resourceMap, setResourceMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const load = async (which: 'all' | 'mine', status?: string) => {
    setLoading(true);
    try {
      if (which === 'all' && user?.role === 'ADMIN') {
        const data = await bookingService.getAll(status && status !== 'all' ? { status } : undefined);
        setBookings(data);
      } else {
        const data = await bookingService.getMyBookings();
        setBookings(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab, statusFilter);
    resourceService.getAll().then(res => {
      const map: Record<string, string> = {};
      res.forEach(r => { map[r.id] = r.name; });
      setResourceMap(map);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    load(tab, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filtered = useMemo(() => bookings.filter(b => {
    const q = search.toLowerCase();
    if (search && !`${b.resourceName || ''} ${b.requesterName || ''}`.toLowerCase().includes(q)) return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (tab === 'mine' && user && b.userId && b.userId !== user.id) return false;
    return true;
  }), [bookings, search, statusFilter, tab, user]);

  const statusOptions = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Bookings"
        description="Manage your resource bookings"
        actions={<Link to="/bookings/new"><Button size="sm"><Plus className="h-3 w-3 mr-1" />New Booking</Button></Link>}
      />

      {user?.role === 'ADMIN' && (
        <Tabs value={tab} onValueChange={v => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All Bookings</TabsTrigger>
            <TabsTrigger value="mine">My Bookings</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search bookings..."
        filters={[
          { key: 'status', label: 'Status', options: statusOptions, value: statusFilter, onChange: setStatusFilter },
        ]}
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading bookings...</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No bookings found" action={<Link to="/bookings/new"><Button><Plus className="h-4 w-4 mr-1" />Create Booking</Button></Link>} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Status</TableHead>
                  {user?.role === 'USER' && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(b => (
                  <TableRow key={b.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-xs"><Link to={`/bookings/${b.id}`} className="hover:text-primary">{b.id}</Link></TableCell>
                    <TableCell className="font-medium">{b.resourceName || resourceMap[b.resourceId] || b.resourceId}</TableCell>
                    <TableCell className="text-muted-foreground">{b.requesterName || b.requesterEmail || b.userId}</TableCell>
                    <TableCell className="tabular-nums">{b.bookingDate}</TableCell>
                    <TableCell className="font-mono text-xs">{b.startTime}–{b.endTime}</TableCell>
                    <TableCell className="tabular-nums">{b.attendeeCount}</TableCell>
                    <TableCell><StatusBadge status={b.status} /></TableCell>
                    {user?.role === 'USER' && (
                      <TableCell>
                        {b.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => navigate(`/bookings/new?editId=${b.id}`)}>Edit</Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => {
                              try {
                                await bookingService.cancel(b.id);
                                toast({ title: 'Booking cancelled' });
                                load(tab, statusFilter);
                              } catch {
                                toast({ title: 'Unable to cancel', variant: 'destructive' });
                              }
                            }}>Cancel</Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Locked</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <BookingCalendar bookings={bookings} />
    </div>
  );
};

export default BookingListPage;
