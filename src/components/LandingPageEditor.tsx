import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Plus, Trash2, Eye, ExternalLink, Upload, ImageIcon, X } from 'lucide-react';
import ImageCropDialog from '@/components/ImageCropDialog';

interface HeroData {
  badge: string;
  title: string;
  highlight: string;
  description: string;
  cta_text: string;
  cta_secondary: string;
  bg_image?: string;
}

interface StatItem { value: string; label: string; }
interface FeatureItem { title: string; desc: string; icon: string; }
interface StepItem { step: string; title: string; desc: string; }
interface TestimonialItem { name: string; role: string; text: string; avatar: string; avatar_url?: string; }
interface DeveloperData {
  title: string;
  description: string;
  techs: string[];
  github_url: string;
  show_section: boolean;
}
interface CtaData { title: string; description: string; button_text: string; }
interface FooterData { brand: string; tagline: string; }

async function uploadImage(file: File, path: string): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const filePath = `${path}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('landing-assets').upload(filePath, file, { upsert: true });
  if (error) { toast.error('Upload failed: ' + error.message); return null; }
  const { data } = supabase.storage.from('landing-assets').getPublicUrl(filePath);
  return data.publicUrl;
}

function ImageUploadField({ label, value, onChange, aspectRatio }: { label: string; value?: string; onChange: (url: string) => void; aspectRatio?: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCropped = async (blob: Blob) => {
    setCropSrc(null);
    setUploading(true);
    const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
    const url = await uploadImage(file, label.toLowerCase().replace(/\s+/g, '-'));
    if (url) onChange(url);
    setUploading(false);
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex items-center gap-3">
        {value ? (
          <div className="relative group">
            <img src={value} alt={label} className="h-20 w-20 rounded-lg object-cover border border-border" />
            <button
              onClick={() => onChange('')}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div>
          <Button
            variant="outline" size="sm" disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-1" /> {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP • Max 5MB</p>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = ''; }} />
      </div>
      {cropSrc && (
        <ImageCropDialog
          open={!!cropSrc}
          imageSrc={cropSrc}
          aspectRatio={aspectRatio}
          onClose={() => setCropSrc(null)}
          onCropComplete={handleCropped}
        />
      )}
    </div>
  );
}

const ICON_OPTIONS = ['Users', 'MessageSquare', 'Briefcase', 'Calendar', 'GraduationCap', 'Shield', 'Zap', 'Globe', 'Code', 'Heart', 'Star', 'TrendingUp', 'Award'];

export default function LandingPageEditor() {
  const queryClient = useQueryClient();

  const { data: settings = {} } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data } = await supabase.from('site_settings').select('*');
      const map: Record<string, any> = {};
      data?.forEach(row => { map[row.setting_key] = row.setting_value; });
      return map;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from('site_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
    onError: () => toast.error('Failed to save'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Edit landing page sections below. Changes are saved to database and reflected instantly.</p>
        <Button variant="outline" size="sm" className="glass-card border-0" onClick={() => window.open('/', '_blank')}>
          <Eye className="h-4 w-4 mr-2" /> Preview Landing Page <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </div>
    <Tabs defaultValue="hero" className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        <TabsTrigger value="hero">Hero</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="steps">How It Works</TabsTrigger>
        <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        <TabsTrigger value="developer">Developer</TabsTrigger>
        <TabsTrigger value="cta">CTA</TabsTrigger>
        <TabsTrigger value="footer">Footer</TabsTrigger>
      </TabsList>

      <TabsContent value="hero">
        <HeroEditor data={settings.hero} onSave={(v) => saveMutation.mutate({ key: 'hero', value: v })} saving={saveMutation.isPending} />
      </TabsContent>
      <TabsContent value="stats">
        <StatsEditor data={settings.stats} onSave={(v) => saveMutation.mutate({ key: 'stats', value: v })} saving={saveMutation.isPending} />
      </TabsContent>
      <TabsContent value="features">
        <FeaturesEditor data={settings.features} onSave={(v) => saveMutation.mutate({ key: 'features', value: v })} saving={saveMutation.isPending} />
      </TabsContent>
      <TabsContent value="steps">
        <StepsEditor data={settings.steps} onSave={(v) => saveMutation.mutate({ key: 'steps', value: v })} saving={saveMutation.isPending} />
      </TabsContent>
      <TabsContent value="testimonials">
        <TestimonialsEditor data={settings.testimonials} onSave={(v) => saveMutation.mutate({ key: 'testimonials', value: v })} saving={saveMutation.isPending} />
      </TabsContent>
      <TabsContent value="developer">
        <DeveloperEditor data={settings.developer} onSave={(v) => saveMutation.mutate({ key: 'developer', value: v })} saving={saveMutation.isPending} />
      </TabsContent>
      <TabsContent value="cta">
        <CtaEditor data={settings.cta} onSave={(v) => saveMutation.mutate({ key: 'cta', value: v })} saving={saveMutation.isPending} />
      </TabsContent>
      <TabsContent value="footer">
        <FooterEditor data={settings.footer} onSave={(v) => saveMutation.mutate({ key: 'footer', value: v })} saving={saveMutation.isPending} />
      </TabsContent>
    </Tabs>
    </div>
  );
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <Button onClick={onClick} disabled={saving} className="mt-4">
      <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

function HeroEditor({ data, onSave, saving }: { data?: HeroData; onSave: (v: HeroData) => void; saving: boolean }) {
  const [form, setForm] = useState<HeroData>({ badge: '', title: '', highlight: '', description: '', cta_text: '', cta_secondary: '', bg_image: '' });
  useEffect(() => { if (data) setForm({ ...form, ...data }); }, [data]);

  return (
    <Card className="glass-card border-0">
      <CardHeader><CardTitle className="text-base">Hero Section</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <ImageUploadField label="Hero Background Image" value={form.bg_image} onChange={url => setForm({ ...form, bg_image: url })} aspectRatio={16/9} />
        <div><Label>Badge Text</Label><Input value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} /></div>
        <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Highlighted Text</Label><Input value={form.highlight} onChange={e => setForm({ ...form, highlight: e.target.value })} /></div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Primary Button</Label><Input value={form.cta_text} onChange={e => setForm({ ...form, cta_text: e.target.value })} /></div>
          <div><Label>Secondary Button</Label><Input value={form.cta_secondary} onChange={e => setForm({ ...form, cta_secondary: e.target.value })} /></div>
        </div>
        <SaveButton onClick={() => onSave(form)} saving={saving} />
      </CardContent>
    </Card>
  );
}

function StatsEditor({ data, onSave, saving }: { data?: StatItem[]; onSave: (v: StatItem[]) => void; saving: boolean }) {
  const [items, setItems] = useState<StatItem[]>([]);
  useEffect(() => { if (data) setItems(data); }, [data]);
  const update = (i: number, field: keyof StatItem, val: string) => {
    const n = [...items]; n[i] = { ...n[i], [field]: val }; setItems(n);
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader><CardTitle className="text-base">Stats Section</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-end">
            <div className="flex-1"><Label>Value</Label><Input value={item.value} onChange={e => update(i, 'value', e.target.value)} /></div>
            <div className="flex-1"><Label>Label</Label><Input value={item.label} onChange={e => update(i, 'label', e.target.value)} /></div>
            <Button variant="destructive" size="icon" className="h-10 w-10 shrink-0" onClick={() => setItems(items.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setItems([...items, { value: '0', label: 'New Stat' }])}><Plus className="h-4 w-4 mr-1" /> Add Stat</Button>
        <SaveButton onClick={() => onSave(items)} saving={saving} />
      </CardContent>
    </Card>
  );
}

function FeaturesEditor({ data, onSave, saving }: { data?: FeatureItem[]; onSave: (v: FeatureItem[]) => void; saving: boolean }) {
  const [items, setItems] = useState<FeatureItem[]>([]);
  useEffect(() => { if (data) setItems(data); }, [data]);
  const update = (i: number, field: keyof FeatureItem, val: string) => {
    const n = [...items]; n[i] = { ...n[i], [field]: val }; setItems(n);
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader><CardTitle className="text-base">Features Section</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="p-4 rounded-lg border border-border/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Feature {i + 1}</span>
              <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => setItems(items.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3 mr-1" /> Remove</Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Title</Label><Input value={item.title} onChange={e => update(i, 'title', e.target.value)} /></div>
              <div>
                <Label>Icon</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={item.icon} onChange={e => update(i, 'icon', e.target.value)}>
                  {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </div>
            </div>
            <div><Label>Description</Label><Textarea value={item.desc} onChange={e => update(i, 'desc', e.target.value)} rows={2} /></div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setItems([...items, { title: 'New Feature', desc: '', icon: 'Zap' }])}><Plus className="h-4 w-4 mr-1" /> Add Feature</Button>
        <SaveButton onClick={() => onSave(items)} saving={saving} />
      </CardContent>
    </Card>
  );
}

function StepsEditor({ data, onSave, saving }: { data?: StepItem[]; onSave: (v: StepItem[]) => void; saving: boolean }) {
  const [items, setItems] = useState<StepItem[]>([]);
  useEffect(() => { if (data) setItems(data); }, [data]);
  const update = (i: number, field: keyof StepItem, val: string) => {
    const n = [...items]; n[i] = { ...n[i], [field]: val }; setItems(n);
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader><CardTitle className="text-base">How It Works</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-start p-3 rounded-lg border border-border/50">
            <div className="w-16"><Label>Step</Label><Input value={item.step} onChange={e => update(i, 'step', e.target.value)} /></div>
            <div className="flex-1"><Label>Title</Label><Input value={item.title} onChange={e => update(i, 'title', e.target.value)} /></div>
            <div className="flex-1"><Label>Description</Label><Input value={item.desc} onChange={e => update(i, 'desc', e.target.value)} /></div>
            <Button variant="destructive" size="icon" className="h-10 w-10 shrink-0 mt-5" onClick={() => setItems(items.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setItems([...items, { step: `0${items.length + 1}`, title: '', desc: '' }])}><Plus className="h-4 w-4 mr-1" /> Add Step</Button>
        <SaveButton onClick={() => onSave(items)} saving={saving} />
      </CardContent>
    </Card>
  );
}

function TestimonialsEditor({ data, onSave, saving }: { data?: TestimonialItem[]; onSave: (v: TestimonialItem[]) => void; saving: boolean }) {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  useEffect(() => { if (data) setItems(data); }, [data]);
  const update = (i: number, field: keyof TestimonialItem, val: string) => {
    const n = [...items]; n[i] = { ...n[i], [field]: val }; setItems(n);
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader><CardTitle className="text-base">Testimonials</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="p-4 rounded-lg border border-border/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Testimonial {i + 1}</span>
              <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => setItems(items.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3 mr-1" /> Remove</Button>
            </div>
            <ImageUploadField
              label={`Avatar Photo (${item.name || 'Testimonial ' + (i + 1)})`}
              value={item.avatar_url}
              onChange={url => { const n = [...items]; n[i] = { ...n[i], avatar_url: url }; setItems(n); }}
            />
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Name</Label><Input value={item.name} onChange={e => update(i, 'name', e.target.value)} /></div>
              <div><Label>Role</Label><Input value={item.role} onChange={e => update(i, 'role', e.target.value)} /></div>
              <div><Label>Fallback Initials</Label><Input value={item.avatar} onChange={e => update(i, 'avatar', e.target.value)} maxLength={2} placeholder="PS" /></div>
            </div>
            <div><Label>Testimonial Text</Label><Textarea value={item.text} onChange={e => update(i, 'text', e.target.value)} rows={2} /></div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setItems([...items, { name: '', role: '', text: '', avatar: '', avatar_url: '' }])}><Plus className="h-4 w-4 mr-1" /> Add Testimonial</Button>
        <SaveButton onClick={() => onSave(items)} saving={saving} />
      </CardContent>
    </Card>
  );
}
function DeveloperEditor({ data, onSave, saving }: { data?: DeveloperData; onSave: (v: DeveloperData) => void; saving: boolean }) {
  const [form, setForm] = useState<DeveloperData>({ title: '', description: '', techs: [], github_url: '', show_section: true });
  const [techInput, setTechInput] = useState('');
  useEffect(() => { if (data) setForm(data); }, [data]);

  return (
    <Card className="glass-card border-0">
      <CardHeader><CardTitle className="text-base">Developer Section</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Switch checked={form.show_section} onCheckedChange={v => setForm({ ...form, show_section: v })} />
          <Label>Show Developer Section</Label>
        </div>
        <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
        <div><Label>GitHub URL</Label><Input value={form.github_url} onChange={e => setForm({ ...form, github_url: e.target.value })} /></div>
        <div>
          <Label>Tech Stack</Label>
          <div className="flex flex-wrap gap-2 mt-1 mb-2">
            {form.techs.map((t, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {t}
                <button onClick={() => setForm({ ...form, techs: form.techs.filter((_, j) => j !== i) })} className="hover:text-destructive">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={techInput} onChange={e => setTechInput(e.target.value)} placeholder="Add technology..." onKeyDown={e => { if (e.key === 'Enter' && techInput.trim()) { setForm({ ...form, techs: [...form.techs, techInput.trim()] }); setTechInput(''); } }} />
            <Button variant="outline" size="sm" onClick={() => { if (techInput.trim()) { setForm({ ...form, techs: [...form.techs, techInput.trim()] }); setTechInput(''); } }}><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
        <SaveButton onClick={() => onSave(form)} saving={saving} />
      </CardContent>
    </Card>
  );
}

function CtaEditor({ data, onSave, saving }: { data?: CtaData; onSave: (v: CtaData) => void; saving: boolean }) {
  const [form, setForm] = useState<CtaData>({ title: '', description: '', button_text: '' });
  useEffect(() => { if (data) setForm(data); }, [data]);

  return (
    <Card className="glass-card border-0">
      <CardHeader><CardTitle className="text-base">CTA Section</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /></div>
        <div><Label>Button Text</Label><Input value={form.button_text} onChange={e => setForm({ ...form, button_text: e.target.value })} /></div>
        <SaveButton onClick={() => onSave(form)} saving={saving} />
      </CardContent>
    </Card>
  );
}

function FooterEditor({ data, onSave, saving }: { data?: FooterData; onSave: (v: FooterData) => void; saving: boolean }) {
  const [form, setForm] = useState<FooterData>({ brand: '', tagline: '' });
  useEffect(() => { if (data) setForm(data); }, [data]);

  return (
    <Card className="glass-card border-0">
      <CardHeader><CardTitle className="text-base">Footer</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div><Label>Brand Name</Label><Input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></div>
        <div><Label>Tagline</Label><Input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} /></div>
        <SaveButton onClick={() => onSave(form)} saving={saving} />
      </CardContent>
    </Card>
  );
}
