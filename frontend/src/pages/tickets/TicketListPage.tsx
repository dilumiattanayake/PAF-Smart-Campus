import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ticketService } from '@/services/ticketService';
import type { Ticket } from '@/types';

const TicketListPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ticketService.getMyTickets(user?.name || '');
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
  }, [user?.name]);

  const filtered = tickets.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Maintenance Tickets"
        description="Report and track campus issues"
        actions={<Link to="/tickets/new"><Button size="sm"><Plus className="h-3 w-3 mr-1" />New Ticket</Button></Link>}
      />

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tickets..."
        filters={[
          { key: 'status', label: 'Status', options: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(s => ({ label: s.replace(/_/g, ' '), value: s })), value: statusFilter, onChange: setStatusFilter },
          { key: 'priority', label: 'Priority', options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => ({ label: p, value: p })), value: priorityFilter, onChange: setPriorityFilter },
        ]}
      />

      {loading ? (
        <Card>
          <div className="p-6 text-sm text-muted-foreground">Loading tickets...</div>
        </Card>
      ) : error ? (
        <Card>
          <div className="p-6 text-sm text-destructive">{error}</div>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState title="No tickets found" action={<Link to="/tickets/new"><Button><Plus className="h-4 w-4 mr-1" />Create Ticket</Button></Link>} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(t => (
                  <TableRow key={t.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs"><Link to={`/tickets/${t.id}`} className="hover:text-primary">{t.id}</Link></TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{t.title}</TableCell>
                    <TableCell className="text-muted-foreground">{t.category}</TableCell>
                    <TableCell><StatusBadge status={t.priority} /></TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{t.assignedTechnician || '—'}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{t.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/tickets/${t.id}`}><Button size="sm" variant="ghost" className="h-8 text-xs">View</Button></Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TicketListPage;
