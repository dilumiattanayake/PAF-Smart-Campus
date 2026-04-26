import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { CardSkeleton } from '@/components/shared/LoadingState';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, LayoutGrid, List, MapPin, Users as UsersIcon, Building2, Wrench, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { resourceService } from '@/services/resourceService';
import type { Resource } from '@/types';

const ResourceListPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [minCapacity, setMinCapacity] = useState('');
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [resources, setResources] = useState<Resource[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);

  const getTypeMeta = (type: string) => {
    const normalized = type.toLowerCase();
    if (normalized.includes('lecture')) return { icon: '🏛️', tone: 'from-primary/15 via-transparent to-accent/10' };
    if (normalized.includes('lab')) return { icon: '🧪', tone: 'from-emerald-500/15 via-transparent to-cyan-500/10' };
    if (normalized.includes('meeting') || normalized.includes('conference')) return { icon: '🪑', tone: 'from-amber-500/15 via-transparent to-rose-500/10' };
    if (normalized.includes('projector') || normalized.includes('camera') || normalized.includes('equipment')) return { icon: '🎥', tone: 'from-indigo-500/15 via-transparent to-sky-500/10' };
    return { icon: '🏢', tone: 'from-slate-500/15 via-transparent to-emerald-500/10' };
  };

  const formatAvailability = (resource: Resource) => {
    if (resource.availableFrom && resource.availableTo) {
      return `${resource.availableFrom}–${resource.availableTo}`;
    }
    return 'Hours TBD';
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await resourceService.getAll();
        setAllResources(data);
        setResources(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await resourceService.getAll({
          q: search || undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          location: locationFilter !== 'all' ? locationFilter : undefined,
          minCapacity: minCapacity ? Number(minCapacity) : undefined,
        });
        setResources(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [search, typeFilter, statusFilter, locationFilter, minCapacity]);

  const types = [...new Set(allResources.map(r => r.type))];
  const locations = [...new Set(allResources.map(r => r.location))];
  const totalResources = allResources.length;
  const activeResources = allResources.filter(r => r.status === 'ACTIVE' || r.status === 'AVAILABLE').length;
  const outOfServiceResources = allResources.filter(r => r.status === 'OUT_OF_SERVICE' || r.status === 'UNAVAILABLE').length;
  const maintenanceResources = allResources.filter(r => r.status === 'MAINTENANCE').length;
  const hasFilters = Boolean(search || typeFilter !== 'all' || statusFilter !== 'all' || locationFilter !== 'all' || minCapacity);

  const handleReset = () => {
    setSearch('');
    setTypeFilter('all');
    setStatusFilter('all');
    setLocationFilter('all');
    setMinCapacity('');
  };

  return (
    <div className="relative space-y-6 animate-fade-in">
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative space-y-6">
        <PageHeader
          title="Resources & Facilities"
          description="Plan, manage, and book shared campus spaces and equipment."
          actions={user?.role === 'ADMIN' && <Link to="/admin/resources/new"><Button size="sm"><Plus className="h-3 w-3 mr-1" />Add Resource</Button></Link>}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total resources" value={totalResources} icon={Building2} description="Across all campus locations" />
          <StatCard title="Active" value={activeResources} icon={UsersIcon} description="Ready to be booked" className="border-success/30" />
          <StatCard title="Maintenance" value={maintenanceResources} icon={Wrench} description="Temporarily offline" className="border-info/30" />
          <StatCard title="Out of service" value={outOfServiceResources} icon={AlertTriangle} description="Unavailable now" className="border-destructive/30" />
        </div>

        <Card className="border bg-card/80 backdrop-blur">
          <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
            <SearchFilterBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search by name, location, or type..."
              filters={[
                { key: 'type', label: 'Type', options: types.map(t => ({ label: t, value: t })), value: typeFilter, onChange: setTypeFilter },
                { key: 'location', label: 'Location', options: locations.map(l => ({ label: l, value: l })), value: locationFilter, onChange: setLocationFilter },
                { key: 'status', label: 'Status', options: [{ label: 'Active', value: 'ACTIVE' }, { label: 'Out of Service', value: 'OUT_OF_SERVICE' }, { label: 'Maintenance', value: 'MAINTENANCE' }], value: statusFilter, onChange: setStatusFilter },
              ]}
              className="flex-1"
            />
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="minCapacity" className="text-sm text-muted-foreground">Min capacity</label>
                <input
                  id="minCapacity"
                  type="number"
                  min={1}
                  value={minCapacity}
                  onChange={e => setMinCapacity(e.target.value)}
                  className="h-9 w-28 rounded-md border border-input bg-background px-3 text-sm"
                  placeholder="0"
                />
              </div>
              <Tabs value={view} onValueChange={v => setView(v as any)}>
                <TabsList className="h-9">
                  <TabsTrigger value="grid" className="px-3"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
                  <TabsTrigger value="table" className="px-3"><List className="h-4 w-4" /></TabsTrigger>
                </TabsList>
              </Tabs>
              {hasFilters && (
                <Button variant="outline" size="sm" onClick={handleReset}>Reset</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : resources.length === 0 ? (
          <EmptyState title="No resources found" description="Try adjusting your search or filters." />
        ) : view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map(r => {
              const meta = getTypeMeta(r.type);
              return (
                <Link key={r.id} to={`/resources/${r.id}`}>
                  <Card className="group h-full overflow-hidden border-transparent bg-card/90 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg">
                    <div className={`h-28 bg-gradient-to-br ${meta.tone} relative`}
                      aria-hidden="true"
                    />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{r.type}</p>
                          <h3 className="mt-1 text-lg font-semibold font-display group-hover:text-primary transition-colors">{r.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{r.location}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-sm text-xl">
                          {meta.icon}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{r.description}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><UsersIcon className="h-3 w-3" />{r.capacity} seats</span>
                        <span>{formatAvailability(r)}</span>
                        <StatusBadge status={r.status} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map(r => (
                    <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell><Link to={`/resources/${r.id}`} className="font-medium hover:text-primary">{r.name}</Link></TableCell>
                      <TableCell>{r.type}</TableCell>
                      <TableCell className="text-muted-foreground">{r.location}</TableCell>
                      <TableCell className="tabular-nums">{r.capacity}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{formatAvailability(r)}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ResourceListPage;
