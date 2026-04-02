import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ticketService } from '@/services/ticketService';
import type { Ticket } from '@/types';

const techs = [
  { id: 'tech-1', name: 'Technician 1' },
  { id: 'tech-2', name: 'Technician 2' },
  { id: 'tech-3', name: 'Technician 3' },
];

const AdminTicketsPage = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ticketService.getAll();
        if (active) {
          setTickets(data);
        }
      } catch {
        if (active) {
          setError('Failed to load tickets. Please try again.');
          setTickets([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadTickets();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Manage Tickets" description="Assign and oversee maintenance tickets" />
      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading tickets...</div>
          ) : error ? (
            <div className="p-6 text-sm text-destructive">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{t.title}</TableCell>
                    <TableCell><StatusBadge status={t.priority} /></TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell>
                      <Select defaultValue={t.assignedTechnician || ''} onValueChange={() => toast({ title: 'Technician assigned' })}>
                        <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Assign..." /></SelectTrigger>
                        <SelectContent>{techs.map(tc => <SelectItem key={tc.id} value={tc.name}>{tc.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Link to={`/tickets/${t.id}`}><Button size="sm" variant="ghost" className="h-7 text-xs">View</Button></Link></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminTicketsPage;
