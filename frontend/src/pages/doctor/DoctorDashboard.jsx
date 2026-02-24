import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ArrowRight, Sparkles, Users, Calendar, Clock, Activity, TrendingUp, Loader2 } from 'lucide-react';
import { appointmentApi, documentApi } from '../../services/api';
import { CalendarWidget } from '../../components/ui/CalendarWidget';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, iconBg, iconColor, accentColor, label, value, sublabel, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    <Card className={`border-t-4 ${accentColor} overflow-hidden group`}>
      <CardContent className="p-6">
        <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <h3 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</h3>
          {sublabel && <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{sublabel}</span>}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [consentsCount, setConsentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [apptRes, consentRes] = await Promise.allSettled([
        appointmentApi.doctorList({ date: todayStr }),
        documentApi.doctorConsents({ status: 'granted' }),
      ]);
      if (apptRes.status === 'fulfilled') {
        const data = apptRes.value.data;
        const list = Array.isArray(data) ? data : (data.results || []);
        setTodaysAppointments(list);
        setAllAppointments(list);
      }
      if (consentRes.status === 'fulfilled') {
        const data = consentRes.value.data;
        const list = Array.isArray(data) ? data : (data.results || []);
        setConsentsCount(list.length);
      }
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Dr. {user.name}'s Portal
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button onClick={() => navigate('/doctor/queue')} className="gap-2 shrink-0 glow-primary">
          <Users size={16} /> View Patient Queue
        </Button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard index={0} icon={Clock} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600" accentColor="border-t-blue-500" label="Today's Appointments" value={loading ? '…' : todaysAppointments.length} sublabel="scheduled" />
        <StatCard index={1} icon={Sparkles} iconBg="bg-violet-50 dark:bg-violet-900/20" iconColor="text-violet-600" accentColor="border-t-violet-500" label="Total This Month" value={loading ? '…' : allAppointments.length} sublabel="appointments" />
        <StatCard index={2} icon={Activity} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-600" accentColor="border-t-emerald-500" label="Active Consents" value={loading ? '…' : consentsCount} sublabel="patients connected" />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Appointments Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <Badge variant="primary">{loading ? '…' : todaysAppointments.length} patients</Badge>
            </CardHeader>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Time</TableHeader>
                  <TableHeader>Patient</TableHeader>
                  <TableHeader>Reason</TableHeader>
                  <TableHeader className="text-right">Action</TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan="4" className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading…</span>
                    </TableCell>
                  </TableRow>
                ) : todaysAppointments.map(appt => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-semibold text-sm" style={{ color: 'var(--primary)' }}>{appt.appointment_time || appt.time}</TableCell>
                    <TableCell>
                      <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {appt.patient?.name || appt.patientName || 'Patient'}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {appt.appointment_type || appt.reason || '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm truncate max-w-[120px]" style={{ color: 'var(--text-secondary)' }}>
                      {appt.notes || appt.reason || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/queue')}>
                        View <ArrowRight size={13} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && todaysAppointments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan="4" className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                      No appointments scheduled for today
                    </TableCell>
                  </TableRow>
                )}
              </tbody>
            </Table>
          </Card>
        </motion.div>

        {/* Right Column */}
        <motion.div className="flex flex-col gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          {/* AI Summaries CTA */}
          <Card className="overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-muted)] to-transparent pointer-events-none" />
            <CardContent className="p-8 text-center relative z-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-glow-primary)]"
                style={{ background: 'var(--primary)' }}>
                <Sparkles size={26} className="text-white" />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>AI Summaries Ready</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                QuickCare AI has analyzed recent lab reports and highlighted out-of-range indicators for faster clinical review.
              </p>
              <div className="flex items-center justify-center gap-2 mb-5 text-sm font-medium" style={{ color: 'var(--accent)' }}>
                <TrendingUp size={16} /> 92% diagnostic accuracy on flagged items
              </div>
              <Button onClick={() => navigate('/doctor/reports')} className="gap-2 animate-pulse-glow">
                Review AI Summaries <ArrowRight size={15} />
              </Button>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card>
            <CardContent className="p-4">
              <Button onClick={() => setShowCalendar(!showCalendar)} variant="ghost" className="w-full justify-between mb-2">
                <span className="flex items-center gap-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
                  <Calendar size={17} /> My Schedule
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                  {showCalendar ? 'Hide' : 'Show'} Calendar
                </span>
              </Button>
              {showCalendar && <CalendarWidget events={allAppointments} />}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
