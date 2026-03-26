import { useParams, Link } from 'react-router-dom';
import { mockTickets, mockUsers } from '@/data/mockData';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, MapPin, User, Clock, MessageSquare, Upload } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const TicketDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const ticket = mockTickets.find(t => t.id === id);
  const [newComment, setNewComment] = useState('');

  if (!ticket) return <EmptyState title="Ticket not found" action={<Link to="/tickets"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></Link>} />;

  const technicians = mockUsers.filter(u => u.role === 'TECHNICIAN');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/tickets" className="hover:text-foreground flex items-center gap-1"><ArrowLeft className="h-3 w-3" />Tickets</Link>
        <span>/</span><span className="font-mono">{ticket.id}</span>
      </div>

      <PageHeader title={ticket.title} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{ticket.description}</p>
              {ticket.resolutionNotes && (
                <div className="mt-4 rounded-md bg-success/10 p-3">
                  <p className="text-xs font-semibold text-success mb-1">Resolution Notes</p>
                  <p className="text-sm">{ticket.resolutionNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline / Comments */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <CardTitle className="text-base">Activity & Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.comments?.map(c => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">{c.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{c.author}</span>
                      <StatusBadge status={c.authorRole} />
                      <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{c.content}</p>
                  </div>
                </div>
              )) || <p className="text-sm text-muted-foreground">No comments yet.</p>}

              {/* Add comment */}
              <div className="border-t pt-4 space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center gap-3">
                  <Button size="sm" disabled={!newComment.trim()}>Post Comment</Button>
                  <Button size="sm" variant="outline"><Upload className="h-3 w-3 mr-1" />Attach File</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={ticket.status} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><StatusBadge status={ticket.priority} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span>{ticket.category}</span></div>
              <div className="flex items-center gap-2"><MapPin className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">{ticket.resourceOrLocation}</span></div>
              <div className="flex items-center gap-2"><User className="h-3 w-3 text-muted-foreground" /><span>Created by: {ticket.createdBy}</span></div>
              <div className="flex items-center gap-2"><Clock className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground font-mono text-xs">{ticket.createdAt}</span></div>
              <div className="text-xs text-muted-foreground font-mono">Updated: {ticket.updatedAt}</div>
            </CardContent>
          </Card>

          {/* Admin: Assign technician */}
          {user?.role === 'ADMIN' && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Assign Technician</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Select defaultValue={ticket.assignedTechnician}>
                  <SelectTrigger><SelectValue placeholder="Select technician" /></SelectTrigger>
                  <SelectContent>
                    {technicians.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" className="w-full">Assign</Button>
              </CardContent>
            </Card>
          )}

          {/* Technician: Update status */}
          {user?.role === 'TECHNICIAN' && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Update Status</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Select defaultValue={ticket.status}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Textarea placeholder="Resolution notes..." rows={2} />
                <Button size="sm" className="w-full">Update Status</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
