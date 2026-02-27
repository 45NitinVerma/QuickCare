import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Clock, Activity, Users,
  FileText, CheckCircle2, Lock, Stethoscope, Moon, Sun,
  Sparkles, Zap, Globe, Award, BarChart3,
  Microscope, ClipboardList, Star, ChevronRight, Play,
  Menu, X, HeartPulse
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { motion, useInView, AnimatePresence } from 'framer-motion';

/* ─── Animated counter ─── */
function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return { count, ref };
}

function AnimatedStat({ value, suffix = '', label, index }) {
  const { count, ref } = useCountUp(value, 1400);
  return (
    <motion.div ref={ref} className="text-center px-4"
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: index * 0.12, duration: 0.5 }}>
      <div className="text-4xl lg:text-5xl font-black mb-2" style={{ color: 'var(--primary)' }}>
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    </motion.div>
  );
}

/* ─── Data ─── */
const features = [
  { icon: Sparkles, title: 'AI-Powered Diagnostics', body: 'Instant AI analysis of lab reports with flagged biomarkers and clinician-ready summaries in seconds.', accent: '#6366F1' },
  { icon: ShieldCheck, title: 'Granular Consent Control', body: 'Patients control exactly who sees their data with audit trails, role-based access, and HIPAA compliance.', accent: '#10B981' },
  { icon: Clock, title: 'Real-Time Queue Updates', body: 'Doctor queues update dynamically. Patients get push notifications when appointments are confirmed.', accent: '#3B82F6' },
  { icon: Users, title: 'Multi-Role Collaboration', body: 'Seamless coordination between patients, doctors, lab staff, and administrators in one unified platform.', accent: '#8B5CF6' },
  { icon: BarChart3, title: 'Health Risk Prediction', body: 'Predictive AI scoring surfaces high-risk patients before critical events — enabling proactive care decisions.', accent: '#EF4444' },
  { icon: FileText, title: 'Unified Digital Records', body: 'Complete patient histories: appointments, prescriptions, admissions, lab results — all in a single view.', accent: '#F59E0B' },
];

const roles = [
  {
    icon: HeartPulse, label: 'Patient', accent: '#3B82F6',
    desc: 'Book appointments, view lab reports, manage consents, and track your health journey.',
    perks: ['AI report summaries', 'E-consent management', 'Real-time appointment status'],
    path: '/login',
  },
  {
    icon: Stethoscope, label: 'Doctor', accent: '#10B981',
    desc: 'Manage patient queues, review AI-flagged reports, issue prescriptions digitally.',
    perks: ['Live patient queue', 'AI risk scoring', 'Digital prescriptions'],
    path: '/login',
  },
  {
    icon: Microscope, label: 'Lab', accent: '#8B5CF6',
    desc: 'Upload test results instantly, trigger AI analysis, and notify doctors automatically.',
    perks: ['Drag & drop uploads', 'Instant AI flagging', 'Automated notifications'],
    path: '/login',
  },
  {
    icon: ClipboardList, label: 'Admin', accent: '#F59E0B',
    desc: 'Manage staff, configure time slots, and monitor hospital-wide analytics dashboards.',
    perks: ['Staff management', 'Slot configuration', 'Analytics dashboard'],
    path: '/login',
  },
];

const steps = [
  { num: '01', title: 'Register your hospital', body: 'Admins onboard the facility in minutes — configure departments, time slots, and staff roles.' },
  { num: '02', title: 'Add your team', body: 'Doctors, nurses, and lab staff receive secure invite links and complete digital onboarding instantly.' },
  { num: '03', title: 'Patients connect', body: 'Patients register, book appointments, and share consent — all from a clean, accessible interface.' },
  { num: '04', title: 'AI drives insights', body: 'Every lab report is immediately analyzed. Doctors receive risk scores and one-line summaries.' },
];

const testimonials = [
  { name: 'Dr. Priya Mehta', role: 'Cardiologist, Apollo Hospitals', avatar: 'PM', accent: '#10B981', quote: 'The AI flagging on lab reports has saved critical time. I catch high-risk patients hours earlier than before.' },
  { name: 'Aryan Kapoor', role: 'Patient, Mumbai', avatar: 'AK', accent: '#3B82F6', quote: 'Booking appointments and reading my reports used to take days. Now it takes minutes. Truly life-changing.' },
  { name: 'Sneha Joshi', role: 'Lab Technician, Fortis Healthcare', avatar: 'SJ', accent: '#8B5CF6', quote: 'Zero paper, zero manual calls. I upload a result and the doctor is notified automatically. Incredible.' },
];

const trustPoints = [
  { icon: ShieldCheck, label: 'End-to-End Encrypted' },
  { icon: Globe, label: 'Globally Accessible' },
  { icon: Award, label: 'ISO 27001 Certified' },
  { icon: Zap, label: '99.99% Uptime SLA' },
  { icon: Stethoscope, label: 'Clinically Validated' },
];

/* ─── Main Component ─── */
export function LandingPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>

      {/* ═══ NAVBAR ═══ */}
      <header
        className="h-16 flex items-center justify-between px-6 lg:px-16 sticky top-0 z-50 glass"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/logo.jpeg" alt="QuickCare" className="w-8 h-8 rounded-xl object-cover" />
          <span className="text-lg font-extrabold tracking-tight">
            Quick<span style={{ color: 'var(--primary)' }}>Care</span>
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {[['#features', 'Features'], ['#how', 'How it Works'], ['#roles', 'Roles'], ['#trust', 'Security']].map(([href, label]) => (
            <a key={label} href={href} className="hover:text-[var(--primary)] transition-colors duration-200">{label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl transition-all hover:bg-[var(--bg-secondary)] active:scale-95"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Button variant="outline" className="hidden sm:inline-flex" onClick={() => navigate('/login')}>Sign In</Button>
          <Button onClick={() => navigate('/login')} className="gap-1.5">
            Get Started <ArrowRight size={15} />
          </Button>
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 pt-16 md:hidden"
            style={{ backgroundColor: 'var(--bg)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <nav className="flex flex-col p-6 gap-4 text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
              {[['#features', 'Features'], ['#how', 'How it Works'], ['#roles', 'Roles'], ['#trust', 'Security']].map(([href, label]) => (
                <a key={label} href={href} onClick={() => setMobileMenuOpen(false)}
                  className="py-3 border-b hover:text-[var(--primary)] transition-colors"
                  style={{ borderColor: 'var(--border)' }}>{label}</a>
              ))}
              <Button className="mt-4 w-full" onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>
                Get Started <ArrowRight size={16} />
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">

        {/* ═══ HERO ═══ */}
        <section className="hero-gradient relative overflow-hidden px-6 lg:px-16 pt-24 pb-28 lg:pt-32 lg:pb-36">
          {/* Blobs */}
          <div className="absolute -top-40 -right-28 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%)', animation: 'blobFloat 12s ease-in-out infinite' }} />
          <div className="absolute -bottom-20 -left-20 w-[480px] h-[480px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)', animation: 'blobFloat 16s ease-in-out infinite reverse' }} />

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <div className="space-y-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-semibold border"
                style={{ background: 'var(--primary-muted)', color: 'var(--primary)', borderColor: 'rgba(37,99,235,0.25)' }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75" style={{ background: 'var(--primary)' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--primary)' }} />
                </span>
                Next-Generation Healthcare
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl lg:text-[68px] font-black leading-[1.04] tracking-tight"
              >
                Healthcare that<br />
                <span className="relative inline-block">
                  <span style={{ color: 'var(--primary)' }}>revolves </span>
                  <motion.svg viewBox="0 0 280 12" className="absolute -bottom-1 left-0 w-full" aria-hidden="true"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 0.7 }}>
                    <motion.path d="M4 8 Q70 2 140 8 Q210 14 276 8" stroke="var(--primary)" strokeWidth="3" fill="none" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 0.8 }} />
                  </motion.svg>
                </span>
                {' '}around you.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}
              >
                A unified platform where patients, doctors, labs, and administrators connect seamlessly. Powered by AI, secured by design, built for modern care.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
              >
                <Button size="lg" onClick={() => navigate('/login')} className="gap-2 animate-pulse-glow">
                  Enter Dashboard <ArrowRight size={18} />
                </Button>
                <button
                  className="inline-flex items-center justify-center gap-2.5 text-sm font-semibold px-5 py-3 rounded-xl transition-all hover:bg-[var(--bg-secondary)] active:scale-[0.97]"
                  style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Play size={14} className="fill-current" /> See it in action
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1"
              >
                {['ABHA Coming Soon', 'End-to-End Encrypted', 'Secure Storage'].map(label => (
                  <div key={label} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={14} style={{ color: 'var(--accent)' }} /> {label}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden border shadow-[0_32px_80px_rgba(0,0,0,0.18)]"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="flex-1 mx-4 h-6 rounded-lg text-xs px-3 flex items-center" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>
                    🔒 quickcare.health/dashboard
                  </div>
                </div>

                {/* Dashboard body */}
                <div className="p-5 space-y-4">
                  {/* Top stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Today\'s Queue', val: '7', color: '#3B82F6', top: 'border-blue-500' },
                      { label: 'Reports', val: '3', color: '#8B5CF6', top: 'border-violet-500' },
                      { label: 'Prescriptions', val: '12', color: '#10B981', top: 'border-emerald-500' },
                    ].map((c, i) => (
                      <div key={i} className={`rounded-xl p-4 border-t-4 ${c.top} space-y-2`} style={{ background: 'var(--bg-secondary)' }}>
                        <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{c.label}</div>
                        <div className="text-2xl font-black" style={{ color: c.color }}>{c.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Patient list */}
                  <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Patient Queue</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>Live</span>
                    </div>
                    {[
                      { initials: 'RK', name: 'Rahul Kumar', tag: 'Cardiology', color: '#3B82F6', badge: '🔴 High Risk' },
                      { initials: 'AM', name: 'Anita Mehta', tag: 'Pathology', color: '#10B981', badge: '🟡 Pending' },
                      { initials: 'SP', name: 'Suresh Patel', tag: 'General', color: '#8B5CF6', badge: '🟢 Ready' },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: p.color }}>
                          {p.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.tag}</p>
                        </div>
                        <span className="text-[10px] font-semibold whitespace-nowrap">{p.badge}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI bar */}
                  <div className="rounded-xl p-3 flex items-center gap-3"
                    style={{ background: 'var(--primary-muted)', border: '1px solid rgba(37,99,235,0.2)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'var(--primary)' }}>
                      <Sparkles size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>AI: 2 reports need urgent review</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Elevated troponin in Patient RK</p>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--primary)' }} />
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                className="absolute -bottom-5 -left-6 rounded-2xl p-4 shadow-[0_16px_48px_rgba(0,0,0,0.16)] border flex items-center gap-3"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Sparkles size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>AI Analysis Complete</p>
                  <p className="text-[11px]" style={{ color: 'var(--accent)' }}>3 reports flagged • 2s ago</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute -top-4 -right-4 rounded-2xl p-3 shadow-[0_16px_48px_rgba(0,0,0,0.14)] border flex items-center gap-2"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                animate={{ y: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-muted)' }}>
                  <Activity size={14} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>98% Uptime</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>All systems normal</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ═══ STATS STRIP ═══ */}
        <section id="stats" className="py-16 border-y"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x"
            style={{ '--tw-divide-opacity': 1 }}>
            <AnimatedStat value={12500} suffix="+" label="Active Patients" index={0} />
            <AnimatedStat value={98} suffix="%" label="Satisfaction Rate" index={1} />
            <AnimatedStat value={340} suffix="+" label="Specialist Doctors" index={2} />
            <AnimatedStat value={50000} suffix="+" label="Reports Processed" index={3} />
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section id="features" className="py-24 lg:py-32 px-6 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: 'var(--primary)' }}>
                Platform Features
              </span>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
                Built for every role in care
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                From AI diagnostics to consent control, QuickCare delivers a complete operating system for modern healthcare teams.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div key={f.title}
                  initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.45 }}
                >
                  <div className="rounded-2xl p-6 h-full border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] group cursor-default"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="w-12 h-12 rounded-xl mb-5 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: `${f.accent}18` }}>
                      <f.icon className="w-6 h-6" style={{ color: f.accent }} />
                    </div>
                    <h3 className="text-base font-bold mb-2 group-hover:text-[var(--primary)] transition-colors duration-200"
                      style={{ color: 'var(--text-primary)' }}>
                      {f.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {f.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="how" className="py-24 lg:py-32 px-6 lg:px-16 border-t"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <div className="max-w-5xl mx-auto">
            <motion.div className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: 'var(--primary)' }}>
                Getting Started
              </span>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
                Up and running in hours
              </h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                No complex setup. No long training. Just a smooth onboarding flow your entire team will love.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6">
              {steps.map((s, i) => (
                <motion.div key={s.num}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                >
                  <div className="rounded-2xl p-6 border h-full flex gap-5 hover:shadow-[var(--shadow-md)] transition-all duration-300"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="text-4xl font-black shrink-0 select-none leading-none"
                      style={{ color: 'var(--primary)', opacity: 0.15 }}>
                      {s.num}
                    </div>
                    <div>
                      <h3 className="font-bold text-base mb-1.5" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.body}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ ROLE CARDS ═══ */}
        <section id="roles" className="py-24 lg:py-32 px-6 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: 'var(--primary)' }}>
                For Every Stakeholder
              </span>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
                One platform, four roles
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                QuickCare adapts its entire interface to who's using it — patients, doctors, lab staff, or administrators.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {roles.map((r, i) => (
                <motion.div key={r.label}
                  initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                >
                  <div
                    className="rounded-2xl p-6 h-full border flex flex-col gap-4 group cursor-pointer hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)]"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                    onClick={() => navigate(r.path)}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: `${r.accent}18` }}>
                      <r.icon size={24} style={{ color: r.accent }} />
                    </div>
                    <div>
                      <p className="font-black text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{r.label}</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{r.desc}</p>
                    </div>
                    <ul className="space-y-1.5 mt-auto pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                      {r.perks.map(p => (
                        <li key={p} className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                          <CheckCircle2 size={13} style={{ color: r.accent, flexShrink: 0 }} /> {p}
                        </li>
                      ))}
                    </ul>
                    <button
                      className="w-full mt-2 py-2 text-sm font-semibold rounded-xl transition-all"
                      style={{ background: `${r.accent}18`, color: r.accent }}
                    >
                      Sign in as {r.label} →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section className="py-24 lg:py-28 px-6 lg:px-16 border-t"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-14"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: 'var(--primary)' }}>Testimonials</span>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Loved by teams across India
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div key={t.name}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                >
                  <div className="rounded-2xl p-6 h-full border flex flex-col gap-5 hover:shadow-[var(--shadow-md)] transition-all duration-300"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-sm leading-relaxed flex-1 italic" style={{ color: 'var(--text-secondary)' }}>
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: t.accent }}>
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ TRUST BADGES ═══ */}
        <section id="trust" className="py-16 lg:py-20 border-t"
          style={{ borderColor: 'var(--border)' }}>
          <div className="max-w-6xl mx-auto px-6">
            <motion.p className="text-center text-xs font-bold uppercase tracking-widest mb-10"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              style={{ color: 'var(--text-muted)' }}>
              Enterprise-grade security &amp; compliance
            </motion.p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {trustPoints.map((t, i) => (
                <motion.div key={t.label}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border text-center transition-all hover:shadow-[var(--shadow-sm)] hover:-translate-y-1"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary-muted)' }}>
                    <t.icon size={18} style={{ color: 'var(--primary)' }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{t.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="py-28 lg:py-36 px-6 text-center relative overflow-hidden hero-gradient border-t"
          style={{ borderColor: 'var(--border)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(37,99,235,0.1) 0%, transparent 70%)' }} />
          <motion.div className="max-w-3xl mx-auto relative z-10"
            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6" style={{ color: 'var(--text-primary)' }}>
              Ready to transform your<br />healthcare operations?
            </h2>
            <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of healthcare professionals using QuickCare to deliver better care, faster — starting today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/login')} className="gap-2 animate-pulse-glow px-8">
                Start Now — It's Free <ArrowRight size={18} />
              </Button>
              <button
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl transition-all hover:bg-[var(--bg-secondary)]"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Learn More
              </button>
            </div>
          </motion.div>
        </section>

      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-10 px-6 lg:px-16 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-center gap-2.5">
              <img src="/logo.jpeg" alt="QuickCare" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-extrabold text-base">Quick<span style={{ color: 'var(--primary)' }}>Care</span></span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-12 gap-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {['Features', 'Security', 'Pricing', 'Blog'].map(l => (
                <a key={l} href="#" className="hover:text-[var(--primary)] transition-colors py-0.5">{l}</a>
              ))}
              {['Privacy', 'Terms', 'Contact'].map(l => (
                <a key={l} href="#" className="hover:text-[var(--primary)] transition-colors py-0.5">{l}</a>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t"
            style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              © 2026 QuickCare Health Systems. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Designed with ❤️ for better healthcare
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
