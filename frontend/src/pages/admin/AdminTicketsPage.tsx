import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockTickets, mockUsers } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AdminTicketsPage = () => {
  const { toast } = useToast();
  const techs = mockUsers.filter(u => u.role === 'TECHNICIAN');

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Manage Tickets" description="Assign and oversee maintenance tickets" />
      <Card>
        <div className="overflow-x-auto">
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
              {mockTickets.map(t => (
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
        </div>
      </Card>
    </div>
  );
};

export default AdminTicketsPage;
