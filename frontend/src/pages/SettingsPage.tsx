import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const SettingsPage = () => (
  <div className="space-y-6 animate-fade-in max-w-2xl">
    <PageHeader title="Settings" description="Manage your preferences" />
    <Card>
      <CardHeader><CardTitle className="text-base">Notification Preferences</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {['Email notifications', 'Booking confirmations', 'Ticket updates', 'System announcements'].map(s => (
          <div key={s} className="flex items-center justify-between">
            <Label>{s}</Label><Switch defaultChecked />
          </div>
        ))}
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle className="text-base">Display</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between"><Label>Compact mode</Label><Switch /></div>
        <div className="flex items-center justify-between"><Label>Show IDs in tables</Label><Switch defaultChecked /></div>
      </CardContent>
    </Card>
  </div>
);

export default SettingsPage;
