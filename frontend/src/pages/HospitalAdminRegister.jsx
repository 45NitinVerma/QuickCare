import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi, clinicApi, setTokens } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse, ArrowRight, ArrowLeft, CheckCircle2, Building2, User,
  Phone, Lock, Eye, EyeOff, Sun, Moon, AlertCircle, X, Plus, Trash2,
  MapPin, FileText, Mail, Shield, Clock,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// ─── Constants ────────────────────────────────────────────────
const STEPS = ['Account Setup', 'Verify OTP', 'Clinic Details'];

const CLINIC_TYPES = [
  { value: 'clinic',            label: 'Clinic' },
  { value: 'hospital',          label: 'Hospital' },
  { value: 'diagnostic_center', label: 'Diagnostic Centre' },
  { value: 'polyclinic',        label: 'Polyclinic' },
];

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
];

const DEFAULT_SLOTS = [
  { day_of_week: 0, start_time: '09:00', end_time: '13:00', slot_duration_minutes: 15, max_appointments: 20 },
  { day_of_week: 1, start_time: '09:00', end_time: '13:00', slot_duration_minutes: 15, max_appointments: 20 },
];

// ─── Style helpers ─────────────────────────────────────────────
const inputCls   = 'flex h-10 w-full rounded-xl px-3 text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]';
const inputStyle = { background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' };
const labelCls   = 'block text-sm font-medium mb-1.5';
const labelStyle = { color: 'var(--text-secondary)' };
const selectStyle = {
  ...inputStyle,
  height: '2.5rem', width: '100%', borderRadius: '0.75rem',
  padding: '0 0.75rem', fontSize: '0.875rem', border: '1px solid var(--border)', outline: 'none',
};

// ─── Sub-components ────────────────────────────────────────────

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300"
                style={{
                  background: done ? 'var(--primary)' : active ? 'var(--primary-muted)' : 'var(--bg-secondary)',
                  borderColor: done || active ? 'var(--primary)' : 'var(--border)',
                  color: done ? '#fff' : active ? 'var(--primary)' : 'var(--text-muted)',
                }}
              >
                {done ? <CheckCircle2 size={15} /> : i + 1}
              </div>
              <span className="text-[10px] mt-1 font-medium hidden sm:block" style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-12 sm:w-20 h-0.5 mb-4 transition-all duration-500" style={{ background: i < current ? 'var(--primary)' : 'var(--border)' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

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
      {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />}
      <input className={inputCls + (Icon ? ' pl-9' : ' pl-3')} style={inputStyle} {...props} />
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

function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === 'success' ? 'var(--success)' : 'var(--danger)';
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
      style={{ background: bg, color: '#fff', minWidth: 280 }}
    >
      <CheckCircle2 size={18} />
      <span className="text-sm font-semibold">{msg}</span>
      <button onClick={onClose} className="ml-auto"><X size={16} /></button>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function HospitalAdminRegister() {
  const navigate = useNavigate();
  const { setUserFromTokens } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [step, setStep]           = useState(0);
  const [toast, setToast]         = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors]       = useState({});
  const [apiError, setApiError]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);

  // ── Step 1 form ──
  const [form, setForm] = useState({ name: '', contact: '', password: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Step 2 OTP ──
  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const otpRefs                   = useRef([]);
  const [otpSent, setOtpSent]     = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // ── Step 3 clinic ──
  const [clinic, setClinic] = useState({
    name: '', clinic_type: 'clinic', phone: '', email: '',
    address: '', city: '', state: '', pincode: '', registration_number: '',
  });
  const setC = (k, v) => setClinic(c => ({ ...c, [k]: v }));

  const [slots, setSlots] = useState(DEFAULT_SLOTS);

  // ── OTP countdown ──
  useEffect(() => {
    if (!otpSent || canResend) return;
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, otpSent, canResend]);

  // ─── Step 1 submit → send OTP ───────────────────────────────
  const handleStep1 = async () => {
    const e = {};
    if (!form.name.trim())               e.name     = 'Full name is required';
    if (!/^\d{10}$/.test(form.contact))  e.contact  = 'Enter a valid 10-digit mobile number';
    if (form.password.length < 6)        e.password = 'Password must be at least 6 characters';
    setErrors(e);
    if (Object.keys(e).length) return;

    setApiError('');
    setIsLoading(true);
    try {
      await authApi.clinicStep1({
        contact:  Number(form.contact),
        name:     form.name.trim(),
        password: form.password,
      });
      setOtpSent(true);
      setCanResend(false);
      setCountdown(30);
      setOtp(['', '', '', '', '', '']);
      setStep(1);
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.contact?.[0]
        || 'Failed to send OTP. Please try again.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Resend OTP ─────────────────────────────────────────────
  const resendOtp = async () => {
    setApiError('');
    setIsLoading(true);
    try {
      await authApi.clinicStep1({
        contact:  Number(form.contact),
        name:     form.name.trim(),
        password: form.password,
      });
      setCanResend(false);
      setCountdown(30);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── OTP key handling ─────────────────────────────────────────
  const handleOtpKey = (i, e) => {
    const val = e.target.value.replace(/\D/, '');
    const next = [...otp];
    if (!val) {
      next[i] = '';
      setOtp(next);
      if (i > 0) otpRefs.current[i - 1]?.focus();
      return;
    }
    next[i] = val[0];
    setOtp(next);
    if (i < 5) otpRefs.current[i + 1]?.focus();
  };

  // Persist step-2 tokens + user so step-3 can use them
  const step2Ref = useRef(null);

  // ─── Step 2 submit → verify OTP ──────────────────────────────
  const handleStep2 = async () => {
    const code = otp.join('');
    if (code.length < 6) { setErrors({ otp: 'Please enter all 6 digits' }); return; }
    setErrors({});
    setApiError('');
    setIsLoading(true);
    try {
      const { data } = await authApi.clinicStep2({
        contact: Number(form.contact),
        otp:     code,
      });
      // Store tokens immediately so the authenticated step-3 request works
      setTokens(data.access, data.refresh);
      // Keep the user payload for use after step-3 completes
      step2Ref.current = { access: data.access, refresh: data.refresh, user: data.user };
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.otp?.[0]
        || 'Invalid or expired OTP.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Slot helpers ─────────────────────────────────────────────
  const addSlot = () => setSlots(s => [...s, {
    day_of_week: 0, start_time: '09:00', end_time: '13:00',
    slot_duration_minutes: 15, max_appointments: 20,
  }]);

  const removeSlot = (i) => setSlots(s => s.filter((_, idx) => idx !== i));

  const updateSlot = (i, key, val) => setSlots(s => s.map((slot, idx) =>
    idx === i ? { ...slot, [key]: key === 'day_of_week' || key === 'slot_duration_minutes' || key === 'max_appointments' ? Number(val) : val } : slot
  ));

  // ─── Step 3 submit → create clinic ───────────────────────────
  const handleStep3 = async () => {
    const e = {};
    if (!clinic.name.trim())          e.clinicName  = 'Clinic name is required';
    if (!clinic.registration_number.trim()) e.regNumber = 'Registration number is required';
    if (!clinic.state)                e.state       = 'Please select a state';
    if (!clinic.city.trim())          e.city        = 'City is required';
    if (!clinic.address.trim())       e.address     = 'Address is required';
    if (!/^\d{6}$/.test(clinic.pincode)) e.pincode  = 'Enter a valid 6-digit pincode';
    if (!/^\d{10,12}$/.test(clinic.phone.replace(/[-\s]/g, ''))) e.phone = 'Enter a valid phone number';
    if (clinic.email && !/\S+@\S+\.\S+/.test(clinic.email)) e.email = 'Enter a valid email';
    if (slots.length === 0)           e.slots       = 'Add at least one time slot';
    // Validate slot times
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].start_time >= slots[i].end_time) {
        e.slots = `Slot ${i + 1}: start time must be before end time`;
        break;
      }
    }
    setErrors(e);
    if (Object.keys(e).length) return;

    setApiError('');
    setIsLoading(true);
    try {
      await clinicApi.onboardStep3({
        name:                clinic.name.trim(),
        clinic_type:         clinic.clinic_type,
        phone:               clinic.phone,
        email:               clinic.email || undefined,
        address:             clinic.address.trim(),
        city:                clinic.city.trim(),
        state:               clinic.state,
        pincode:             clinic.pincode,
        registration_number: clinic.registration_number.trim(),
        time_slots:          slots,
      });

      // Update AuthContext so ProtectedRoute sees a logged-in Admin user
      const { access, refresh, user } = step2Ref.current;
      setUserFromTokens(access, refresh, { ...user, is_complete_onboarding: true });

      setToast('Clinic Registered Successfully! Welcome to QuickCare.');
      setTimeout(() => navigate('/admin'), 1200);
    } catch (err) {
      const d = err.response?.data;
      const msg = d?.message || d?.name?.[0] || d?.non_field_errors?.[0] || 'Registration failed. Please try again.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col hero-gradient relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)', animation: 'blobFloat 12s ease-in-out infinite' }} />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)', animation: 'blobFloat 10s ease-in-out infinite reverse' }} />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 relative z-10">
        <Link to="/login" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <HeartPulse className="text-white" size={18} />
          </div>
          <span className="font-bold text-sm">Quick<span style={{ color: 'var(--primary)' }}>Care</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            Clinic Registration
          </span>
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-all" style={{ color: 'var(--text-muted)' }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-4 pb-10">
        <div className="w-full max-w-2xl">

          {/* Header */}
          <motion.div className="text-center mb-6" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)' }}>
              <Building2 size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Register Your Clinic</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>3-step onboarding to get started on QuickCare</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-3xl border shadow-2xl overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>

            {/* Step indicator */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <StepIndicator current={step} />
            </div>

            <div className="p-6">
              {/* API Error banner */}
              <AnimatePresence>
                {apiError && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-xs px-4 py-3 rounded-xl mb-4"
                    style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                    <AlertCircle size={14} /> {apiError}
                    <button className="ml-auto" onClick={() => setApiError('')}><X size={13} /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">

                {/* ══════════════════════════════════════════════════
                    STEP 1 — Account Setup
                ══════════════════════════════════════════════════ */}
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                    <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <User size={17} style={{ color: 'var(--primary)' }} /> Admin Account Details
                    </h2>

                    <FieldWrap label="Full Name *">
                      <TextInput icon={User} placeholder="Dr. Sunil Varma" value={form.name} onChange={e => set('name', e.target.value)} />
                      <ErrMsg msg={errors.name} />
                    </FieldWrap>

                    <FieldWrap label="Mobile Number *">
                      <TextInput icon={Phone} type="tel" inputMode="numeric" placeholder="9876543210" maxLength={10}
                        value={form.contact} onChange={e => set('contact', e.target.value.replace(/\D/, ''))} />
                      <ErrMsg msg={errors.contact} />
                    </FieldWrap>

                    <FieldWrap label="Password *">
                      <div className="relative">
                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                        <input
                          type={showPwd ? 'text' : 'password'}
                          placeholder="Min 6 characters"
                          value={form.password}
                          onChange={e => set('password', e.target.value)}
                          className={inputCls + ' pl-9 pr-10'}
                          style={inputStyle}
                        />
                        <button type="button" onClick={() => setShowPwd(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                          {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <ErrMsg msg={errors.password} />
                    </FieldWrap>

                    <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--primary-muted)' }}>
                      <Shield size={14} style={{ color: 'var(--primary)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                        Role: <strong>Clinic Administrator</strong> — automatically assigned
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* ══════════════════════════════════════════════════
                    STEP 2 — OTP Verification
                ══════════════════════════════════════════════════ */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
                    <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Phone size={17} style={{ color: 'var(--primary)' }} /> Verify Your Mobile
                    </h2>

                    <div className="p-4 rounded-2xl border" style={{ background: 'var(--primary-muted)', borderColor: 'rgba(37,99,235,0.2)' }}>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                        An OTP has been sent to <strong>+91 {form.contact}</strong>
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Check the server console (dev mode) for the OTP value.
                      </p>
                    </div>

                    <div>
                      <label className={labelCls} style={labelStyle}>Enter 6-digit OTP</label>
                      <div className="flex gap-2 justify-center mt-2">
                        {otp.map((d, i) => (
                          <input
                            key={i}
                            ref={el => otpRefs.current[i] = el}
                            value={d}
                            onChange={e => handleOtpKey(i, e)}
                            onKeyDown={e => {
                              if (e.key === 'Backspace' && !d && i > 0) otpRefs.current[i - 1]?.focus();
                            }}
                            maxLength={1}
                            inputMode="numeric"
                            className="w-12 h-13 text-center text-xl font-bold rounded-xl border-2 transition-all focus:outline-none focus:border-[var(--primary)]"
                            style={{
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-primary)',
                              borderColor: d ? 'var(--primary)' : 'var(--border)',
                              height: '3.25rem',
                            }}
                          />
                        ))}
                      </div>
                      <ErrMsg msg={errors.otp} />
                    </div>

                    <div className="text-center">
                      {canResend ? (
                        <button onClick={resendOtp} disabled={isLoading}
                          className="text-sm font-semibold hover:underline disabled:opacity-50"
                          style={{ color: 'var(--primary)' }}>
                          Resend OTP
                        </button>
                      ) : (
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          Resend in <span className="font-bold" style={{ color: 'var(--primary)' }}>{countdown}s</span>
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ══════════════════════════════════════════════════
                    STEP 3 — Clinic Details
                ══════════════════════════════════════════════════ */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                    <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Building2 size={17} style={{ color: 'var(--primary)' }} /> Clinic Information
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Clinic Name */}
                      <FieldWrap label="Clinic Name *" className="sm:col-span-2">
                        <TextInput icon={Building2} placeholder="City Care Clinic" value={clinic.name} onChange={e => setC('name', e.target.value)} />
                        <ErrMsg msg={errors.clinicName} />
                      </FieldWrap>

                      {/* Clinic Type */}
                      <FieldWrap label="Clinic Type *">
                        <select style={selectStyle} value={clinic.clinic_type} onChange={e => setC('clinic_type', e.target.value)}>
                          {CLINIC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </FieldWrap>

                      {/* Registration Number */}
                      <FieldWrap label="Registration Number *">
                        <TextInput icon={FileText} placeholder="RJ-MED-2024-001" value={clinic.registration_number} onChange={e => setC('registration_number', e.target.value)} />
                        <ErrMsg msg={errors.regNumber} />
                      </FieldWrap>

                      {/* Phone */}
                      <FieldWrap label="Clinic Phone *">
                        <TextInput icon={Phone} type="tel" placeholder="9876543210" maxLength={12}
                          value={clinic.phone} onChange={e => setC('phone', e.target.value.replace(/[^\d-\s]/, ''))} />
                        <ErrMsg msg={errors.phone} />
                      </FieldWrap>

                      {/* Email */}
                      <FieldWrap label="Clinic Email">
                        <TextInput icon={Mail} type="email" placeholder="citycare@example.com"
                          value={clinic.email} onChange={e => setC('email', e.target.value)} />
                        <ErrMsg msg={errors.email} />
                      </FieldWrap>

                      {/* Address */}
                      <FieldWrap label="Address *" className="sm:col-span-2">
                        <TextInput icon={MapPin} placeholder="12, MG Road" value={clinic.address} onChange={e => setC('address', e.target.value)} />
                        <ErrMsg msg={errors.address} />
                      </FieldWrap>

                      {/* City */}
                      <FieldWrap label="City *">
                        <TextInput icon={MapPin} placeholder="Jaipur" value={clinic.city} onChange={e => setC('city', e.target.value)} />
                        <ErrMsg msg={errors.city} />
                      </FieldWrap>

                      {/* State */}
                      <FieldWrap label="State *">
                        <select style={selectStyle} value={clinic.state} onChange={e => setC('state', e.target.value)}>
                          <option value="">Select state</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ErrMsg msg={errors.state} />
                      </FieldWrap>

                      {/* Pincode */}
                      <FieldWrap label="Pincode *">
                        <TextInput placeholder="302001" maxLength={6}
                          value={clinic.pincode} onChange={e => setC('pincode', e.target.value.replace(/\D/, ''))} />
                        <ErrMsg msg={errors.pincode} />
                      </FieldWrap>
                    </div>

                    {/* ── Time Slots ── */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                          <Clock size={15} style={{ color: 'var(--primary)' }} /> Weekly Time Slots
                        </h3>
                        <button
                          onClick={addSlot}
                          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                          style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                          <Plus size={13} /> Add Slot
                        </button>
                      </div>
                      <ErrMsg msg={errors.slots} />

                      <div className="space-y-3 mt-2">
                        {slots.map((slot, i) => (
                          <div key={i} className="rounded-2xl border p-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                              {/* Day */}
                              <div className="sm:col-span-1">
                                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Day</label>
                                <select
                                  style={{ ...selectStyle, height: '2.25rem' }}
                                  value={slot.day_of_week}
                                  onChange={e => updateSlot(i, 'day_of_week', e.target.value)}
                                >
                                  {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                </select>
                              </div>

                              {/* Start */}
                              <div>
                                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Start</label>
                                <input type="time" value={slot.start_time}
                                  onChange={e => updateSlot(i, 'start_time', e.target.value)}
                                  className="h-9 w-full rounded-xl border px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                                  style={inputStyle} />
                              </div>

                              {/* End */}
                              <div>
                                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>End</label>
                                <input type="time" value={slot.end_time}
                                  onChange={e => updateSlot(i, 'end_time', e.target.value)}
                                  className="h-9 w-full rounded-xl border px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                                  style={inputStyle} />
                              </div>

                              {/* Duration */}
                              <div>
                                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Slot (min)</label>
                                <input type="number" min={5} max={60} step={5} value={slot.slot_duration_minutes}
                                  onChange={e => updateSlot(i, 'slot_duration_minutes', e.target.value)}
                                  className="h-9 w-full rounded-xl border px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                                  style={inputStyle} />
                              </div>

                              {/* Max appts + remove */}
                              <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Max appts</label>
                                  <input type="number" min={1} max={100} value={slot.max_appointments}
                                    onChange={e => updateSlot(i, 'max_appointments', e.target.value)}
                                    className="h-9 w-full rounded-xl border px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                                    style={inputStyle} />
                                </div>
                                <button
                                  onClick={() => removeSlot(i)}
                                  className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80"
                                  style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {slots.length === 0 && (
                          <div className="text-center py-8 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                            <Clock size={28} className="mx-auto mb-2 opacity-40" />
                            <p className="text-sm">No time slots added. Click <strong>+ Add Slot</strong> above.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* ── Bottom Navigation ── */}
            <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
              {/* Back */}
              {step > 0 ? (
                <button
                  onClick={() => { setStep(s => s - 1); setErrors({}); setApiError(''); }}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:bg-[var(--border)]"
                  style={{ color: 'var(--text-secondary)' }}>
                  <ArrowLeft size={15} /> Back
                </button>
              ) : (
                <Link to="/login" className="text-sm font-semibold px-4 py-2 rounded-xl" style={{ color: 'var(--text-muted)' }}>
                  Back to Login
                </Link>
              )}

              {/* Next / Submit */}
              {step === 0 && (
                <button onClick={handleStep1} disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--primary)' }}>
                  {isLoading
                    ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : <><span>Continue</span><ArrowRight size={15} /></>}
                </button>
              )}
              {step === 1 && (
                <button onClick={handleStep2} disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--primary)' }}>
                  {isLoading
                    ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : <><span>Verify & Continue</span><ArrowRight size={15} /></>}
                </button>
              )}
              {step === 2 && (
                <button onClick={handleStep3} disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--success)' }}>
                  {isLoading
                    ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : <><CheckCircle2 size={15} /><span>Complete Registration</span></>}
                </button>
              )}
            </div>
          </motion.div>

          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            Already registered?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Sign In</Link>
          </p>
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
