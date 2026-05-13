import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Briefcase, Calendar, UserPlus, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const { profile, role, user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [connections, messages, jobs, events] = await Promise.all([
        supabase.from('connections').select('id', { count: 'exact', head: true }).or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`).eq('status', 'accepted'),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('receiver_id', user!.id).eq('read', false),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('events').select('id', { count: 'exact', head: true }),
      ]);
      return {
        connections: connections.count ?? 0,
        unread: messages.count ?? 0,
        jobs: jobs.count ?? 0,
        events: events.count ?? 0,
      };
    },
  });

  const statCards = [
    { label: 'Connections', value: stats?.connections ?? 0, icon: Users, color: 'text-primary' },
    { label: 'Unread Messages', value: stats?.unread ?? 0, icon: MessageSquare, color: 'text-accent' },
    { label: 'Active Jobs', value: stats?.jobs ?? 0, icon: Briefcase, color: 'text-success' },
    { label: 'Events', value: stats?.events ?? 0, icon: Calendar, color: 'text-warning' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {profile?.full_name || 'there'}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {role === 'student' && 'Discover mentors and opportunities in your alumni network.'}
          {role === 'alumni' && 'Stay connected and help shape the next generation.'}
          {role === 'admin' && 'Manage your institution\'s alumni network.'}
          {!role && 'Your alumni connection dashboard.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {role === 'student' && (
              <>
                <ActionItem href="/directory" label="Browse Alumni Directory" desc="Find mentors and professionals" />
                <ActionItem href="/jobs" label="View Job Postings" desc="Discover internships and career opportunities" />
                <ActionItem href="/events" label="Upcoming Events" desc="Don't miss networking opportunities" />
              </>
            )}
            {role === 'alumni' && (
              <>
                <ActionItem href="/jobs" label="Post a Job/Internship" desc="Share opportunities with students" />
                <ActionItem href="/appointments" label="Manage Appointments" desc="Review mentorship requests" />
                <ActionItem href="/profile" label="Update Profile" desc="Keep your info current" />
              </>
            )}
            {role === 'admin' && (
              <>
                <ActionItem href="/admin" label="Admin Dashboard" desc="View analytics and manage users" />
                <ActionItem href="/events" label="Create Event" desc="Organize alumni gatherings" />
                <ActionItem href="/directory" label="User Directory" desc="Manage all members" />
              </>
            )}
            {!role && (
              <ActionItem href="/profile" label="Complete Your Profile" desc="Get started by setting up your profile" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-accent" />
              Platform Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Activity feed will appear here as the network grows.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ActionItem({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <a href={href} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </a>
  );
}
