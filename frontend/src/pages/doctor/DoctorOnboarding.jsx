import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi, setTokens, doctorApi } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, User, Phone, Mail, MapPin, FileText,
  CheckCircle2, AlertCircle, ArrowRight, X, Eye, EyeOff, HeartPulse,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────
const SPECIALTIES = [
  { value: 'general_medicine', label: 'General Medicine' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'gynecology', label: 'Gynecology' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'ent', label: 'ENT' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'dentistry', label: 'Dentistry' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'pathology', label: 'Pathology' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'urology', label: 'Urology' },
  { value: 'other', label: 'Other' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['male', 'female', 'others'];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
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

// ─── Styles ───────────────────────────────────────────────────
const inputCls = 'flex h-10 w-full rounded-xl px-3 text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]';
const inputStyle = { background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' };
const labelCls = 'block text-sm font-medium mb-1.5';
const labelStyle = { color: 'var(--text-secondary)' };
const selectStyle = {
  ...inputStyle,
  height: '2.5rem', width: '100%', borderRadius: '0.75rem',
  padding: '0 0.75rem', fontSize: '0.875rem', border: '1px solid var(--border)', outline: 'none',
};

// ─── Sub-components ───────────────────────────────────────────
function FieldWrap({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className={labelCls} style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function TextInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />}
      <input className={inputCls + (Icon ? ' pl-9' : '')} style={inputStyle} {...props} />
    </div>
  );
}

function ErrMsg({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
      <AlertCircle size={11} /> {msg}
    </p>
  );
}

function SectionHead({ icon: Icon, title }) {
  return (
    <h3 className="text-sm font-bold flex items-center gap-2 pb-2 mb-4 border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
      <Icon size={15} style={{ color: 'var(--primary)' }} /> {title}
    </h3>
  );
}

// ─── Main Component ───────────────────────────────────────────
export function DoctorOnboarding() {
  const navigate = useNavigate();
  const { user, setUserFromTokens } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    // Personal
    name: user?.name || '',
    gender: '',
    age: '',
    email: user?.email || '',
    blood_group: '',
    // Professional (doctor)
    specialty: '',
    qualification: '',
    experience_years: '',
    // Address
    house_no: '',
    address_area: '',
    town: '',
    state: '',
    pincode: '',
  });
  const [workingHours, setWorkingHours] = useState([{
    day: 'monday', start_time: '09:00', end_time: '17:00', slot_duration_minutes: 15, max_patients: 20
  }]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Validation ───────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.gender) e.gender = 'Please select gender';
    if (!form.age || isNaN(form.age) || Number(form.age) < 18)
      e.age = 'Enter a valid age (18+)';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Enter a valid email';
    if (form.pincode && !/^\d{6}$/.test(form.pincode))
      e.pincode = 'Pincode must be 6 digits';
      
    if (user?.role === 'Doctor') {
      if (workingHours.length === 0) e.workingHours = 'At least one working hour slot is required';
      workingHours.forEach((slot, i) => {
        if (!slot.day || !slot.start_time || !slot.end_time || !slot.slot_duration_minutes || !slot.max_patients) {
          e[`slot_${i}`] = 'All fields are required for each slot';
        }
      });
    }
    return e;
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setApiError('');
    setIsLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        gender: form.gender || undefined,
        age: form.age ? Number(form.age) : undefined,
        email: form.email || undefined,
        blood_group: form.blood_group || undefined,
        specialty: form.specialty || undefined,
        qualification: form.qualification || undefined,
        experience_years: form.experience_years ? Number(form.experience_years) : undefined,
        address_area: form.address_area || undefined,
        house_no: form.house_no || undefined,
        town: form.town || undefined,
        state: form.state || undefined,
        pincode: form.pincode || undefined,
      };

      const { data } = await authApi.memberComplete(payload);

      // We need valid tokens right away to call doctor setup
      setTokens(data.access, data.refresh);

      // Create initial availability slot if doctor
      if (user?.role === 'Doctor') {
        const docRes = await doctorApi.me();
        const docId = docRes.data?.id;
        const clinicId = docRes.data?.clinics?.[0]?.clinic_id;
        if (docId) {
          for (const slot of workingHours) {
            const availPayload = {
              day: slot.day,
              start_time: slot.start_time,
              end_time: slot.end_time,
              slot_duration_minutes: Number(slot.slot_duration_minutes),
              max_patients: Number(slot.max_patients),
            };
            if (clinicId) availPayload.clinic = clinicId;
            try {
              await doctorApi.createAvailability(docId, availPayload);
            } catch(e) { console.error('Failed to create slot', e); }
          }
        }
      }

      // Update auth context with the fully onboarded user
      setUserFromTokens(data.access, data.refresh, data.user);
      setDone(true);
      setTimeout(() => navigate('/doctor'), 1400);
    } catch (err) {
      const d = err.response?.data;
      const msg = d?.message || d?.detail || d?.non_field_errors?.[0] || 'Failed to complete profile. Please try again.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: 'var(--success)' }}>
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            Welcome to QuickCare!
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Your profile is set up. Redirecting to your dashboard…
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col hero-gradient relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)' }} />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 relative z-10">
        <div className="flex items-center gap-2">
          <img src="/logo.jpeg" alt="QuickCare" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-bold text-sm">Quick<span style={{ color: 'var(--primary)' }}>Care</span></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}>
            First-Time Setup
          </span>
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-all"
            style={{ color: 'var(--text-muted)' }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-4 pb-12">
        <div className="w-full max-w-2xl">

          {/* Header */}
          <motion.div className="text-center mb-6" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)' }}>
              <Stethoscope size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Complete Your Profile
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              You're logging in for the first time. Fill in your details to get started.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-3xl border shadow-2xl overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>

            <div className="p-6 space-y-8">
              {/* API Error */}
              <AnimatePresence>
                {apiError && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
                    style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                    <AlertCircle size={14} /> {apiError}
                    <button className="ml-auto" onClick={() => setApiError('')}><X size={13} /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Section 1: Personal Details ── */}
              <div>
                <SectionHead icon={User} title="Personal Details" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldWrap label="Full Name *" className="sm:col-span-2">
                    <TextInput icon={User} placeholder="Dr. Suresh Yadav" value={form.name} onChange={e => set('name', e.target.value)} />
                    <ErrMsg msg={errors.name} />
                  </FieldWrap>

                  <FieldWrap label="Gender *">
                    <select style={selectStyle} value={form.gender} onChange={e => set('gender', e.target.value)}>
                      <option value="">Select gender</option>
                      {GENDERS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                    </select>
                    <ErrMsg msg={errors.gender} />
                  </FieldWrap>

                  <FieldWrap label="Age *">
                    <TextInput type="number" min={18} max={100} placeholder="35" value={form.age} onChange={e => set('age', e.target.value)} />
                    <ErrMsg msg={errors.age} />
                  </FieldWrap>

                  <FieldWrap label="Email">
                    <TextInput icon={Mail} type="email" placeholder="suresh@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                    <ErrMsg msg={errors.email} />
                  </FieldWrap>

                  <FieldWrap label="Blood Group">
                    <select style={selectStyle} value={form.blood_group} onChange={e => set('blood_group', e.target.value)}>
                      <option value="">Select blood group</option>
                      {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </FieldWrap>
                </div>
              </div>

              {/* ── Section 2: Professional Details ── */}
              <div>
                <SectionHead icon={Stethoscope} title="Professional Details (Doctor)" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldWrap label="Specialty">
                    <select style={selectStyle} value={form.specialty} onChange={e => set('specialty', e.target.value)}>
                      <option value="">Select specialty</option>
                      {SPECIALTIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </FieldWrap>

                  <FieldWrap label="Experience (years)">
                    <TextInput type="number" min={0} max={60} placeholder="10" value={form.experience_years} onChange={e => set('experience_years', e.target.value)} />
                  </FieldWrap>

                  <FieldWrap label="Qualification" className="sm:col-span-2">
                    <TextInput icon={FileText} placeholder="MBBS, MD Cardiology" value={form.qualification} onChange={e => set('qualification', e.target.value)} />
                  </FieldWrap>
                </div>
              </div>

              {/* ── Section 3: Address ── */}
              <div>
                <SectionHead icon={MapPin} title="Home Address" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldWrap label="House / Flat No.">
                    <TextInput placeholder="5B" value={form.house_no} onChange={e => set('house_no', e.target.value)} />
                  </FieldWrap>

                  <FieldWrap label="Area / Street">
                    <TextInput icon={MapPin} placeholder="Vaishali Nagar" value={form.address_area} onChange={e => set('address_area', e.target.value)} />
                  </FieldWrap>

                  <FieldWrap label="Town / City">
                    <TextInput placeholder="Jaipur" value={form.town} onChange={e => set('town', e.target.value)} />
                  </FieldWrap>

                  <FieldWrap label="State">
                    <select style={selectStyle} value={form.state} onChange={e => set('state', e.target.value)}>
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </FieldWrap>

                  <FieldWrap label="Pincode">
                    <TextInput placeholder="302021" maxLength={6} value={form.pincode}
                      onChange={e => set('pincode', e.target.value.replace(/\D/, ''))} />
                    <ErrMsg msg={errors.pincode} />
                  </FieldWrap>
                </div>
              </div>

              {/* ── Section 4: Working Hours ── */}
              {user?.role === 'Doctor' && (
                <div>
                  <SectionHead icon={HeartPulse} title="Working Hours (Mandatory)" />
                  <div className="space-y-4">
                    {workingHours.map((slot, index) => (
                      <div key={index} className="p-4 rounded-xl border relative" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
                        {workingHours.length > 1 && (
                          <button type="button" onClick={() => setWorkingHours(wh => wh.filter((_, i) => i !== index))} className="absolute top-3 right-3 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <X size={14} />
                          </button>
                        )}
                        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4 pr-6">
                          <FieldWrap label="Day *">
                            <select style={selectStyle} value={slot.day} onChange={e => {
                              const newWh = [...workingHours]; newWh[index].day = e.target.value; setWorkingHours(newWh);
                            }}>
                              {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                            </select>
                          </FieldWrap>
                          <FieldWrap label="Start *">
                            <TextInput type="time" value={slot.start_time} onChange={e => {
                              const newWh = [...workingHours]; newWh[index].start_time = e.target.value; setWorkingHours(newWh);
                            }} />
                          </FieldWrap>
                          <FieldWrap label="End *">
                            <TextInput type="time" value={slot.end_time} onChange={e => {
                              const newWh = [...workingHours]; newWh[index].end_time = e.target.value; setWorkingHours(newWh);
                            }} />
                          </FieldWrap>
                          <FieldWrap label="Duration (m) *">
                            <TextInput type="number" min={5} value={slot.slot_duration_minutes} onChange={e => {
                              const newWh = [...workingHours]; newWh[index].slot_duration_minutes = e.target.value; setWorkingHours(newWh);
                            }} />
                          </FieldWrap>
                          <FieldWrap label="Patients *">
                            <TextInput type="number" min={1} value={slot.max_patients} onChange={e => {
                              const newWh = [...workingHours]; newWh[index].max_patients = e.target.value; setWorkingHours(newWh);
                            }} />
                          </FieldWrap>
                        </div>
                        <ErrMsg msg={errors[`slot_${index}`]} />
                      </div>
                    ))}
                    <ErrMsg msg={errors.workingHours} />
                    {DAYS.filter(d => !workingHours.some(s => s.day === d.value)).length > 0 && (
                      <button type="button" onClick={() => setWorkingHours(wh => {
                        const used = wh.map(s => s.day);
                        const nextDay = DAYS.find(d => !used.includes(d.value))?.value || 'monday';
                        return [...wh, { day: nextDay, start_time: '09:00', end_time: '17:00', slot_duration_minutes: 15, max_patients: 20 }];
                      })}
                        className="text-sm font-semibold flex items-center gap-2 transition-opacity hover:opacity-80" style={{ color: 'var(--primary)', marginTop: '0.5rem' }}>
                        + Add another slot
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div className="flex justify-end px-6 py-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--success)' }}>
                {isLoading
                  ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : <><CheckCircle2 size={15} /><span>Complete Profile</span></>}
              </button>
            </div>
          </motion.div>

          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            All fields marked with <span className="font-bold" style={{ color: 'var(--danger)' }}>*</span> are required.
            Professional fields are optional for non-doctor staff.
          </p>
        </div>
      </div>
    </div>
  );
}
