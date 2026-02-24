import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse, ArrowRight, ShieldCheck, Clock, Activity, Users,
  FileText, CheckCircle2, TrendingUp, Lock, Stethoscope, Moon, Sun,
  Sparkles, Zap, Globe, Award
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { motion, useInView } from 'framer-motion';

// Animated stat counter hook
function useCountUp(target, duration = 1500) {
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
  const { count, ref } = useCountUp(value, 1200);
  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
    >
      <div className="text-4xl lg:text-5xl font-black mb-2" style={{ color: 'var(--primary)' }}>
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    </motion.div>
  );
}

const features = [
  { icon: Sparkles, title: 'AI-Powered Diagnostics', body: 'Instant AI analysis of lab reports with flagged biomarkers and clinician-ready summaries.', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { icon: ShieldCheck, title: 'Security & Consent', body: 'Patients control exactly who accesses their data, with granular consent management and full audit trails.', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { icon: Clock, title: 'Real-Time Queues', body: 'Doctor queues update dynamically. Patients get notified instantly when their appointment is confirmed.', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { icon: Users, title: 'Multi-Role Collaboration', body: 'Seamless care coordination between patients, doctors, lab personnel, and administrators.', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  { icon: Activity, title: 'Health Risk Prediction', body: 'Predictive AI scoring surfaces high-risk patients before critical events, enabling proactive care.', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  { icon: FileText, title: 'Digital Records', body: 'Unified patient histories spanning appointments, prescriptions, admissions, and lab results.', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
];

const trustPoints = [
  { icon: Lock, label: 'HIPAA Compliant' },
  { icon: ShieldCheck, label: 'End-to-End Encrypted' },
  { icon: Globe, label: 'Globally Accessible' },
  { icon: Award, label: 'ISO 27001 Certified' },
  { icon: Zap, label: '99.99% Uptime SLA' },
  { icon: Stethoscope, label: 'Clinically Validated' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* ====== NAVBAR ====== */}
      <header className="h-18 border-b flex items-center justify-between px-6 lg:px-16 glass sticky top-0 z-50"
        style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-[var(--shadow-glow-primary)]"
            style={{ background: 'var(--primary)' }}>
            <HeartPulse className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Quick<span style={{ color: 'var(--primary)' }}>Care</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {[['#features', 'Features'], ['#stats', 'Impact'], ['#trust', 'Security']].map(([href, label]) => (
            <a key={label} href={href} className="hover:text-[var(--primary)] transition-colors duration-200">{label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2.5 rounded-xl transition-all hover:bg-[var(--bg-secondary)] active:scale-95" style={{ color: 'var(--text-muted)' }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate('/login')}>Sign in</Button>
          <Button onClick={() => navigate('/login')} className="gap-2">Get Started <ArrowRight size={15} /></Button>
        </div>
      </header>

      <main className="flex-1">
        {/* ====== HERO ====== */}
        <section className="hero-gradient relative overflow-hidden px-6 lg:px-16 py-24 lg:py-32">
          {/* Animated blobs */}
          <div className="absolute -top-48 -right-32 w-[700px] h-[700px] rounded-full opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', animation: 'blobFloat 10s ease-in-out infinite' }} />
          <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)', animation: 'blobFloat 14s ease-in-out infinite reverse' }} />

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="space-y-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border"
                style={{ background: 'var(--primary-muted)', color: 'var(--primary)', borderColor: 'rgba(37,99,235,0.2)' }}
              >
                <span className="flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75" style={{ background: 'var(--primary)' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--primary)' }} />
                </span>
                Next-Generation Healthcare Platform
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
                className="text-5xl lg:text-[64px] font-black leading-[1.05] tracking-tight"
              >
                Healthcare that{' '}
                <br />
                <span style={{ color: 'var(--primary)' }}>revolves </span>
                around you.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg leading-relaxed max-w-lg"
                style={{ color: 'var(--text-secondary)' }}
              >
                A unified platform where patients, doctors, labs, and administrators connect seamlessly. Secure, intelligent, and designed for modern care.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <Button size="lg" onClick={() => navigate('/login')} className="w-full sm:w-auto gap-2 animate-pulse-glow">
                  Enter Dashboard <ArrowRight size={18} />
                </Button>
                <Button size="lg" variant="secondary" className="w-full sm:w-auto" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                  Explore Features
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2"
              >
                {['HIPAA Compliant', 'End-to-End Encrypted', 'SOC 2 Type II'].map(label => (
                  <div key={label} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={15} style={{ color: 'var(--accent)' }} /> {label}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Visual Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl shadow-[var(--shadow-xl)] overflow-hidden border"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                {/* Fake browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="flex-1 mx-4 h-6 rounded-lg text-xs px-3 flex items-center" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>
                    🔒 quickcare.health/dashboard
                  </div>
                </div>
                {/* Fake dashboard content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="h-5 w-40 rounded-lg shimmer mb-2" />
                      <div className="h-3.5 w-28 rounded-lg shimmer" />
                    </div>
                    <div className="h-9 w-32 rounded-xl" style={{ background: 'var(--primary)', opacity: 0.9 }} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[['border-blue-500', '#3B82F6'], ['border-violet-500', '#8B5CF6'], ['border-emerald-500', '#10B981']].map(([border, color], i) => (
                      <div key={i} className={`rounded-xl p-4 border-t-4 ${border}`} style={{ background: 'var(--bg-secondary)' }}>
                        <div className="w-8 h-8 rounded-lg mb-3 shimmer" />
                        <div className="h-3 w-3/4 rounded shimmer mb-2" />
                        <div className="text-2xl font-black" style={{ color }}>{[7, 3, 12][i]}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                    <div className="h-3.5 w-32 rounded shimmer mb-4" />
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                        <div className="w-8 h-8 rounded-full shrink-0 shimmer" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 rounded shimmer w-3/5" />
                          <div className="h-2.5 rounded shimmer w-2/5" />
                        </div>
                        <div className="h-5 w-16 rounded-full shimmer" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <motion.div
                className="absolute -bottom-4 -left-6 rounded-2xl p-4 shadow-[var(--shadow-xl)] border flex items-center gap-3"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Sparkles size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>AI Analysis Complete</p>
                  <p className="text-[11px]" style={{ color: 'var(--accent)' }}>3 reports flagged for review</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ====== STATS ====== */}
        <section id="stats" className="py-16 lg:py-20 border-y" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
            <AnimatedStat value={12500} suffix="+" label="Active Patients" index={0} />
            <AnimatedStat value={98} suffix="%" label="Satisfaction Rate" index={1} />
            <AnimatedStat value={340} suffix="+" label="Specialist Doctors" index={2} />
            <AnimatedStat value={50000} suffix="+" label="Reports Processed" index={3} />
          </div>
        </section>

        {/* ====== FEATURES ====== */}
        <section id="features" className="py-20 lg:py-28 px-6 lg:px-16 max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <span className="text-sm font-semibold uppercase tracking-widest mb-4 block" style={{ color: 'var(--primary)' }}>Platform Features</span>
            <h2 className="text-4xl font-black tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>Built for every role in care</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              From AI diagnostics to consent control, QuickCare delivers a complete toolset for modern healthcare teams.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.45 }}
              >
                <div className="rounded-2xl p-6 h-full border transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:border-[var(--primary)] group cursor-default"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110`}>
                    <f.icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="text-base font-bold mb-2 group-hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ====== TRUST ====== */}
        <section id="trust" className="py-16 lg:py-20 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <div className="max-w-6xl mx-auto px-6">
            <motion.p className="text-center text-sm font-semibold uppercase tracking-widest mb-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ color: 'var(--text-muted)' }}>
              Built for enterprise-grade security and compliance
            </motion.p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {trustPoints.map((t, i) => (
                <motion.div
                  key={t.label}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border text-center transition-all hover:shadow-[var(--shadow-sm)] hover:border-[var(--primary)]"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
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

        {/* ====== CTA ====== */}
        <section className="py-24 lg:py-32 px-6 text-center hero-gradient relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(37,99,235,0.1) 0%, transparent 70%)' }} />
          <motion.div
            className="max-w-3xl mx-auto relative z-10"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6" style={{ color: 'var(--text-primary)' }}>
              Ready to transform your<br />healthcare operations?
            </h2>
            <p className="text-lg mb-10" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of healthcare professionals using QuickCare to deliver better care, faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/login')} className="gap-2 animate-pulse-glow px-8">
                Start Now — It's Free <ArrowRight size={18} />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => window.scrollTo(0, 0)}>
                Learn More
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ====== FOOTER ====== */}
      <footer className="py-8 px-6 lg:px-16 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <HeartPulse className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-sm">Quick<span style={{ color: 'var(--primary)' }}>Care</span></span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2026 QuickCare Health Systems. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs" style={{ color: 'var(--text-muted)' }}>
            {['Privacy', 'Terms', 'Security', 'HIPAA'].map(link => (
              <a key={link} href="#" className="hover:text-[var(--primary)] transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
