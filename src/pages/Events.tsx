import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, MapPin, Video, ExternalLink, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function Events() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState('');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('*').order('event_date', { ascending: true });
      return data ?? [];
    },
  });

  const createEvent = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('events').insert({
        created_by: user!.id,
        title, description, event_date: new Date(eventDate).toISOString(),
        location, is_virtual: isVirtual, meeting_url: meetingUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setOpen(false);
      toast.success('Event created!');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted!');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const canCreate = role === 'alumni' || role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">Upcoming networking and alumni events</p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Create Event</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
              <form onSubmit={e => { e.preventDefault(); createEvent.mutate(); }} className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Date & Time</Label><Input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} required /></div>
                <div className="flex items-center gap-2"><Switch checked={isVirtual} onCheckedChange={setIsVirtual} /><Label>Virtual Event</Label></div>
                {isVirtual ? (
                  <div className="space-y-2"><Label>Meeting URL</Label><Input value={meetingUrl} onChange={e => setMeetingUrl(e.target.value)} placeholder="https://meet.google.com/..." /></div>
                ) : (
                  <div className="space-y-2"><Label>Location</Label><Input value={location} onChange={e => setLocation(e.target.value)} /></div>
                )}
                <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3} /></div>
                <Button type="submit" className="w-full" disabled={createEvent.isPending}>Create Event</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4">{[1,2].map(i => <Card key={i}><CardContent className="p-6 h-24 animate-pulse bg-muted/30" /></Card>)}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No events yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map(event => {
            const isPast = new Date(event.event_date) < new Date();
            return (
              <Card key={event.id} className={`hover:shadow-md transition-shadow ${isPast ? 'opacity-60' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{event.title}</h3>
                        {isPast && <Badge variant="secondary" className="text-xs">Past</Badge>}
                        {event.is_virtual && <Badge variant="outline" className="text-xs"><Video className="h-3 w-3 mr-0.5" />Virtual</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      {event.location && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.location}</p>}
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    </div>
                    {event.is_virtual && event.meeting_url && !isPast && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={event.meeting_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1" />Join</a>
                      </Button>
                    )}
                    {(event.created_by === user?.id || role === 'admin') && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                            <AlertDialogDescription>Ye event permanently delete ho jayega.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteEvent.mutate(event.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
