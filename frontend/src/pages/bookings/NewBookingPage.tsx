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
import type { Resource } from '@/types';
import { useEffect } from 'react';

const NewBookingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [params] = useSearchParams();
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
    await bookingService.create({
      resourceId: form.resourceId,
      purpose: form.purpose,
      bookingDate: form.bookingDate,
      startTime: form.startTime,
      endTime: form.endTime,
      attendeeCount: Number(form.attendeeCount),
      notes: form.notes,
    });
    setLoading(false);
    toast({ title: 'Booking submitted!', description: 'Your booking request is pending approval.' });
    navigate('/bookings');
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
      <PageHeader title="Create New Booking" description="Request a campus resource" />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <F id="resourceId" label="Resource">
              <Select value={form.resourceId} onValueChange={v => setForm({ ...form, resourceId: v })}>
                <SelectTrigger id="resourceId" aria-label="Resource">
                  <SelectValue placeholder="Select resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.filter(r => r.status === 'AVAILABLE').map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name} ({r.type})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="resourceId" value={form.resourceId} />
            </F>
            <F id="purpose" label="Purpose"><Input id="purpose" name="purpose" autoComplete="off" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} placeholder="e.g., Guest Lecture on AI Ethics" /></F>
            <div className="grid gap-4 sm:grid-cols-3">
              <F id="bookingDate" label="Date"><Input id="bookingDate" name="bookingDate" autoComplete="off" type="date" value={form.bookingDate} onChange={e => setForm({ ...form, bookingDate: e.target.value })} /></F>
              <F id="startTime" label="Start Time"><Input id="startTime" name="startTime" autoComplete="off" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></F>
              <F id="endTime" label="End Time"><Input id="endTime" name="endTime" autoComplete="off" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></F>
            </div>
            <F id="attendeeCount" label="Number of Attendees"><Input id="attendeeCount" name="attendeeCount" autoComplete="off" type="number" value={form.attendeeCount} onChange={e => setForm({ ...form, attendeeCount: e.target.value })} /></F>
            <F id="notes" label="Additional Notes (optional)"><Textarea id="notes" name="notes" autoComplete="off" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} /></F>
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
