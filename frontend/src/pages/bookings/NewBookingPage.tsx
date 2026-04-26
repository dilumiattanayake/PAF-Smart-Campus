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
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { resourceService } from '@/services/resourceService';
import { bookingService } from '@/services/bookingService';
import type { BookingRecommendation, Resource } from '@/types';
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
  const [recommendations, setRecommendations] = useState<BookingRecommendation[]>([]);
  const [conflictMessage, setConflictMessage] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setRecommendations([]);
    setConflictMessage('');
    try {
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
      const serverRecommendations = err?.response?.data?.details?.recommendations;
      const parsedRecommendations = Array.isArray(serverRecommendations)
        ? (serverRecommendations as BookingRecommendation[])
        : [];
      if (conflict) {
        setConflictMessage(serverMessage || 'This time range conflicts with an existing booking.');
        setRecommendations(parsedRecommendations);
      }
      toast({
        title: conflict ? 'Time conflict detected' : 'Unable to save booking',
        description: conflict
          ? (parsedRecommendations.length > 0
            ? `Found ${parsedRecommendations.length} alternative resource option(s).`
            : (serverMessage || 'This time range conflicts with an existing booking.'))
          : 'Please try again or contact admin.',
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
            {recommendations.length > 0 && (
              <Alert className="border-amber-300 bg-amber-50/80">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Suggested Alternatives For The Same Time And Location</AlertTitle>
                <AlertDescription>
                  <p>{conflictMessage}</p>
                  <div className="mt-3 grid gap-2">
                    {recommendations.map(rec => (
                      <div key={rec.resourceId} className="rounded-md border border-amber-200 bg-white p-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm">
                          <p className="font-medium text-foreground">{rec.resourceName || rec.resourceId}</p>
                          <p className="text-muted-foreground">
                            {rec.resourceType} | {rec.location}
                            {typeof rec.capacity === 'number' ? ` | Capacity ${rec.capacity}` : ''}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setForm(prev => ({ ...prev, resourceId: rec.resourceId }));
                            setRecommendations([]);
                            setErrors(prev => ({ ...prev, resourceId: '' }));
                          }}
                        >
                          Use This Resource
                        </Button>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
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
