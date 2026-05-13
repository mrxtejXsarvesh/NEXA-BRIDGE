import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, Check, X, Users, Building2, GraduationCap, Briefcase, ExternalLink, ChevronDown, ChevronUp, SlidersHorizontal, RotateCcw, Phone, Linkedin, Mail, MapPin, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import ConnectionRequests from '@/components/ConnectionRequests';
import VerifiedBadge from '@/components/VerifiedBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Directory() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [expandedBio, setExpandedBio] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterConnection, setFilterConnection] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();

  const isOnline = (lastSeen: string | null) => {
    if (!lastSeen) return false;
    return Date.now() - new Date(lastSeen).getTime() < 5 * 60 * 1000; // 5 min
  };

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').neq('user_id', user?.id ?? '');
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: connections = [] } = useQuery({
    queryKey: ['connections', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('connections').select('*').or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['all-roles'],
    queryFn: async () => {
      const { data } = await supabase.from('user_roles').select('*');
      return data ?? [];
    },
  });

  const sendConnection = useMutation({
    mutationFn: async (receiverId: string) => {
      const { error } = await supabase.from('connections').insert({ sender_id: user!.id, receiver_id: receiverId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection request sent!');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const getConnectionStatus = (profileUserId: string) => {
    const conn = connections.find(
      c => (c.sender_id === user?.id && c.receiver_id === profileUserId) ||
           (c.receiver_id === user?.id && c.sender_id === profileUserId)
    );
    return conn?.status ?? null;
  };

  const getRoleForUser = (userId: string) => {
    return roles.find(r => r.user_id === userId)?.role ?? null;
  };

  const allDepartments = [
    'Computer Science & Engineering', 'Information Technology',
    'Electronics & Communication Engineering', 'Electrical Engineering',
    'Electrical & Electronics Engineering', 'Mechanical Engineering',
    'Civil Engineering', 'Chemical Engineering',
    'Aerospace Engineering', 'Biotechnology',
    'Biomedical Engineering', 'Industrial Engineering',
    'Environmental Engineering', 'Mining Engineering',
    'Metallurgical Engineering', 'Petroleum Engineering',
    'Textile Engineering', 'Agricultural Engineering',
    'Automobile Engineering', 'Instrumentation Engineering',
    'Production Engineering', 'Robotics & Automation',
    'Artificial Intelligence & Data Science', 'Cyber Security',
    'Internet of Things',
  ];
  // Merge DB departments with predefined list
  const dbDepts = profiles.map(p => p.department).filter(Boolean) as string[];
  const departments = [...new Set([...allDepartments, ...dbDepts])].sort();
  const years = Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => new Date().getFullYear() - i);
  const allRoles = ['student', 'alumni', 'admin'] as const;

  const filtered = profiles
    .filter(p => {
      const matchSearch = search === '' ||
        p.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (p.company?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (p.department?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (p.position?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (p.skills?.some(s => s.toLowerCase().includes(search.toLowerCase())) ?? false);
      const matchDept = filterDept === 'all' || p.department === filterDept;
      const matchYear = filterYear === 'all' || p.graduation_year?.toString() === filterYear;
      const matchRole = filterRole === 'all' || getRoleForUser(p.user_id) === filterRole;
      const connStatus = getConnectionStatus(p.user_id);
      const matchConn = filterConnection === 'all' ||
        (filterConnection === 'connected' && connStatus === 'accepted') ||
        (filterConnection === 'pending' && connStatus === 'pending') ||
        (filterConnection === 'not_connected' && connStatus === null);
      return matchSearch && matchDept && matchYear && matchRole && matchConn;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.full_name.localeCompare(b.full_name);
      if (sortBy === 'year_desc') return (b.graduation_year ?? 0) - (a.graduation_year ?? 0);
      if (sortBy === 'year_asc') return (a.graduation_year ?? 0) - (b.graduation_year ?? 0);
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });

  const hasActiveFilters = filterDept !== 'all' || filterYear !== 'all' || filterRole !== 'all' || filterConnection !== 'all';
  const clearFilters = () => { setFilterDept('all'); setFilterYear('all'); setFilterRole('all'); setFilterConnection('all'); };

  const renderConnectionButton = (p: any, size: 'sm' | 'default' = 'default') => {
    const status = getConnectionStatus(p.user_id);
    if (status === 'accepted') {
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"><Check className="h-3 w-3 mr-1" />Connected</Badge>;
    }
    if (status === 'pending') {
      return <Badge variant="secondary">Pending</Badge>;
    }
    if (status === 'rejected') {
      return <Badge variant="secondary" className="text-destructive"><X className="h-3 w-3 mr-1" />Declined</Badge>;
    }
    return (
      <Button size={size} onClick={() => sendConnection.mutate(p.user_id)} disabled={sendConnection.isPending} className="bg-primary hover:bg-primary/90">
        <UserPlus className="h-4 w-4 mr-1.5" /> Connect
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alumni Directory</h1>
        <p className="text-muted-foreground">Find and connect with alumni and students</p>
      </div>

      <Tabs defaultValue="directory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="directory"><Users className="h-4 w-4 mr-1" /> Directory</TabsTrigger>
          <TabsTrigger value="requests"><UserPlus className="h-4 w-4 mr-1" /> Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <div className="space-y-4">
            {/* Search + Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, company, skills, or department..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="flex gap-2">
                <Button variant={showFilters ? 'default' : 'outline'} size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1.5">
                  <SlidersHorizontal className="h-4 w-4" /> Sort & Filter
                  {hasActiveFilters && <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">!</Badge>}
                </Button>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                    <RotateCcw className="h-3.5 w-3.5" /> Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card className="border border-border/60">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Department</label>
                      <Select value={filterDept} onValueChange={setFilterDept}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Batch Year</label>
                      <Select value={filterYear} onValueChange={setFilterYear}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          {years.map(y => <SelectItem key={y} value={y.toString()}>Batch {y}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Role</label>
                      <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          {allRoles.map(r => <SelectItem key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Connection</label>
                      <Select value={filterConnection} onValueChange={setFilterConnection}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="connected">Connected</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="not_connected">Not Connected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name (A-Z)</SelectItem>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="year_desc">Year (Newest)</SelectItem>
                          <SelectItem value="year_asc">Year (Oldest)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results count */}
            <p className="text-xs text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? 's' : ''} found</p>

            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <Card key={i}><CardContent className="p-6 h-48 animate-pulse bg-muted/30" /></Card>)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No profiles found.</div>
            ) : (
              <div className="space-y-4">
                {filtered.map(p => {
                  const role = getRoleForUser(p.user_id);
                  const initials = p.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  const isExpanded = expandedBio === p.id;
                  const hasBio = p.bio && p.bio.length > 0;
                  const bioPreview = p.bio && p.bio.length > 120 ? p.bio.slice(0, 120) + '...' : p.bio;

                  return (
                    <Card key={p.id} className="hover:shadow-lg transition-all duration-200 border border-border/60">
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Avatar */}
                          <div className="flex-shrink-0 flex sm:flex-col items-center gap-3 sm:gap-1">
                            <div className="relative">
                              <Avatar className="h-20 w-20 border-2 border-primary/20 cursor-pointer" onClick={() => setSelectedProfile(p)}>
                                {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name} /> : null}
                                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{initials}</AvatarFallback>
                              </Avatar>
                              {isOnline(p.last_seen) ? (
                                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background" title="Online" />
                              ) : (
                                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-muted-foreground/40 border-2 border-background" title="Offline" />
                              )}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div className="space-y-1">
                                {/* Name + Badges */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h3 className="font-bold text-lg cursor-pointer hover:text-primary transition-colors" onClick={() => setSelectedProfile(p)}>
                                    {p.full_name}
                                  </h3>
                                  <VerifiedBadge role={role} studentBadge={p.student_badge} size={16} />
                                  {role && <Badge variant="secondary" className="text-[10px] capitalize">{role}</Badge>}
                                </div>

                                {/* Position & Company */}
                                {(p.position || p.company) && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    <Briefcase className="h-3.5 w-3.5 shrink-0" />
                                    {p.position}{p.position && p.company ? ' | ' : ''}{p.company}
                                  </p>
                                )}

                                {/* Department & Graduation */}
                                {(p.department || p.graduation_year) && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                                    {p.department}{p.department && p.graduation_year ? ` · Batch ${p.graduation_year}` : p.graduation_year ? `Batch ${p.graduation_year}` : ''}
                                  </p>
                                )}

                                {/* Companies */}
                                {p.company && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                                    <span><strong className="text-foreground/80">Company:</strong> {p.company}</span>
                                  </p>
                                )}
                              </div>

                              {/* Connect button */}
                              <div className="flex-shrink-0">
                                {renderConnectionButton(p)}
                              </div>
                            </div>

                            {/* Bio */}
                            {hasBio && (
                              <div className="mt-3 text-sm text-muted-foreground">
                                <p>{isExpanded ? p.bio : bioPreview}</p>
                                {p.bio && p.bio.length > 120 && (
                                  <button
                                    onClick={() => setExpandedBio(isExpanded ? null : p.id)}
                                    className="text-primary text-xs font-medium hover:underline mt-0.5 inline-flex items-center gap-0.5"
                                  >
                                    {isExpanded ? <>Show less <ChevronUp className="h-3 w-3" /></> : <>Read more <ChevronDown className="h-3 w-3" /></>}
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Skills */}
                            {p.skills && p.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {p.skills.slice(0, 6).map(s => (
                                  <Badge key={s} variant="outline" className="text-xs px-2 py-0.5 bg-muted/50">{s}</Badge>
                                ))}
                                {p.skills.length > 6 && (
                                  <Badge variant="outline" className="text-xs px-2 py-0.5">+{p.skills.length - 6}</Badge>
                                )}
                              </div>
                            )}

                            {/* LinkedIn */}
                            {p.linkedin_url && (
                              <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                                <ExternalLink className="h-3 w-3" /> LinkedIn Profile
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <Card className="glass-card border-0 rounded-xl">
            <CardContent className="p-6">
              <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                <UserPlus className="h-4 w-4 text-primary" /> Pending Connection Requests
              </h3>
              <ConnectionRequests />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          {selectedProfile && (() => {
            const p = selectedProfile;
            const role = getRoleForUser(p.user_id);
            const initials = p.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
            const online = isOnline(p.last_seen);
            return (
              <>
                <DialogHeader className="sr-only">
                  <DialogTitle>{p.full_name}'s Profile</DialogTitle>
                </DialogHeader>

                {/* Header Section - like GFG */}
                <div className="p-6 pb-4">
                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* Avatar with online */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                      <div className="relative">
                        <Avatar className="h-28 w-28 border-3 border-primary/20">
                          {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name} /> : null}
                          <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">{initials}</AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-background ${online ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                      </div>
                      <Badge variant={online ? 'default' : 'secondary'} className={`text-xs ${online ? 'bg-emerald-500 text-white' : ''}`}>
                        {online ? 'Online' : 'Offline'}
                      </Badge>
                    </div>

                    {/* Name, role, actions */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-2xl font-bold">{p.full_name}</h2>
                        <VerifiedBadge role={role} studentBadge={p.student_badge} size={20} />
                      </div>
                      {(p.position || p.company) && (
                        <p className="text-muted-foreground mt-0.5">
                          {p.position}{p.position && p.company ? ' | ' : ''}{p.company}
                        </p>
                      )}
                      {(p.department || p.graduation_year) && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {p.department}{p.graduation_year ? ` · Batch ${p.graduation_year}` : ''}
                        </p>
                      )}

                      {/* Role badge + connect */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {role && <Badge variant="secondary" className="capitalize">{role}</Badge>}
                        {renderConnectionButton(p)}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* About Me */}
                {p.bio && (
                  <div className="px-6 py-4">
                    <h3 className="font-semibold text-foreground mb-2">About Me</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{p.bio}</p>
                  </div>
                )}

                {/* Skills / Expertise */}
                {p.skills && p.skills.length > 0 && (
                  <>
                    <Separator />
                    <div className="px-6 py-4">
                      <h3 className="font-semibold text-foreground mb-3">Skills & Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {p.skills.map((s: string) => (
                          <Badge key={s} variant="outline" className="text-sm px-3 py-1 bg-muted/40 hover:bg-muted/60 transition-colors">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Contact & Details */}
                <Separator />
                <div className="px-6 py-4">
                  <h3 className="font-semibold text-foreground mb-3">Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {p.company && (
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Building2 className="h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/60">Company</p>
                          <p className="text-foreground">{p.company}</p>
                        </div>
                      </div>
                    )}
                    {p.position && (
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Briefcase className="h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/60">Position</p>
                          <p className="text-foreground">{p.position}</p>
                        </div>
                      </div>
                    )}
                    {p.department && (
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/60">Department</p>
                          <p className="text-foreground">{p.department}</p>
                        </div>
                      </div>
                    )}
                    {p.graduation_year && (
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/60">Batch</p>
                          <p className="text-foreground">{p.graduation_year}</p>
                        </div>
                      </div>
                    )}
                    {p.phone && (
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/60">Phone</p>
                          <p className="text-foreground">{p.phone}</p>
                        </div>
                      </div>
                    )}
                    {p.linkedin_url && (
                      <div className="flex items-center gap-2.5">
                        <Linkedin className="h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/60">LinkedIn</p>
                          <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm truncate block max-w-[200px]">
                            View Profile ↗
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
