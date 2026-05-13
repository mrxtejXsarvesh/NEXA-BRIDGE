import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import VerifiedBadge from '@/components/VerifiedBadge';

export default function Appointments() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .or(`requester_id.eq.${user!.id},requested_id.eq.${user!.id}`)
        .order('scheduled_at', { ascending: true });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['appointment-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('user_id, full_name');
      return data ?? [];
    },
  });

  const { data: appointmentRoles = [] } = useQuery({
    queryKey: ['appointment-roles'],
    queryFn: async () => {
      const { data } = await supabase.from('user_roles').select('*');
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'accepted' | 'rejected' }) => {
      const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment updated!');
    },
  });

  const getName = (userId: string) => profiles.find(p => p.user_id === userId)?.full_name ?? 'Unknown';
  const getRoleForUser = (userId: string) => appointmentRoles.find(r => r.user_id === userId)?.role ?? null;

  const statusIcons: Record<string, typeof Clock> = { pending: Clock, accepted: Check, rejected: X };
  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    accepted: 'bg-success/10 text-success',
    rejected: 'bg-destructive/10 text-destructive',
    completed: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appointments</h1>
        <p className="text-muted-foreground">Manage your mentorship and meeting requests</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2].map(i => <Card key={i}><CardContent className="p-6 h-20 animate-pulse bg-muted/30" /></Card>)}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarClock className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No appointments yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(apt => {
            const isRequested = apt.requested_id === user?.id;
            const otherName = getName(isRequested ? apt.requester_id : apt.requested_id);
            const otherUserId = isRequested ? apt.requester_id : apt.requested_id;
            return (
              <Card key={apt.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h3 className="font-medium text-sm">{apt.title}</h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span>{isRequested ? `From: ${otherName}` : `With: ${otherName}`}</span>
                      <VerifiedBadge role={getRoleForUser(otherUserId)} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(apt.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {apt.description && <p className="text-xs text-muted-foreground">{apt.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[apt.status]}>{apt.status}</Badge>
                    {isRequested && apt.status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline" className="text-success" onClick={() => updateStatus.mutate({ id: apt.id, status: 'accepted' })}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatus.mutate({ id: apt.id, status: 'rejected' })}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
