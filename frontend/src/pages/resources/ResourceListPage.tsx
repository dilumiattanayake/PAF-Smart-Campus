import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, LayoutGrid, List, MapPin, Users as UsersIcon } from 'lucide-react';
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

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Resources & Facilities"
        description={`${resources.length} resources`}
        actions={user?.role === 'ADMIN' && <Link to="/admin/resources/new"><Button size="sm"><Plus className="h-3 w-3 mr-1" />Add Resource</Button></Link>}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search resources..."
          filters={[
            { key: 'type', label: 'Type', options: types.map(t => ({ label: t, value: t })), value: typeFilter, onChange: setTypeFilter },
            { key: 'location', label: 'Location', options: locations.map(l => ({ label: l, value: l })), value: locationFilter, onChange: setLocationFilter },
            { key: 'status', label: 'Status', options: [{ label: 'Active', value: 'ACTIVE' }, { label: 'Out of Service', value: 'OUT_OF_SERVICE' }, { label: 'Maintenance', value: 'MAINTENANCE' }], value: statusFilter, onChange: setStatusFilter },
          ]}
        />
        <div className="flex items-center gap-2">
          <label htmlFor="minCapacity" className="text-sm text-muted-foreground">Min capacity</label>
          <input
            id="minCapacity"
            type="number"
            min={1}
            value={minCapacity}
            onChange={e => setMinCapacity(e.target.value)}
            className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
            placeholder="0"
          />
        </div>
        <Tabs value={view} onValueChange={v => setView(v as any)}>
          <TabsList className="h-9">
            <TabsTrigger value="grid" className="px-3"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="table" className="px-3"><List className="h-4 w-4" /></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading resources...</p>
      ) : resources.length === 0 ? (
        <EmptyState title="No resources found" description="Try adjusting your search or filters." />
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map(r => (
            <Link key={r.id} to={`/resources/${r.id}`}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg flex items-center justify-center">
                  <span className="text-3xl">🏛️</span>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{r.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{r.location}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{r.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><UsersIcon className="h-3 w-3" />{r.capacity}</span>
                    <span>{r.type}</span>
                    <span>{r.availableFrom}–{r.availableTo}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
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
                    <TableCell className="text-muted-foreground font-mono text-xs">{r.availableFrom}–{r.availableTo}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
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

export default ResourceListPage;
