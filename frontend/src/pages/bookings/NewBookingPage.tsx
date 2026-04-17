import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { resourceService } from '@/services/resourceService';
import { bookingService } from '@/services/bookingService';
import type { Booking, Resource } from '@/types';
import { useEffect } from 'react';

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

const NewBookingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const editId = params.get('editId');
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [form, setForm] = useState({
    resourceId: params.get('resourceId') || '',
    purpose: '', bookingDate: '', startTime: '09:00', endTime: '10:00',
    attendeeCount: '', notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const res = await resourceService.getAll();
      setResources(res);
    })();
  }, []);

  useEffect(() => {
    if (!editId) return;
    (async () => {
      const booking = await bookingService.getById(editId);
      setForm({
        resourceId: booking.resourceId,
        purpose: booking.purpose,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        attendeeCount: booking.attendeeCount?.toString() || '',
        notes: booking.notes || '',
      });
    })();
  }, [editId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.resourceId) e.resourceId = 'Select a resource';
    if (!form.purpose.trim()) e.purpose = 'Required';
    if (!form.bookingDate) e.bookingDate = 'Required';
    if (!form.startTime) e.startTime = 'Required';
    if (!form.endTime) e.endTime = 'Required';
    if (form.startTime >= form.endTime) e.endTime = 'Must be after start time';
    if (!form.attendeeCount || Number(form.attendeeCount) < 1) e.attendeeCount = 'At least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toMinutes = (t: string) => {
    const m = /^(\d{1,2}):(\d{2})/.exec(t);
    if (!m) return null;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    return hh * 60 + mm;
  };

  const overlaps = (start1: string, end1: string, start2: string, end2: string) => {
    const s1 = toMinutes(start1);
    const e1 = toMinutes(end1);
    const s2 = toMinutes(start2);
    const e2 = toMinutes(end2);
    if (s1 == null || e1 == null || s2 == null || e2 == null) return false;
    return s1 < e2 && e1 > s2;
  };

  const findUserTimeConflict = (all: Booking[], date: string, startTime: string, endTime: string, ignoreId?: string | null) => {
    return all.find(b =>
      b.id !== ignoreId &&
      b.bookingDate === date &&
      (b.status === 'PENDING' || b.status === 'APPROVED') &&
      overlaps(startTime, endTime, b.startTime, b.endTime)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Client-side guard: avoid letting a USER double-book themselves.
      if (user?.role === 'USER') {
        const mine = await bookingService.getMyBookings();
        const conflict = findUserTimeConflict(mine, form.bookingDate, form.startTime, form.endTime, editId);
        if (conflict) {
          const msg = `You already have a booking for ${conflict.resourceName || conflict.resourceId} on ${conflict.bookingDate} (${conflict.startTime}–${conflict.endTime}).`;
          setErrors(prev => ({ ...prev, startTime: msg, endTime: msg }));
          toast({ title: 'Time conflict', description: msg, variant: 'destructive' });
          return;
        }
      }

      const payload = {
        resourceId: form.resourceId,
        purpose: form.purpose,
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
        attendeeCount: Number(form.attendeeCount),
        notes: form.notes,
      };
      if (editId) {
        await bookingService.update(editId, payload);
        toast({ title: 'Booking updated', description: 'Your booking was updated successfully.' });
      } else {
        await bookingService.create(payload);
        toast({ title: 'Booking submitted!', description: 'Your booking request is pending approval.' });
      }
      navigate('/bookings');
    } catch (err: any) {
      const conflict = err?.response?.status === 409;
      const serverMessage = err?.response?.data?.message as string | undefined;
      toast({
        title: conflict ? 'Time conflict detected' : 'Unable to save booking',
        description: conflict ? (serverMessage || 'This time range conflicts with an existing booking.') : 'Please try again or contact admin.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <PageHeader title={editId ? 'Update Booking' : 'Create New Booking'} description={editId ? 'Edit your pending booking before approval.' : 'Request a campus resource'} />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField id="resourceId" label="Resource" error={errors.resourceId}>
              <Select value={form.resourceId} onValueChange={v => setForm({ ...form, resourceId: v })}>
                <SelectTrigger id="resourceId" aria-label="Resource">
                  <SelectValue placeholder="Select resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources
                    .filter(r => r.status === 'ACTIVE')
                    .map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name} ({r.type})</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="resourceId" value={form.resourceId} />
            </FormField>
            <FormField id="purpose" label="Purpose" error={errors.purpose}>
              <Input id="purpose" name="purpose" autoComplete="off" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} placeholder="e.g., Guest Lecture on AI Ethics" />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField id="bookingDate" label="Date" error={errors.bookingDate}>
                <Input id="bookingDate" name="bookingDate" autoComplete="off" type="date" value={form.bookingDate} onChange={e => setForm({ ...form, bookingDate: e.target.value })} />
              </FormField>
              <FormField id="startTime" label="Start Time" error={errors.startTime}>
                <Input id="startTime" name="startTime" autoComplete="off" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
              </FormField>
              <FormField id="endTime" label="End Time" error={errors.endTime}>
                <Input id="endTime" name="endTime" autoComplete="off" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
              </FormField>
            </div>
            <FormField id="attendeeCount" label="Number of Attendees" error={errors.attendeeCount}>
              <Input id="attendeeCount" name="attendeeCount" autoComplete="off" type="number" value={form.attendeeCount} onChange={e => setForm({ ...form, attendeeCount: e.target.value })} />
            </FormField>
            <FormField id="notes" label="Additional Notes (optional)" error={errors.notes}>
              <Textarea id="notes" name="notes" autoComplete="off" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
            </FormField>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Booking'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewBookingPage;
