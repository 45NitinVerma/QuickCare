import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi, documentApi } from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Calendar, FileText, Clock, AlertCircle, ChevronRight, Activity, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { CalendarWidget } from '../../components/ui/CalendarWidget';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const cardVariant = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } } };

export function PatientDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments]       = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [apptRes, docRes] = await Promise.all([
          appointmentApi.myList(),
          documentApi.list(),
        ]);
        setAppointments(apptRes.data || []);
        setDocuments(docRes.data || []);
      } catch {
        // silently handle — user sees empty states
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const todayStr      = new Date().toISOString().split('T')[0];
  const upcomingCount = appointments.filter(a => a.appointment_date >= todayStr).length;
  const docsCount     = documents.length;

  // Transform appointments for CalendarWidget format
  const calendarEvents = appointments.map(a => ({
    id:   a.id,
    date: a.appointment_date,
    time: a.appointment_time,
    doctorName: a.doctor?.user?.name || 'Doctor',
    reason:     a.notes || a.appointment_type || '',
    status:     a.status === 'confirmed' ? 'Confirmed' : 'Pending',
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Here's a summary of your health records and upcoming schedules.
          </p>
        </div>
        <Button onClick={() => navigate('/patient/book')} className="gap-2 shrink-0 glow-primary">
          <Calendar size={16} /> Book Appointment
        </Button>
      </motion.div>

      {/* KPI Stat Cards */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" animate="show">
        <motion.div variants={cardVariant}>
          <Card className="border-t-4 border-t-blue-500 overflow-hidden group">
            <CardContent className="p-6">
              <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Upcoming Appointments</p>
              <h3 className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {loading ? '–' : upcomingCount}
              </h3>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariant}>
          <Card className="border-t-4 border-t-violet-500 overflow-hidden group">
            <CardContent className="p-6">
              <div className="w-11 h-11 bg-violet-50 dark:bg-violet-900/20 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110">
                <FileText className="w-5 h-5 text-violet-600" />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Documents</p>
              <h3 className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {loading ? '–' : docsCount}
              </h3>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariant}>
          <Card className="border-t-4 border-t-emerald-500 overflow-hidden group">
            <CardContent className="p-6">
              <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Health Status</p>
              <div className="flex items-center gap-2 mt-1">
                <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Active</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold">↑ Good</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Content Grid */}
      <motion.div className="grid lg:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" animate="show">
        {/* Appointments */}
        <motion.div variants={cardVariant} className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> Scheduled Visits
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4">
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />)}</div>
              ) : appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.slice(0, 4).map(appt => (
                    <div key={appt.id} className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-[var(--bg-secondary)] group cursor-pointer">
                      <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 border"
                        style={{ background: 'var(--primary-muted)', borderColor: 'rgba(37,99,235,0.2)' }}>
                        <span className="text-[9px] font-bold uppercase" style={{ color: 'var(--primary)' }}>
                          {new Date(appt.appointment_date + 'T00:00:00').toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-base font-black leading-none" style={{ color: 'var(--primary)' }}>
                          {new Date(appt.appointment_date + 'T00:00:00').getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{appt.doctor?.user?.name || 'Doctor'}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{appt.appointment_type} · {appt.appointment_time}</p>
                      </div>
                      <Badge variant={appt.status === 'confirmed' ? 'success' : 'warning'}>{appt.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No upcoming appointments</p>
                  <Button size="sm" className="mt-4" onClick={() => navigate('/patient/book')}>Book Now</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Documents */}
        <motion.div variants={cardVariant} className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> Documents
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/patient/reports')} className="text-xs">
                  View all <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 space-y-3">
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />)}</div>
              ) : documents.length > 0 ? documents.slice(0, 3).map(doc => (
                <div key={doc.id} className="p-3 rounded-xl border cursor-pointer transition-all hover:border-[var(--primary)] group"
                  style={{ borderColor: 'var(--border)' }}
                  onClick={() => navigate('/patient/reports')}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold group-hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text-primary)' }}>{doc.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{doc.document_type}</p>
                    </div>
                    <Badge variant="primary">{doc.document_type}</Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No documents yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Health + Calendar */}
        <motion.div variants={cardVariant} className="lg:col-span-1 flex flex-col gap-6">
          <Card className="border-t-4 border-t-indigo-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.04]"><Activity size={120} /></div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Sparkles className="w-4 h-4 text-indigo-500" /> AI Health Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 shadow-inner shrink-0"
                  style={{ borderColor: 'rgba(99,102,241,0.2)', background: 'var(--card)' }}>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none">84</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>Score</span>
                </div>
                <div>
                  <Badge variant="success" className="mb-1.5"><TrendingUp size={11} /> Improving</Badge>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Low Risk Profile</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 p-3 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 shrink-0"><Activity size={13} /></div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Vitals stable. Blood pressure trends are excellent this month.</p>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl border" style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'var(--warning-light)' }}>
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 shrink-0"><AlertTriangle size={13} /></div>
                  <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-400">Slight LDL cholesterol elevation noted. Consider dietary review.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Button onClick={() => setShowCalendar(!showCalendar)} variant="ghost" className="w-full justify-between mb-2">
                <span className="flex items-center gap-2 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  <Calendar size={16} /> My Schedule
                </span>
                <span className="text-xs" style={{ color: 'var(--primary)' }}>{showCalendar ? 'Hide' : 'Show'}</span>
              </Button>
              {showCalendar && <CalendarWidget events={calendarEvents} />}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
