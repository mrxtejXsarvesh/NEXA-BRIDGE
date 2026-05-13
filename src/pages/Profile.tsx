import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Camera, User, Briefcase, GraduationCap, Phone, Linkedin, Mail, Code, FileText,
  Calendar, Award, Star, TrendingUp, BookOpen, MessageSquare, ThumbsUp, Eye, Clock,
  Trophy, Target, Flame, Zap, CheckCircle2, PenLine, Building2, MapPin, Globe,
  Users, IndianRupee, Megaphone, Sparkles, Shield, X, Plus,
} from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';

const allDepartments = [
  'Computer Science & Engineering', 'Information Technology',
  'Electronics & Communication Engineering', 'Electrical Engineering',
  'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering',
  'Biotechnology', 'Artificial Intelligence & Data Science',
  'Artificial Intelligence & Machine Learning', 'Cyber Security',
  'Internet of Things', 'Robotics & Automation', 'Aerospace Engineering',
  'Automobile Engineering', 'Industrial Engineering', 'Instrumentation Engineering',
  'Mining Engineering', 'Petroleum Engineering', 'Agricultural Engineering',
  'Biomedical Engineering', 'Environmental Engineering', 'Food Technology',
  'Textile Engineering', 'Production Engineering', 'Metallurgical Engineering',
  'Marine Engineering', 'Other',
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2000 + 5 }, (_, i) => (currentYear + 4 - i).toString());

/* ── Coding Score Data (UI only) ── */
const codingStats = [
  { label: 'Problems Solved', value: 142, max: 500, icon: Target, color: 'text-green-500' },
  { label: 'Current Streak', value: 7, max: 30, icon: Flame, color: 'text-orange-500' },
  { label: 'Contests Attended', value: 5, max: 20, icon: Trophy, color: 'text-yellow-500' },
  { label: 'Institute Rank', value: 23, max: 100, icon: TrendingUp, color: 'text-primary' },
];

const difficultyBreakdown = [
  { level: 'Easy', solved: 78, total: 200, color: 'bg-green-500' },
  { level: 'Medium', solved: 48, total: 200, color: 'bg-yellow-500' },
  { level: 'Hard', solved: 16, total: 100, color: 'bg-red-500' },
];

const recentSubmissions = [
  { title: 'Two Sum', difficulty: 'Easy', status: 'Accepted', time: '2 hours ago' },
  { title: 'LRU Cache', difficulty: 'Hard', status: 'Accepted', time: '1 day ago' },
  { title: 'Merge Intervals', difficulty: 'Medium', status: 'Accepted', time: '2 days ago' },
  { title: 'Valid Parentheses', difficulty: 'Easy', status: 'Accepted', time: '3 days ago' },
];

/* ── Sample Posts/Reviews (static for now) ── */
const samplePosts = [
  { title: 'My journey from college to FAANG', likes: 45, comments: 12, views: 320, date: 'Mar 15, 2026' },
  { title: 'Top 10 DSA patterns for interviews', likes: 89, comments: 23, views: 1200, date: 'Feb 28, 2026' },
  { title: 'How I cracked Google interview', likes: 120, comments: 34, views: 2100, date: 'Jan 10, 2026' },
];

const sampleReviews = [
  { reviewer: 'Amit K.', rating: 5, text: 'Excellent mentor! Helped me prepare for my Google interview.', date: 'Mar 2026' },
  { reviewer: 'Sneha R.', rating: 4, text: 'Very knowledgeable and patient. Great guidance on DSA.', date: 'Feb 2026' },
  { reviewer: 'Rohit M.', rating: 5, text: 'Best alumni mentor on the platform. Highly recommended!', date: 'Jan 2026' },
];

const instSampleReviews = [
  { reviewer: 'Aarav M.', rating: 5, text: 'Amazing campus and excellent placement support. Highly recommend!', date: 'Mar 2026' },
  { reviewer: 'Priya S.', rating: 4, text: 'Great faculty and good infrastructure. Alumni network is strong.', date: 'Feb 2026' },
  { reviewer: 'Rohit V.', rating: 5, text: 'Best engineering college experience. Departments are well-organized.', date: 'Jan 2026' },
];

interface InstitutionData {
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
}

export default function Profile() {
  const { profile, role, user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [department, setDepartment] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Institution-specific state
  const [instData, setInstData] = useState<InstitutionData | null>(null);
  const [instLoading, setInstLoading] = useState(false);
  const [instShortName, setInstShortName] = useState('');
  const [instLocation, setInstLocation] = useState('');
  const [instCity, setInstCity] = useState('');
  const [instState, setInstState] = useState('');
  const [instWebsite, setInstWebsite] = useState('');
  const [instEstYear, setInstEstYear] = useState('');
  const [instType, setInstType] = useState('government');
  const [instAffiliation, setInstAffiliation] = useState('');
  const [instDescription, setInstDescription] = useState('');
  const [instTagline, setInstTagline] = useState('');
  const [instVision, setInstVision] = useState('');
  const [instAchievements, setInstAchievements] = useState<string[]>([]);
  const [instDepartments, setInstDepartments] = useState<string[]>([]);
  const [instTotalStudents, setInstTotalStudents] = useState('');
  const [instPlacementRate, setInstPlacementRate] = useState('');
  const [instHighestPkg, setInstHighestPkg] = useState('');
  const [instAvgPkg, setInstAvgPkg] = useState('');
  const [instLogoUrl, setInstLogoUrl] = useState('');
  const [instBannerUrl, setInstBannerUrl] = useState('');
  const [deptInput, setDeptInput] = useState('');
  const [achieveInput, setAchieveInput] = useState('');

  const isInstitution = role === 'institution';

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setBio(profile.bio ?? '');
      setDepartment(profile.department ?? '');
      setGradYear(profile.graduation_year?.toString() ?? '');
      setCompany(profile.company ?? '');
      setPosition(profile.position ?? '');
      setPhone(profile.phone ?? '');
      setLinkedin(profile.linkedin_url ?? '');
      setSkillsInput(profile.skills?.join(', ') ?? '');
      setAvatarUrl(profile.avatar_url ?? '');
    }
  }, [profile]);

  // Load institution data for institution role
  useEffect(() => {
    if (isInstitution && user) {
      setInstLoading(true);
      supabase.from('institutions').select('*').eq('managed_by', user.id).maybeSingle().then(({ data }) => {
        if (data) {
          const d = data as InstitutionData;
          setInstData(d);
          setInstShortName(d.short_name || '');
          setInstLocation(d.location || '');
          setInstCity(d.city || '');
          setInstState(d.state || '');
          setInstWebsite(d.website || '');
          setInstEstYear(d.established_year?.toString() || '');
          setInstType(d.type || 'government');
          setInstAffiliation(d.affiliation || '');
          setInstDescription(d.description || '');
          setInstTagline(d.tagline || '');
          setInstVision(d.vision || '');
          setInstAchievements(d.achievements || []);
          setInstDepartments(d.departments || []);
          setInstTotalStudents(d.total_students?.toString() || '');
          setInstPlacementRate(d.placement_rate?.toString() || '');
          setInstHighestPkg(d.highest_package || '');
          setInstAvgPkg(d.average_package || '');
          setInstLogoUrl(d.logo_url || '');
          setInstBannerUrl(d.banner_url || '');
        }
        setInstLoading(false);
      });
    }
  }, [isInstitution, user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const newUrl = `${publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: newUrl }).eq('user_id', user.id);
      if (updateError) throw updateError;
      setAvatarUrl(newUrl);
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      await refreshProfile();
      toast.success('Profile photo updated!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = useMutation({
    mutationFn: async () => {
      // Update profile table
      const { error } = await supabase.from('profiles').update({
        full_name: fullName, bio, department: isInstitution ? '' : department,
        graduation_year: gradYear ? parseInt(gradYear) : null,
        company, position, phone, linkedin_url: linkedin,
        skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
      }).eq('user_id', user!.id);
      if (error) throw error;

      // Update institution data if institution role
      if (isInstitution && user && instData?.id) {
        const { error: instError } = await supabase.from('institutions').update({
          name: company.trim() || instData.name,
          short_name: instShortName || null,
          location: instLocation,
          city: instCity,
          state: instState,
          website: instWebsite,
          established_year: instEstYear ? parseInt(instEstYear) : null,
          type: instType,
          affiliation: instAffiliation,
          description: instDescription,
          tagline: instTagline,
          vision: instVision,
          achievements: instAchievements,
          departments: instDepartments,
          total_students: instTotalStudents ? parseInt(instTotalStudents) : 0,
          placement_rate: instPlacementRate ? parseFloat(instPlacementRate) : 0,
          highest_package: instHighestPkg,
          average_package: instAvgPkg,
          logo_url: instLogoUrl,
          banner_url: instBannerUrl,
        }).eq('id', instData.id);
        if (instError) throw instError;
      } else if (isInstitution && user && !instData?.id && company.trim()) {
        const { error: instError } = await supabase.from('institutions').insert({
          name: company.trim(),
          managed_by: user.id,
          short_name: instShortName || null,
          location: instLocation, city: instCity, state: instState,
          website: instWebsite,
          established_year: instEstYear ? parseInt(instEstYear) : null,
          type: instType, affiliation: instAffiliation,
          description: instDescription, tagline: instTagline, vision: instVision,
          achievements: instAchievements, departments: instDepartments,
          total_students: instTotalStudents ? parseInt(instTotalStudents) : 0,
          placement_rate: instPlacementRate ? parseFloat(instPlacementRate) : 0,
          highest_package: instHighestPkg, average_package: instAvgPkg,
          logo_url: instLogoUrl, banner_url: instBannerUrl,
          is_featured: false,
        });
        if (instError) throw instError;
      }
    },
    onSuccess: async () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      await refreshProfile();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const addDept = () => {
    if (deptInput.trim() && !instDepartments.includes(deptInput.trim())) {
      setInstDepartments([...instDepartments, deptInput.trim()]);
      setDeptInput('');
    }
  };
  const removeDept = (idx: number) => setInstDepartments(instDepartments.filter((_, i) => i !== idx));

  const addAchievement = () => {
    if (achieveInput.trim()) {
      setInstAchievements([...instAchievements, achieveInput.trim()]);
      setAchieveInput('');
    }
  };
  const removeAchievement = (idx: number) => setInstAchievements(instAchievements.filter((_, i) => i !== idx));

  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  const isOnline = profile?.last_seen ? (Date.now() - new Date(profile.last_seen).getTime()) < 5 * 60 * 1000 : false;

  const fields = isInstitution ? [
    { label: 'Admin Name', filled: !!fullName.trim() },
    { label: 'Photo', filled: !!avatarUrl },
    { label: 'Institution Name', filled: !!company.trim() },
    { label: 'Short Name', filled: !!instShortName.trim() },
    { label: 'Description', filled: !!instDescription.trim() },
    { label: 'City', filled: !!instCity.trim() },
    { label: 'State', filled: !!instState.trim() },
    { label: 'Website', filled: !!instWebsite.trim() },
    { label: 'Departments', filled: instDepartments.length > 0 },
    { label: 'Placement Rate', filled: !!instPlacementRate },
  ] : [
    { label: 'Full Name', filled: !!fullName.trim() },
    { label: 'Photo', filled: !!avatarUrl },
    { label: 'Bio', filled: !!bio.trim() },
    { label: 'Department', filled: !!department },
    { label: 'Graduation Year', filled: !!gradYear },
    { label: 'Company', filled: !!company.trim() },
    { label: 'Position', filled: !!position.trim() },
    { label: 'Phone', filled: !!phone.trim() },
    { label: 'LinkedIn', filled: !!linkedin.trim() },
    { label: 'Skills', filled: !!skillsInput.trim() },
  ];
  const filledCount = fields.filter(f => f.filled).length;
  const completeness = Math.round((filledCount / fields.length) * 100);
  const completenessColor = completeness === 100 ? 'bg-green-500' : completeness >= 70 ? 'bg-yellow-500' : completeness >= 40 ? 'bg-orange-500' : 'bg-red-500';

  const posts = samplePosts;
  const reviews = isInstitution ? instSampleReviews : sampleReviews;

  // ── Announcements & Articles from DB ──
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [dbArticles, setDbArticles] = useState<any[]>([]);
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [showArtForm, setShowArtForm] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [artTitle, setArtTitle] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artTag, setArtTag] = useState('');
  const [savingAnn, setSavingAnn] = useState(false);
  const [savingArt, setSavingArt] = useState(false);

  const loadAnnouncements = async () => {
    if (!user) return;
    const { data } = await supabase.from('announcements').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setAnnouncements(data || []);
  };

  const loadArticles = async () => {
    if (!user) return;
    const { data } = await supabase.from('articles').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setDbArticles(data || []);
  };

  useEffect(() => { loadAnnouncements(); loadArticles(); }, [user]);

  const createAnnouncement = async () => {
    if (!annTitle.trim() || !user) return;
    setSavingAnn(true);
    const payload: any = { user_id: user.id, title: annTitle.trim(), content: annContent.trim() };
    if (instData?.id) payload.institution_id = instData.id;
    const { error } = await supabase.from('announcements').insert(payload);
    if (error) { toast.error(error.message); } else { toast.success('Announcement created!'); setAnnTitle(''); setAnnContent(''); setShowAnnForm(false); loadAnnouncements(); }
    setSavingAnn(false);
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    toast.success('Deleted'); loadAnnouncements();
  };

  const createArticle = async () => {
    if (!artTitle.trim() || !user) return;
    setSavingArt(true);
    const payload: any = { user_id: user.id, title: artTitle.trim(), content: artContent.trim(), tag: artTag.trim() };
    if (instData?.id) payload.institution_id = instData.id;
    const { error } = await supabase.from('articles').insert(payload);
    if (error) { toast.error(error.message); } else { toast.success('Article published!'); setArtTitle(''); setArtContent(''); setArtTag(''); setShowArtForm(false); loadArticles(); }
    setSavingArt(false);
  };

  const deleteArticle = async (id: string) => {
    await supabase.from('articles').delete().eq('id', id);
    toast.success('Deleted'); loadArticles();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group flex-shrink-0">
              <Avatar className="h-28 w-28 border-4 border-primary/20">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} /> : null}
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-6 w-6 text-white" />
              </button>
              <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background ${isOnline ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{isInstitution ? (company || 'Institution Name') : (fullName || 'Your Name')}</h2>
                <VerifiedBadge role={role} studentBadge={profile?.student_badge} size={18} />
              </div>
              {isInstitution ? (
                <>
                  <p className="text-muted-foreground">{fullName}{position ? ` • ${position}` : ''}</p>
                  {instTagline && <p className="text-sm text-primary italic">"{instTagline}"</p>}
                </>
              ) : (
                (position || company) && (
                  <p className="text-muted-foreground">{position}{position && company ? ' at ' : ''}{company}</p>
                )
              )}
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                {role && <Badge variant="secondary" className="capitalize">{role}</Badge>}
                {!isInstitution && profile?.student_badge && <Badge variant="outline" className="capitalize">{profile.student_badge} Student</Badge>}
                {isInstitution && instCity && <Badge variant="outline"><MapPin className="h-3 w-3 mr-1" />{instCity}{instState ? `, ${instState}` : ''}</Badge>}
                {!isInstitution && department && <Badge variant="outline">{department}</Badge>}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
                {isOnline ? 'Online now' : 'Offline'}
              </div>
              {/* Quick Stats */}
              <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-sm">
                {isInstitution ? (
                  <>
                    <div className="text-center"><span className="font-bold text-foreground">{instTotalStudents || '0'}</span><p className="text-xs text-muted-foreground">Students</p></div>
                    <div className="text-center"><span className="font-bold text-foreground">{instDepartments.length}</span><p className="text-xs text-muted-foreground">Depts</p></div>
                    <div className="text-center"><span className="font-bold text-foreground">{instPlacementRate || '0'}%</span><p className="text-xs text-muted-foreground">Placed</p></div>
                    <div className="text-center"><span className="font-bold text-foreground">{instAchievements.length}</span><p className="text-xs text-muted-foreground">Awards</p></div>
                  </>
                ) : (
                  <>
                    <div className="text-center"><span className="font-bold text-foreground">142</span><p className="text-xs text-muted-foreground">Problems</p></div>
                    <div className="text-center"><span className="font-bold text-foreground">3</span><p className="text-xs text-muted-foreground">Posts</p></div>
                    <div className="text-center"><span className="font-bold text-foreground">2</span><p className="text-xs text-muted-foreground">Articles</p></div>
                    <div className="text-center"><span className="font-bold text-foreground">4.7</span><p className="text-xs text-muted-foreground">Rating</p></div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Completeness Bar */}
          <div className="mt-5 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">Profile Completeness</span>
              <span className={`text-xs font-bold ${completeness === 100 ? 'text-green-500' : ''}`}>{completeness}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${completenessColor}`} style={{ width: `${completeness}%` }} />
            </div>
            {completeness < 100 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {fields.filter(f => !f.filled).map(f => (
                  <Badge key={f.label} variant="outline" className="text-[10px] text-muted-foreground">+ {f.label}</Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── TABS ── */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-card border border-border/50 h-12 p-1 rounded-xl">
          <TabsTrigger value="overview" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <User className="h-4 w-4" /> Overview
          </TabsTrigger>
          {isInstitution ? (
            <TabsTrigger value="stats" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
              <TrendingUp className="h-4 w-4" /> Stats & Placements
            </TabsTrigger>
          ) : (
            <TabsTrigger value="coding" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
              <Code className="h-4 w-4" /> Coding Score
            </TabsTrigger>
          )}
          <TabsTrigger value="posts" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <PenLine className="h-4 w-4" /> {isInstitution ? 'Announcements' : 'Posts'}
          </TabsTrigger>
          <TabsTrigger value="articles" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <BookOpen className="h-4 w-4" /> Articles
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            <Star className="h-4 w-4" /> Reviews
          </TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW TAB ── */}
        <TabsContent value="overview" className="space-y-5 mt-5">
          <form onSubmit={e => { e.preventDefault(); updateProfile.mutate(); }} className="space-y-5">
            {/* Admin Personal Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-primary" /> {isInstitution ? 'Admin Information' : 'Personal Information'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs">{isInstitution ? 'Admin Name *' : 'Full Name *'}</Label>
                    <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter full name" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input value={user?.email ?? ''} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone</Label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{isInstitution ? 'Designation' : 'LinkedIn URL'}</Label>
                    {isInstitution ? (
                      <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Admin, Dean, Coordinator" />
                    ) : (
                      <Input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
                    )}
                  </div>
                </div>
                {!isInstitution && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Bio</Label>
                    <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell about yourself..." rows={4} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Institution Details */}
            {isInstitution && (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Institution Details</CardTitle>
                    <CardDescription className="text-xs">Main information about your institution</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Institution Name *</Label>
                        <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Delhi Technological University" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Short Name</Label>
                        <Input value={instShortName} onChange={e => setInstShortName(e.target.value)} placeholder="e.g. DTU" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Type</Label>
                        <Select value={instType} onValueChange={setInstType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="government">Government</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="deemed">Deemed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Established Year</Label>
                        <Input type="number" value={instEstYear} onChange={e => setInstEstYear(e.target.value)} placeholder="e.g. 1941" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Affiliation</Label>
                        <Input value={instAffiliation} onChange={e => setInstAffiliation(e.target.value)} placeholder="e.g. AICTE, UGC" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Website</Label>
                        <Input value={instWebsite} onChange={e => setInstWebsite(e.target.value)} placeholder="https://dtu.ac.in" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Tagline</Label>
                      <Input value={instTagline} onChange={e => setInstTagline(e.target.value)} placeholder="Connecting Generations of Innovators" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Textarea value={instDescription} onChange={e => setInstDescription(e.target.value)} placeholder="About your institution..." rows={4} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Vision & Mission</Label>
                      <Textarea value={instVision} onChange={e => setInstVision(e.target.value)} placeholder="Institution's vision and mission statement..." rows={3} />
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">City</Label>
                        <Input value={instCity} onChange={e => setInstCity(e.target.value)} placeholder="e.g. Delhi" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">State</Label>
                        <Input value={instState} onChange={e => setInstState(e.target.value)} placeholder="e.g. Delhi" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Full Address</Label>
                        <Input value={instLocation} onChange={e => setInstLocation(e.target.value)} placeholder="Full campus address" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Branding */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Branding</CardTitle>
                    <CardDescription className="text-xs">Logo and banner image URLs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Logo URL</Label>
                        <Input value={instLogoUrl} onChange={e => setInstLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Banner URL</Label>
                        <Input value={instBannerUrl} onChange={e => setInstBannerUrl(e.target.value)} placeholder="https://example.com/banner.jpg" />
                      </div>
                    </div>
                    {(instLogoUrl || instBannerUrl) && (
                      <div className="flex gap-4 mt-3">
                        {instLogoUrl && <img src={instLogoUrl} alt="Logo" className="h-16 w-16 rounded-lg object-cover border border-border" />}
                        {instBannerUrl && <img src={instBannerUrl} alt="Banner" className="h-16 w-40 rounded-lg object-cover border border-border" />}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Departments */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> Departments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input value={deptInput} onChange={e => setDeptInput(e.target.value)} placeholder="Add department name"
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDept())} />
                      <Button type="button" variant="outline" onClick={addDept} size="sm"><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {instDepartments.map((d, i) => (
                        <Badge key={i} variant="secondary" className="gap-1 py-1">{d}<X className="h-3 w-3 cursor-pointer" onClick={() => removeDept(i)} /></Badge>
                      ))}
                    </div>
                    {instDepartments.length === 0 && <p className="text-xs text-muted-foreground">No departments added yet.</p>}
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4 text-amber-400" /> Achievements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input value={achieveInput} onChange={e => setAchieveInput(e.target.value)} placeholder="Add achievement"
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAchievement())} />
                      <Button type="button" variant="outline" onClick={addAchievement} size="sm"><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="space-y-2">
                      {instAchievements.map((a, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/30">
                          <Star className="h-4 w-4 text-amber-400 shrink-0" />
                          <span className="text-sm flex-1">{a}</span>
                          <X className="h-3.5 w-3.5 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => removeAchievement(i)} />
                        </div>
                      ))}
                    </div>
                    {instAchievements.length === 0 && <p className="text-xs text-muted-foreground">No achievements added yet.</p>}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Academic - non-institution only */}
            {!isInstitution && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> Academic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Department</Label>
                      <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                        <SelectContent>{allDepartments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Graduation Year</Label>
                      <Select value={gradYear} onValueChange={setGradYear}>
                        <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                        <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Professional - non-institution only */}
            {!isInstitution && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> Professional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Company</Label>
                      <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, TCS" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Position</Label>
                      <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Software Engineer" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills / Tags */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Code className="h-4 w-4 text-primary" /> {isInstitution ? 'Tags / Keywords' : 'Skills'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea value={skillsInput} onChange={e => setSkillsInput(e.target.value)} placeholder={isInstitution ? 'Engineering, Placements, Research...' : 'React, TypeScript, Python...'} rows={2} />
                {skillsInput && (
                  <div className="flex flex-wrap gap-1.5">
                    {skillsInput.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={updateProfile.isPending} className="min-w-[160px]">
                {updateProfile.isPending ? 'Saving...' : 'Save All Changes'}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* ── INSTITUTION STATS TAB ── */}
        {isInstitution && (
          <TabsContent value="stats" className="space-y-5 mt-5">
            <form onSubmit={e => { e.preventDefault(); updateProfile.mutate(); }} className="space-y-5">
              {/* Placement Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Users, label: 'Total Students', value: instTotalStudents || '0', color: 'text-blue-400' },
                  { icon: TrendingUp, label: 'Placement Rate', value: `${instPlacementRate || '0'}%`, color: 'text-green-400' },
                  { icon: IndianRupee, label: 'Highest Package', value: instHighestPkg || 'N/A', color: 'text-amber-400' },
                  { icon: IndianRupee, label: 'Average Package', value: instAvgPkg || 'N/A', color: 'text-blue-400' },
                ].map((s, i) => (
                  <Card key={i}>
                    <CardContent className="pt-5 pb-4 text-center">
                      <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
                      <p className="text-xl font-bold">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Editable Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Edit Placement Statistics</CardTitle>
                  <CardDescription className="text-xs">Update your institution's placement and student data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Total Students</Label>
                      <Input type="number" value={instTotalStudents} onChange={e => setInstTotalStudents(e.target.value)} placeholder="e.g. 5000" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Placement Rate (%)</Label>
                      <Input type="number" value={instPlacementRate} onChange={e => setInstPlacementRate(e.target.value)} placeholder="e.g. 95" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Highest Package</Label>
                      <Input value={instHighestPkg} onChange={e => setInstHighestPkg(e.target.value)} placeholder="₹2.1 Cr / $250K" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Average Package</Label>
                      <Input value={instAvgPkg} onChange={e => setInstAvgPkg(e.target.value)} placeholder="₹14 LPA" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={updateProfile.isPending} className="min-w-[160px]">
                  {updateProfile.isPending ? 'Saving...' : 'Save Stats'}
                </Button>
              </div>
            </form>
          </TabsContent>
        )}

        {/* ── CODING SCORE TAB (non-institution) ── */}
        {!isInstitution && (
          <TabsContent value="coding" className="space-y-5 mt-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {codingStats.map((s, i) => (
                <Card key={i}>
                  <CardContent className="pt-5 pb-4 text-center">
                    <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Difficulty Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {difficultyBreakdown.map(d => (
                  <div key={d.level} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{d.level}</span>
                      <span className="text-muted-foreground">{d.solved} / {d.total}</span>
                    </div>
                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${d.color} transition-all`} style={{ width: `${(d.solved / d.total) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSubmissions.map((sub, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/30">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">{sub.title}</p>
                          <p className="text-xs text-muted-foreground">{sub.time}</p>
                        </div>
                      </div>
                      <Badge variant={sub.difficulty === 'Easy' ? 'secondary' : sub.difficulty === 'Medium' ? 'outline' : 'destructive'} className="text-xs">
                        {sub.difficulty}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Flame className="h-4 w-4 text-primary" /> Activity Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-[repeat(26,1fr)] gap-1">
                  {Array.from({ length: 182 }).map((_, i) => {
                    const intensity = Math.random();
                    return (
                      <div key={i} className={`aspect-square rounded-sm ${
                        intensity > 0.7 ? 'bg-green-500' : intensity > 0.4 ? 'bg-green-400/60' : intensity > 0.2 ? 'bg-green-300/30' : 'bg-muted'
                      }`} />
                    );
                  })}
                </div>
                <div className="flex items-center justify-end gap-1.5 mt-3 text-xs text-muted-foreground">
                  <span>Less</span>
                  <div className="w-3 h-3 rounded-sm bg-muted" />
                  <div className="w-3 h-3 rounded-sm bg-green-300/30" />
                  <div className="w-3 h-3 rounded-sm bg-green-400/60" />
                  <div className="w-3 h-3 rounded-sm bg-green-500" />
                  <span>More</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ── POSTS / ANNOUNCEMENTS TAB ── */}
        <TabsContent value="posts" className="space-y-4 mt-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{isInstitution ? 'Announcements' : 'Your Posts'} ({isInstitution ? announcements.length : posts.length})</h3>
            <Button size="sm" className="gap-1.5" onClick={() => isInstitution ? setShowAnnForm(!showAnnForm) : null}>
              <PenLine className="h-3.5 w-3.5" /> {isInstitution ? 'New Announcement' : 'Write Post'}
            </Button>
          </div>

          {/* Create Announcement Form */}
          {isInstitution && showAnnForm && (
            <Card className="border-primary/30">
              <CardContent className="pt-5 space-y-3">
                <Input placeholder="Announcement title *" value={annTitle} onChange={e => setAnnTitle(e.target.value)} />
                <Textarea placeholder="Content (optional)" value={annContent} onChange={e => setAnnContent(e.target.value)} rows={3} />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowAnnForm(false)}>Cancel</Button>
                  <Button size="sm" onClick={createAnnouncement} disabled={savingAnn || !annTitle.trim()}>
                    {savingAnn ? 'Posting...' : 'Post Announcement'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isInstitution ? (
            announcements.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No announcements yet. Create your first one!</CardContent></Card>
            ) : (
              announcements.map((ann) => (
                <Card key={ann.id} className="hover:border-primary/20 transition-colors">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold mb-1">{ann.title}</h4>
                        {ann.content && <p className="text-sm text-muted-foreground mb-2">{ann.content}</p>}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {new Date(ann.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteAnnouncement(ann.id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          ) : (
            posts.map((post, i) => (
              <Card key={i} className="hover:border-primary/20 transition-colors">
                <CardContent className="pt-5 pb-4">
                  <h4 className="font-semibold mb-2 hover:text-primary cursor-pointer transition-colors">{post.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {post.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.comments}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.views}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ── ARTICLES TAB ── */}
        <TabsContent value="articles" className="space-y-4 mt-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{isInstitution ? 'Institution Articles' : 'Your Articles'} ({dbArticles.length})</h3>
            <Button size="sm" className="gap-1.5" onClick={() => setShowArtForm(!showArtForm)}>
              <BookOpen className="h-3.5 w-3.5" /> Write Article
            </Button>
          </div>

          {/* Create Article Form */}
          {showArtForm && (
            <Card className="border-primary/30">
              <CardContent className="pt-5 space-y-3">
                <Input placeholder="Article title *" value={artTitle} onChange={e => setArtTitle(e.target.value)} />
                <Textarea placeholder="Article content *" value={artContent} onChange={e => setArtContent(e.target.value)} rows={5} />
                <Input placeholder="Tag (e.g. Research, Placements, React)" value={artTag} onChange={e => setArtTag(e.target.value)} />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setShowArtForm(false)}>Cancel</Button>
                  <Button size="sm" onClick={createArticle} disabled={savingArt || !artTitle.trim()}>
                    {savingArt ? 'Publishing...' : 'Publish Article'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {dbArticles.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No articles yet. Write your first one!</CardContent></Card>
          ) : (
            dbArticles.map((article) => (
              <Card key={article.id} className="hover:border-primary/20 transition-colors">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{article.title}</h4>
                      {article.content && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{article.content}</p>}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(article.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {article.tag && <Badge variant="secondary" className="text-xs">{article.tag}</Badge>}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteArticle(article.id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ── REVIEWS TAB ── */}
        <TabsContent value="reviews" className="space-y-4 mt-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{isInstitution ? 'Institution Reviews' : 'Reviews'} ({reviews.length})</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`h-4 w-4 ${s <= 4.7 ? 'fill-yellow-500 text-yellow-500' : 'text-muted'}`} />
                ))}
              </div>
              <span className="text-sm font-bold">4.7</span>
              <span className="text-xs text-muted-foreground">({reviews.length} reviews)</span>
            </div>
          </div>
          {reviews.map((review, i) => (
            <Card key={i}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {review.reviewer.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.reviewer}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.text}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
