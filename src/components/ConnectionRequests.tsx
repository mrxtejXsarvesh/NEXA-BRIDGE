import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, X, UserPlus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import VerifiedBadge from '@/components/VerifiedBadge';

interface ConnectionRequestsProps {
  /** If true, shows ALL pending connections (admin view) */
  adminView?: boolean;
}

export default function ConnectionRequests({ adminView = false }: ConnectionRequestsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: pendingConnections = [], isLoading } = useQuery({
    queryKey: ['pending-connections', user?.id, adminView],
    queryFn: async () => {
      let query = supabase.from('connections').select('*').eq('status', 'pending');
      if (!adminView) {
        query = query.eq('receiver_id', user!.id);
      }
      const { data } = await query.order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['connection-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('user_id, full_name, position, company, department');
      return data ?? [];
    },
  });

  const { data: connRoles = [] } = useQuery({
    queryKey: ['connection-roles'],
    queryFn: async () => {
      const { data } = await supabase.from('user_roles').select('*');
      return data ?? [];
    },
  });

  const getRoleForUser = (userId: string) => connRoles.find(r => r.user_id === userId)?.role ?? null;

  const respondMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'accepted' | 'rejected' }) => {
      const { error } = await supabase.from('connections').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      toast.success(status === 'accepted' ? 'Connection accepted!' : 'Connection rejected');
      queryClient.invalidateQueries({ queryKey: ['pending-connections'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: () => toast.error('Failed to update connection'),
  });

  const getProfile = (userId: string) => profiles.find(p => p.user_id === userId);
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => <Card key={i}><CardContent className="p-4 h-16 animate-pulse bg-muted/30" /></Card>)}
      </div>
    );
  }

  if (pendingConnections.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No pending connection requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingConnections.map(conn => {
        const sender = getProfile(conn.sender_id);
        const receiver = getProfile(conn.receiver_id);
        const senderName = sender?.full_name || 'Unknown';
        const receiverName = receiver?.full_name || 'Unknown';
        const initials = getInitials(senderName);
        const isReceiver = conn.receiver_id === user?.id;

        return (
          <Card key={conn.id} className="glass-card border-0">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium">{senderName}</p>
                    <VerifiedBadge role={getRoleForUser(conn.sender_id)} />
                  </div>
                  {adminView && (
                    <p className="text-xs text-muted-foreground">→ {receiverName}</p>
                  )}
                  {sender?.position && sender?.company && (
                    <p className="text-xs text-muted-foreground">{sender.position} at {sender.company}</p>
                  )}
                  {sender?.department && (
                    <p className="text-xs text-muted-foreground">{sender.department}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3 inline mr-0.5" />
                    {new Date(conn.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" /> Pending
                </Badge>
                {(isReceiver || adminView) && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                      onClick={() => respondMutation.mutate({ id: conn.id, status: 'accepted' })}
                      disabled={respondMutation.isPending}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => respondMutation.mutate({ id: conn.id, status: 'rejected' })}
                      disabled={respondMutation.isPending}
                    >
                      <X className="h-3.5 w-3.5 mr-1" /> Reject
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
