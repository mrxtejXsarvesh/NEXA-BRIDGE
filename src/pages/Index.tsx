import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  Users, Briefcase, MessageSquare, Calendar, ArrowRight, Shield,
  GraduationCap, Zap, Globe, ChevronRight, Sun, Moon, Star,
  TrendingUp, Award, Lock, Link2, BarChart3, UserCheck,
  Rocket, Handshake, Mail, MapPin, Phone, CheckCircle2,
  ArrowUpRight, Sparkles, Play, ExternalLink, Building2,
  DollarSign, Heart,
} from 'lucide-react';

import hero3d from '@/assets/hero-3d.png';
import problem3d from '@/assets/problem-3d.png';
import solution3d from '@/assets/solution-3d.png';
import previewDashboard from '@/assets/preview-dashboard.jpg';
import previewChat from '@/assets/preview-chat.jpg';
import previewDirectory from '@/assets/preview-directory.jpg';

/* ── Animations ── */
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { delay, duration: 0.8, ease } },
});
const scaleIn = (delay = 0) => ({
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { delay, duration: 0.7, ease } },
});

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={fadeUp(delay)} className={className}>
      {children}
    </motion.div>
  );
}

/* ── Data ── */
const features = [
  { icon: Lock, title: 'Secure OTP Login', desc: 'Fast & secure authentication', gradient: 'from-blue-600 to-cyan-500' },
  { icon: Link2, title: 'Smart Connections', desc: 'AI-powered alumni matching', gradient: 'from-violet-600 to-purple-500' },
  { icon: MessageSquare, title: 'Real-Time Chat', desc: 'Instant messaging & media', gradient: 'from-emerald-600 to-green-500' },
  { icon: Calendar, title: 'Mentorship Sessions', desc: 'Book 1-on-1 sessions', gradient: 'from-orange-600 to-amber-500' },
  { icon: Briefcase, title: 'Job Board', desc: 'Exclusive opportunities', gradient: 'from-rose-600 to-pink-500' },
  { icon: BarChart3, title: 'Admin Analytics', desc: 'Full platform control', gradient: 'from-indigo-600 to-blue-500' },
];

const problems = [
  'Alumni lose touch after graduation — no centralized system',
  'Students lack mentorship & career guidance',
  'Job opportunities scattered across WhatsApp groups',
  'No structured way to connect & collaborate',
];

const solutions = [
  { icon: Globe, text: 'One platform for all alumni-student interactions' },
  { icon: Link2, text: 'Smart matching based on skills & department' },
  { icon: GraduationCap, text: 'Structured mentorship with booking system' },
  { icon: Briefcase, text: 'Dedicated job & internship board' },
];

const steps = [
  { num: '01', title: 'Sign Up', desc: 'Quick OTP-based registration', icon: UserCheck, color: 'from-blue-500 to-cyan-400' },
  { num: '02', title: 'Build Profile', desc: 'Add skills & experience', icon: Users, color: 'from-purple-500 to-violet-400' },
  { num: '03', title: 'Connect', desc: 'Find alumni in your field', icon: Handshake, color: 'from-emerald-500 to-green-400' },
  { num: '04', title: 'Grow Together', desc: 'Chat, learn & get hired', icon: Rocket, color: 'from-orange-500 to-amber-400' },
];

const roles = [
  { emoji: '🎓', title: 'Students', desc: 'Find mentors, get referrals, build network', gradient: 'from-blue-500/20 to-cyan-500/5' },
  { emoji: '👨‍💼', title: 'Alumni', desc: 'Guide students, post jobs, stay connected', gradient: 'from-purple-500/20 to-pink-500/5' },
  { emoji: '🏫', title: 'Institutions', desc: 'Manage alumni network, analytics & placements', gradient: 'from-emerald-500/20 to-green-500/5' },
  { emoji: '🛡️', title: 'Admins', desc: 'Full platform control, analytics & moderation', gradient: 'from-orange-500/20 to-red-500/5' },
];

const benefits = [
  { icon: Rocket, title: 'Career Growth', emoji: '🚀' },
  { icon: Handshake, title: 'Strong Network', emoji: '🤝' },
  { icon: MessageSquare, title: 'Easy Communication', emoji: '💬' },
  { icon: Briefcase, title: 'Real Opportunities', emoji: '💼' },
  { icon: GraduationCap, title: 'Expert Mentorship', emoji: '🎯' },
  { icon: Shield, title: 'Trusted Platform', emoji: '🔒' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'B.Tech CSE \'24', text: 'Got my dream internship at Google through an alumni connection on NexaBridge!', avatar: 'PS', rating: 5 },
  { name: 'Rahul Verma', role: 'SDE @ Microsoft', text: 'Best way to give back to my alma mater. The mentorship system is fantastic.', avatar: 'RV', rating: 5 },
  { name: 'Ananya Singh', role: 'B.Tech ECE \'25', text: 'The mentorship booking made career guidance so easy. Totally recommended!', avatar: 'AS', rating: 5 },
];

const demoTabs = [
  { label: 'Dashboard', img: previewDashboard, icon: BarChart3 },
  { label: 'Chat', img: previewChat, icon: MessageSquare },
  { label: 'Directory', img: previewDirectory, icon: Users },
];

const stats = [
  { value: '10K+', label: 'Alumni Connected', icon: Users },
  { value: '500+', label: 'Opportunities', icon: Briefcase },
  { value: '200+', label: 'Events Hosted', icon: Calendar },
  { value: '98%', label: 'Satisfaction', icon: Star },
];

/* ── Page ── */
export default function Index() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeDemo, setActiveDemo] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate('/dashboard', { replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    const t = setInterval(() => setActiveDemo(p => (p + 1) % demoTabs.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">

      {/* ━━━ NAV ━━━ */}
      <motion.nav initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-2xl bg-background/60 border-b border-border/30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.h1 whileHover={{ scale: 1.05 }} className="text-xl font-extrabold tracking-tight cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Nexa<span className="text-primary">Bridge</span>
          </motion.h1>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            {['Features', 'How It Works', 'Preview'].map(l => (
              <button key={l} onClick={() => document.getElementById(l.toLowerCase().replace(/ /g, '-'))?.scrollIntoView({ behavior: 'smooth' })}
                className="hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all hover:after:w-full">{l}</button>
            ))}
            <button onClick={() => navigate('/for-institutions')}
              className="hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all hover:after:w-full flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" /> For Institutions
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={toggleTheme}>
              <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.div>
            </Button>
            <Button variant="ghost" className="hidden sm:inline-flex font-medium" onClick={() => navigate('/auth')}>Login</Button>
            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20 font-semibold" onClick={() => navigate('/auth')}>
              Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* ━━━ HERO ━━━ */}
      <header ref={heroRef} className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <motion.div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/[0.07] blur-[120px]"
            animate={{ x: [0, 50, 0], y: [0, -40, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/[0.07] blur-[120px]"
            animate={{ x: [0, -40, 0], y: [0, 50, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-[100px]"
            animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
        </div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/30"
            style={{ top: `${20 + i * 12}%`, left: `${10 + i * 15}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}

        <motion.div style={{ y: heroY, scale: heroScale }} className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-8">
                <Sparkles className="h-4 w-4" /> The Alumni Connection Engine
              </motion.div>

              <motion.h2 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 1 }}
                className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] tracking-tight">
                Reconnect. Grow.
                <br />
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-[gradient_4s_ease_infinite] bg-clip-text text-transparent">
                  Succeed Together.
                </span>
              </motion.h2>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">
                One platform for mentorship, internships, career growth & lifelong alumni connections.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
                className="mt-10 flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate('/auth')}
                  className="h-13 px-8 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-xl shadow-primary/25 group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/auth')}
                  className="h-13 px-8 text-base font-semibold border-border/60 hover:border-primary/50 group">
                  <Play className="mr-2 h-4 w-4" /> Watch Demo
                </Button>
              </motion.div>

              {/* Trusted by */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
                className="mt-12 flex items-center gap-8">
                {stats.slice(0, 3).map(s => (
                  <div key={s.label}>
                    <p className="text-xl font-extrabold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right – Hero Image */}
            <motion.div initial={{ opacity: 0, scale: 0.7, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, duration: 1.2, type: 'spring', stiffness: 60 }}
              className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/25 to-accent/25 blur-[80px] rounded-full scale-90" />
              <motion.img src={hero3d} alt="Global alumni network" width={1024} height={800}
                className="relative z-10 w-full max-w-lg mx-auto drop-shadow-2xl"
                animate={{ y: [0, -15, 0], rotate: [0, 1, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
              {/* Floating badge */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute bottom-10 -left-4 px-4 py-2.5 rounded-xl bg-card border border-border/50 shadow-xl text-sm font-medium flex items-center gap-2 z-20">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                New connection accepted!
              </motion.div>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                className="absolute top-16 -right-4 px-4 py-2.5 rounded-xl bg-card border border-border/50 shadow-xl text-sm font-medium flex items-center gap-2 z-20">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-white" />
                </div>
                3 new job posts
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </header>

      {/* ━━━ STATS MARQUEE ━━━ */}
      <Reveal className="py-8 border-y border-border/30 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} className="text-center cursor-default group">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl font-extrabold tracking-tight">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ━━━ PROBLEM ━━━ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <Reveal>
              <span className="text-sm font-bold text-destructive/80 uppercase tracking-widest">⚠️ The Problem</span>
              <h3 className="text-3xl md:text-4xl font-extrabold mt-4 mb-8 leading-tight">Why Alumni Networks<br />Keep Failing</h3>
              <div className="space-y-4">
                {problems.map((p, i) => (
                  <Reveal key={i} delay={i * 0.1}>
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-destructive/[0.04] border border-destructive/10 hover:border-destructive/25 transition-all">
                      <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-destructive text-xs font-black">✕</span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{p}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.3} className="hidden lg:flex justify-center">
              <motion.img src={problem3d} alt="Disconnection" loading="lazy" width={800} height={640}
                className="w-full max-w-sm opacity-80"
                animate={{ rotate: [0, 2, -2, 0] }} transition={{ duration: 8, repeat: Infinity }} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ━━━ SOLUTION ━━━ */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <Reveal delay={0.2} className="hidden lg:flex justify-center order-1 lg:order-none">
              <motion.img src={solution3d} alt="NexaBridge Solution" loading="lazy" width={800} height={640}
                className="w-full max-w-md"
                animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
            </Reveal>
            <Reveal>
              <span className="text-sm font-bold text-primary uppercase tracking-widest">💡 Our Solution</span>
              <h3 className="text-3xl md:text-4xl font-extrabold mt-4 mb-8 leading-tight">NexaBridge — The Bridge<br />That Never Breaks</h3>
              <div className="space-y-4">
                {solutions.map((s, i) => (
                  <Reveal key={i} delay={i * 0.1}>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/[0.04] border border-primary/10 hover:border-primary/25 transition-all group">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <s.icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground">{s.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ━━━ FEATURES ━━━ */}
      <section id="features" className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-muted/30 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <Reveal className="text-center mb-16">
            <span className="text-sm font-bold text-primary uppercase tracking-widest">⚙️ Core Features</span>
            <h3 className="text-3xl md:text-5xl font-extrabold mt-4">Everything You Need</h3>
            <p className="text-muted-foreground mt-4 max-w-md mx-auto">Powerful, beautiful tools for students, alumni & administrators</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <motion.div whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-default h-full">
                  <motion.div whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.5 }}
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                    <f.icon className="h-6 w-6 text-white" />
                  </motion.div>
                  <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{f.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ USER ROLES ━━━ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <Reveal className="text-center mb-16">
            <span className="text-sm font-bold text-primary uppercase tracking-widest">👥 Roles</span>
            <h3 className="text-3xl md:text-5xl font-extrabold mt-4">Built for Everyone</h3>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {roles.map((r, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <motion.div whileHover={{ y: -6 }}
                  onClick={r.title === 'Institutions' ? () => navigate('/for-institutions') : undefined}
                  className={`relative p-8 rounded-3xl bg-gradient-to-br ${r.gradient} border border-border/30 text-center ${r.title === 'Institutions' ? 'cursor-pointer' : 'cursor-default'} hover:shadow-xl transition-all duration-500`}>
                  <div className="text-5xl mb-4">{r.emoji}</div>
                  <h4 className="font-bold text-xl mb-2">{r.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                  {r.title === 'Institutions' && (
                    <p className="text-xs text-primary mt-2 font-semibold flex items-center justify-center gap-1">Learn More <ArrowRight className="h-3 w-3" /></p>
                  )}
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ HOW IT WORKS ━━━ */}
      <section id="how-it-works" className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-muted/30 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <Reveal className="text-center mb-16">
            <span className="text-sm font-bold text-primary uppercase tracking-widest">🔄 Process</span>
            <h3 className="text-3xl md:text-5xl font-extrabold mt-4">4 Simple Steps</h3>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <motion.div whileHover={{ y: -6, scale: 1.02 }}
                  className="relative p-6 rounded-2xl bg-card border border-border/50 text-center hover:shadow-xl transition-all duration-500">
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r ${s.color} text-white text-xs font-bold shadow-lg`}>
                    {s.num}
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 mt-3">
                    <s.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h4 className="font-bold text-base mb-1">{s.title}</h4>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ BENEFITS STRIP ━━━ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Reveal className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-extrabold">Why NexaBridge?</h3>
          </Reveal>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {benefits.map((b, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <motion.div whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-card border border-border/50 hover:border-primary/30 transition-all cursor-default shadow-sm">
                  <span className="text-lg">{b.emoji}</span>
                  <span className="text-sm font-semibold">{b.title}</span>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ DEMO PREVIEW ━━━ */}
      <section id="preview" className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-muted/30 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <Reveal className="text-center mb-12">
            <span className="text-sm font-bold text-primary uppercase tracking-widest">🧪 Preview</span>
            <h3 className="text-3xl md:text-5xl font-extrabold mt-4">See It In Action</h3>
          </Reveal>
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-center gap-2 mb-8">
              {demoTabs.map((tab, i) => (
                <motion.button key={i} onClick={() => setActiveDemo(i)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    activeDemo === i
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-xl shadow-primary/20'
                      : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30'
                  }`}>
                  <tab.icon className="h-4 w-4" /> {tab.label}
                </motion.button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={activeDemo}
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.96 }}
                transition={{ duration: 0.5, ease }}
                className="rounded-2xl overflow-hidden border border-border/40 shadow-2xl shadow-black/10 bg-card">
                {/* Browser chrome */}
                <div className="bg-muted/50 px-4 py-2.5 border-b border-border/30 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-warning/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 mx-8">
                    <div className="bg-background/50 rounded-md px-3 py-1 text-xs text-muted-foreground text-center max-w-xs mx-auto">
                      nexabridge.app/{demoTabs[activeDemo].label.toLowerCase()}
                    </div>
                  </div>
                </div>
                <img src={demoTabs[activeDemo].img} alt={demoTabs[activeDemo].label} loading="lazy" width={1400} height={736} className="w-full" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ━━━ TESTIMONIALS ━━━ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <Reveal className="text-center mb-16">
            <span className="text-sm font-bold text-primary uppercase tracking-widest">🗣️ Testimonials</span>
            <h3 className="text-3xl md:text-5xl font-extrabold mt-4">Loved by the Community</h3>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <motion.div whileHover={{ y: -4 }}
                  className="p-7 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(t.rating)].map((_, j) => <Star key={j} className="h-4 w-4 fill-yellow-500 text-yellow-500" />)}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3 mt-5 pt-5 border-t border-border/30">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white shadow-lg">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ FOR INSTITUTIONS ━━━ */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <Reveal className="text-center mb-16">
            <span className="text-sm font-bold text-primary uppercase tracking-widest">🏫 For Institutions</span>
            <h3 className="text-3xl md:text-5xl font-extrabold mt-4">Power Your College's<br />Alumni Network</h3>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">NexaBridge gives institutions a complete platform to manage, engage, and grow their alumni community.</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-12">
            {[
              { icon: Users, title: 'User Management', desc: 'Add, manage & approve students and alumni', color: 'from-blue-600 to-cyan-500' },
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track engagement, growth & placement stats', color: 'from-purple-600 to-violet-500' },
              { icon: MessageSquare, title: 'Mass Communication', desc: 'Announcements, notifications & bulk messaging', color: 'from-emerald-600 to-green-500' },
              { icon: Briefcase, title: 'Job & Placement Board', desc: 'Approve & highlight career opportunities', color: 'from-orange-600 to-amber-500' },
              { icon: Globe, title: 'Customization', desc: 'Branded theme, logo & privacy controls', color: 'from-pink-600 to-rose-500' },
              { icon: Shield, title: 'Content Moderation', desc: 'Monitor connections & moderate content', color: 'from-indigo-600 to-blue-500' },
              { icon: DollarSign, title: 'Fundraising', desc: 'Donation campaigns & alumni giving tracking', color: 'from-teal-600 to-cyan-500' },
              { icon: Heart, title: 'Alumni Engagement', desc: 'Events, reunions & mentorship programs', color: 'from-red-600 to-pink-500' },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <motion.div whileHover={{ y: -6 }}
                  className="p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-500 h-full">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-sm mb-1">{f.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>

          <Reveal className="text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => navigate('/for-institutions')}
                className="h-13 px-8 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-xl shadow-primary/25">
                Register Your Institution <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/for-institutions')}
                className="h-13 px-8 text-base font-semibold">
                Learn More <Building2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-400" />Free to Start</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-400" />Launch in 24hrs</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-400" />100+ Institutions</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent" />
        <motion.div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-[100px]"
          animate={{ scale: [1, 1.4, 1], x: [0, 40, 0] }} transition={{ duration: 10, repeat: Infinity }} />
        <motion.div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-[80px]"
          animate={{ scale: [1.3, 1, 1.3] }} transition={{ duration: 8, repeat: Infinity }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Reveal>
            <Sparkles className="h-8 w-8 text-white/80 mx-auto mb-6" />
            <h3 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Ready to Transform Your<br />Alumni Network?
            </h3>
            <p className="mt-5 text-white/70 text-lg max-w-lg mx-auto">Join thousands of students and alumni already growing together on NexaBridge.</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Button size="lg" onClick={() => navigate('/auth')}
                className="mt-10 h-14 px-10 text-base font-bold bg-white text-primary hover:bg-white/90 shadow-2xl shadow-black/20 rounded-xl">
                Get Started — It's Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="py-16 border-t border-border/30 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-extrabold">Nexa<span className="text-primary">Bridge</span></h2>
              <p className="text-sm text-muted-foreground mt-3 max-w-sm leading-relaxed">
                Bridging the gap between students and alumni — for mentorship, career growth & lifelong connections.
              </p>
              <div className="flex items-center gap-3 mt-6">
                {['G', 'T', 'L', 'I'].map(s => (
                  <motion.div key={s} whileHover={{ scale: 1.15, y: -3 }}
                    className="h-10 w-10 rounded-xl bg-muted/60 border border-border/50 flex items-center justify-center text-sm font-bold text-muted-foreground hover:text-primary hover:border-primary/30 cursor-pointer transition-colors">
                    {s}
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-5 text-sm uppercase tracking-wider text-muted-foreground">Navigation</h4>
              <ul className="space-y-3">
                {[
                  { l: 'Login', a: () => navigate('/auth') },
                  { l: 'Sign Up', a: () => navigate('/auth') },
                  { l: 'Features', a: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
                  { l: 'For Institutions', a: () => navigate('/for-institutions') },
                ].map(item => (
                  <li key={item.l} onClick={item.a} className="text-sm text-foreground/70 hover:text-primary cursor-pointer transition-colors flex items-center gap-2">
                    <ChevronRight className="h-3 w-3 text-primary/50" /> {item.l}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-5 text-sm uppercase tracking-wider text-muted-foreground">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-foreground/70"><Mail className="h-4 w-4 text-primary/50" /> contact@nexabridge.com</li>
                <li className="flex items-center gap-3 text-sm text-foreground/70"><MapPin className="h-4 w-4 text-primary/50" /> India</li>
                <li className="flex items-center gap-3 text-sm text-foreground/70"><Phone className="h-4 w-4 text-primary/50" /> +91 XXXXX XXXXX</li>
              </ul>
            </div>
          </div>
          <div className="mt-14 pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} NexaBridge. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="hover:text-primary cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
