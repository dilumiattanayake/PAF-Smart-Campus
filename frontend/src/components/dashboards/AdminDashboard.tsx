import { Building2, CalendarDays, Wrench, Users, ArrowRight, Plus } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockResources, mockBookings, mockTickets, mockUsers } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const resourceUsage = [
  { name: 'Lecture Halls', usage: 85 },
  { name: 'Labs', usage: 72 },
  { name: 'Study Rooms', usage: 91 },
  { name: 'Conference', usage: 60 },
  { name: 'Sports', usage: 45 },
];

const ticketByStatus = [
  { name: 'Open', value: mockTickets.filter(t => t.status === 'OPEN').length },
  { name: 'In Progress', value: mockTickets.filter(t => t.status === 'IN_PROGRESS').length },
  { name: 'Resolved', value: mockTickets.filter(t => t.status === 'RESOLVED').length },
  { name: 'Closed', value: mockTickets.filter(t => t.status === 'CLOSED').length },
];

const COLORS = ['hsl(210, 70%, 50%)', 'hsl(38, 92%, 50%)', 'hsl(152, 60%, 38%)', 'hsl(215, 12%, 50%)'];

export const AdminDashboard = () => {
  const pendingBookings = mockBookings.filter(b => b.status === 'PENDING');

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Admin Dashboard"
        description="System overview and management controls"
        actions={<Link to="/admin/resources/new"><Button size="sm"><Plus className="h-3 w-3 mr-1" />Add Resource</Button></Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Resources" value={mockResources.length} icon={Building2} trend={{ value: 5, positive: true }} />
        <StatCard title="Pending Bookings" value={pendingBookings.length} icon={CalendarDays} description="Awaiting approval" />
        <StatCard title="Active Tickets" value={mockTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length} icon={Wrench} />
        <StatCard title="Total Users" value={mockUsers.length} icon={Users} trend={{ value: 8, positive: true }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Resource Usage Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resource Utilization (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={resourceUsage}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip />
                <Bar dataKey="usage" fill="hsl(174, 62%, 38%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ticket Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tickets by Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={ticketByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {ticketByStatus.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Booking Approval Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Booking Approval Queue</CardTitle>
          <Link to="/admin/bookings"><Button variant="ghost" size="sm">Manage all <ArrowRight className="h-3 w-3 ml-1" /></Button></Link>
        </CardHeader>
        <CardContent>
          {pendingBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No pending bookings</p>
          ) : (
            <div className="space-y-3">
              {pendingBookings.map(b => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{b.resourceName}</p>
                    <p className="text-xs text-muted-foreground">{b.requesterName} • {b.bookingDate} {b.startTime}–{b.endTime}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-success border-success/30 hover:bg-success/10">Approve</Button>
                    <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent System Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { text: 'New ticket T005 created by Alex Johnson', time: '2 hours ago' },
            { text: 'Booking B003 approved for Conference Room 3B', time: '5 hours ago' },
            { text: 'Resource "Sports Hall" set to maintenance', time: '1 day ago' },
            { text: 'Ticket T004 resolved by Mike Torres', time: '2 days ago' },
          ].map((a, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span>{a.text}</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{a.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
