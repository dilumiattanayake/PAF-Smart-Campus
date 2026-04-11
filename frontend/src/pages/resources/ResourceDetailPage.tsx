import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Users, Clock, Edit, Trash2, CalendarDays, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { resourceService } from '@/services/resourceService';
import type { Resource } from '@/types';

const ResourceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await resourceService.getById(id);
        setResource(res ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const availability = resource?.availableFrom && resource?.availableTo ? `${resource.availableFrom} – ${resource.availableTo}` : 'Hours TBD';

  const handleDelete = async () => {
    if (!resource?.id) return;
    setDeleting(true);
    try {
      await resourceService.delete(resource.id);
      toast({ title: 'Resource removed', description: `${resource.name} was deleted.` });
      navigate('/resources');
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  if (!resource) return <EmptyState title="Resource not found" description="The resource you're looking for doesn't exist." action={<Link to="/resources"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-1" />Back to Resources</Button></Link>} />;

  return (
    <div className="relative space-y-6 animate-fade-in">
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete resource?"
        description="This will permanently remove the resource and its availability window."
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        destructive
        onConfirm={handleDelete}
      />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/resources" className="hover:text-foreground flex items-center gap-1"><ArrowLeft className="h-3 w-3" />Resources</Link>
        <span>/</span>
        <span>{resource.name}</span>
      </div>

      <PageHeader
        title={resource.name}
        description={`${resource.type} · ${resource.location}`}
        actions={
          user?.role === 'ADMIN' && (
            <div className="flex gap-2">
              <Link to={`/admin/resources/${resource.id}/edit`}><Button size="sm" variant="outline"><Edit className="h-3 w-3 mr-1" />Edit</Button></Link>
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => setConfirmOpen(true)}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
            </div>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className="relative h-56 bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
              {resource.image ? (
                <img src={resource.image} alt={resource.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-6xl">🏛️</span>
                </div>
              )}
            </div>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <StatusBadge status={resource.status} />
                <span className="text-sm text-muted-foreground">{resource.type}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{resource.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Availability</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{availability}</span></div>
              <p>Bookings will be scheduled inside this window.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Resource details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{resource.location}</span></div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span>Capacity: {resource.capacity}</span></div>
              <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /><span>Type: {resource.type}</span></div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono"><span>ID: {resource.id}</span></div>
            </CardContent>
          </Card>

          <Link to={`/bookings/new?resourceId=${resource.id}`}>
            <Button className="w-full"><CalendarDays className="h-4 w-4 mr-2" />Book This Resource</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailPage;
