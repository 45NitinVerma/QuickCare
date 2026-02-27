import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Plus, Upload, FileText, Pill, Clock, Trash2,
  Phone, Search, CheckCircle2, AlertCircle, X, User,
  FileCheck, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userApi, documentApi } from '../../services/api';

const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5 MB

const labelStyle = {
  display: 'block', fontSize: '0.875rem', fontWeight: 600,
  marginBottom: '0.5rem', color: 'var(--text-secondary)',
};

const selectStyle = {
  width: '100%', height: '2.75rem', borderRadius: '0.75rem', padding: '0 0.75rem',
  fontSize: '0.875rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
  border: '1px solid var(--border)', outline: 'none', transition: 'border-color 0.2s',
};

/* ── small helper badges ── */
function InfoBadge({ label, value }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      borderRadius: '0.75rem', padding: '0.5rem 0.875rem',
    }}>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{label}</p>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value || '—'}</p>
    </div>
  );
}

export function DoctorPrescriptions() {
  const { user } = useAuth();

  /* ── patient lookup ── */
  const [contact, setContact] = useState('');
  const [lookupState, setLookupState] = useState('idle'); // idle | loading | found | not_found | error
  const [patient, setPatient] = useState(null);
  const [lookupError, setLookupError] = useState('');

  /* ── medicines ── */
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', notes: '' }]);

  /* ── PDF upload ── */
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfError, setPdfError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  /* ── submission ── */
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  /* ── patient lookup handler ── */
  const handleLookup = async () => {
    if (contact.length !== 10) return;
    setLookupState('loading');
    setPatient(null);
    setLookupError('');
    try {
      const { data } = await userApi.lookupByContact(contact);
      setPatient(data);
      setLookupState('found');
    } catch (err) {
      if (err.response?.status === 404) {
        setLookupState('not_found');
        setLookupError('No patient found with this contact number.');
      } else if (err.response?.status === 403) {
        setLookupState('error');
        setLookupError('You are not authorised to look up patients.');
      } else {
        setLookupState('error');
        setLookupError('Something went wrong. Please try again.');
      }
    }
  };

  /* ── medicine helpers ── */
  const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', duration: '', notes: '' }]);
  const removeMedicine = idx => setMedicines(medicines.filter((_, i) => i !== idx));
  const handleMedChange = (idx, field, value) => {
    const updated = [...medicines];
    updated[idx][field] = value;
    setMedicines(updated);
  };

  /* ── PDF helpers ── */
  const validateAndSetPdf = (file) => {
    setPdfError('');
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setPdfError('Only PDF files are allowed.');
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setPdfError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed is 5 MB.`);
      return;
    }
    setPdfFile(file);
  };

  const onFileInput = e => validateAndSetPdf(e.target.files[0]);
  const onDrop = useCallback(e => {
    e.preventDefault();
    setDragOver(false);
    validateAndSetPdf(e.dataTransfer.files[0]);
  }, []);

  /* ── submit ── */
  const handleSubmit = async () => {
    if (!patient) return;
    const hasValidMed = medicines.some(m => m.name.trim());
    if (!hasValidMed && !pdfFile) {
      setSubmitError('Please add at least one medicine or upload a prescription PDF.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const form = new FormData();

      // ── Required fields per POST /api/documents/ spec ──
      form.append('patient_id', patient.id);          // was 'patient' ❌
      form.append('document_type', 'prescription');
      form.append('title', `Prescription — ${patient.name}`); // required field, was missing ❌

      // Medicines → description (optional but informative)
      const validMeds = medicines.filter(m => m.name.trim());
      if (validMeds.length) {
        const desc = validMeds
          .map((m, i) => `${i + 1}. ${m.name}${m.dosage ? ' — ' + m.dosage : ''}${m.duration ? ' for ' + m.duration : ''}${m.notes ? ' (' + m.notes + ')' : ''}`)
          .join('\n');
        form.append('description', desc);             // was 'notes' ❌
      }

      // PDF attachment (optional)
      if (pdfFile) {
        form.append('file', pdfFile);
      }

      await documentApi.upload(form);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'Failed to save prescription. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setContact(''); setLookupState('idle'); setPatient(null); setLookupError('');
    setMedicines([{ name: '', dosage: '', duration: '', notes: '' }]);
    setPdfFile(null); setPdfError(''); setSubmitted(false); setSubmitError('');
  };

  /* ── success screen ── */
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-20 text-center"
      >
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg"
          style={{ background: 'var(--success-muted, #d1fae5)', color: '#10b981' }}>
          <CheckCircle2 size={44} />
        </div>
        <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>Prescription Saved!</h2>
        <p className="mb-6 text-base" style={{ color: 'var(--text-muted)' }}>
          The prescription was successfully added to <strong>{patient?.name}</strong>'s record.
        </p>
        <Button onClick={resetForm}>+ New Prescription</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          New Prescription
        </h1>
        <p className="mt-1 text-base" style={{ color: 'var(--text-muted)' }}>
          Look up a patient by contact number, then fill in the prescription details.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* ── Main form ── */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
        >
          <Card>
            <CardContent className="p-8 space-y-8">

              {/* ─── Patient Lookup ─── */}
              <div>
                <label style={labelStyle}>Patient Contact Number</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="tel"
                      placeholder="Enter 10-digit contact number"
                      value={contact}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setContact(val);
                        if (lookupState !== 'idle') { setLookupState('idle'); setPatient(null); setLookupError(''); }
                      }}
                      onKeyDown={e => e.key === 'Enter' && handleLookup()}
                      className="w-full h-11 pl-9 pr-3 rounded-xl text-sm focus:outline-none transition-all"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    />
                  </div>
                  <button
                    onClick={handleLookup}
                    disabled={contact.length !== 10 || lookupState === 'loading'}
                    className="flex items-center gap-1.5 px-4 h-11 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    style={{ background: 'var(--primary)', color: '#fff' }}
                  >
                    {lookupState === 'loading'
                      ? <Loader2 size={15} className="animate-spin" />
                      : <Search size={15} />}
                    {lookupState === 'loading' ? 'Searching…' : 'Look Up'}
                  </button>
                </div>

                {/* Lookup feedback */}
                <AnimatePresence>
                  {lookupState === 'found' && patient && (
                    <motion.div
                      key="found"
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-3 p-4 rounded-2xl flex items-center gap-4"
                      style={{ background: 'var(--primary-muted)', border: '1px solid var(--primary-light)' }}
                    >
                      <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0"
                        style={{ background: 'var(--primary)', color: '#fff' }}>
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{patient.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {patient.age} yrs · {patient.gender} · Blood: {patient.blood_group}
                        </p>
                      </div>
                      <CheckCircle2 size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    </motion.div>
                  )}

                  {(lookupState === 'not_found' || lookupState === 'error') && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-3 flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
                      style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
                    >
                      <AlertCircle size={15} />
                      {lookupError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ─── Medicines ─── */}
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
                    <div key={idx} className="relative p-5 rounded-2xl border"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
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
                        <Input placeholder="Dosage (e.g. 50mg twice daily)" value={med.dosage} onChange={e => handleMedChange(idx, 'dosage', e.target.value)} />
                        <Input placeholder="Duration (e.g. 7 days)" value={med.duration} onChange={e => handleMedChange(idx, 'duration', e.target.value)} />
                        <Input placeholder="Notes / Instructions" value={med.notes} onChange={e => handleMedChange(idx, 'notes', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── PDF Upload ─── */}
              <div>
                <label style={labelStyle}>
                  Scanned Prescription PDF{' '}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional · PDF only · max 5 MB)</span>
                </label>

                {/* Drop zone */}
                {!pdfFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className="mt-1 flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all"
                    style={{
                      borderColor: dragOver ? 'var(--primary)' : 'var(--border)',
                      background: dragOver ? 'var(--primary-muted)' : 'var(--bg-secondary)',
                    }}
                  >
                    <div className="p-3 rounded-xl" style={{ background: 'var(--primary-muted)' }}>
                      <Upload size={22} style={{ color: 'var(--primary)' }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Drag & drop or <span style={{ color: 'var(--primary)' }}>click to upload</span>
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>PDF only · up to 5 MB</p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: 'var(--primary-muted)', border: '1px solid var(--primary-light)' }}
                  >
                    <FileCheck size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{pdfFile.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => { setPdfFile(null); setPdfError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="p-1.5 rounded-lg transition-colors hover:bg-red-100"
                      style={{ color: 'var(--danger)' }}
                      title="Remove file"
                    >
                      <X size={15} />
                    </button>
                  </motion.div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={onFileInput}
                />

                {/* PDF error */}
                <AnimatePresence>
                  {pdfError && (
                    <motion.p
                      key="pdf-err"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="mt-2 flex items-center gap-1.5 text-xs"
                      style={{ color: 'var(--danger)' }}
                    >
                      <AlertCircle size={13} /> {pdfError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* ─── Submit error ─── */}
              <AnimatePresence>
                {submitError && (
                  <motion.div
                    key="sub-err"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
                    style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
                  >
                    <AlertCircle size={15} /> {submitError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Save button ─── */}
              <div className="pt-2">
                <Button
                  className="w-full h-12 text-base font-semibold"
                  onClick={handleSubmit}
                  disabled={!patient || submitting}
                >
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin mr-2" />Saving…</>
                    : 'Save Prescription'
                  }
                </Button>
                {!patient && (
                  <p className="mt-2 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    Look up a patient first to enable saving.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Sidebar ── */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}
        >
          {/* Patient info card (shown after lookup) */}
          <AnimatePresence>
            {patient && (
              <motion.div
                key="patient-card"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-4"
              >
                <Card>
                  <div className="flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                    <User size={15} style={{ color: 'var(--text-muted)' }} /> Patient Info
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                        style={{ background: 'var(--primary)', color: '#fff' }}>
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{patient.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{patient.contact}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <InfoBadge label="Age" value={`${patient.age} yrs`} />
                      <InfoBadge label="Gender" value={patient.gender} />
                      <InfoBadge label="Blood" value={patient.blood_group} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent prescriptions placeholder */}
          <Card className="sticky top-24 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3.5 font-semibold text-sm border-b"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              <Clock size={16} style={{ color: 'var(--text-muted)' }} /> Recent Prescriptions
            </div>
            <div className="max-h-[480px] overflow-y-auto divide-y">
              <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                <Pill size={24} className="mx-auto mb-2 opacity-30" />
                <p>Prescription history coming soon.</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
