import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi, setTokens } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse, ArrowRight, ArrowLeft, CheckCircle2, User, Phone,
  Shield, Sun, Moon, X, AlertCircle, Heart, Pill, ChevronDown, Key
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const STEPS = ['Account Setup', 'Verify OTP', 'Complete Profile'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['male', 'female', 'other'];
const GENDER_LABELS = { male: 'Male', female: 'Female', other: 'Other' };
const INDIAN_STATES = [
  'Andhra Pradesh', 'Gujarat', 'Delhi', 'Goa', 'Haryana', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];

// ─── Style helpers ────────────────────────────────────────────────────────────
const inputCls   = 'flex h-10 w-full rounded-xl px-3 text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]';
const inputStyle = { background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' };
const labelCls   = 'block text-sm font-medium mb-1.5';
const labelStyle = { color: 'var(--text-secondary)' };
const selectStyle = { ...inputStyle, height: '2.5rem', width: '100%', borderRadius: '0.75rem', padding: '0 0.75rem', fontSize: '0.875rem', border: '1px solid var(--border)', outline: 'none' };

// ─── Sub-components ───────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((label, i) => {
        const done = i < current; const active = i === current;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300"
                style={{ background: done ? 'var(--primary)' : active ? 'var(--primary-muted)' : 'var(--bg-secondary)', borderColor: done || active ? 'var(--primary)' : 'var(--border)', color: done ? '#fff' : active ? 'var(--primary)' : 'var(--text-muted)' }}>
                {done ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className="text-[10px] mt-1 font-medium hidden sm:block" style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="w-10 sm:w-16 h-0.5 mb-4 transition-all duration-300" style={{ background: i < current ? 'var(--primary)' : 'var(--border)' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function FieldWrap({ label, children }) {
  return <div><label className={labelCls} style={labelStyle}>{label}</label>{children}</div>;
}

function TextInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />}
      <input className={inputCls + (Icon ? ' pl-9' : ' pl-3')} style={inputStyle} {...props} />
    </div>
  );
}

function Accordion({ title, icon: Icon, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-[var(--bg-secondary)]">
        <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          <Icon size={15} style={{ color: 'var(--primary)' }} /> {title}
        </span>
        <ChevronDown size={15} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1" style={{ borderTop: '1px solid var(--border)' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AbhaModal({ name, onClose }) {
  const abhaId = `ABHA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <motion.div className="relative w-full max-w-sm" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', damping: 18 }}>
        <div className="rounded-3xl p-6 text-center shadow-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 8px 24px rgba(16,185,129,0.4)' }}>
            <Shield size={30} className="text-white" />
          </div>
          <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Registration Complete!</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Your QuickCare account is ready</p>
          <div className="rounded-2xl p-5 mb-5 text-left relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)' }}>
            <div className="flex items-center gap-2 mb-4">
              <HeartPulse size={16} className="text-white" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Ayushman Bharat Health Account</span>
            </div>
            <p className="text-2xl font-black tracking-widest text-white mb-2">{abhaId}</p>
            <p className="text-sm text-white/90 font-semibold">{name}</p>
            <p className="text-xs text-white/60 mt-1">QuickCare Health Network · Verified</p>
          </div>
          <button onClick={onClose}
            className="w-full h-11 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            Go to My Dashboard <ArrowRight size={14} className="inline ml-1" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function PatientRegister() {
  const navigate = useNavigate();
  const { setUserFromTokens } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [step, setStep]         = useState(0);
  const [errors, setErrors]     = useState({});
  const [showAbha, setShowAbha] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  // OTP state
  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const otpRefs                   = useRef([]);
  const step2TokenRef             = useRef(null);  // holds { access, refresh } from step 2
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Form data
  const [form, setForm] = useState({
    // Step 0
    name: '', contact: '', password: '',
    // Step 2 (profile)
    gender: '', age: '',
    email: '', blood_group: '', state: '', town: '',
    address_area: '', house_no: '', pincode: '', landmark: '',
    allergies: '', chronic_conditions: '', current_medications: '',
    past_surgeries: '', family_history: '',
    height_cm: '', weight_kg: '',
    emergency_contact_name: '', emergency_contact_number: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Countdown timer for OTP resend (runs when on step 1)
  useEffect(() => {
    if (step !== 1 || canResend || countdown <= 0) {
      if (countdown <= 0) setCanResend(true);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, step, canResend]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.name.trim()) e.name = 'Full name required';
      if (!/^\d{10}$/.test(form.contact)) e.contact = 'Valid 10-digit mobile required';
      if (form.password.length < 6) e.password = 'Min 6 characters';
    }
    if (step === 2) {
      if (!form.gender) e.gender = 'Select gender';
      if (!form.age || isNaN(form.age) || Number(form.age) < 1) e.age = 'Valid age required';
      if (form.emergency_contact_number && !/^\d{10}$/.test(form.emergency_contact_number))
        e.emergency_contact_number = 'Valid 10-digit number';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── STEP 0 → Call step1 API to send OTP, then advance ─────────────────────
  const handleSendOtp = async () => {
    if (!validate()) return;
    setApiError('');
    setLoading(true);
    try {
      await authApi.patientStep1({
        contact:  Number(form.contact),
        name:     form.name,
        password: form.password,
      });
      setOtp(['', '', '', '', '', '']);
      setCountdown(30);
      setCanResend(false);
      setStep(1);
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.contact?.[0]
        || 'Failed to send OTP. Please check your number.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    setApiError('');
    setLoading(true);
    try {
      await authApi.patientStep1({
        contact:  Number(form.contact),
        name:     form.name,
        password: form.password,
      });
      setOtp(['', '', '', '', '', '']);
      setCountdown(30);
      setCanResend(false);
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 1 → Verify OTP (step2 API) → account created, JWT received ───────
  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) { setErrors({ otp: 'Enter all 6 digits' }); return; }
    setApiError('');
    setErrors({});
    setLoading(true);
    try {
      const { data } = await authApi.patientStep2({
        contact: Number(form.contact),
        otp:     code,
      });
      // Store JWT tokens so step3 PUT will be authorized
      setTokens(data.access, data.refresh);
      // Also keep them for setUserFromTokens after step3 completes
      step2TokenRef.current = { access: data.access, refresh: data.refresh };
      // Advance to profile completion step
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.otp?.[0]
        || 'OTP verification failed. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2 → Complete profile (step3 API) ─────────────────────────────────
  const handleCompleteProfile = async () => {
    if (!validate()) return;
    setApiError('');
    setLoading(true);
    try {
      const { data } = await authApi.patientStep3({
        gender:                   form.gender,
        age:                      Number(form.age),
        email:                    form.email || undefined,
        blood_group:              form.blood_group || undefined,
        address_area:             form.address_area || undefined,
        house_no:                 form.house_no || undefined,
        town:                     form.town || undefined,
        state:                    form.state || undefined,
        pincode:                  form.pincode || undefined,
        landmark:                 form.landmark || undefined,
        allergies:                form.allergies || undefined,
        chronic_conditions:       form.chronic_conditions || undefined,
        current_medications:      form.current_medications || undefined,
        past_surgeries:           form.past_surgeries || undefined,
        family_history:           form.family_history || undefined,
        height_cm:                form.height_cm ? Number(form.height_cm) : undefined,
        weight_kg:                form.weight_kg ? Number(form.weight_kg) : undefined,
        emergency_contact_name:   form.emergency_contact_name || undefined,
        emergency_contact_number: form.emergency_contact_number ? Number(form.emergency_contact_number) : undefined,
      });
      const tokens = step2TokenRef.current;
      setUserFromTokens(tokens?.access, tokens?.refresh, { ...data.user, is_complete_onboarding: true });
      setShowAbha(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Profile save failed. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  // OTP key handler
  const handleOtpKey = (i, e) => {
    const val = e.target.value.replace(/\D/, '');
    if (!val) {
      const next = [...otp]; next[i] = ''; setOtp(next);
      if (i > 0) otpRefs.current[i - 1]?.focus(); return;
    }
    const next = [...otp]; next[i] = val[0]; setOtp(next);
    if (i < 5) otpRefs.current[i + 1]?.focus();
  };

  const errMsg = (k) => errors[k] && (
    <p className="mt-1 text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
      <AlertCircle size={11} /> {errors[k]}
    </p>
  );

  return (
    <div className="min-h-screen flex flex-col hero-gradient relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)', animation: 'blobFloat 12s ease-in-out infinite' }} />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)', animation: 'blobFloat 10s ease-in-out infinite reverse' }} />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 relative z-10">
        <Link to="/login" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <HeartPulse className="text-white" size={18} />
          </div>
          <span className="font-bold text-sm">Quick<span style={{ color: 'var(--primary)' }}>Care</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>
            Patient Registration
          </span>
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-all" style={{ color: 'var(--text-muted)' }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-4 pb-8">
        <div className="w-full max-w-xl">
          <motion.div className="text-center mb-6" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #0f766e 100%)' }}>
              <Heart size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Create Patient Account</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Quick 3-step setup · Get your ABHA ID instantly</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-3xl border shadow-[var(--shadow-xl)] overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}><StepIndicator current={step} /></div>

            <div className="p-6">
              <AnimatePresence mode="wait">

                {/* ══ STEP 0: Account Setup — send OTP ══════════════════════════════════════ */}
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <User size={17} style={{ color: 'var(--primary)' }} /> Account Information
                    </h2>

                    {apiError && (
                      <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                        <AlertCircle size={13} /> {apiError}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <FieldWrap label="Full Name *">
                          <TextInput icon={User} placeholder="Rahul Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
                          {errMsg('name')}
                        </FieldWrap>
                      </div>
                      <FieldWrap label="Mobile Number *">
                        <TextInput icon={Phone} type="tel" inputMode="numeric" placeholder="9876543210" maxLength={10} value={form.contact} onChange={e => set('contact', e.target.value)} />
                        {errMsg('contact')}
                      </FieldWrap>
                      <FieldWrap label="Password *">
                        <TextInput type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
                        {errMsg('password')}
                      </FieldWrap>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-2xl border" style={{ background: 'rgba(16,185,129,0.07)', borderColor: 'rgba(16,185,129,0.2)' }}>
                      <Shield size={16} style={{ color: '#10b981', marginTop: 2 }} />
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        An OTP will be sent to your mobile number to verify your identity before creating your account.
                      </p>
                    </div>

                    <button onClick={handleSendOtp} disabled={loading}
                      className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'var(--primary)', color: '#fff' }}>
                      {loading
                        ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        : <><Phone size={16} /> Send OTP to +91 {form.contact || '••••••••••'}</>}
                    </button>
                  </motion.div>
                )}

                {/* ══ STEP 1: Verify OTP ════════════════════════════════════════════════════ */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <h2 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Key size={17} style={{ color: 'var(--primary)' }} /> Verify OTP
                    </h2>

                    <div className="p-4 rounded-2xl border" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>OTP sent to: <strong>+91 {form.contact}</strong></p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Please enter the 6-digit code from your SMS</p>
                    </div>

                    {apiError && (
                      <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                        <AlertCircle size={13} /> {apiError}
                      </div>
                    )}

                    <div>
                      <label className={labelCls} style={labelStyle}>Enter 6-digit OTP</label>
                      <div className="flex gap-2 justify-center mt-2">
                        {otp.map((d, i) => (
                          <input key={i} ref={el => otpRefs.current[i] = el}
                            value={d} onChange={e => handleOtpKey(i, e)}
                            onKeyDown={e => e.key === 'Backspace' && !d && i > 0 && otpRefs.current[i - 1]?.focus()}
                            maxLength={1} inputMode="numeric"
                            className="w-11 h-12 text-center text-lg font-bold rounded-xl border-2 transition-all focus:outline-none focus:border-[var(--primary)]"
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: d ? '#10b981' : 'var(--border)' }}
                          />
                        ))}
                      </div>
                      {errMsg('otp')}
                    </div>

                    <div className="text-center">
                      {canResend ? (
                        <button onClick={resendOtp} disabled={loading} className="text-sm font-semibold hover:underline disabled:opacity-50" style={{ color: '#10b981' }}>
                          Resend OTP
                        </button>
                      ) : (
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          Resend in <span className="font-bold" style={{ color: '#10b981' }}>{countdown}s</span>
                        </p>
                      )}
                    </div>

                    <button onClick={handleVerifyOtp} disabled={loading || otp.join('').length < 6}
                      className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: '#10b981', color: '#fff' }}>
                      {loading
                        ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        : <><CheckCircle2 size={16} /> Verify &amp; Create Account</>}
                    </button>
                  </motion.div>
                )}

                {/* ══ STEP 2: Complete Profile & Medical Details ═══════════════════════════ */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Heart size={17} style={{ color: '#10b981' }} /> Complete Your Profile
                    </h2>

                    {apiError && (
                      <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                        <AlertCircle size={13} /> {apiError}
                      </div>
                    )}

                    {/* Required */}
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Required</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FieldWrap label="Gender *">
                        <select style={selectStyle} value={form.gender} onChange={e => set('gender', e.target.value)}>
                          <option value="">Select gender</option>
                          {GENDERS.map(g => <option key={g} value={g}>{GENDER_LABELS[g]}</option>)}
                        </select>
                        {errMsg('gender')}
                      </FieldWrap>
                      <FieldWrap label="Age *">
                        <TextInput type="number" placeholder="28" min={1} max={120} value={form.age} onChange={e => set('age', e.target.value)} />
                        {errMsg('age')}
                      </FieldWrap>
                    </div>

                    {/* Personal optional */}
                    <p className="text-xs font-semibold uppercase tracking-widest mt-2" style={{ color: 'var(--text-muted)' }}>Personal Details (optional)</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FieldWrap label="Email">
                        <TextInput type="email" placeholder="rahul@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                      </FieldWrap>
                      <FieldWrap label="Blood Group">
                        <select style={selectStyle} value={form.blood_group} onChange={e => set('blood_group', e.target.value)}>
                          <option value="">Select blood group</option>
                          {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </FieldWrap>
                      <FieldWrap label="Height (cm)">
                        <TextInput type="number" placeholder="175" value={form.height_cm} onChange={e => set('height_cm', e.target.value)} />
                      </FieldWrap>
                      <FieldWrap label="Weight (kg)">
                        <TextInput type="number" step="0.1" placeholder="70.5" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} />
                      </FieldWrap>
                    </div>

                    {/* Address optional */}
                    <p className="text-xs font-semibold uppercase tracking-widest mt-2" style={{ color: 'var(--text-muted)' }}>Address (optional)</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FieldWrap label="State">
                        <select style={selectStyle} value={form.state} onChange={e => set('state', e.target.value)}>
                          <option value="">Select state</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </FieldWrap>
                      <FieldWrap label="City / Town">
                        <TextInput placeholder="Jaipur" value={form.town} onChange={e => set('town', e.target.value)} />
                      </FieldWrap>
                      <FieldWrap label="House No">
                        <TextInput placeholder="12A" value={form.house_no} onChange={e => set('house_no', e.target.value)} />
                      </FieldWrap>
                      <FieldWrap label="Area / Address">
                        <TextInput placeholder="Near City Hospital" value={form.address_area} onChange={e => set('address_area', e.target.value)} />
                      </FieldWrap>
                      <FieldWrap label="Landmark">
                        <TextInput placeholder="Opp. SBI Bank" value={form.landmark} onChange={e => set('landmark', e.target.value)} />
                      </FieldWrap>
                      <FieldWrap label="Pincode">
                        <TextInput type="tel" inputMode="numeric" placeholder="302001" value={form.pincode} onChange={e => set('pincode', e.target.value)} />
                      </FieldWrap>
                    </div>

                    {/* Emergency contact optional */}
                    <p className="text-xs font-semibold uppercase tracking-widest mt-2" style={{ color: 'var(--text-muted)' }}>Emergency Contact (optional)</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FieldWrap label="Contact Name">
                        <TextInput icon={User} placeholder="Priya Sharma" value={form.emergency_contact_name} onChange={e => set('emergency_contact_name', e.target.value)} />
                      </FieldWrap>
                      <FieldWrap label="Contact Number">
                        <TextInput icon={Phone} type="tel" inputMode="numeric" placeholder="9123456789" maxLength={10} value={form.emergency_contact_number} onChange={e => set('emergency_contact_number', e.target.value)} />
                        {errMsg('emergency_contact_number')}
                      </FieldWrap>
                    </div>

                    {/* Medical optional */}
                    <p className="text-xs font-semibold uppercase tracking-widest mt-2" style={{ color: 'var(--text-muted)' }}>Medical Details (optional)</p>
                    <div className="space-y-2">
                      <Accordion title="Known Allergies" icon={AlertCircle}>
                        <input className={inputCls + ' mt-2 pl-3'} style={inputStyle} placeholder="e.g. Penicillin, Peanuts" value={form.allergies} onChange={e => set('allergies', e.target.value)} />
                      </Accordion>
                      <Accordion title="Chronic Conditions" icon={Heart}>
                        <input className={inputCls + ' mt-2 pl-3'} style={inputStyle} placeholder="e.g. Hypertension, Diabetes" value={form.chronic_conditions} onChange={e => set('chronic_conditions', e.target.value)} />
                      </Accordion>
                      <Accordion title="Current Medications" icon={Pill}>
                        <input className={inputCls + ' mt-2 pl-3'} style={inputStyle} placeholder="e.g. Amlodipine 5mg daily" value={form.current_medications} onChange={e => set('current_medications', e.target.value)} />
                      </Accordion>
                      <Accordion title="Past Surgeries" icon={AlertCircle}>
                        <input className={inputCls + ' mt-2 pl-3'} style={inputStyle} placeholder="e.g. Appendectomy 2020" value={form.past_surgeries} onChange={e => set('past_surgeries', e.target.value)} />
                      </Accordion>
                      <Accordion title="Family Medical History" icon={User}>
                        <input className={inputCls + ' mt-2 pl-3'} style={inputStyle} placeholder="e.g. Diabetes (father)" value={form.family_history} onChange={e => set('family_history', e.target.value)} />
                      </Accordion>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Bottom Nav */}
            <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
              {step === 0 ? (
                <Link to="/login" className="text-sm font-semibold px-4 py-2 rounded-xl" style={{ color: 'var(--text-muted)' }}>Back to Login</Link>
              ) : step === 1 ? (
                <button onClick={() => { setStep(0); setErrors({}); setApiError(''); }}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[var(--border)]" style={{ color: 'var(--text-secondary)' }}>
                  <ArrowLeft size={15} /> Edit Info
                </button>
              ) : (
                <span /> // No back on step 2 — account is already created
              )}

              {step === 2 && (
                <button onClick={handleCompleteProfile} disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#10b981' }}>
                  {loading
                    ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    : <><CheckCircle2 size={15} /> Complete Registration</>}
                </button>
              )}
            </div>
          </motion.div>

          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Sign In</Link>
          </p>
        </div>
      </div>

      {/* ABHA Modal */}
      <AnimatePresence>
        {showAbha && <AbhaModal name={form.name} onClose={() => { setShowAbha(false); navigate('/patient'); }} />}
      </AnimatePresence>
    </div>
  );
}
