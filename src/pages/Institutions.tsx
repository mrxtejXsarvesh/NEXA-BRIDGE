import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Building2, MapPin, Globe, Calendar, Users, TrendingUp, Award,
  Plus, Pencil, Trash2, Search, Star, ExternalLink, GraduationCap,
  IndianRupee, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Institution {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  established_year: number | null;
  type: string | null;
  affiliation: string | null;
  description: string | null;
  departments: string[] | null;
  total_students: number | null;
  placement_rate: number | null;
  highest_package: string | null;
  average_package: string | null;
  is_featured: boolean | null;
}

const emptyForm: Partial<Institution> = {
  name: '', short_name: '', location: '', city: '', state: '', website: '',
  established_year: 2020, type: 'government', affiliation: '', description: '',
  departments: [], total_students: 0, placement_rate: 0,
  highest_package: '', average_package: '', is_featured: false,
};

export default function Institutions() {
  const { role, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAdmin = role === 'admin';
  const canAddInstitution = role === 'admin';
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState<Institution | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<Partial<Institution>>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [deptInput, setDeptInput] = useState('');

  const fetchInstitutions = async () => {
    const { data } = await supabase.from('institutions').select('*').order('is_featured', { ascending: false }).order('name');
    setInstitutions((data as Institution[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchInstitutions(); }, []);

  const filtered = institutions.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.short_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.city || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || i.type === typeFilter;
    return matchSearch && matchType;
  });

  const openAdd = () => { setForm(emptyForm); setEditing(false); setFormOpen(true); };
  const openEdit = (inst: Institution) => {
    setForm({ ...inst });
    setEditing(true);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    const payload = {
      name: form.name, short_name: form.short_name || null, location: form.location || '',
      city: form.city || '', state: form.state || '', website: form.website || '',
      established_year: form.established_year || null, type: form.type || 'government',
      affiliation: form.affiliation || '', description: form.description || '',
      departments: form.departments || [], total_students: form.total_students || 0,
      placement_rate: form.placement_rate || 0, highest_package: form.highest_package || '',
      average_package: form.average_package || '', is_featured: form.is_featured || false,
      ...(role === 'institution' && user ? { managed_by: user.id } : {}),
    };
    if (editing && form.id) {
      const { error } = await supabase.from('institutions').update(payload).eq('id', form.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { error } = await supabase.from('institutions').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    }
    toast({ title: editing ? 'Updated!' : 'Added!' });
    setFormOpen(false);
    fetchInstitutions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this institution?')) return;
    await supabase.from('institutions').delete().eq('id', id);
    toast({ title: 'Deleted!' });
    if (selected?.id === id) setSelected(null);
    fetchInstitutions();
  };

  const addDept = () => {
    if (deptInput.trim()) {
      setForm(f => ({ ...f, departments: [...(f.departments || []), deptInput.trim()] }));
      setDeptInput('');
    }
  };
  const removeDept = (idx: number) => {
    setForm(f => ({ ...f, departments: (f.departments || []).filter((_, i) => i !== idx) }));
  };

  if (selected) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setSelected(null)} className="mb-2">← Back to Institutions</Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-2xl">{selected.name}</CardTitle>
                    {selected.short_name && <Badge variant="secondary">{selected.short_name}</Badge>}
                    {selected.is_featured && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Star className="h-3 w-3 mr-1" />Featured</Badge>}
                  </div>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-4 w-4" />{selected.location}, {selected.city}, {selected.state}</p>
                </div>
                <div className="flex gap-2">
                  {selected.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selected.website} target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4 mr-1" />Website</a>
                    </Button>
                  )}
                  {isAdmin && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => openEdit(selected)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(selected.id)}><Trash2 className="h-4 w-4" /></Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Established</p>
                  <p className="text-lg font-bold">{selected.established_year || 'N/A'}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Students</p>
                  <p className="text-lg font-bold">{(selected.total_students || 0).toLocaleString()}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-400" />
                  <p className="text-xs text-muted-foreground">Placement Rate</p>
                  <p className="text-lg font-bold">{selected.placement_rate}%</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Award className="h-5 w-5 mx-auto mb-1 text-amber-400" />
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-lg font-bold capitalize">{selected.type}</p>
                </div>
              </div>

              {/* About */}
              <div>
                <h3 className="font-semibold text-lg mb-2">About</h3>
                <p className="text-muted-foreground">{selected.description || 'No description available.'}</p>
              </div>

              {/* Affiliation */}
              {selected.affiliation && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Affiliation</h3>
                  <p className="text-muted-foreground">{selected.affiliation}</p>
                </div>
              )}

              {/* Packages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><IndianRupee className="h-4 w-4" />Highest Package</p>
                    <p className="text-xl font-bold text-green-400 mt-1">{selected.highest_package || 'N/A'}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><IndianRupee className="h-4 w-4" />Average Package</p>
                    <p className="text-xl font-bold text-blue-400 mt-1">{selected.average_package || 'N/A'}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Departments */}
              {selected.departments && selected.departments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Departments</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.departments.map((d, i) => (
                      <Badge key={i} variant="outline" className="py-1.5 px-3"><GraduationCap className="h-3 w-3 mr-1" />{d}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2"><Building2 className="h-7 w-7 text-primary" />Institutions</h1>
          <p className="text-muted-foreground text-sm mt-1">Explore top engineering universities</p>
        </div>
        {canAddInstitution && (
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Institution</Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, city..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="government">Government</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="deemed">Deemed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 rounded-lg bg-muted/30 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">No institutions found.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((inst, i) => (
              <motion.div key={inst.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg group" onClick={() => navigate(`/university/${inst.id}`)}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{inst.short_name || inst.name}</h3>
                          {inst.is_featured && <Star className="h-4 w-4 text-amber-400 shrink-0 fill-amber-400" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{inst.name}</p>
                      </div>
                      <Badge variant="outline" className="capitalize shrink-0 text-xs">{inst.type}</Badge>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{inst.city}, {inst.state}</p>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/40 rounded p-2">
                        <p className="text-xs text-muted-foreground">Est.</p>
                        <p className="text-sm font-semibold">{inst.established_year}</p>
                      </div>
                      <div className="bg-muted/40 rounded p-2">
                        <p className="text-xs text-muted-foreground">Place%</p>
                        <p className="text-sm font-semibold text-green-400">{inst.placement_rate}%</p>
                      </div>
                      <div className="bg-muted/40 rounded p-2">
                        <p className="text-xs text-muted-foreground">Avg Pkg</p>
                        <p className="text-sm font-semibold text-blue-400">{inst.average_package}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {(inst.departments || []).slice(0, 3).map((d, j) => (
                        <Badge key={j} variant="secondary" className="text-[10px] py-0">{d}</Badge>
                      ))}
                      {(inst.departments || []).length > 3 && (
                        <Badge variant="secondary" className="text-[10px] py-0">+{(inst.departments || []).length - 3}</Badge>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex gap-2 pt-1" onClick={e => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => openEdit(inst)}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                        <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => handleDelete(inst.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Institution' : 'Add Institution'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Name *</Label>
              <Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Short Name</Label>
              <Input value={form.short_name || ''} onChange={e => setForm(f => ({ ...f, short_name: e.target.value }))} placeholder="e.g. DTU" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type || 'government'} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="deemed">Deemed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>City</Label><Input value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
            <div><Label>State</Label><Input value={form.state || ''} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
            <div className="md:col-span-2"><Label>Location</Label><Input value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
            <div><Label>Website</Label><Input value={form.website || ''} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} /></div>
            <div><Label>Affiliation</Label><Input value={form.affiliation || ''} onChange={e => setForm(f => ({ ...f, affiliation: e.target.value }))} /></div>
            <div><Label>Established Year</Label><Input type="number" value={form.established_year || ''} onChange={e => setForm(f => ({ ...f, established_year: parseInt(e.target.value) }))} /></div>
            <div><Label>Total Students</Label><Input type="number" value={form.total_students || ''} onChange={e => setForm(f => ({ ...f, total_students: parseInt(e.target.value) }))} /></div>
            <div><Label>Placement Rate (%)</Label><Input type="number" value={form.placement_rate || ''} onChange={e => setForm(f => ({ ...f, placement_rate: parseFloat(e.target.value) }))} /></div>
            <div><Label>Highest Package</Label><Input value={form.highest_package || ''} onChange={e => setForm(f => ({ ...f, highest_package: e.target.value }))} placeholder="₹2.1 Cr / $250K" /></div>
            <div><Label>Average Package</Label><Input value={form.average_package || ''} onChange={e => setForm(f => ({ ...f, average_package: e.target.value }))} placeholder="₹14 LPA" /></div>
            <div>
              <Label>Featured</Label>
              <Select value={form.is_featured ? 'yes' : 'no'} onValueChange={v => setForm(f => ({ ...f, is_featured: v === 'yes' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <Label>Departments</Label>
              <div className="flex gap-2 mb-2">
                <Input value={deptInput} onChange={e => setDeptInput(e.target.value)} placeholder="Add department" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDept())} />
                <Button type="button" variant="outline" onClick={addDept}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {(form.departments || []).map((d, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">{d}<X className="h-3 w-3 cursor-pointer" onClick={() => removeDept(i)} /></Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
