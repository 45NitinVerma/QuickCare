import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Activity, FileText, Pill, AlertTriangle, User, History, ShieldAlert, Sparkles } from 'lucide-react';
import { mockReports, mockPrescriptions, mockUsers, patientConsents } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export function PatientDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const patient = mockUsers.find(u => u.id === id) || { name: 'John Doe', email: 'john@patient.com', age: 34, gender: 'Male', bloodGroup: 'O+' };
  const hasAccess = patientConsents.some(c => c.doctorId === user.id && c.status === 'Granted');
  const patientReports = mockReports.filter(r => r.patientId === id);
  const patientPrescriptions = mockPrescriptions.filter(p => p.patientId === id);

  const vitals = [
    ['Height', '178 cm'], ['Weight', '76 kg'],
    ['Blood Pressure', '120/80 mmHg'], ['Heart Rate', '72 bpm'],
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Patient Header Card */}
      <motion.div
        className="rounded-2xl p-6 border flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0"
            style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
            {patient.name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>{patient.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5"><User size={13} /> {patient.age || 34} yrs, {patient.gender || 'Male'}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5"><Activity size={13} /> Blood: {patient.bloodGroup || 'O+'}</span>
              <span>·</span>
              <span>ID: {id}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {!hasAccess && (
            <Button variant="secondary" className="flex-1 md:flex-auto gap-2" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}>
              <ShieldAlert size={15} /> Request Access
            </Button>
          )}
          <Button onClick={() => navigate('/doctor/prescribe/' + id)} className="flex-1 md:flex-auto gap-2">
            <Pill size={15} /> Add Prescription
          </Button>
        </div>
      </motion.div>

      {hasAccess ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles size={18} style={{ color: 'var(--primary)' }} /> AI Clinical Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl border" style={{ background: 'var(--primary-muted)', borderColor: 'rgba(96,165,250,0.25)' }}>
                  <h4 className="font-semibold text-sm mb-2 pb-2 border-b" style={{ color: 'var(--primary)', borderColor: 'rgba(96,165,250,0.2)' }}>
                    Synthesized Health Context
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Patient presents with a history of elevated cholesterol and mild hypertension. Recent pathology (Feb 15) indicates values are returning to normal limits. Ongoing treatment includes Aspirin 81mg daily.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="warning">Hypertension</Badge>
                    <Badge variant="primary">Cholesterol</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History size={18} style={{ color: 'var(--text-muted)' }} /> Medical Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 relative">
                  {/* Vertical line */}
                  <div className="absolute left-10 top-6 bottom-6 w-0.5" style={{ background: 'var(--border)' }} />

                  <div className="space-y-6 relative">
                    {patientReports.map((report, i) => (
                      <motion.div key={'r' + i} className="flex gap-4"
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm"
                          style={{ background: 'var(--primary-muted)', color: 'var(--primary)', border: '3px solid var(--card)' }}>
                          <FileText size={13} />
                        </div>
                        <div className="pt-1 flex-1">
                          <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>{report.date}</p>
                          <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                            <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{report.name} ({report.type})</h4>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{report.aiSummary}</p>
                            <Button variant="ghost" size="sm" className="h-7 px-2 mt-2 text-xs" style={{ color: 'var(--primary)' }}>
                              View Full Report
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {patientPrescriptions.map((px, i) => (
                      <motion.div key={'p' + i} className="flex gap-4"
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (patientReports.length + i) * 0.08 }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm"
                          style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '3px solid var(--card)' }}>
                          <Pill size={13} />
                        </div>
                        <div className="pt-1 flex-1">
                          <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>{px.date}</p>
                          <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                            <h4 className="font-bold text-sm mb-2 pb-2 border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
                              Prescribed: {px.medicine}
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <p><span className="font-medium" style={{ color: 'var(--text-muted)' }}>Dosage:</span> <span style={{ color: 'var(--text-secondary)' }}>{px.dosage}</span></p>
                              <p><span className="font-medium" style={{ color: 'var(--text-muted)' }}>Duration:</span> <span style={{ color: 'var(--text-secondary)' }}>{px.duration}</span></p>
                            </div>
                            {px.notes && (
                              <p className="text-sm mt-2 italic pl-3 border-l-2" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-strong)' }}>
                                {px.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {patientReports.length === 0 && patientPrescriptions.length === 0 && (
                      <div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No medical history available for this patient.</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Column */}
          <div className="space-y-6">
            {/* Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity size={17} style={{ color: 'var(--text-muted)' }} /> Vitals & Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {vitals.map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center py-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{val}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Allergies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[var(--danger)]">
                  <AlertTriangle size={17} /> Known Allergies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[['Penicillin', 'Mild Rash'], ['Peanuts', 'Severe Anaphylaxis']].map(([a, reaction]) => (
                  <div key={a} className="flex items-start justify-between p-3 rounded-xl border"
                    style={{ background: 'var(--danger-light)', borderColor: 'rgba(252,129,129,0.2)' }}>
                    <span className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>{a}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{reaction}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* No Consent State */
        <motion.div
          className="rounded-2xl p-12 text-center max-w-2xl mx-auto mt-8 border-2 border-dashed"
          style={{ background: 'var(--warning-light)', borderColor: 'rgba(252,211,77,0.4)' }}
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        >
          <ShieldAlert className="w-16 h-16 mx-auto mb-4 opacity-80" style={{ color: 'var(--warning)' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Restricted Access</h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            You do not have consent to view this patient's full medical history. Send an access request to the patient to proceed.
          </p>
          <Button>Send Access Request</Button>
        </motion.div>
      )}
    </div>
  );
}
