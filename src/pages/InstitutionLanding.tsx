import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  GraduationCap, Users, Link2, Briefcase, TrendingUp, Shield,
  DollarSign, BarChart3, MessageSquare, ArrowRight, CheckCircle2,
  Star, Zap, Globe, Heart, Award, Building2, Sparkles,
} from 'lucide-react';
import institutionHero from '@/assets/institution-hero.png';

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { delay, duration: 0.7, ease } },
});

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={fadeUp(delay)} className={className}>
      {children}
    </motion.div>
  );
}

const stats = [
  { icon: GraduationCap, label: 'Alumni Connected', value: '50,000+', color: 'text-purple-400' },
  { icon: Users, label: 'Students Enrolled', value: '1,20,000+', color: 'text-blue-400' },
  { icon: Link2, label: 'Connections Made', value: '3,00,000+', color: 'text-green-400' },
  { icon: Briefcase, label: 'Jobs Posted', value: '15,000+', color: 'text-amber-400' },
];

const benefits = [
  { icon: Users, title: 'Strong Alumni Network', desc: 'Build a lifelong connection between your alumni and current students for mentorship & collaboration.' },
  { icon: TrendingUp, title: 'Better Placements', desc: 'Alumni-driven referrals and job postings directly boost your campus placement statistics.' },
  { icon: DollarSign, title: 'Fundraising Opportunities', desc: 'Engage alumni for donations, scholarships, and institutional development campaigns.' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track engagement, active users, mentorship sessions, and growth metrics on a live dashboard.' },
  { icon: MessageSquare, title: 'Instant Communication', desc: 'Mass messaging, announcements, and push notifications to stay connected with your community.' },
  { icon: Shield, title: 'Complete Admin Control', desc: 'Full control over users, content moderation, privacy settings, and platform customization.' },
];

const steps = [
  { step: '01', title: 'Register Institution', desc: 'Fill in your college details and verify your institution identity.' },
  { step: '02', title: 'Admin Account Created', desc: 'Get instant admin access to manage your institution dashboard.' },
  { step: '03', title: 'Upload Student & Alumni Data', desc: 'Bulk import via CSV or add users manually to the platform.' },
  { step: '04', title: 'Platform Ready!', desc: 'Your branded alumni network is live and ready for engagement.' },
];

const testimonials = [
  { name: 'Dr. Priya Sharma', role: 'Dean, DTU', text: 'NexaBridge transformed our alumni engagement. 40% increase in mentorship sessions within 3 months!' },
  { name: 'Prof. Rajesh Kumar', role: 'Director, NSUT', text: 'The analytics dashboard alone is worth it. We can now track and improve our alumni relations data-driven.' },
  { name: 'Anil Mehta', role: 'Alumni Cell Head, IIT Delhi', text: 'Our alumni fund collection improved by 60% after implementing NexaBridge across departments.' },
];

export default function InstitutionLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>
            Nexa<span className="text-primary">Bridge</span>
            <span className="text-xs ml-2 text-muted-foreground font-normal">for Institutions</span>
          </h1>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>Login</Button>
            <Button size="sm" onClick={() => navigate('/auth')}>Register Institution <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
              <Sparkles className="h-4 w-4" /> Trusted by 100+ Institutions
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Empower Your{' '}
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Alumni Network
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              NexaBridge connects your students with alumni for mentorship, internships, placements, and lifelong engagement — all on one platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="text-base px-8" onClick={() => navigate('/auth')}>
                Register Your Institution <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8">
                Request Demo
              </Button>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-400" />Free Setup</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-400" />No Credit Card</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-400" />Launch in 24hrs</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease }}>
            <img src={institutionHero} alt="NexaBridge for Institutions" width={1024} height={1024} className="w-full max-w-lg mx-auto drop-shadow-2xl" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-muted/30 border-y border-border/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="text-center">
                <s.icon className={`h-8 w-8 mx-auto mb-2 ${s.color}`} />
                <p className="text-2xl md:text-3xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Institutions Choose <span className="text-primary">NexaBridge</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to build, manage, and grow your alumni network — from a single powerful platform.</p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <Card className="h-full hover:border-primary/40 transition-all hover:shadow-lg group">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <b.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-muted/30 border-y border-border/50">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started in <span className="text-primary">4 Easy Steps</span></h2>
              <p className="text-muted-foreground">From registration to a fully functional alumni network — in less than 24 hours.</p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-6">
            {steps.map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <Card className="relative overflow-hidden hover:border-primary/40 transition-all">
                  <CardContent className="p-6">
                    <span className="absolute top-4 right-4 text-5xl font-black text-primary/10">{s.step}</span>
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm mb-4">{s.step}</div>
                    <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features highlight */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful <span className="text-primary">Admin Dashboard</span></h2>
              <p className="text-muted-foreground">Complete control over your institution's alumni platform</p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'User Management', desc: 'Add, edit, approve students & alumni' },
              { icon: BarChart3, label: 'Analytics', desc: 'Engagement, growth & placement stats' },
              { icon: MessageSquare, label: 'Mass Communication', desc: 'Announcements & notifications' },
              { icon: Briefcase, label: 'Job Board', desc: 'Approve & highlight opportunities' },
              { icon: Globe, label: 'Customization', desc: 'Logo, theme, branding controls' },
              { icon: Shield, label: 'Moderation', desc: 'Content & connection monitoring' },
              { icon: Award, label: 'Leaderboard', desc: 'Most active alumni recognition' },
              { icon: Heart, label: 'Fundraising', desc: 'Donation campaigns & tracking' },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div className="p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-all text-center">
                  <f.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-medium text-sm">{f.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-muted/30 border-y border-border/50">
        <div className="max-w-5xl mx-auto">
          <Reveal><h2 className="text-3xl md:text-4xl font-bold text-center mb-14">What Institutions <span className="text-primary">Say</span></h2></Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">{[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                    <p className="text-sm text-muted-foreground italic mb-4">"{t.text}"</p>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <Building2 className="h-12 w-12 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join <span className="text-primary">NexaBridge</span> Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8">Transform your institution's alumni engagement. Free to start, powerful to scale.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="text-base px-10" onClick={() => navigate('/auth')}>
                Register Your Institution <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-10">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 NexaBridge. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
