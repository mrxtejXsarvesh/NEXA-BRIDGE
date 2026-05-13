import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Users, UserPlus, Briefcase, Calendar, MessageSquare, Shield,
  Ban, UserCheck, Trash2, Search, AlertTriangle, ClipboardList, Globe,
} from 'lucide-react';
import LandingPageEditor from '@/components/LandingPageEditor';
import ConnectionRequests from '@/components/ConnectionRequests';
import VerifiedBadge from '@/components/VerifiedBadge';

// Helper to log admin actions
async function logAction(adminUserId: string, action: string, targetType: string, targetId?: string, details?: string) {
  await supabase.from('admin_logs').insert({
    admin_user_id: adminUserId,
    action,
    target_type: targetType,
    target_id: targetId ?? null,
    details: details ?? null,
  });
}

export default function AdminPanel() {
  const { role, user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{ type: string; id: string; name: string } | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    enabled: role === 'admin',
    queryFn: async () => {
      const [users, connections, jobs, events, messages] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('connections').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
      ]);
      const blocked = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_blocked', true);
      return {
        users: users.count ?? 0, connections: connections.count ?? 0, jobs: jobs.count ?? 0,
        events: events.count ?? 0, messages: messages.count ?? 0, blocked: blocked.count ?? 0,
      };
    },
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin-users'],
    enabled: role === 'admin',
    queryFn: async () => {
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: roles } = await supabase.from('user_roles').select('*');
      return (profiles ?? []).map(p => ({
        ...p,
        role: roles?.find(r => r.user_id === p.user_id)?.role ?? 'unknown',
      }));
    },
  });

  const { data: allJobs = [] } = useQuery({
    queryKey: ['admin-jobs'],
    enabled: role === 'admin',
    queryFn: async () => {
      const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ['admin-events'],
    enabled: role === 'admin',
    queryFn: async () => {
      const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  // Activity Logs
  const { data: logs = [] } = useQuery({
    queryKey: ['admin-logs'],
    enabled: role === 'admin',
    queryFn: async () => {
      const { data } = await supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const blockMutation = useMutation({
    mutationFn: async ({ userId, block, userName }: { userId: string; block: boolean; userName: string }) => {
      const { error } = await supabase.from('profiles').update({ is_blocked: block }).eq('user_id', userId);
      if (error) throw error;
      if (user) await logAction(user.id, block ? 'block_user' : 'unblock_user', 'user', userId, `${block ? 'Blocked' : 'Unblocked'} user: ${userName}`);
    },
    onSuccess: (_, { block }) => {
      toast.success(block ? 'User blocked' : 'User unblocked');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
    },
    onError: () => toast.error('Action failed'),
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async ({ userId, userName }: { userId: string; userName: string }) => {
      const { error } = await supabase.from('profiles').delete().eq('user_id', userId);
      if (error) throw error;
      if (user) await logAction(user.id, 'delete_profile', 'user', userId, `Deleted profile: ${userName}`);
    },
    onSuccess: () => {
      toast.success('Profile removed');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
      setConfirmDialog(null);
    },
    onError: () => toast.error('Failed to remove profile'),
  });

  const deleteJobMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from('jobs').delete().eq('id', id);
      if (error) throw error;
      if (user) await logAction(user.id, 'delete_job', 'job', id, `Deleted job: ${name}`);
    },
    onSuccess: () => {
      toast.success('Job deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
      setConfirmDialog(null);
    },
    onError: () => toast.error('Failed to delete job'),
  });

  const toggleJobMutation = useMutation({
    mutationFn: async ({ id, active, name }: { id: string; active: boolean; name: string }) => {
      const { error } = await supabase.from('jobs').update({ is_active: active }).eq('id', id);
      if (error) throw error;
      if (user) await logAction(user.id, active ? 'activate_job' : 'deactivate_job', 'job', id, `${active ? 'Activated' : 'Deactivated'} job: ${name}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      if (user) await logAction(user.id, 'delete_event', 'event', id, `Deleted event: ${name}`);
    },
    onSuccess: () => {
      toast.success('Event deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
      setConfirmDialog(null);
    },
    onError: () => toast.error('Failed to delete event'),
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole, userName }: { userId: string; newRole: string; userName: string }) => {
      // Use upsert to handle users who may not have a role entry yet
      const { error } = await supabase.from('user_roles').upsert(
        { user_id: userId, role: newRole as any },
        { onConflict: 'user_id' }
      );
      if (error) throw error;
      if (user) await logAction(user.id, 'change_role', 'user', userId, `Changed role of ${userName} to ${newRole}`);
    },
    onSuccess: () => {
      toast.success('Role updated!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
    },
    onError: (err: any) => toast.error('Failed to change role: ' + err.message),
  });

  const changeBadgeMutation = useMutation({
    mutationFn: async ({ userId, badge, userName }: { userId: string; badge: string | null; userName: string }) => {
      const { error } = await supabase.from('profiles').update({ student_badge: badge } as any).eq('user_id', userId);
      if (error) throw error;
      if (user) await logAction(user.id, 'change_badge', 'user', userId, `Set badge of ${userName} to ${badge || 'none'}`);
    },
    onSuccess: () => {
      toast.success('Badge updated!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
    },
    onError: () => toast.error('Failed to update badge'),
  });

  if (role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Admin access required.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = allUsers.filter(u =>
    (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.department ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { label: 'Total Users', value: stats?.users ?? 0, icon: Users, color: 'text-blue-500' },
    { label: 'Blocked', value: stats?.blocked ?? 0, icon: Ban, color: 'text-red-500' },
    { label: 'Connections', value: stats?.connections ?? 0, icon: UserPlus, color: 'text-green-500' },
    { label: 'Job Posts', value: stats?.jobs ?? 0, icon: Briefcase, color: 'text-purple-500' },
    { label: 'Events', value: stats?.events ?? 0, icon: Calendar, color: 'text-orange-500' },
    { label: 'Messages', value: stats?.messages ?? 0, icon: MessageSquare, color: 'text-cyan-500' },
  ];

  const actionLabels: Record<string, { label: string; color: string }> = {
    block_user: { label: 'Blocked User', color: 'destructive' },
    unblock_user: { label: 'Unblocked User', color: 'secondary' },
    delete_profile: { label: 'Deleted Profile', color: 'destructive' },
    delete_job: { label: 'Deleted Job', color: 'destructive' },
    activate_job: { label: 'Activated Job', color: 'secondary' },
    deactivate_job: { label: 'Deactivated Job', color: 'outline' },
    delete_event: { label: 'Deleted Event', color: 'destructive' },
  };

  const handleConfirm = () => {
    if (!confirmDialog) return;
    if (confirmDialog.type === 'delete-profile') deleteProfileMutation.mutate({ userId: confirmDialog.id, userName: confirmDialog.name });
    if (confirmDialog.type === 'delete-job') deleteJobMutation.mutate({ id: confirmDialog.id, name: confirmDialog.name });
    if (confirmDialog.type === 'delete-event') deleteEventMutation.mutate({ id: confirmDialog.id, name: confirmDialog.name });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> Admin Panel
        </h1>
        <p className="text-muted-foreground">Full platform control — manage users, content & settings</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(c => (
          <Card key={c.label} className="glass-card border-0 rounded-xl">
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 rounded-xl mx-auto mb-2 flex items-center justify-center bg-primary/10">
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="glass-card border-0 rounded-xl p-1 flex-wrap h-auto">
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" /> Users</TabsTrigger>
          <TabsTrigger value="jobs"><Briefcase className="h-4 w-4 mr-1" /> Jobs</TabsTrigger>
          <TabsTrigger value="events"><Calendar className="h-4 w-4 mr-1" /> Events</TabsTrigger>
          <TabsTrigger value="connections"><UserPlus className="h-4 w-4 mr-1" /> Connections</TabsTrigger>
          <TabsTrigger value="logs"><ClipboardList className="h-4 w-4 mr-1" /> Activity Logs</TabsTrigger>
          <TabsTrigger value="landing"><Globe className="h-4 w-4 mr-1" /> Landing Page</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="glass-card border-0 rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base">User Management</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Badge</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium flex items-center gap-1">{u.full_name || '—'} <VerifiedBadge role={u.role} studentBadge={(u as any).student_badge} /></TableCell>
                        <TableCell>
                          <select
                            className="h-8 px-2 rounded-md border border-input bg-background text-xs font-medium"
                            value={u.role}
                            onChange={e => changeRoleMutation.mutate({ userId: u.user_id, newRole: e.target.value, userName: u.full_name || 'Unknown' })}
                            disabled={u.user_id === user?.id}
                          >
                            <option value="student">Student</option>
                            <option value="alumni">Alumni</option>
                            <option value="admin">Admin</option>
                          </select>
                        </TableCell>
                        <TableCell>
                          {u.role === 'student' ? (
                            <select
                              className="h-8 px-2 rounded-md border border-input bg-background text-xs font-medium"
                              value={(u as any).student_badge || ''}
                              onChange={e => changeBadgeMutation.mutate({ userId: u.user_id, badge: e.target.value || null, userName: u.full_name || 'Unknown' })}
                            >
                              <option value="">No Badge</option>
                              <option value="gold">🥇 Gold</option>
                              <option value="silver">🥈 Silver</option>
                              <option value="bronze">🥉 Bronze</option>
                            </select>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{u.department || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{u.company || '—'}</TableCell>
                        <TableCell>
                          {u.is_blocked ? (
                            <Badge variant="destructive" className="text-xs">Blocked</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-600">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {u.is_blocked ? (
                              <Button size="sm" variant="outline" className="h-8 text-xs"
                                onClick={() => blockMutation.mutate({ userId: u.user_id, block: false, userName: u.full_name || 'Unknown' })}>
                                <UserCheck className="h-3 w-3 mr-1" /> Unblock
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline"
                                className="h-8 text-xs text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => blockMutation.mutate({ userId: u.user_id, block: true, userName: u.full_name || 'Unknown' })}
                                disabled={u.role === 'admin'}>
                                <Ban className="h-3 w-3 mr-1" /> Block
                              </Button>
                            )}
                            <Button size="sm" variant="destructive" className="h-8 text-xs"
                              onClick={() => setConfirmDialog({ type: 'delete-profile', id: u.user_id, name: u.full_name || 'this user' })}
                              disabled={u.role === 'admin'}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Card className="glass-card border-0 rounded-xl">
            <CardHeader><CardTitle className="text-base">Job Posts Management</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allJobs.map(j => (
                      <TableRow key={j.id}>
                        <TableCell className="font-medium">{j.title}</TableCell>
                        <TableCell className="text-muted-foreground">{j.company}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{j.job_type.replace('_', ' ')}</Badge></TableCell>
                        <TableCell>
                          <Switch checked={j.is_active ?? true} onCheckedChange={active => toggleJobMutation.mutate({ id: j.id, active, name: j.title })} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">{new Date(j.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="destructive" className="h-8 text-xs"
                            onClick={() => setConfirmDialog({ type: 'delete-job', id: j.id, name: j.title })}>
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {allJobs.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No jobs found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card className="glass-card border-0 rounded-xl">
            <CardHeader><CardTitle className="text-base">Events Management</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Virtual</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allEvents.map(e => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.title}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{new Date(e.event_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-muted-foreground">{e.location || '—'}</TableCell>
                        <TableCell>
                          {e.is_virtual ? (
                            <Badge variant="secondary" className="text-xs">Virtual</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">In-person</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="destructive" className="h-8 text-xs"
                            onClick={() => setConfirmDialog({ type: 'delete-event', id: e.id, name: e.title })}>
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {allEvents.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No events found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connections Tab */}
        <TabsContent value="connections">
          <Card className="glass-card border-0 rounded-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" /> Pending Connection Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConnectionRequests adminView />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="glass-card border-0 rounded-xl">
            <CardHeader><CardTitle className="text-base">Activity Logs</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Date & Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map(log => {
                      const info = actionLabels[log.action] ?? { label: log.action, color: 'outline' };
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge variant={info.color as 'destructive' | 'secondary' | 'outline' | 'default'}>{info.label}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground capitalize">{log.target_type}</TableCell>
                          <TableCell className="text-sm max-w-xs truncate">{log.details || '—'}</TableCell>
                          <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {logs.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No activity yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Landing Page Tab */}
        <TabsContent value="landing">
          <LandingPageEditor />
        </TabsContent>
      </Tabs>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Confirm Action
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{confirmDialog?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
