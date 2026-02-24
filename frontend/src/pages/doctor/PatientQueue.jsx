import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Calendar, ExternalLink, Clock } from 'lucide-react';
import { mockAppointments } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function PatientQueue() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const d = new Date();
  const todayStr = d.toISOString().split('T')[0];
  const myAppointments = mockAppointments.filter(a => a.doctorId === user.id);
  const todaysAppointments = myAppointments.filter(a => a.date === todayStr);
  const filteredQueue = todaysAppointments.filter(appt =>
    appt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appt.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Manage your active appointments for today.</p>
        </div>
        <Button variant="secondary" className="gap-2 shrink-0">
          <Calendar size={16} /> Today's Schedule
        </Button>
      </motion.div>

      {/* Search / Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input
            placeholder="Search patient by name or ID…"
            className="w-full h-10 pl-9 pr-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
            style={{
              background: 'var(--bg-secondary)', color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="secondary" className="gap-2 shrink-0">
          <Filter size={16} /> Filter Status
        </Button>
      </div>

      {/* Queue Cards */}
      <div className="grid gap-4">
        {filteredQueue.map((appt, i) => (
          <motion.div
            key={appt.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card
              className="cursor-pointer transition-all group"
              onClick={() => navigate('/doctor/patient/' + appt.patientId)}
              style={{ '--hover-border': 'var(--primary)' }}
            >
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-5 flex-1">
                  {/* Time Badge */}
                  <div
                    className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-colors font-semibold text-sm group-hover:bg-[var(--primary-muted)] group-hover:text-[var(--primary)]"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                  >
                    {appt.time.split(' ')[0]}
                    <span className="text-[10px] font-bold uppercase tracking-wide">{appt.time.split(' ')[1]}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                      <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{appt.patientName}</h3>
                      <Badge variant={appt.status === 'Confirmed' ? 'success' : 'warning'}>{appt.status}</Badge>
                    </div>
                    <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Reason: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{appt.reason}</span>
                    </p>
                    <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={11} /> ID: {appt.patientId} · Age: 34 · Male
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <Button
                    variant="secondary"
                    className="gap-2"
                    onClick={(e) => { e.stopPropagation(); navigate('/doctor/patient/' + appt.patientId); }}
                  >
                    View Details <ExternalLink size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Empty state */}
        {filteredQueue.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 rounded-2xl border-2 border-dashed"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
          >
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Queue is empty</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No patients match your search or today has no appointments scheduled.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
