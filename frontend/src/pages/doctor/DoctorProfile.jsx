import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi, doctorApi } from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { User, Mail, Phone, Award, Clock, Building2, Lock, CheckCircle2, AlertCircle, X, Loader2, Eye, EyeOff, CalendarDays, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const inputCls    = 'flex h-10 w-full rounded-xl px-3 text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]';
const inputStyle  = { background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' };
const disabledSt  = { ...inputStyle, background: 'var(--bg)', color: 'var(--text-muted)' };
const labelStyle  = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' };
const selectStyle = { ...inputStyle, height: '2.5rem', width: '100%', borderRadius: '0.75rem', padding: '0 0.75rem', fontSize: '0.875rem', border: '1px solid var(--border)', outline: 'none' };

const SPECIALTIES = [
  { value: 'general_medicine', label: 'General Medicine' },
  { value: 'cardiology',       label: 'Cardiology' },
  { value: 'dermatology',      label: 'Dermatology' },
  { value: 'neurology',        label: 'Neurology' },
  { value: 'orthopedics',      label: 'Orthopedics' },
  { value: 'pediatrics',       label: 'Pediatrics' },
  { value: 'gynecology',       label: 'Gynecology' },
  { value: 'ent',              label: 'ENT' },
  { value: 'psychiatry',       label: 'Psychiatry' },
  { value: 'other',            label: 'Other' },
];

const DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  return (
    <AnimatePresence>
      {toast && (
        <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
          style={{ background: toast.type === 'error' ? 'var(--danger)' : 'var(--success)', color: '#fff', minWidth: 280 }}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span className="text-sm font-semibold">{toast.msg}</span>
          <button onClick={onClose} className="ml-auto"><X size={14} /></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DoctorProfile() {
  const { user } = useAuth();

  const [userForm, setUserForm] = useState({ name: '', email: '' });
  const [docForm,  setDocForm]  = useState({ specialty: '', qualification: '', experience_years: '', clinic_name: '' });
  const [toast,    setToast]    = useState(null);
  const [saving,   setSaving]   = useState({});
  const [loading,  setLoading]  = useState(true);
  const [pwForm,   setPwForm]   = useState({ password: '', confirm: '' });
  const [showPw,   setShowPw]   = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const [availability, setAvailability] = useState([]);
  const [availForm, setAvailForm] = useState({ day: 'monday', start_time: '09:00', end_time: '17:00', slot_duration_minutes: 15, max_patients: 20, clinic_id: '' });
  const [availSaving, setAvailSaving] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [doctorId, setDoctorId] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, docRes] = await Promise.allSettled([userApi.getMe(), doctorApi.me()]);
      if (meRes.status === 'fulfilled') {
        const u = meRes.value.data;
        setUserForm({ name: u.name || '', email: u.email || '' });
      }
      if (docRes.status === 'fulfilled') {
        const d = docRes.value.data;
        setDocForm({
          specialty:        d.specialty        || '',
          qualification:    d.qualification    || '',
          experience_years: d.experience_years ?? '',
          clinic_name:      d.clinic_name      || '',
        });
        setClinics(d.clinics || []);
        
        // Fetch availability if doctor id is available
        if (d.id) {
          setDoctorId(d.id);
          const availRes = await doctorApi.availability(d.id);
          setAvailability(Array.isArray(availRes.data) ? availRes.data : (availRes.data?.results || []));
        }
      }
    } catch {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSavePersonal = async () => {
    setSaving(s => ({ ...s, personal: true }));
    try {
      await userApi.updateMe({ name: userForm.name || undefined, email: userForm.email || undefined });
      showToast('Personal info saved!');
    } catch {
      showToast('Failed to save', 'error');
    } finally {
      setSaving(s => ({ ...s, personal: false }));
    }
  };

  const handleSaveDoc = async () => {
    setSaving(s => ({ ...s, doc: true }));
    try {
      await doctorApi.updateMe({
        specialty:        docForm.specialty        || undefined,
        qualification:    docForm.qualification    || undefined,
        experience_years: docForm.experience_years ? Number(docForm.experience_years) : undefined,
      });
      showToast('Professional details saved!');
    } catch {
      showToast('Failed to save professional info', 'error');
    } finally {
      setSaving(s => ({ ...s, doc: false }));
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.password || pwForm.password.length < 6) { showToast('Min 6 characters', 'error'); return; }
    if (pwForm.password !== pwForm.confirm) { showToast('Passwords do not match', 'error'); return; }
    setPwSaving(true);
    try {
      await userApi.changePassword(pwForm.password);
      setPwForm({ password: '', confirm: '' });
      showToast('Password changed!');
    } catch {
      showToast('Failed to change password', 'error');
    } finally {
      setPwSaving(false);
    }
  };

  const handleAddAvailability = async () => {
    if (!clinics.length) { showToast('No clinic assigned to your profile', 'error'); return; }
    if (!doctorId) { showToast('Doctor profile not loaded', 'error'); return; }
    
    setAvailSaving(true);
    try {
      const payload = {
        clinic: availForm.clinic_id || clinics[0].clinic_id,
        day: availForm.day,
        start_time: availForm.start_time,
        end_time: availForm.end_time,
        slot_duration_minutes: Number(availForm.slot_duration_minutes),
        max_patients: Number(availForm.max_patients),
      };
      await doctorApi.createAvailability(doctorId, payload);
      
      // Reload availability
      const availRes = await doctorApi.availability(doctorId);
      setAvailability(Array.isArray(availRes.data) ? availRes.data : (availRes.data?.results || []));
      showToast('Availability added!');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to add availability', 'error');
    } finally {
      setAvailSaving(false);
    }
  };

  const handleRemoveAvailability = async (availId) => {
    if (!doctorId) return;
    try {
      await doctorApi.deleteAvailability(doctorId, availId);
      
      setAvailability(prev => prev.filter(a => a.id !== availId));
      showToast('Availability removed');
    } catch {
      showToast('Failed to remove availability', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24" style={{ color: 'var(--text-muted)' }}>
      <Loader2 size={28} className="animate-spin" />
    </div>
  );

  const setU = (k, v) => setUserForm(f => ({ ...f, [k]: v }));
  const setD = (k, v) => setDocForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div className="flex items-center justify-between pb-6 border-b" style={{ borderColor: 'var(--border)' }}
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Physician Profile</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Update your credentials and personal information.</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Avatar card */}
        <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="text-center overflow-visible mt-8">
            <CardContent className="p-6 pt-0">
              <div className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-4xl font-black -mt-12 mb-4"
                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)', color: 'white' }}>
                {(userForm.name || user?.name || 'D').charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{userForm.name || 'Doctor'}</h2>
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{userForm.email}</p>
              <p className="text-xs mb-4 font-medium capitalize" style={{ color: 'var(--primary)' }}>{docForm.specialty || 'Physician'}</p>
              <div className="flex justify-center gap-2 mb-5">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>Active</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>Verified MD</span>
              </div>
              <div className="space-y-2 pt-4 border-t text-left" style={{ borderColor: 'var(--border)' }}>
                {[['Experience', docForm.experience_years ? `${docForm.experience_years} yrs` : '–'], ['Contact', `+91-${user?.contact || ''}`]].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Forms */}
        <motion.div className="lg:col-span-2 space-y-6" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
          {/* Personal */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="font-semibold text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Personal Details</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input className={inputCls + ' pl-9'} style={inputStyle} value={userForm.name} onChange={e => setU('name', e.target.value)} placeholder="Dr. Your Name" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input className={inputCls + ' pl-9'} style={inputStyle} type="email" value={userForm.email} onChange={e => setU('email', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Mobile (read-only)</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input className={inputCls + ' pl-9'} style={disabledSt} readOnly value={`+91-${user?.contact || ''}`} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Assigned Clinic</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input className={inputCls + ' pl-9'} style={disabledSt} readOnly value={docForm.clinic_name || '—'} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSavePersonal} disabled={saving.personal} className="gap-2">
                  {saving.personal ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save Personal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Professional */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="font-semibold text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Professional Details</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label style={labelStyle}>Specialty</label>
                  <select style={selectStyle} value={docForm.specialty} onChange={e => setD('specialty', e.target.value)}>
                    <option value="">Select specialty</option>
                    {SPECIALTIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Experience (years)</label>
                  <div className="relative">
                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input className={inputCls + ' pl-9'} style={inputStyle} type="number" min={0} value={docForm.experience_years} onChange={e => setD('experience_years', e.target.value)} placeholder="10" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label style={labelStyle}>Qualification</label>
                  <div className="relative">
                    <Award size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input className={inputCls + ' pl-9'} style={inputStyle} value={docForm.qualification} onChange={e => setD('qualification', e.target.value)} placeholder="MBBS, MD Cardiology" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveDoc} disabled={saving.doc} className="gap-2">
                  {saving.doc ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save Professional
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="font-semibold text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Change Password</h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label style={labelStyle}>New Password</label>
                  <div className="relative">
                    <input className={inputCls + ' pr-10'} style={inputStyle} type={showPw ? 'text' : 'password'} value={pwForm.password} onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" />
                    <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <input className={inputCls} style={inputStyle} type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Re-enter" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleChangePassword} disabled={pwSaving} className="gap-2">
                  {pwSaving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="font-semibold text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Working Hours</h3>
              
              <div className="space-y-3 mb-6">
                {availability.length === 0 ? (
                  <p className="text-sm border rounded-xl p-4 text-center" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    No working hours defined. Add your availability below.
                  </p>
                ) : (
                  availability.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-xl border text-sm" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                      <div>
                        <span className="font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{a.day}</span>
                        <span style={{ color: 'var(--text-muted)' }} className="ml-2">
                          {a.start_time.substring(0,5)} - {a.end_time.substring(0,5)}
                        </span>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {a.slot_duration_minutes} mins · max {a.max_patients} patients
                        </div>
                      </div>
                      <button onClick={() => handleRemoveAvailability(a.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 rounded-xl border space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
                <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Add New Slot</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label style={labelStyle}>Clinic</label>
                    <select style={selectStyle} value={availForm.clinic_id} onChange={e => setAvailForm(f => ({ ...f, clinic_id: e.target.value }))}>
                      {clinics.map(c => <option key={c.clinic_id} value={c.clinic_id}>{c.clinic_name}</option>)}
                      {clinics.length === 0 && <option value="">No clinics found</option>}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label style={labelStyle}>Day</label>
                    <select style={selectStyle} value={availForm.day} onChange={e => setAvailForm(f => ({ ...f, day: e.target.value }))}>
                      {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label style={labelStyle}>Start</label>
                    <input className={inputCls} style={inputStyle} type="time" value={availForm.start_time} onChange={e => setAvailForm(f => ({ ...f, start_time: e.target.value }))} />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label style={labelStyle}>End</label>
                    <input className={inputCls} style={inputStyle} type="time" value={availForm.end_time} onChange={e => setAvailForm(f => ({ ...f, end_time: e.target.value }))} />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label style={labelStyle}>Duration</label>
                    <input className={inputCls} style={inputStyle} type="number" min={5} value={availForm.slot_duration_minutes} onChange={e => setAvailForm(f => ({ ...f, slot_duration_minutes: e.target.value }))} />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label style={labelStyle}>Max Pts</label>
                    <input className={inputCls} style={inputStyle} type="number" min={1} value={availForm.max_patients} onChange={e => setAvailForm(f => ({ ...f, max_patients: e.target.value }))} />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={handleAddAvailability} disabled={availSaving || !clinics.length} className="gap-2">
                    {availSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Hours
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
