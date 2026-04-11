import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Wrench } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ticketService } from '@/services/ticketService';
import type { Ticket } from '@/types';

type TechnicianTicketsPageProps = {
  mode?: 'tasks' | 'tickets';
};

const STATUS_BY_MODE: Record<NonNullable<TechnicianTicketsPageProps['mode']>, Ticket['status'][]> = {
  tasks: ['IN_PROGRESS'],
  tickets: ['RESOLVED', 'CLOSED'],
};

const TechnicianTicketsPage = ({ mode = 'tickets' }: TechnicianTicketsPageProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allowedStatuses = STATUS_BY_MODE[mode];
  const statusOptions = allowedStatuses.map(s => ({ label: s.replace(/_/g, ' '), value: s }));
  const pageTitle = mode === 'tasks' ? 'My Tasks' : 'My Tickets';
  const pageDescription = mode === 'tasks'
    ? 'Tickets currently in progress'
    : 'Resolved and closed ticket history';
  const searchPlaceholder = mode === 'tasks'
    ? 'Search in-progress tasks...'
    : 'Search resolved and closed tickets...';
  const emptyStateTitle = mode === 'tasks' ? 'No tasks in progress' : 'No resolved tickets';
  const emptyStateDescription = mode === 'tasks'
    ? 'You do not have any in-progress tickets right now.'
    : 'You do not have resolved or closed tickets yet.';
  const queueLabel = mode === 'tasks' ? 'Task queue' : 'Ticket history';

  useEffect(() => {
    let active = true;

    const loadTickets = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ticketService.getAssignedTickets();
        if (active) {
          setTickets(data);
        }
      } catch {
        if (active) {
          setError('Failed to load assigned tickets. Please try again.');
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

  const filtered = tickets.filter(ticket => {
    if (!allowedStatuses.includes(ticket.status)) return false;
    const query = search.toLowerCase();
    if (query && !ticket.title.toLowerCase().includes(query) && !ticket.id.toLowerCase().includes(query) && !ticket.category.toLowerCase().includes(query)) {
      return false;
    }
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        actions={<div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground"><Wrench className="h-3 w-3" />{queueLabel}</div>}
      />

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={searchPlaceholder}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: statusOptions,
            value: statusFilter,
            onChange: setStatusFilter,
          },
          {
            key: 'priority',
            label: 'Priority',
            options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => ({ label: p, value: p })),
            value: priorityFilter,
            onChange: setPriorityFilter,
          },
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
        <EmptyState
          title={emptyStateTitle}
          description={emptyStateDescription}
          action={<Link to="/dashboard"><Button variant="outline"><ArrowRight className="h-4 w-4 mr-1" />Back to dashboard</Button></Link>}
        />
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
                  <TableHead>Reported By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(ticket => (
                  <TableRow key={ticket.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-xs">{ticket.id}</TableCell>
                    <TableCell className="max-w-[220px] truncate font-medium">{ticket.title}</TableCell>
                    <TableCell className="text-muted-foreground">{ticket.category}</TableCell>
                    <TableCell><StatusBadge status={ticket.priority} /></TableCell>
                    <TableCell><StatusBadge status={ticket.status} /></TableCell>
                    <TableCell className="max-w-[180px] truncate text-muted-foreground">{ticket.createdBy || '—'}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/tickets/${ticket.id}`}><Button size="sm" variant="ghost" className="h-8 text-xs">View</Button></Link>
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

export default TechnicianTicketsPage;
