import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Users, Building, Activity, ShieldCheck, Stethoscope, Briefcase,
  Bell, Info, AlertCircle, Users2, TestTube, ArrowRight, Loader2,
  TrendingUp, CalendarDays, ChevronRight, CheckCircle2, UserCircle2,
} from 'lucide-react';
import { clinicApi, appointmentApi } from '../../services/api';
import { motion } from 'framer-motion';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [members, setMembers]         = useState([]);
  const [clinic, setClinic]           = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]         = useState(true);

  const loadData = useCallback(async () => {
    try {
      const { data: clinics } = await clinicApi.myClinics();
      if (clinics?.length) {
        setClinic(clinics[0]);
        const [membRes, dashRes] = await Promise.allSettled([
          clinicApi.members(clinics[0].id, {}),
          clinicApi.dashboard(clinics[0].id, {}),
        ]);
        if (membRes.status === 'fulfilled') {
          const d = membRes.value.data;
          setMembers(Array.isArray(d) ? d : (d.results || []));
        }
        if (dashRes.status === 'fulfilled') {
          const d = dashRes.value.data;
          setDashboardData(d);
          setAppointments(d.appointments || []);
        }
      }
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const doctors       = members.filter(m => m.member_role === 'doctor');
  const activeDoctors = doctors.filter(m => m.status === 'active');
  const labStaff      = members.filter(m => m.member_role === 'lab_member');
  const totalStaff    = members.length;

  const todayApptsCount  = dashboardData?.summary?.total || 0;
  const uniquePatients   = new Set(appointments.map(a => a.patient?.id || a.patient)).size;
  const pendingAppts     = (dashboardData?.summary?.pending || 0) + (dashboardData?.summary?.confirmed || 0);

  const statCards = [
    {
      label: 'Total Staff',
      value: loading ? '…' : totalStaff,
      sub: loading ? '' : `${members.filter(m => m.status === 'active').length} active`,
      icon: Stethoscope,
      thick: '#3B82F6',
      bg: 'rgba(59,130,246,0.12)',
      accent: '#3B82F6',
      onClick: () => navigate('/admin/staff'),
    },
    {
      label: 'Doctors',
      value: loading ? '…' : doctors.length,
      sub: loading ? '' : `${activeDoctors.length} on duty`,
      icon: Users,
      thick: '#10B981',
      bg: 'rgba(16,185,129,0.12)',
      accent: '#10B981',
      onClick: () => navigate('/admin/staff'),
    },
    {
      label: 'Lab Personnel',
      value: loading ? '…' : labStaff.length,
      sub: loading ? '' : `${labStaff.filter(m => m.status === 'active').length} active`,
      icon: TestTube,
      thick: '#8B5CF6',
      bg: 'rgba(139,92,246,0.12)',
      accent: '#8B5CF6',
      onClick: () => navigate('/admin/staff'),
    },
    {
      label: 'Patients Seen',
      value: loading ? '…' : (uniquePatients || 0),
      sub: loading ? '' : `${todayApptsCount} today`,
      icon: UserCircle2,
      thick: '#F59E0B',
      bg: 'rgba(245,158,11,0.12)',
      accent: '#F59E0B',
      onClick: null,
    },
  ];

  const quickActions = [
    {
      label: 'Manage Staff',
      sub: 'Add / deactivate doctors & lab staff',
      icon: Users2,
      path: '/admin/staff',
      accent: '#3B82F6',
      bg: 'rgba(59,130,246,0.1)',
      badge: loading ? null : totalStaff,
    },
    {
      label: 'View Analytics',
      sub: 'KPI dashboards & AI impact metrics',
      icon: Activity,
      path: '/admin/analytics',
      accent: '#10B981',
      bg: 'rgba(16,185,129,0.1)',
      badge: null,
    },
    {
      label: 'Time Slots',
      sub: 'Configure appointment hours',
      icon: CalendarDays,
      path: '/admin/slots',
      accent: '#F59E0B',
      bg: 'rgba(245,158,11,0.1)',
      badge: null,
    },
    {
      label: 'My Profile',
      sub: 'Hospital details & account settings',
      icon: ShieldCheck,
      path: '/admin/profile',
      accent: '#8B5CF6',
      bg: 'rgba(139,92,246,0.1)',
      badge: null,
    },
  ];

  const alerts = [
    {
      label: 'System Update',
      body: 'AI Summary integrations for lab reports are now live.',
      icon: Info,
      bg: 'var(--info-light)',
      accentColor: 'var(--info)',
    },
    ...(pendingAppts > 0 ? [{
      label: `${pendingAppts} Pending Appointment${pendingAppts > 1 ? 's' : ''}`,
      body: `There ${pendingAppts === 1 ? 'is' : 'are'} ${pendingAppts} appointment${pendingAppts > 1 ? 's' : ''} awaiting confirmation.`,
      icon: AlertCircle,
      bg: 'var(--warning-light)',
      accentColor: 'var(--warning)',
      action: 'View',
      onClick: () => navigate('/admin/analytics'),
    }] : [{
      label: 'Action Required',
      body: 'New patient admission documents may need manual verification.',
      icon: AlertCircle,
      bg: 'var(--warning-light)',
      accentColor: 'var(--warning)',
      action: 'Review Now',
      onClick: () => navigate('/admin/staff'),
    }]),
    {
      label: 'Staff Status',
      body: `${activeDoctors.length} doctor${activeDoctors.length !== 1 ? 's' : ''} currently active in your clinic.`,
      icon: CheckCircle2,
      bg: 'var(--success-light)',
      accentColor: 'var(--success)',
    },
  ];

  const recentDoctors = doctors.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Welcome Banner */}
      <motion.div
        className="rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, #1D4ED8 0%, #4338CA 60%, #7C3AED 100%)',
          boxShadow: '0 8px 32px rgba(37,99,235,0.25)',
        }}
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.07)', filter: 'blur(32px)' }} />
        <div className="absolute -bottom-8 right-40 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.05)', filter: 'blur(24px)' }} />
        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium mb-1">{getGreeting()},</p>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {user?.name || 'Administrator'} 
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            {clinic ? `Managing · ${clinic.name}` : 'Hospital Administration Portal'}
          </p>
        </div>
        <div className="relative z-10 flex gap-3 shrink-0">
          <button
            onClick={() => navigate('/admin/analytics')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            <Activity size={15} /> Analytics
          </button>
          <button
            onClick={() => navigate('/admin/staff')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: '#fff', color: '#1D4ED8' }}
          >
            <Users2 size={15} /> Manage Staff
          </button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, accent, bg, thick, onClick }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card
              className={`transition-all hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 ${onClick ? 'cursor-pointer' : ''}`}
              style={{ borderLeft: `3px solid ${thick}` }}
              onClick={onClick || undefined}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl shrink-0" style={{ background: bg, color: accent }}>
                    <Icon size={18} />
                  </div>
                  <TrendingUp size={13} style={{ color: accent, opacity: 0.7 }} />
                </div>
                <h3 className="text-2xl font-black flex items-center gap-1.5 mb-0.5" style={{ color: 'var(--text-primary)' }}>
                  {loading && label !== 'System Health' ? <Loader2 size={16} className="animate-spin" /> : value}
                </h3>
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
                {sub && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Quick Actions</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ label, sub, icon: Icon, path, accent, bg, badge }, i) => (
            <motion.button key={label} onClick={() => navigate(path)} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-4 rounded-2xl border text-left transition-all hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 w-full group"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
              <div className="p-2.5 rounded-xl shrink-0 transition-all group-hover:scale-110" style={{ background: bg, color: accent }}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                  {badge != null && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: bg, color: accent }}>
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5 leading-tight" style={{ color: 'var(--text-muted)' }}>{sub}</p>
              </div>
              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} className="shrink-0 transition-transform group-hover:translate-x-1" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Staff + Appointment Overview */}
        <div className="lg:col-span-2 space-y-5">

          {/* Patient / Appointment Summary */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <UserCircle2 size={17} style={{ color: 'var(--text-muted)' }} /> Patient Activity
                </CardTitle>
                <Button size="sm" variant="secondary" onClick={() => navigate('/admin/analytics')}>
                  Full Report
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(n => <div key={n} className="h-16 rounded-xl shimmer" />)}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Patients", value: uniquePatients || 0, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
                    { label: "Today's Appointments", value: todayApptsCount || 0, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
                    { label: "Pending / Upcoming", value: pendingAppts || 0, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
                  ].map(({ label, value, color, bg: cardBg }) => (
                    <div key={label} className="p-3.5 rounded-xl text-center" style={{ background: cardBg }}>
                      <p className="text-2xl font-black mb-1" style={{ color }}>{value}</p>
                      <p className="text-xs font-medium leading-tight" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff Directory */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase size={17} style={{ color: 'var(--text-muted)' }} /> Staff Directory
                  {!loading && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                      {doctors.length} doctors
                    </span>
                  )}
                </CardTitle>
                <Button size="sm" onClick={() => navigate('/admin/staff')}>View All</Button>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl shimmer shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 rounded shimmer w-1/3" />
                        <div className="h-2.5 rounded shimmer w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentDoctors.length === 0 ? (
                <div className="py-14 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl mb-3 flex items-center justify-center"
                    style={{ background: 'var(--primary-muted)' }}>
                    <Users size={22} style={{ color: 'var(--primary)' }} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No doctors yet</p>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Add your first doctor to get started</p>
                  <Button size="sm" onClick={() => navigate('/admin/staff')}>Add Doctors</Button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                      {['Doctor', 'Department', 'Contact', 'Status'].map(h => (
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
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                              style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                              {(d.user?.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{d.user?.name || '—'}</p>
                              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{d.user?.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                            {d.department || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {d.user?.contact ? `+91 ${d.user.contact}` : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
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
            {!loading && recentDoctors.length > 0 && (
              <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <button onClick={() => navigate('/admin/staff')}
                  className="text-xs font-semibold flex items-center gap-1 transition-all hover:gap-2"
                  style={{ color: 'var(--primary)' }}>
                  View all {totalStaff} staff members <ArrowRight size={13} />
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* Alerts & Clinic Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={17} style={{ color: 'var(--text-muted)' }} /> Alerts
                <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--danger)' }}>
                  {alerts.filter(a => a.action).length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map(({ label, body, icon: Icon, bg, accentColor, action, onClick }) => (
                <div key={label} className="p-3.5 rounded-xl border"
                  style={{ background: bg, borderColor: `${accentColor}33` }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={13} style={{ color: accentColor }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>{label}</span>
                  </div>
                  <p className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>{body}</p>
                  {action && (
                    <button onClick={onClick}
                      className="mt-2.5 w-full h-8 text-xs font-semibold rounded-lg border transition-colors hover:opacity-80"
                      style={{ borderColor: `${accentColor}55`, color: accentColor, background: 'transparent' }}>
                      {action}
                    </button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Clinic Info Card */}
          {clinic && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl shrink-0" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                      <Building size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Your Clinic</p>
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{clinic.name}</p>
                      {clinic.city && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {clinic.city}{clinic.state ? `, ${clinic.state}` : ''}
                        </p>
                      )}
                    </div>
                    <button onClick={() => navigate('/admin/profile')} className="ml-auto shrink-0" style={{ color: 'var(--text-muted)' }}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  {/* Mini stats row */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    {[
                      { label: 'Total Staff',  val: totalStaff },
                      { label: 'Active Doctors', val: activeDoctors.length },
                    ].map(({ label, val }) => (
                      <div key={label} className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                        <p className="text-base font-black" style={{ color: 'var(--primary)' }}>{loading ? '…' : val}</p>
                        <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
