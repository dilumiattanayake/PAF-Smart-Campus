import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockTickets } from '@/data/mockData';
import { Link } from 'react-router-dom';

const TechnicianTasksPage = () => {
  const assigned = mockTickets.filter(t => t.assignedTechnician === 'Mike Torres');

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="My Tasks" description="Your assigned maintenance tasks" />
      <div className="space-y-3">
        {assigned.map(t => (
          <Card key={t.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">{t.id} • {t.resourceOrLocation}</p>
                <div className="flex gap-2 mt-2"><StatusBadge status={t.priority} /><StatusBadge status={t.status} /></div>
              </div>
              <Link to={`/tickets/${t.id}`}><Button size="sm">View Details</Button></Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TechnicianTasksPage;
