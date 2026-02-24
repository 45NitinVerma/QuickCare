import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, TrendingUp, DownloadCloud } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const appointmentData = [
  { name: 'Mon', appointments: 40 },
  { name: 'Tue', appointments: 30 },
  { name: 'Wed', appointments: 45 },
  { name: 'Thu', appointments: 50 },
  { name: 'Fri', appointments: 35 },
  { name: 'Sat', appointments: 20 },
  { name: 'Sun', appointments: 15 },
];

const deptData = [
  { name: 'Cardiology',   value: 400 },
  { name: 'Neurology',    value: 300 },
  { name: 'Pediatrics',   value: 300 },
  { name: 'Orthopedics',  value: 200 },
];

const COLORS = ['#60A5FA', '#4ADE80', '#A78BFA', '#FCD34D'];

const kpiCards = [
  { label: 'Lab Reports Processed', value: '1,452', delta: '+18%' },
  { label: 'Avg Diagnosis Time',    value: '6.2 min', delta: '-32%' },
  { label: 'AI Accuracy Score',     value: '97.4%',   delta: '+2.1%' },
  { label: 'Active Physicians',     value: '24',       delta: '+3' },
];

export function AnalyticsViewer() {
  const { isDark } = useTheme();

  const tickColor = isDark ? '#94A3B8' : '#6B7280';
  const gridColor = isDark ? '#1E3050' : '#E5E7EB';
  const tooltipStyle = {
    borderRadius: '12px',
    border: `1px solid ${isDark ? '#1E3050' : '#E5E7EB'}`,
    background: isDark ? '#1A2235' : '#FFFFFF',
    color: isDark ? '#F1F5F9' : '#111827',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
  };
  const cursorColor = isDark ? 'rgba(96,165,250,0.08)' : 'rgba(0,0,0,0.04)';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--border)' }}
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Activity size={22} style={{ color: 'var(--primary)' }} /> KPI & Analytics Center
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Review operational benchmarks and AI adoption metrics.</p>
        </div>
        <Button variant="secondary" className="gap-2 shrink-0">
          <DownloadCloud size={16} /> Export CSV
        </Button>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, delta }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="hover:shadow-[var(--shadow-md)] transition-shadow">
              <CardContent className="p-4">
                <p className="text-xs font-medium mb-2 leading-tight" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <div className="flex items-end justify-between gap-2">
                  <h3 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</h3>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--success-light)', color: 'var(--accent)' }}>{delta}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Weekly Appointments</CardTitle>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Total patient visits past 7 days</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1"
                  style={{ background: 'var(--success-light)', color: 'var(--accent)' }}>
                  <TrendingUp size={12} /> +12%
                </span>
              </div>
            </CardHeader>
            <CardContent className="h-[260px] pb-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 12 }} />
                  <Tooltip cursor={{ fill: cursorColor }} contentStyle={tooltipStyle} />
                  <Bar dataKey="appointments" fill="#60A5FA" radius={[6, 6, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <Card>
            <CardHeader>
              <CardTitle>Department Load Distribution</CardTitle>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Patient volume by clinical department</p>
            </CardHeader>
            <CardContent className="h-[260px] pb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%" cy="45%"
                    innerRadius={65} outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {deptData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    iconType="circle"
                    verticalAlign="bottom"
                    formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Impact Banner */}
      <motion.div
        className="rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #4338CA 100%)' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
      >
        {/* decorative blobs */}
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.07)', filter: 'blur(40px)' }} />
        <div className="absolute -bottom-12 left-20 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.05)', filter: 'blur(30px)' }} />

        <div className="relative z-10 w-full md:w-2/3">
          <h3 className="text-2xl font-bold mb-2">Automated Report AI Impact</h3>
          <p className="text-blue-100 text-sm max-w-xl leading-relaxed">
            Since integrating document summarizations, the QuickCare AI has successfully processed{' '}
            <strong className="text-white">1,452 lab reports</strong>. Clinical staff reports a{' '}
            <strong className="text-white">32% reduction</strong> in initial diagnostic review time.
          </p>
        </div>
        <div className="relative z-10 flex gap-4 shrink-0">
          {[['32%', 'Time Saved'], ['10k+', 'Scans Done']].map(([val, label]) => (
            <div key={label} className="px-5 py-4 rounded-xl text-center"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span className="text-3xl font-black block mb-1">{val}</span>
              <span className="text-[11px] text-blue-200 uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
