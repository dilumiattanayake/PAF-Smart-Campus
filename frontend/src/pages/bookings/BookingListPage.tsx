import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockBookings } from '@/data/mockData';
import { Plus, CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const BookingListPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tab, setTab] = useState('all');

  const bookings = tab === 'mine'
    ? mockBookings.filter(b => b.requesterEmail === user?.email)
    : mockBookings;

  const filtered = bookings.filter(b => {
    if (search && !b.resourceName.toLowerCase().includes(search.toLowerCase()) && !b.requesterName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Bookings"
        description="Manage your resource bookings"
        actions={<Link to="/bookings/new"><Button size="sm"><Plus className="h-3 w-3 mr-1" />New Booking</Button></Link>}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="mine">My Bookings</TabsTrigger>
        </TabsList>
      </Tabs>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search bookings..."
        filters={[
          { key: 'status', label: 'Status', options: [{ label: 'Pending', value: 'PENDING' }, { label: 'Approved', value: 'APPROVED' }, { label: 'Rejected', value: 'REJECTED' }, { label: 'Cancelled', value: 'CANCELLED' }], value: statusFilter, onChange: setStatusFilter },
        ]}
      />

      {filtered.length === 0 ? (
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(b => (
                  <TableRow key={b.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-xs"><Link to={`/bookings/${b.id}`} className="hover:text-primary">{b.id}</Link></TableCell>
                    <TableCell className="font-medium">{b.resourceName}</TableCell>
                    <TableCell className="text-muted-foreground">{b.requesterName}</TableCell>
                    <TableCell className="tabular-nums">{b.bookingDate}</TableCell>
                    <TableCell className="font-mono text-xs">{b.startTime}–{b.endTime}</TableCell>
                    <TableCell className="tabular-nums">{b.attendeeCount}</TableCell>
                    <TableCell><StatusBadge status={b.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Calendar View */}
      <Card className="p-6">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><CalendarDays className="h-4 w-4" />Booking Calendar</h3>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="font-medium text-muted-foreground py-2">{d}</div>
          ))}
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 2;
            const date = new Date(2026, 2, day);
            const dateStr = date.toISOString().split('T')[0];
            const dayBookings = mockBookings.filter(b => b.bookingDate === dateStr);
            return (
              <div key={i} className={`p-2 rounded-md min-h-[60px] text-left ${day < 1 || day > 31 ? 'text-muted-foreground/30' : 'border hover:bg-muted/50'}`}>
                <span className="text-xs tabular-nums">{day > 0 && day <= 31 ? day : ''}</span>
                {dayBookings.slice(0, 2).map(b => (
                  <div key={b.id} className="mt-1 text-[10px] rounded bg-primary/10 px-1 py-0.5 truncate text-primary font-medium">
                    {b.resourceName.split(' ')[0]}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default BookingListPage;
