import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TestTube, FileUp, Sparkles, Activity, ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const statCards = [
  { label: 'Samples to Collect', value: '12', icon: TestTube,  accent: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  thick: '#3B82F6' },
  { label: 'Tests Processed',     value: '45', icon: Activity,  accent: '#10B981', bg: 'rgba(16,185,129,0.12)', thick: '#10B981' },
  { label: 'AI Summaries Done',   value: '38', icon: Sparkles,  accent: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', thick: '#8B5CF6' },
];

export function LabDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--border)' }}
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Lab Personnel Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Manage sample collections and upload generated health reports.
          </p>
        </div>
        <Button onClick={() => navigate('/lab/upload')} className="gap-2 shrink-0">
          <FileUp size={17} /> Upload New Report
        </Button>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {statCards.map(({ label, value, icon: Icon, accent, bg, thick }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="overflow-hidden hover:shadow-[var(--shadow-md)] transition-shadow" style={{ borderTop: `3px solid ${thick}` }}>
              <CardContent className="p-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: bg, color: accent }}>
                  <Icon size={22} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <h3 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</h3>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Uploads + CTA */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
              <FileText size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No uploads yet. Use the button above to upload a new report.</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Import CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-8 border flex flex-col justify-center items-center text-center"
          style={{
            background: 'linear-gradient(135deg, var(--primary-muted) 0%, var(--card) 100%)',
            borderColor: 'rgba(96,165,250,0.2)',
          }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-[var(--shadow-glow-primary)]"
            style={{ background: 'var(--primary)', color: 'white' }}>
            <FileUp size={28} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Automated Report Import</h2>
          <p className="text-sm max-w-xs mb-6" style={{ color: 'var(--text-secondary)' }}>
            Our AI engine reads incoming PDF labs and structures them for doctors before human verification.
          </p>
          <Button onClick={() => navigate('/lab/upload')} className="gap-2">
            Scan & Upload Form <ArrowRight size={15} />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
