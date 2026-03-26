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

  const F = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {errors[id] && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors[id]}</p>}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <PageHeader title="Add New Resource" description="Create a new campus resource or facility" />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <F id="name" label="Resource Name"><Input id="name" name="name" autoComplete="off" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></F>
            <div className="grid gap-4 sm:grid-cols-2">
              <F id="type" label="Type">
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger id="type" aria-label="Type"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {['Lecture Hall', 'Lab', 'Study Room', 'Conference Room', 'Sports Facility'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <input type="hidden" name="type" value={form.type} />
              </F>
              <F id="capacity" label="Capacity"><Input id="capacity" name="capacity" autoComplete="off" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} /></F>
            </div>
            <F id="location" label="Location"><Input id="location" name="location" autoComplete="off" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></F>
            <F id="description" label="Description"><Textarea id="description" name="description" autoComplete="off" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></F>
            <div className="grid gap-4 sm:grid-cols-2">
              <F id="availableFrom" label="Available From"><Input id="availableFrom" name="availableFrom" autoComplete="off" type="time" value={form.availableFrom} onChange={e => setForm({ ...form, availableFrom: e.target.value })} /></F>
              <F id="availableTo" label="Available To"><Input id="availableTo" name="availableTo" autoComplete="off" type="time" value={form.availableTo} onChange={e => setForm({ ...form, availableTo: e.target.value })} /></F>
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
