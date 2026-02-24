import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse, ArrowRight, ArrowLeft, CheckCircle2, User, Mail, Phone,
  Calendar, ChevronDown, Shield, Sun, Moon, X, AlertCircle, Heart, Pill
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const STEPS = ['Basic Info', 'Medical Identity', 'Verify & Complete'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const INDIAN_STATES = [
  'Andhra Pradesh', 'Gujarat', 'Delhi', 'Goa', 'Haryana', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
];

const inputCls = 'flex h-10 w-full rounded-xl px-3 text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]';
const inputStyle = { background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' };
const labelCls = 'block text-sm font-medium mb-1.5';
const labelStyle = { color: 'var(--text-secondary)' };
const selectStyle = { ...inputStyle, height: '2.5rem', width: '100%', borderRadius: '0.75rem', padding: '0 0.75rem', fontSize: '0.875rem', border: '1px solid var(--border)', outline: 'none' };

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

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
      style={{ background: 'var(--success)', color: '#fff', minWidth: 280 }}>
      <CheckCircle2 size={18} />
      <span className="text-sm font-semibold">{msg}</span>
      <button onClick={onClose}><X size={16} /></button>
    </motion.div>
  );
}

// ABHA Card Modal
function AbhaModal({ abhaId, name, onClose }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <motion.div className="relative w-full max-w-sm" initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', damping: 18 }}>
        <div className="rounded-3xl p-6 text-center shadow-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 8px 24px rgba(16,185,129,0.4)' }}>
            <Shield size={30} className="text-white" />
          </div>
          <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>ABHA ID Generated!</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Your unique health identity has been created</p>

          {/* ABHA Card */}
          <div className="rounded-2xl p-5 mb-5 text-left relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10" style={{ background: 'white', transform: 'translate(25%, -25%)' }} />
            <div className="flex items-center gap-2 mb-4">
              <HeartPulse size={16} className="text-white" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Ayushman Bharat Health Account</span>
            </div>
            <p className="text-2xl font-black tracking-widest text-white mb-2">{abhaId}</p>
            <p className="text-sm text-white/90 font-semibold">{name}</p>
            <p className="text-xs text-white/60 mt-1">QuickCare Health Network · Verified</p>
          </div>

          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
            Your ABHA ID is saved to your profile. Use it for all healthcare services across India.
          </p>
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

export function PatientRegister() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [showAbha, setShowAbha] = useState(false);
  const [generatedAbha, setGeneratedAbha] = useState('');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', mobile: '', dob: '', gender: '',
    bloodGroup: '', emergencyName: '', emergencyNumber: '', state: '', city: '', address: '',
    allergies: '', conditions: '', medications: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!otpSent || canResend || countdown <= 0) {
      if (countdown <= 0) setCanResend(true);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, otpSent, canResend]);

  const sendOtp = () => {
    setOtpSent(true); setCanResend(false); setCountdown(30);
    setOtp(['', '', '', '', '', '']);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpKey = (i, e) => {
    const val = e.target.value.replace(/\D/, '');
    if (!val) {
      const next = [...otp]; next[i] = ''; setOtp(next);
      if (i > 0) otpRefs.current[i - 1]?.focus(); return;
    }
    const next = [...otp]; next[i] = val[0]; setOtp(next);
    if (i < 5) otpRefs.current[i + 1]?.focus();
  };

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.name.trim()) e.name = 'Full name required';
      if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
      if (!/^\+?\d{10,13}$/.test(form.mobile.replace(/\s/g, ''))) e.mobile = 'Valid mobile required';
      if (!form.dob) e.dob = 'Date of birth required';
      if (!form.gender) e.gender = 'Select gender';
    }
    if (step === 1) {
      if (!form.bloodGroup) e.bloodGroup = 'Select blood group';
      if (!form.emergencyName.trim()) e.emergencyName = 'Emergency contact name required';
      if (!/^\+?\d{10,13}$/.test(form.emergencyNumber.replace(/\s/g, ''))) e.emergencyNumber = 'Valid emergency number';
      if (!form.state) e.state = 'Select state';
      if (!form.city.trim()) e.city = 'City required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const prev = () => { setStep(s => s - 1); setErrors({}); };

  const handleComplete = () => {
    const code = otp.join('');
    if (code.length < 6) { setErrors({ otp: 'Enter all 6 digits' }); return; }
    setVerifying(true);
    setTimeout(() => {
      const newUser = register('Patient', {
        name: form.name, email: form.email, mobile: form.mobile,
        dob: form.dob, gender: form.gender, bloodGroup: form.bloodGroup,
        state: form.state, city: form.city, address: form.address,
        emergencyContact: { name: form.emergencyName, number: form.emergencyNumber },
        medicalInfo: { allergies: form.allergies, conditions: form.conditions, medications: form.medications },
      });
      setGeneratedAbha(newUser.abhaId);
      setVerifying(false);
      setShowAbha(true);
    }, 1500);
  };

  const err = (k) => errors[k] && (
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
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <StepIndicator current={step} />
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* ── STEP 0: Basic Info ── */}
                {step === 0 && (
                  <motion.div key="p0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <User size={17} style={{ color: 'var(--primary)' }} /> Basic Information
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <FieldWrap label="Full Name *">
                          <TextInput icon={User} placeholder="Rohan Mehta" value={form.name} onChange={e => set('name', e.target.value)} />
                          {err('name')}
                        </FieldWrap>
                      </div>
                      <FieldWrap label="Email Address *">
                        <TextInput icon={Mail} type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                        {err('email')}
                      </FieldWrap>
                      <FieldWrap label="Mobile Number *">
                        <TextInput icon={Phone} type="tel" placeholder="+91 98765 43210" value={form.mobile} onChange={e => set('mobile', e.target.value)} />
                        {err('mobile')}
                      </FieldWrap>
                      <FieldWrap label="Date of Birth *">
                        <TextInput icon={Calendar} type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
                        {err('dob')}
                      </FieldWrap>
                      <FieldWrap label="Gender *">
                        <select style={selectStyle} value={form.gender} onChange={e => set('gender', e.target.value)}>
                          <option value="">Select gender</option>
                          {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        {err('gender')}
                      </FieldWrap>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 1: Medical Identity ── */}
                {step === 1 && (
                  <motion.div key="p1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Heart size={17} style={{ color: '#10b981' }} /> Medical Identity
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <FieldWrap label="Blood Group *">
                          <select style={selectStyle} value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                            <option value="">Select blood group</option>
                            {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                          {err('bloodGroup')}
                        </FieldWrap>
                      </div>
                      <FieldWrap label="Emergency Contact Name *">
                        <TextInput icon={User} placeholder="Priya Mehta" value={form.emergencyName} onChange={e => set('emergencyName', e.target.value)} />
                        {err('emergencyName')}
                      </FieldWrap>
                      <FieldWrap label="Emergency Contact Number *">
                        <TextInput icon={Phone} type="tel" placeholder="+91 98765 12345" value={form.emergencyNumber} onChange={e => set('emergencyNumber', e.target.value)} />
                        {err('emergencyNumber')}
                      </FieldWrap>
                      <FieldWrap label="State *">
                        <select style={selectStyle} value={form.state} onChange={e => set('state', e.target.value)}>
                          <option value="">Select state</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {err('state')}
                      </FieldWrap>
                      <FieldWrap label="City *">
                        <TextInput placeholder="Pune" value={form.city} onChange={e => set('city', e.target.value)} />
                        {err('city')}
                      </FieldWrap>
                      <div className="sm:col-span-2">
                        <FieldWrap label="Address (optional)">
                          <input className={inputCls + ' pl-3'} style={inputStyle} placeholder="12, Shivaji Nagar, Pune" value={form.address} onChange={e => set('address', e.target.value)} />
                        </FieldWrap>
                      </div>
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-widest mt-2" style={{ color: 'var(--text-muted)' }}>Optional Medical Info</p>
                    <div className="space-y-2">
                      <Accordion title="Known Allergies" icon={AlertCircle}>
                        <input className={inputCls + ' mt-2 pl-3'} style={inputStyle} placeholder="e.g. Penicillin, Peanuts" value={form.allergies} onChange={e => set('allergies', e.target.value)} />
                      </Accordion>
                      <Accordion title="Existing Conditions" icon={Heart}>
                        <input className={inputCls + ' mt-2 pl-3'} style={inputStyle} placeholder="e.g. Hypertension, Diabetes" value={form.conditions} onChange={e => set('conditions', e.target.value)} />
                      </Accordion>
                      <Accordion title="Current Medications" icon={Pill}>
                        <input className={inputCls + ' mt-2 pl-3'} style={inputStyle} placeholder="e.g. Amlodipine 5mg daily" value={form.medications} onChange={e => set('medications', e.target.value)} />
                      </Accordion>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 2: OTP ── */}
                {step === 2 && (
                  <motion.div key="p2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <h2 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Mail size={17} style={{ color: 'var(--primary)' }} /> Email Verification
                    </h2>
                    <div className="p-4 rounded-2xl border" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>OTP will be sent to: <strong>{form.email}</strong></p>
                    </div>
                    {!otpSent ? (
                      <button onClick={sendOtp}
                        className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                        style={{ background: '#10b981', color: '#fff' }}>
                        <Mail size={16} /> Send OTP to Email
                      </button>
                    ) : (
                      <>
                        <div>
                          <label className={labelCls} style={labelStyle}>Enter 6-digit OTP</label>
                          <div className="flex gap-2 justify-center">
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
                          {err('otp')}
                          <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>For demo: enter any 6 digits</p>
                        </div>
                        <div className="text-center">
                          {canResend ? (
                            <button onClick={sendOtp} className="text-sm font-semibold hover:underline" style={{ color: '#10b981' }}>Resend OTP</button>
                          ) : (
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                              Resend in <span className="font-bold" style={{ color: '#10b981' }}>{countdown}s</span>
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    <div className="flex items-start gap-3 p-4 rounded-2xl border" style={{ background: 'rgba(16,185,129,0.07)', borderColor: 'rgba(16,185,129,0.2)' }}>
                      <Shield size={16} style={{ color: '#10b981', marginTop: 2 }} />
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Upon verification, your unique <strong>ABHA ID</strong> (Ayushman Bharat Health Account) will be automatically generated and linked to your profile.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Nav */}
            <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
              {step > 0 ? (
                <button onClick={prev} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[var(--border)]" style={{ color: 'var(--text-secondary)' }}>
                  <ArrowLeft size={15} /> Back
                </button>
              ) : (
                <Link to="/login" className="text-sm font-semibold px-4 py-2 rounded-xl" style={{ color: 'var(--text-muted)' }}>Back to Login</Link>
              )}

              {step < STEPS.length - 1 ? (
                <button onClick={next} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90"
                  style={{ background: 'var(--primary)' }}>
                  Continue <ArrowRight size={15} />
                </button>
              ) : (
                <button onClick={handleComplete} disabled={verifying || !otpSent}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#10b981' }}>
                  {verifying ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <><CheckCircle2 size={15} /> Complete Registration</>
                  )}
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
        {showAbha && <AbhaModal abhaId={generatedAbha} name={form.name} onClose={() => { setShowAbha(false); navigate('/patient'); }} />}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
