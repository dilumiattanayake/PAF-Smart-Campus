import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockBookings } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const AdminBookingsPage = () => {
  const { toast } = useToast();
  const [reason, setReason] = useState('');

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Manage Bookings" description="Review and approve booking requests" />
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
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBookings.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{b.id}</TableCell>
                  <TableCell className="font-medium">{b.resourceName}</TableCell>
                  <TableCell>{b.requesterName}</TableCell>
                  <TableCell className="tabular-nums">{b.bookingDate}</TableCell>
                  <TableCell className="font-mono text-xs">{b.startTime}–{b.endTime}</TableCell>
                  <TableCell><StatusBadge status={b.status} /></TableCell>
                  <TableCell>
                    {b.status === 'PENDING' ? (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="text-success h-7 text-xs" onClick={() => toast({ title: 'Booking approved' })}>Approve</Button>
                        <Dialog>
                          <DialogTrigger asChild><Button size="sm" variant="outline" className="text-destructive h-7 text-xs">Reject</Button></DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Reject Booking {b.id}</DialogTitle></DialogHeader>
                            <Textarea placeholder="Reason for rejection (optional)" value={reason} onChange={e => setReason(e.target.value)} />
                            <Button onClick={() => { toast({ title: 'Booking rejected' }); setReason(''); }} className="bg-destructive text-destructive-foreground">Confirm Rejection</Button>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      <Link to={`/bookings/${b.id}`}><Button size="sm" variant="ghost" className="h-7 text-xs">View</Button></Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default AdminBookingsPage;
