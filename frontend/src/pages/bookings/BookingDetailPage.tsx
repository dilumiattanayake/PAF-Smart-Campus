import { useParams, Link } from 'react-router-dom';
import { mockBookings } from '@/data/mockData';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, Clock, Users, Mail, FileText } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuth } from '@/contexts/AuthContext';

const BookingDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const booking = mockBookings.find(b => b.id === id);

  if (!booking) return <EmptyState title="Booking not found" action={<Link to="/bookings"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></Link>} />;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/bookings" className="hover:text-foreground flex items-center gap-1"><ArrowLeft className="h-3 w-3" />Bookings</Link>
        <span>/</span><span className="font-mono">{booking.id}</span>
      </div>

      <PageHeader
        title={booking.purpose}
        actions={
          <div className="flex gap-2">
            {booking.status === 'PENDING' && user?.role === 'ADMIN' && (
              <>
                <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground">Approve</Button>
                <Button size="sm" variant="outline" className="text-destructive">Reject</Button>
              </>
            )}
            {booking.status === 'PENDING' && booking.requesterEmail === user?.email && (
              <Button size="sm" variant="outline" className="text-destructive">Cancel</Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Booking Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" />{booking.bookingDate}</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" />{booking.startTime} – {booking.endTime}</div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />{booking.attendeeCount} attendees</div>
            <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{booking.purpose}</div>
            {booking.notes && <div className="text-muted-foreground pt-2 border-t">{booking.notes}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Status & Resource</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={booking.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Resource</span>
              <Link to={`/resources/${booking.resourceId}`} className="font-medium text-primary hover:underline">{booking.resourceName}</Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Requester</span>
              <span>{booking.requesterName}</span>
            </div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{booking.requesterEmail}</div>
            {booking.rejectionReason && (
              <div className="rounded-md bg-destructive/10 p-3 text-destructive text-xs">
                <strong>Rejection reason:</strong> {booking.rejectionReason}
              </div>
            )}
            <div className="text-xs text-muted-foreground font-mono pt-2 border-t">Created: {booking.createdAt}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingDetailPage;
