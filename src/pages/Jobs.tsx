import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Plus, MapPin, Building2, ExternalLink, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const jobTypeLabels: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  internship: 'Internship',
  contract: 'Contract',
};

export default function Jobs() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [jobType, setJobType] = useState<string>('full_time');
  const [location, setLocation] = useState('');
  const [applyUrl, setApplyUrl] = useState('');

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data } = await supabase.from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const createJob = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('jobs').insert({
        posted_by: user!.id,
        title, company, description,
        job_type: jobType as any,
        location, apply_url: applyUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setOpen(false);
      setTitle(''); setCompany(''); setDescription(''); setLocation(''); setApplyUrl('');
      toast.success('Job posted!');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('jobs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted!');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const canPost = role === 'alumni' || role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs & Internships</h1>
          <p className="text-muted-foreground">Explore career opportunities from alumni</p>
        </div>
        {canPost && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1.5" />Post Job</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Post a Job/Internship</DialogTitle></DialogHeader>
              <form onSubmit={e => { e.preventDefault(); createJob.mutate(); }} className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Company</Label><Input value={company} onChange={e => setCompany(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Type</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(jobTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Location</Label><Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Remote / City" /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} /></div>
                <div className="space-y-2"><Label>Apply URL</Label><Input value={applyUrl} onChange={e => setApplyUrl(e.target.value)} placeholder="https://..." /></div>
                <Button type="submit" className="w-full" disabled={createJob.isPending}>Post Job</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4">{[1,2,3].map(i => <Card key={i}><CardContent className="p-6 h-28 animate-pulse bg-muted/30" /></Card>)}</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No jobs posted yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{job.company}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{jobTypeLabels[job.job_type] || job.job_type}</Badge>
                      {job.location && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><MapPin className="h-3 w-3" />{job.location}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {job.apply_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={job.apply_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1" />Apply</a>
                      </Button>
                    )}
                    {(job.posted_by === user?.id || role === 'admin') && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Job?</AlertDialogTitle>
                            <AlertDialogDescription>Ye job post permanently delete ho jayegi.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteJob.mutate(job.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{new Date(job.created_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
