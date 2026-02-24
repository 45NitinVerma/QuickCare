import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi, clinicApi, setTokens } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse, ArrowRight, ArrowLeft, CheckCircle2, Building2, User,
  Phone, Lock, Globe, MapPin, FileText, Upload, Shield,
  Eye, EyeOff, Sun, Moon, AlertCircle, X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const STEPS = ['Basic Info', 'Hospital Details', 'Verification', 'OTP & Confirm'];
const CLINIC_TYPES = ['clinic', 'hospital', 'diagnostic_center', 'polyclinic'];
const CLINIC_TYPE_LABELS = { clinic: 'Clinic', hospital: 'Hospital', diagnostic_center: 'Diagnostic Centre', polyclinic: 'Polyclinic' };
const INDIAN_STATES = [
  'Andhra Pradesh', 'Gujarat', 'Delhi', 'Goa', 'Haryana', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];

const inputCls   = 'flex h-10 w-full rounded-xl px-3 text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]';
const inputStyle = { background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' };
const labelCls   = 'block text-sm font-medium mb-1.5';
const labelStyle = { color: 'var(--text-secondary)' };
const selectStyle = { ...inputStyle, height: '2.5rem', width: '100%', borderRadius: '0.75rem', padding: '0 0.75rem', fontSize: '0.875rem', border: '1px solid var(--border)', outline: 'none' };

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
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
            {i < STEPS.length - 1 && <div className="w-8 sm:w-12 h-0.5 mb-4 transition-all duration-300" style={{ background: i < current ? 'var(--primary)' : 'var(--border)' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function FieldWrap({ label, children }) { return <div><label className={labelCls} style={labelStyle}>{label}</label>{children}</div>; }

function TextInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />}
      <input className={inputCls + (Icon ? ' pl-9' : ' pl-3')} style={inputStyle} {...props} />
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
      <button onClick={onClose} className="ml-auto"><X size={16} /></button>
    </motion.div>
  );
}

export function HospitalAdminRegister() {
  const navigate = useNavigate();
  const { setUserFromTokens } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [step, setStep]         = useState(0);
  const [showPwd, setShowPwd]   = useState(false);
  const [toast, setToast]       = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');

  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragging, setDragging]         = useState(false);
  const fileRef = useRef();

  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const otpRefs                   = useRef([]);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otpSent, setOtpSent]     = useState(false);

  const [form, setForm] = useState({
    name: '', contact: '', password: '',
    hospitalName: '', regNumber: '', clinicType: 'clinic', state: '', city: '',
    address: '', pincode: '', contactNumber: '', hospitalEmail: '', website: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!otpSent || canResend) return;
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, otpSent, canResend]);

  const sendOtp = async () => {
    setApiError('');
    setIsLoading(true);
    try {
      await authApi.clinicStep1({
        contact:  Number(form.contact),
        name:     form.name,
        password: form.password,
      });
      setOtpSent(true); setCanResend(false); setCountdown(30);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.contact?.[0] || 'Failed to send OTP.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpKey = (i, e) => {
    const val = e.target.value.replace(/\D/, '');
    if (!val) { const next = [...otp]; next[i] = ''; setOtp(next); if (i > 0) otpRefs.current[i - 1]?.focus(); return; }
    const next = [...otp]; next[i] = val[0]; setOtp(next);
    if (i < 5) otpRefs.current[i + 1]?.focus();
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.name.trim()) e.name = 'Full name required';
      if (!/^\d{10}$/.test(form.contact)) e.contact = 'Valid 10-digit mobile required';
      if (form.password.length < 6) e.password = 'Min 6 characters';
    }
    if (step === 1) {
      if (!form.hospitalName.trim()) e.hospitalName = 'Hospital name required';
      if (!form.regNumber.trim()) e.regNumber = 'Reg. number required';
      if (!form.clinicType) e.clinicType = 'Select type';
      if (!form.state) e.state = 'Select state';
      if (!form.city.trim()) e.city = 'City required';
      if (!form.address.trim()) e.address = 'Address required';
      if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Valid 6-digit pincode';
      if (!/^\d{10,12}$/.test(form.contactNumber.replace(/[-\s]/g, ''))) e.contactNumber = 'Valid contact number';
      if (!/\S+@\S+\.\S+/.test(form.hospitalEmail)) e.hospitalEmail = 'Valid hospital email';
    }
    if (step === 2) {
      if (!uploadedFile) e.cert = 'Please upload registration certificate';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const prev = () => { setStep(s => s - 1); setErrors({}); };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setErrors({ otp: 'Enter all 6 digits' }); return; }
    if (!termsAccepted) { setErrors({ terms: 'You must accept the terms' }); return; }
    setApiError('');
    setIsLoading(true);
    try {
      // Step 2 OTP → get JWT
      const { data: step2Data } = await authApi.clinicStep2({
        contact: Number(form.contact),
        otp:     code,
      });
      const { access, refresh, user } = step2Data;
      setTokens(access, refresh);

      // Step 3 — create clinic
      await clinicApi.onboardStep3({
        name:                form.hospitalName,
        clinic_type:         form.clinicType,
        phone:               form.contactNumber,
        email:               form.hospitalEmail,
        address:             form.address,
        city:                form.city,
        state:               form.state,
        pincode:             form.pincode,
        registration_number: form.regNumber,
        description:         '',
        website:             form.website || undefined,
        // Default Mon–Fri morning slot
        time_slots: [
          { day_of_week: 0, start_time: '09:00', end_time: '13:00', slot_duration_minutes: 15, max_appointments: 20 },
          { day_of_week: 1, start_time: '09:00', end_time: '13:00', slot_duration_minutes: 15, max_appointments: 20 },
          { day_of_week: 2, start_time: '09:00', end_time: '13:00', slot_duration_minutes: 15, max_appointments: 20 },
          { day_of_week: 3, start_time: '09:00', end_time: '13:00', slot_duration_minutes: 15, max_appointments: 20 },
          { day_of_week: 4, start_time: '09:00', end_time: '13:00', slot_duration_minutes: 15, max_appointments: 20 },
        ],
      });

      setUserFromTokens(access, refresh, { ...user, is_complete_onboarding: true });
      setToast('Hospital Registered Successfully!');
      setTimeout(() => navigate('/admin'), 1200);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.otp?.[0] || 'Registration failed. Please try again.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (file) { setUploadedFile(file); setErrors(er => ({ ...er, cert: undefined })); }
  };

  const err = (k) => errors[k] && (
    <p className="mt-1 text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
      <AlertCircle size={11} /> {errors[k]}
    </p>
  );

  return (
    <div className="min-h-screen flex flex-col hero-gradient relative overflow-hidden">
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
            Hospital Registration
          </span>
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-all" style={{ color: 'var(--text-muted)' }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-4 pb-8">
        <div className="w-full max-w-2xl">
          <motion.div className="text-center mb-6" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)' }}>
              <Building2 size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Register Your Hospital</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Complete verification to onboard on QuickCare</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-3xl border shadow-[var(--shadow-xl)] overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}><StepIndicator current={step} /></div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* ── STEP 0 ── */}
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <User size={17} style={{ color: 'var(--primary)' }} /> Basic Information
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FieldWrap label="Full Name *"><TextInput icon={User} placeholder="Dr. Sunil Varma" value={form.name} onChange={e => set('name', e.target.value)} />{err('name')}</FieldWrap>
                      <FieldWrap label="Mobile Number *"><TextInput icon={Phone} type="tel" inputMode="numeric" placeholder="9876543210" maxLength={10} value={form.contact} onChange={e => set('contact', e.target.value)} />{err('contact')}</FieldWrap>
                      <FieldWrap label="Password *">
                        <div className="relative">
                          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                          <input type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)}
                            className={inputCls + ' pl-9 pr-9'} style={inputStyle} />
                          <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>{err('password')}
                      </FieldWrap>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--primary-muted)' }}>
                      <Shield size={14} style={{ color: 'var(--primary)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Role: Hospital Administrator (auto-assigned)</span>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 1 ── */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Building2 size={17} style={{ color: 'var(--primary)' }} /> Hospital Details
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2"><FieldWrap label="Hospital Name *"><TextInput icon={Building2} placeholder="Apollo QuickCare Hospital" value={form.hospitalName} onChange={e => set('hospitalName', e.target.value)} />{err('hospitalName')}</FieldWrap></div>
                      <FieldWrap label="Registration Number *"><TextInput icon={FileText} placeholder="MH/HOSP/2018/04821" value={form.regNumber} onChange={e => set('regNumber', e.target.value)} />{err('regNumber')}</FieldWrap>
                      <FieldWrap label="Type *">
                        <select style={selectStyle} value={form.clinicType} onChange={e => set('clinicType', e.target.value)}>
                          {CLINIC_TYPES.map(t => <option key={t} value={t}>{CLINIC_TYPE_LABELS[t]}</option>)}
                        </select>{err('clinicType')}
                      </FieldWrap>
                      <FieldWrap label="State *">
                        <select style={selectStyle} value={form.state} onChange={e => set('state', e.target.value)}>
                          <option value="">Select state</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>{err('state')}
                      </FieldWrap>
                      <FieldWrap label="City *"><TextInput icon={MapPin} placeholder="Mumbai" value={form.city} onChange={e => set('city', e.target.value)} />{err('city')}</FieldWrap>
                      <div className="sm:col-span-2"><FieldWrap label="Full Address *"><TextInput icon={MapPin} placeholder="14, Business Park" value={form.address} onChange={e => set('address', e.target.value)} />{err('address')}</FieldWrap></div>
                      <FieldWrap label="Pincode *"><TextInput placeholder="400076" maxLength={6} value={form.pincode} onChange={e => set('pincode', e.target.value)} />{err('pincode')}</FieldWrap>
                      <FieldWrap label="Contact Number *"><TextInput icon={Phone} type="tel" placeholder="+91-22-6780-0000" value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} />{err('contactNumber')}</FieldWrap>
                      <FieldWrap label="Hospital Email *"><TextInput type="email" placeholder="info@hospital.com" value={form.hospitalEmail} onChange={e => set('hospitalEmail', e.target.value)} />{err('hospitalEmail')}</FieldWrap>
                      <FieldWrap label="Website (optional)"><TextInput icon={Globe} placeholder="www.hospital.com" value={form.website} onChange={e => set('website', e.target.value)} /></FieldWrap>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Shield size={17} style={{ color: 'var(--primary)' }} /> Verification Documents
                    </h2>
                    <div>
                      <label className={labelCls} style={labelStyle}>Hospital Registration Certificate *</label>
                      <div
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleFileDrop}
                        onClick={() => fileRef.current?.click()}
                        className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all"
                        style={{ borderColor: dragging ? 'var(--primary)' : uploadedFile ? 'var(--success)' : 'var(--border)', background: dragging ? 'var(--primary-muted)' : uploadedFile ? 'var(--success-light)' : 'var(--bg-secondary)' }}>
                        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileDrop} />
                        {uploadedFile ? (
                          <div className="flex flex-col items-center gap-2">
                            <CheckCircle2 size={32} style={{ color: 'var(--success)' }} />
                            <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>{uploadedFile.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{(uploadedFile.size / 1024).toFixed(0)} KB · Click to replace</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload size={32} style={{ color: 'var(--text-muted)' }} />
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Drag & Drop or Click to Upload</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Accepted: PDF, JPG, PNG (max 5MB)</p>
                          </div>
                        )}
                      </div>
                      {err('cert')}
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-2xl border" style={{ background: 'var(--info-light)', borderColor: 'rgba(59,130,246,0.2)' }}>
                      <Shield size={16} style={{ color: 'var(--info)', marginTop: 2 }} />
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Your documents are encrypted and stored securely. They will only be used for verification purposes.</p>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 3 OTP ── */}
                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h2 className="text-base font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Phone size={17} style={{ color: 'var(--primary)' }} /> Phone Verification
                    </h2>
                    <div className="p-4 rounded-2xl border" style={{ background: 'var(--primary-muted)', borderColor: 'rgba(37,99,235,0.2)' }}>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>OTP will be sent to: <strong>+91 {form.contact}</strong></p>
                    </div>
                    {apiError && (
                      <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                        <AlertCircle size={13} /> {apiError}
                      </div>
                    )}
                    {!otpSent ? (
                      <button onClick={sendOtp} disabled={isLoading}
                        className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: 'var(--primary)', color: '#fff' }}>
                        {isLoading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><Phone size={16} /> Send OTP</>}
                      </button>
                    ) : (
                      <>
                        <div>
                          <label className={labelCls} style={labelStyle}>Enter 6-digit OTP</label>
                          <div className="flex gap-2 justify-center">
                            {otp.map((d, i) => (
                              <input key={i} ref={el => otpRefs.current[i] = el} value={d}
                                onChange={e => handleOtpKey(i, e)}
                                onKeyDown={e => e.key === 'Backspace' && !d && i > 0 && otpRefs.current[i - 1]?.focus()}
                                maxLength={1} inputMode="numeric"
                                className="w-11 h-12 text-center text-lg font-bold rounded-xl border-2 transition-all focus:outline-none focus:border-[var(--primary)]"
                                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: d ? 'var(--primary)' : 'var(--border)' }}
                              />
                            ))}
                          </div>
                          {err('otp')}
                        </div>
                        <div className="text-center">
                          {canResend ? (
                            <button onClick={sendOtp} className="text-sm font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Resend OTP</button>
                          ) : (
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Resend in <span className="font-bold" style={{ color: 'var(--primary)' }}>{countdown}s</span></p>
                          )}
                        </div>
                      </>
                    )}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="w-4 h-4 mt-0.5 rounded accent-[var(--primary)]" />
                      <span className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        I accept the <span className="font-semibold" style={{ color: 'var(--primary)' }}>Terms & Conditions</span> and <span className="font-semibold" style={{ color: 'var(--primary)' }}>Privacy Policy</span>. I certify all information is accurate.
                      </span>
                    </label>
                    {err('terms')}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Nav */}
            <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
              {step > 0 ? (
                <button onClick={prev} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:bg-[var(--border)]" style={{ color: 'var(--text-secondary)' }}>
                  <ArrowLeft size={15} /> Back
                </button>
              ) : (
                <Link to="/login" className="text-sm font-semibold px-4 py-2 rounded-xl" style={{ color: 'var(--text-muted)' }}>Back to Login</Link>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={next} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ background: 'var(--primary)' }}>
                  Continue <ArrowRight size={15} />
                </button>
              ) : (
                <button onClick={handleVerify} disabled={isLoading || !otpSent}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--success)' }}>
                  {isLoading ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <><CheckCircle2 size={15} /> Complete Registration</>}
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
