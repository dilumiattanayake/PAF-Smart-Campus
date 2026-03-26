import { Wrench, Clock, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockTickets } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const priorityData = [
  { name: 'Low', count: mockTickets.filter(t => t.priority === 'LOW').length },
  { name: 'Medium', count: mockTickets.filter(t => t.priority === 'MEDIUM').length },
  { name: 'High', count: mockTickets.filter(t => t.priority === 'HIGH').length },
  { name: 'Critical', count: mockTickets.filter(t => t.priority === 'CRITICAL').length },
];

export const TechnicianDashboard = () => {
  const assigned = mockTickets.filter(t => t.assignedTechnician === 'Mike Torres');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white p-5 shadow-md">
        <p className="text-xs uppercase tracking-wide opacity-80">Technician view</p>
        <h2 className="text-2xl font-semibold mt-1">Triage, prioritize, and close tickets faster</h2>
      </div>
      <PageHeader title="Technician Dashboard" description="Your assigned tasks and work progress" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Assigned Tickets" value={assigned.length} icon={Wrench} />
        <StatCard title="In Progress" value={assigned.filter(t => t.status === 'IN_PROGRESS').length} icon={Clock} />
        <StatCard title="Resolved Today" value={1} icon={CheckCircle} description="Keep up the great work!" />
        <StatCard title="High Priority" value={assigned.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL').length} icon={AlertTriangle} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assigned Work */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Assigned Work</CardTitle>
            <Link to="/technician/tasks"><Button variant="ghost" size="sm">View all <ArrowRight className="h-3 w-3 ml-1" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {assigned.map(t => (
              <Link key={t.id} to={`/tickets/${t.id}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">{t.id} • {t.resourceOrLocation}</p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Priority Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tickets by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(210, 70%, 28%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Status Update */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Progress Update</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assigned.filter(t => t.status !== 'CLOSED' && t.status !== 'RESOLVED').map(t => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <StatusBadge status={t.status} className="mt-1" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Start Work</Button>
                  <Button size="sm">Mark Resolved</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
