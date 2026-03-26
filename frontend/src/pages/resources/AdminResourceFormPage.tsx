import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { resourceService } from '@/services/resourceService';
import type { Resource } from '@/types';

type FieldProps = { id: string; label: string; error?: string; children: React.ReactNode };

const FormField = ({ id, label, error, children }: FieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error && (
      <p className="text-xs text-destructive flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
    )}
  </div>
);

const AdminResourceFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', description: '', capacity: '', location: '', availableFrom: '08:00', availableTo: '18:00', status: 'AVAILABLE' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const res = await resourceService.getById(id);
      if (res) {
        setForm({
          name: res.name ?? '',
          type: res.type ?? '',
          description: res.description ?? '',
          capacity: String(res.capacity ?? ''),
          location: res.location ?? '',
          availableFrom: res.availableFrom ?? '08:00',
          availableTo: res.availableTo ?? '18:00',
          status: res.status ?? 'AVAILABLE',
        });
      }
      setLoading(false);
    })();
  }, [id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.type) e.type = 'Required';
    if (!form.location.trim()) e.location = 'Required';
    if (!form.capacity || Number(form.capacity) < 1) e.capacity = 'Must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const payload: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'> = {
      name: form.name,
      type: form.type,
      description: form.description,
      capacity: Number(form.capacity),
      location: form.location,
      status: form.status as any,
      availableFrom: form.availableFrom,
      availableTo: form.availableTo,
      image: '',
      createdAt: '',
      updatedAt: '',
    };
    if (id) {
      await resourceService.update(id, payload);
      toast({ title: 'Resource updated', description: `${form.name} has been saved.` });
    } else {
      await resourceService.create(payload);
      toast({ title: 'Resource created', description: `${form.name} has been added successfully.` });
    }
    setLoading(false);
    navigate('/resources');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <PageHeader title="Add New Resource" description="Create a new campus resource or facility" />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField id="name" label="Resource Name" error={errors.name}>
              <Input id="name" name="name" autoComplete="off" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="type" label="Type" error={errors.type}>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger id="type" aria-label="Type"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {['Lecture Hall', 'Lab', 'Study Room', 'Conference Room', 'Sports Facility'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <input type="hidden" name="type" value={form.type} />
              </FormField>
              <FormField id="capacity" label="Capacity" error={errors.capacity}>
                <Input id="capacity" name="capacity" autoComplete="off" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
              </FormField>
            </div>
            <FormField id="location" label="Location" error={errors.location}>
              <Input id="location" name="location" autoComplete="off" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </FormField>
            <FormField id="description" label="Description" error={errors.description}>
              <Textarea id="description" name="description" autoComplete="off" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="availableFrom" label="Available From" error={errors.availableFrom}>
                <Input id="availableFrom" name="availableFrom" autoComplete="off" type="time" value={form.availableFrom} onChange={e => setForm({ ...form, availableFrom: e.target.value })} />
              </FormField>
              <FormField id="availableTo" label="Available To" error={errors.availableTo}>
                <Input id="availableTo" name="availableTo" autoComplete="off" type="time" value={form.availableTo} onChange={e => setForm({ ...form, availableTo: e.target.value })} />
              </FormField>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Resource'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminResourceFormPage;
