import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Upload } from 'lucide-react';

const NewTicketPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', description: '', priority: 'MEDIUM', resourceOrLocation: '', preferredContact: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.category) e.category = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    if (!form.resourceOrLocation.trim()) e.resourceOrLocation = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    toast({ title: 'Ticket created', description: 'Your maintenance request has been submitted.' });
    navigate('/tickets');
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
      <PageHeader title="Report an Issue" description="Submit a new maintenance or incident ticket" />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <F id="title" label="Issue Title"><Input id="title" name="title" autoComplete="off" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Brief summary of the issue" /></F>
            <div className="grid gap-4 sm:grid-cols-2">
              <F id="category" label="Category">
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger id="category" aria-label="Category"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {['Equipment', 'Plumbing', 'Electrical', 'HVAC', 'IT', 'Infrastructure', 'Other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <input type="hidden" name="category" value={form.category} />
              </F>
              <F id="priority" label="Priority">
                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                  <SelectTrigger id="priority" aria-label="Priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                <input type="hidden" name="priority" value={form.priority} />
              </F>
            </div>
            <F id="description" label="Description"><Textarea id="description" name="description" autoComplete="off" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Provide details about the issue..." /></F>
            <F id="resourceOrLocation" label="Resource / Location"><Input id="resourceOrLocation" name="resourceOrLocation" autoComplete="off" value={form.resourceOrLocation} onChange={e => setForm({ ...form, resourceOrLocation: e.target.value })} placeholder="e.g., Building A, Lecture Hall A" /></F>
            <F id="preferredContact" label="Preferred Contact (optional)"><Input id="preferredContact" name="preferredContact" autoComplete="off" value={form.preferredContact} onChange={e => setForm({ ...form, preferredContact: e.target.value })} placeholder="Email or phone" /></F>

            {/* File upload UI */}
            <div className="space-y-2">
              <Label>Attachments (optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Drag & drop files here, or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Ticket'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTicketPage;
