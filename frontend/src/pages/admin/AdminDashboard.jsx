import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Users, Building, Activity, ShieldCheck, Stethoscope, Briefcase,
  Bell, Info, AlertCircle, Users2, TestTube, ArrowRight, Loader2,
} from 'lucide-react';
import { clinicApi } from '../../services/api';
import { motion } from 'framer-motion';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = useCallback(async () => {
    try {
      const { data: clinics } = await clinicApi.myClinics();
      if (clinics?.length) {
        const { data } = await clinicApi.members(clinics[0].id, {});
        setMembers(Array.isArray(data) ? data : (data.results || []));
      }
    } catch {
      // fail silently — counts will just show 0
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const doctors  = members.filter(m => m.member_role === 'doctor');
  const labStaff = members.filter(m => m.member_role === 'lab_member');
  const totalStaff = members.length;

  const statCards = [
    { label: 'Total Staff',     value: loading ? '…' : totalStaff,         icon: Stethoscope, thick: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  accent: '#3B82F6' },
    { label: 'Doctors',         value: loading ? '…' : doctors.length,      icon: Users,       thick: '#10B981', bg: 'rgba(16,185,129,0.12)',  accent: '#10B981' },
    { label: 'Lab Personnel',   value: loading ? '…' : labStaff.length,     icon: TestTube,    thick: '#8B5CF6', bg: 'rgba(139,92,246,0.12)',  accent: '#8B5CF6' },
    { label: 'System Health',   value: '100%',                               icon: ShieldCheck, thick: '#10B981', bg: 'rgba(16,185,129,0.12)',  accent: '#10B981' },
  ];

  const alerts = [
    {
      label: 'System Update',
      body: 'The platform has been updated with new AI Summary integrations for lab reports.',
      icon: Info,
      bg: 'var(--info-light)',
      accentColor: 'var(--info)',
    },
    {
      label: 'Action Required',
      body: 'New patient admission documents may need manual verification.',
      icon: AlertCircle,
      bg: 'var(--warning-light)',
      accentColor: 'var(--warning)',
      action: 'Review Now',
    },
  ];

  // Recent doctors (top 5)
  const recentDoctors = doctors.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--border)' }}
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Hospital Administration</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Platform management, staff directories, and global settings.</p>
        </div>
        <Button onClick={() => navigate('/admin/analytics')} variant="secondary" className="gap-2 shrink-0">
          <Activity size={16} style={{ color: 'var(--primary)' }} /> View Analytics
        </Button>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, accent, bg, thick }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="hover:shadow-[var(--shadow-md)] transition-shadow" style={{ borderLeft: `3px solid ${thick}` }}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-xl shrink-0" style={{ background: bg, color: accent }}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium leading-tight mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <h3 className="text-xl font-black flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    {loading && label !== 'System Health' ? <Loader2 size={16} className="animate-spin" /> : value}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Manage Staff',   sub: 'Doctors & Lab Personnel',    icon: Users2,      path: '/admin/staff',     accent: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'View Analytics', sub: 'Reports & Insights',         icon: Activity,    path: '/admin/analytics', accent: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'My Profile',     sub: 'Hospital & Account Info',    icon: ShieldCheck, path: '/admin/profile',   accent: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
        ].map(({ label, sub, icon: Icon, path, accent, bg }) => (
          <motion.button key={label} onClick={() => navigate(path)} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4 p-4 rounded-2xl border text-left transition-all hover:shadow-[var(--shadow-md)] w-full"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="p-3 rounded-xl shrink-0" style={{ background: bg, color: accent }}><Icon size={20} /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{label}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
          </motion.button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Staff Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase size={18} style={{ color: 'var(--text-muted)' }} /> Staff Directory
                </CardTitle>
                <Button size="sm" onClick={() => navigate('/admin/staff')}>Manage Staff</Button>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-10" style={{ color: 'var(--text-muted)' }}>
                  <Loader2 size={18} className="animate-spin" /> Loading…
                </div>
              ) : recentDoctors.length === 0 ? (
                <div className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No staff yet. <button onClick={() => navigate('/admin/staff')} className="underline" style={{ color: 'var(--primary)' }}>Add doctors</button> from the staff page.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Name', 'Department', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest"
                          style={{ color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentDoctors.map((d, i) => (
                      <motion.tr key={d.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.04 }}
                        className="transition-colors hover:bg-[var(--bg-secondary)]"
                        style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                              style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                              {(d.user?.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{d.user?.name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{d.department || '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: d.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                              color: d.status === 'active' ? 'var(--success)' : 'var(--danger)',
                            }}>
                            {d.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>

        {/* Alerts sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={17} style={{ color: 'var(--text-muted)' }} /> Admin Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map(({ label, body, icon: Icon, bg, accentColor, action }) => (
                <div key={label} className="p-4 rounded-xl border"
                  style={{ background: bg, borderColor: `${accentColor}33` }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon size={13} style={{ color: accentColor }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>{label}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{body}</p>
                  {action && (
                    <button className="mt-3 w-full h-8 text-xs font-semibold rounded-lg border transition-colors"
                      style={{ borderColor: `${accentColor}44`, color: accentColor, background: 'transparent' }}>
                      {action}
                    </button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
