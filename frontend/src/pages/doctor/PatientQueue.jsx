import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Calendar, ExternalLink, Clock, Loader2 } from 'lucide-react';
import { appointmentApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const STATUS_VARIANT = {
  confirmed: 'success',
  pending: 'warning',
  completed: 'primary',
  cancelled: 'danger',
};

export function PatientQueue() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await appointmentApi.doctorList({ date: todayStr });
      setAppointments(Array.isArray(data) ? data : (data.results || []));
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await appointmentApi.updateStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch {
      // fail silently
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredQueue = appointments.filter(appt => {
    const name = appt.patient?.name || appt.patientName || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatTime = (t) => {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--border)' }}
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Patient Queue</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Loading…' : `${appointments.length} appointment${appointments.length !== 1 ? 's' : ''} today`}
          </p>
        </div>
        <Button variant="secondary" className="gap-2 shrink-0" onClick={loadQueue}>
          <Calendar size={16} /> Refresh
        </Button>
      </motion.div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input
            placeholder="Search by patient name…"
            className="w-full h-10 pl-9 pr-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="secondary" className="gap-2 shrink-0">
          <Filter size={16} /> Filter
        </Button>
      </div>

      {/* Queue */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={22} className="animate-spin" /> Loading queue…
          </div>
        ) : filteredQueue.map((appt, i) => {
          const patientName = appt.patient?.user?.name || appt.patient?.name || 'Patient';
          const timeStr = formatTime(appt.appointment_time);
          const [timePart, ampm] = timeStr.split(' ');

          return (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="transition-all group">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-5 flex-1">
                    {/* Time badge */}
                    <div
                      className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 font-semibold text-sm"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                    >
                      {timePart}
                      <span className="text-[10px] font-bold uppercase tracking-wide">{ampm}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{patientName}</h3>
                        <Badge variant={STATUS_VARIANT[appt.status] || 'warning'}>
                          {appt.status?.charAt(0).toUpperCase() + appt.status?.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                        Type: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {appt.appointment_type?.replace('_', ' ') || '—'}
                        </span>
                      </p>
                      <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                        <Clock size={11} /> Mode: {appt.mode || '—'}
                        {appt.notes && ` · ${appt.notes}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {appt.status === 'pending' && (
                      <Button size="sm" variant="secondary"
                        disabled={updatingId === appt.id}
                        onClick={() => handleUpdateStatus(appt.id, 'confirmed')}>
                        {updatingId === appt.id ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
                        Confirm
                      </Button>
                    )}
                    {appt.status === 'confirmed' && (
                      <Button size="sm"
                        disabled={updatingId === appt.id}
                        onClick={() => handleUpdateStatus(appt.id, 'completed')}>
                        {updatingId === appt.id ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
                        Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {!loading && filteredQueue.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 rounded-2xl border-2 border-dashed"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
          >
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Queue is empty</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {searchTerm ? 'No patients match your search.' : 'No appointments scheduled for today.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
