import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
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

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_LOCATION_LENGTH = 100;
const MAX_CAPACITY = 1000;

const isValidUrl = (value: string) => {
  if (!value.trim()) return false;
  return /^https?:\/\/[\w\-@:/?&=.]+=*$/i.test(value);
};

const parseTimeValue = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

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
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', description: '', capacity: '', location: '', availableFrom: '08:00', availableTo: '18:00', status: 'ACTIVE', image: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const typeOptions = [
    'Lecture Hall',
    'Lab',
    'Computer Lab',
    'Meeting Room',
    'Conference Room',
    'Seminar Room',
    'Projector',
    'Camera',
    'Microphone',
    'Speaker System',
    '3D Printer',
    'Other Equipment',
  ];

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
            image: res.image ?? '',
        });
      }
      setLoading(false);
    })();
  }, [id]);

  const validate = () => {
    const e: Record<string, string> = {};
    const trimmedName = form.name.trim();
    const trimmedLocation = form.location.trim();
    const trimmedDescription = form.description.trim();

    if (!trimmedName) {
      e.name = 'Required';
    } else if (trimmedName.length < 3) {
      e.name = 'At least 3 characters';
    } else if (trimmedName.length > MAX_NAME_LENGTH) {
      e.name = `Maximum ${MAX_NAME_LENGTH} characters`;
    }

    if (!form.type.trim()) {
      e.type = 'Required';
    }

    if (!form.status) {
      e.status = 'Required';
    }

    if (!trimmedLocation) {
      e.location = 'Required';
    } else if (trimmedLocation.length < 3) {
      e.location = 'Enter a valid location';
    } else if (trimmedLocation.length > MAX_LOCATION_LENGTH) {
      e.location = `Maximum ${MAX_LOCATION_LENGTH} characters`;
    }

    if (!form.capacity) {
      e.capacity = 'Required';
    } else if (!Number.isInteger(Number(form.capacity))) {
      e.capacity = 'Must be a whole number';
    } else if (Number(form.capacity) < 1) {
      e.capacity = 'Must be at least 1';
    } else if (Number(form.capacity) > MAX_CAPACITY) {
      e.capacity = `Must not exceed ${MAX_CAPACITY}`;
    }

    if (trimmedDescription && trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
      e.description = `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    if (form.image && !isValidUrl(form.image)) {
      e.image = 'Enter a valid URL starting with https:// or http://';
    }

    const hasFrom = Boolean(form.availableFrom);
    const hasTo = Boolean(form.availableTo);
    if (hasFrom !== hasTo) {
      e.availableFrom = 'Start and end time required';
      e.availableTo = 'Start and end time required';
    } else if (hasFrom && hasTo) {
      if (parseTimeValue(form.availableFrom) >= parseTimeValue(form.availableTo)) {
        e.availableFrom = 'Start time must be before end time';
        e.availableTo = 'End time must be after start time';
      }
    }

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
      image: form.image,
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
      <PageHeader title={isEdit ? 'Edit Resource' : 'Add New Resource'} description="Create a new campus resource or facility" />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField id="name" label="Resource Name" error={errors.name}>
              <Input id="name" name="name" autoComplete="off" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="type" label="Type" error={errors.type}>
                <Input
                  id="type"
                  name="type"
                  autoComplete="off"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  list="resource-types"
                  placeholder="Lecture Hall, Projector, Camera"
                />
                <datalist id="resource-types">
                  {typeOptions.map(t => <option key={t} value={t} />)}
                </datalist>
              </FormField>
              <FormField id="status" label="Status" error={errors.status}>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger id="status" aria-label="Status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="status" value={form.status} />
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
            <FormField id="image" label="Image URL (optional)" error={errors.image}>
              <Input id="image" name="image" autoComplete="off" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://" />
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
              <Button type="submit" disabled={loading}>{loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Resource')}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminResourceFormPage;
