import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Upload, FileText, Pill, Clock, Trash2, Calendar } from 'lucide-react';
import { mockUsers, mockPrescriptions } from '../../data/mockData';
import { motion } from 'framer-motion';

const labelStyle = {
  display: 'block', fontSize: '0.875rem', fontWeight: 600,
  marginBottom: '0.5rem', color: 'var(--text-secondary)',
};

const selectStyle = {
  width: '100%', height: '2.75rem', borderRadius: '0.75rem', padding: '0 0.75rem',
  fontSize: '0.875rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
  border: '1px solid var(--border)', outline: 'none', transition: 'border-color 0.2s',
};

export function DoctorPrescriptions() {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', notes: '' }]);

  const patients = mockUsers.filter(u => u.role === 'Patient');
  const pastPrescriptions = mockPrescriptions.filter(p => p.doctorId === user.id);

  const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', duration: '', notes: '' }]);
  const removeMedicine = idx => setMedicines(medicines.filter((_, i) => i !== idx));
  const handleMedChange = (idx, field, value) => {
    const updated = [...medicines];
    updated[idx][field] = value;
    setMedicines(updated);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>New Prescription</h1>
        <p className="mt-1 text-base" style={{ color: 'var(--text-muted)' }}>Create a prescription for your patient</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Form */}
        <motion.div className="lg:col-span-2 space-y-6" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}>
          <Card>
            <CardContent className="p-8 space-y-8">
              {/* Patient selector */}
              <div>
                <label style={labelStyle}>Patient</label>
                <select style={selectStyle} value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                  <option value="" disabled>Select patient…</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {/* Medicines */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    <FileText size={16} style={{ color: 'var(--primary)' }} /> Medicines
                  </div>
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="flex items-center gap-1 text-sm font-semibold transition-colors"
                    style={{ color: 'var(--primary)' }}
                  >
                    <Plus size={15} /> Add
                  </button>
                </div>

                <div className="space-y-4">
                  {medicines.map((med, idx) => (
                    <div key={idx} className="relative p-5 rounded-2xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                      {medicines.length > 1 && (
                        <button
                          onClick={() => removeMedicine(idx)}
                          className="absolute -top-3 -right-3 p-1.5 rounded-full transition-colors shadow-sm"
                          style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid rgba(252,129,129,0.3)' }}
                          title="Remove"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input placeholder="Medicine name *" value={med.name} onChange={e => handleMedChange(idx, 'name', e.target.value)} />
                        <Input placeholder="Dosage (e.g. 50mg)" value={med.dosage} onChange={e => handleMedChange(idx, 'dosage', e.target.value)} />
                        <Input placeholder="Duration (e.g. 7 days)" value={med.duration} onChange={e => handleMedChange(idx, 'duration', e.target.value)} />
                        <Input placeholder="Notes / Instructions" value={med.notes} onChange={e => handleMedChange(idx, 'notes', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload zone */}
              <div>
                <label style={labelStyle}>Scanned Prescription <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <div
                  className="mt-1 flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all hover:border-[var(--primary)]"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
                >
                  <div className="p-3 rounded-xl" style={{ background: 'var(--primary-muted)' }}>
                    <Upload size={22} style={{ color: 'var(--primary)' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Drag & drop or <span style={{ color: 'var(--primary)' }}>click to upload</span></p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>PDF, JPG, PNG up to 10MB</p>
                </div>
              </div>

              {/* Save */}
              <div className="pt-2">
                <Button className="w-full h-12 text-base font-semibold">Save Prescription</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Prescriptions sidebar */}
        <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
          <Card className="sticky top-24 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3.5 font-semibold text-sm border-b"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              <Clock size={16} style={{ color: 'var(--text-muted)' }} /> Recent Prescriptions
            </div>
            <div className="max-h-[600px] overflow-y-auto divide-y" style={{ '--tw-divide-opacity': 1 }}>
              {pastPrescriptions.map(p => {
                const patName = patients.find(pat => pat.id === p.patientId)?.name || 'Unknown Patient';
                return (
                  <div key={p.id} className="p-4 cursor-pointer group transition-colors hover:bg-[var(--bg-secondary)]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm transition-colors group-hover:text-[var(--primary)]" style={{ color: 'var(--text-primary)' }}>
                        {patName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                      <Calendar size={11} /> {p.date}
                    </div>
                    <div className="flex items-start gap-2 p-2.5 rounded-xl border" style={{ background: 'var(--primary-muted)', borderColor: 'rgba(96,165,250,0.2)' }}>
                      <Pill size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.medicine}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.dosage} · {p.duration}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {pastPrescriptions.length === 0 && (
                <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No previous prescriptions found.</div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
