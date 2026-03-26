import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Users, Clock, Edit, Trash2, CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/shared/EmptyState';
import { resourceService } from '@/services/resourceService';
import type { Resource } from '@/types';

const ResourceDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(false);

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

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  if (!resource) return <EmptyState title="Resource not found" description="The resource you're looking for doesn't exist." action={<Link to="/resources"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-1" />Back to Resources</Button></Link>} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/resources" className="hover:text-foreground flex items-center gap-1"><ArrowLeft className="h-3 w-3" />Resources</Link>
        <span>/</span>
        <span>{resource.name}</span>
      </div>

      <PageHeader
        title={resource.name}
        actions={
          user?.role === 'ADMIN' && (
            <div className="flex gap-2">
              <Link to={`/admin/resources/${resource.id}/edit`}><Button size="sm" variant="outline"><Edit className="h-3 w-3 mr-1" />Edit</Button></Link>
              <Button size="sm" variant="outline" className="text-destructive"><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
            </div>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg flex items-center justify-center">
              <span className="text-5xl">🏛️</span>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <StatusBadge status={resource.status} />
                <span className="text-sm text-muted-foreground">{resource.type}</span>
              </div>
              <p className="text-sm text-muted-foreground">{resource.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{resource.location}</span></div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span>Capacity: {resource.capacity}</span></div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span>{resource.availableFrom} – {resource.availableTo}</span></div>
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
