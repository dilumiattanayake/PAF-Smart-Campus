import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', department: user?.department || '' });

  const handleSave = () => {
    setEditing(false);
    toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <PageHeader title="Profile" actions={!editing && <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit Profile</Button>} />
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16"><AvatarFallback className="text-lg bg-primary text-primary-foreground">{user?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <StatusBadge status={user?.role || 'USER'} className="mt-1" />
            </div>
          </div>
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Department</Label><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
              <div className="flex gap-3"><Button onClick={handleSave}>Save Changes</Button><Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button></div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Phone</span><span>{user?.phone || 'Not set'}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Department</span><span>{user?.department || 'Not set'}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Joined</span><span>{user?.joinedAt}</span></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Current Password</Label><Input type="password" /></div>
          <div className="space-y-2"><Label>New Password</Label><Input type="password" /></div>
          <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" /></div>
          <Button onClick={() => toast({ title: 'Password updated' })}>Update Password</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
