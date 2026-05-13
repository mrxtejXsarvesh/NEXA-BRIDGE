import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Building2, MapPin, Calendar, GraduationCap, Users, Link2, Briefcase,
  ArrowRight, Globe, Star, Award, TrendingUp, Heart, MessageSquare,
  Search, ExternalLink, ChevronRight, Megaphone, Shield, Sparkles,
} from 'lucide-react';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { delay, duration: 0.6, ease } },
});

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={fadeUp(delay)} className={className}>
      {children}
    </motion.div>
  );
}

interface Institution {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  banner_url: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  established_year: number | null;
  type: string | null;
  affiliation: string | null;
  description: string | null;
  tagline: string | null;
  vision: string | null;
  achievements: string[] | null;
  departments: string[] | null;
  total_students: number | null;
  placement_rate: number | null;
  highest_package: string | null;
  average_package: string | null;
  is_featured: boolean | null;
  managed_by: string | null;
}

interface AlumniProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  company: string | null;
  position: string | null;
  department: string | null;
}

interface JobItem {
  id: string;
  title: string;
  company: string;
  location: string | null;
  job_type: string;
  created_at: string;
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string | null;
  is_virtual: boolean | null;
}

// Fake top alumni data for demo
const fakeTopAlumni: AlumniProfile[] = [
  { id: '1', full_name: 'Aarav Mehta', avatar_url: null, company: 'Google', position: 'Software Engineer', department: 'CSE' },
  { id: '2', full_name: 'Priya Sharma', avatar_url: null, company: 'Microsoft', position: 'Product Manager', department: 'IT' },
  { id: '3', full_name: 'Rohit Verma', avatar_url: null, company: 'Amazon', position: 'SDE-II', department: 'CSE' },
  { id: '4', full_name: 'Sneha Gupta', avatar_url: null, company: 'Flipkart', position: 'Data Scientist', department: 'ECE' },
  { id: '5', full_name: 'Vikram Singh', avatar_url: null, company: 'Zomato', position: 'Founding Engineer', department: 'ME' },
  { id: '6', full_name: 'Ananya Patel', avatar_url: null, company: 'Razorpay', position: 'Backend Lead', department: 'CSE' },
];

const benefitsList = [
  { icon: Users, title: 'Strong Alumni Network', desc: 'Lifelong connections between alumni & students.' },
  { icon: TrendingUp, title: 'Career Growth', desc: 'Alumni-driven referrals and mentorship programs.' },
  { icon: Heart, title: 'Mentorship', desc: 'One-on-one guidance from industry professionals.' },
  { icon: Briefcase, title: 'Job Opportunities', desc: 'Exclusive job postings from alumni companies.' },
];

export default function UniversityProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [inst, setInst] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [alumniSearch, setAlumniSearch] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data } = await supabase.from('institutions').select('*').eq('id', id).single();
      setInst(data as Institution | null);

      const { data: jobsData } = await supabase.from('jobs').select('id, title, company, location, job_type, created_at').eq('is_active', true).order('created_at', { ascending: false }).limit(4);
      setJobs((jobsData as JobItem[]) || []);

      const { data: eventsData } = await supabase.from('events').select('id, title, description, event_date, location, is_virtual').order('event_date', { ascending: false }).limit(4);
      setEvents((eventsData as EventItem[]) || []);

      setLoading(false);
    };
    load();
  }, [id]);

  const filteredAlumni = fakeTopAlumni.filter(a =>
    a.full_name.toLowerCase().includes(alumniSearch.toLowerCase()) ||
    (a.company || '').toLowerCase().includes(alumniSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!inst) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">Institution Not Found</h2>
          <Button onClick={() => navigate('/institutions')}>View All Institutions</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HERO / HEADER */}
      <section className="relative">
        {/* Banner */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-primary/30 via-primary/10 to-background relative overflow-hidden">
          {inst.banner_url && (
            <img src={inst.banner_url} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        {/* Profile overlay */}
        <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Logo */}
              <div className="h-28 w-28 rounded-2xl border-4 border-background bg-card shadow-xl flex items-center justify-center overflow-hidden shrink-0">
                {inst.logo_url ? (
                  <img src={inst.logo_url} alt={inst.name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-12 w-12 text-primary" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-bold">{inst.name}</h1>
                  {inst.short_name && <Badge variant="secondary" className="text-sm">{inst.short_name}</Badge>}
                  {inst.is_featured && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                      <Star className="h-3 w-3 mr-1 fill-amber-400" />Featured
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground flex items-center gap-2 flex-wrap">
                  <MapPin className="h-4 w-4" />{inst.city}, {inst.state}
                  {inst.established_year && <><span className="text-border">•</span><Calendar className="h-4 w-4" />Est. {inst.established_year}</>}
                  {inst.type && <><span className="text-border">•</span><Badge variant="outline" className="capitalize">{inst.type}</Badge></>}
                </p>
                {inst.tagline && <p className="text-primary italic text-sm">"{inst.tagline}"</p>}
              </div>

              {/* CTAs - hide for the institution owner */}
              <div className="flex gap-3 shrink-0 flex-wrap">
                {!(user && inst.managed_by === user.id) && (
                  <>
                    <Button onClick={() => navigate('/auth')}>
                      <GraduationCap className="h-4 w-4 mr-2" />Join as Student
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/auth')}>
                      <Users className="h-4 w-4 mr-2" />Join as Alumni
                    </Button>
                  </>
                )}
                {inst.website && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={inst.website} target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4" /></a>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { icon: GraduationCap, label: 'Total Students', value: (inst.total_students || 0).toLocaleString(), color: 'text-blue-400' },
                { icon: Users, label: 'Total Alumni', value: `${Math.floor((inst.total_students || 0) * 2.5).toLocaleString()}+`, color: 'text-purple-400' },
                { icon: Link2, label: 'Active Connections', value: `${Math.floor((inst.total_students || 0) * 0.8).toLocaleString()}`, color: 'text-green-400' },
                { icon: Briefcase, label: 'Jobs Posted', value: `${jobs.length * 25}+`, color: 'text-amber-400' },
                { icon: TrendingUp, label: 'Placement Rate', value: `${inst.placement_rate || 0}%`, color: 'text-emerald-400' },
              ].map((s, i) => (
                <Card key={i} className="hover:border-primary/30 transition-all">
                  <CardContent className="p-4 text-center">
                    <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
                    <p className="text-xl md:text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-10 px-6 bg-muted/30 border-y border-border/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <Reveal>
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Building2 className="h-6 w-6 text-primary" />About</h2>
              <p className="text-muted-foreground leading-relaxed">{inst.description || 'No description available.'}</p>
              {inst.affiliation && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Affiliation:</span> {inst.affiliation}</p>
                </div>
              )}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div>
              {inst.vision && (
                <>
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" />Vision & Mission</h2>
                  <p className="text-muted-foreground leading-relaxed">{inst.vision}</p>
                </>
              )}
              {inst.achievements && inst.achievements.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Award className="h-5 w-5 text-amber-400" />Achievements</h3>
                  <ul className="space-y-2">
                    {inst.achievements.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />{a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* DEPARTMENTS */}
      {inst.departments && inst.departments.length > 0 && (
        <section className="py-10 px-6">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><GraduationCap className="h-6 w-6 text-primary" />Departments</h2>
              <div className="flex flex-wrap gap-3">
                {inst.departments.map((d, i) => (
                  <Badge key={i} variant="outline" className="py-2 px-4 text-sm">
                    <GraduationCap className="h-3.5 w-3.5 mr-1.5" />{d}
                  </Badge>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* TOP ALUMNI SHOWCASE */}
      <section className="py-10 px-6 bg-muted/30 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Award className="h-6 w-6 text-amber-400" />Top Alumni</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search alumni..." value={alumniSearch} onChange={e => setAlumniSearch(e.target.value)} className="pl-9 h-9" />
              </div>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {filteredAlumni.map((a, i) => (
              <Reveal key={a.id} delay={i * 0.05}>
                <Card className="hover:border-primary/40 transition-all group cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-3 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                      <AvatarImage src={a.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">{a.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-sm truncate">{a.full_name}</p>
                    <p className="text-xs text-primary truncate">{a.position}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.company}</p>
                    <Badge variant="secondary" className="mt-2 text-[10px]">{a.department}</Badge>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <div className="text-center mt-6">
              <Button variant="outline" onClick={() => navigate('/directory')}>
                View Full Directory <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* JOBS & INTERNSHIPS */}
      <section className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="h-6 w-6 text-amber-400" />Latest Opportunities</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>View All <ChevronRight className="h-4 w-4" /></Button>
            </div>
          </Reveal>
          {jobs.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No active opportunities. Check back soon!</CardContent></Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {jobs.map((j, i) => (
                <Reveal key={j.id} delay={i * 0.08}>
                  <Card className="hover:border-primary/40 transition-all cursor-pointer" onClick={() => navigate('/jobs')}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{j.title}</h3>
                          <p className="text-sm text-muted-foreground">{j.company}</p>
                        </div>
                        <Badge variant="outline" className="capitalize text-xs">{j.job_type.replace('_', ' ')}</Badge>
                      </div>
                      {j.location && <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</p>}
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* EVENTS */}
      <section className="py-10 px-6 bg-muted/30 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar className="h-6 w-6 text-primary" />Events & Meetups</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>View All <ChevronRight className="h-4 w-4" /></Button>
            </div>
          </Reveal>
          {events.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No upcoming events.</CardContent></Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {events.map((e, i) => (
                <Reveal key={e.id} delay={i * 0.08}>
                  <Card className="hover:border-primary/40 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{e.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{e.description}</p>
                        </div>
                        {e.is_virtual && <Badge variant="secondary" className="text-xs shrink-0">Virtual</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(e.event_date).toLocaleDateString()}</span>
                        {e.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</span>}
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2 className="text-2xl font-bold mb-8 text-center">Why Join <span className="text-primary">{inst.short_name || inst.name}</span> Network?</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefitsList.map((b, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <Card className="h-full hover:border-primary/40 transition-all text-center">
                  <CardContent className="p-5">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <b.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{b.title}</h3>
                    <p className="text-xs text-muted-foreground">{b.desc}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS (placeholder) */}
      <section className="py-10 px-6 bg-muted/30 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Megaphone className="h-6 w-6 text-primary" />Announcements</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Alumni Meet 2026', desc: 'Annual alumni reunion scheduled for March 2026. Register now!', date: 'Jan 15, 2026' },
              { title: 'Placement Season Open', desc: 'Over 200 companies visiting campus this season.', date: 'Dec 1, 2025' },
              { title: 'New Mentorship Program', desc: 'Connect with industry experts through our new mentorship initiative.', date: 'Nov 20, 2025' },
            ].map((a, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <Card className="hover:border-primary/40 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Megaphone className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">{a.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-2">{a.date}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <Building2 className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-3">
              Join <span className="text-primary">{inst.short_name || inst.name}</span> Network
            </h2>
            <p className="text-muted-foreground mb-6">Connect with alumni, access opportunities, and grow your career.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Get Started <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                Contact Admin
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 NexaBridge × {inst.short_name || inst.name}</p>
          <div className="flex gap-6">
            <button onClick={() => navigate('/')} className="hover:text-foreground transition-colors">Home</button>
            <button onClick={() => navigate('/for-institutions')} className="hover:text-foreground transition-colors">For Institutions</button>
            {inst.website && <a href={inst.website} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">Website <ExternalLink className="h-3 w-3" /></a>}
          </div>
        </div>
      </footer>
    </div>
  );
}
