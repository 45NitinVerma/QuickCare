import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import {
  User, Shield, Key, Mail, Globe, Clock, Star, Calendar,
  Building2, FileText, Phone, MapPin, Loader2, CheckCircle2,
  AlertTriangle, X, Lock, Eye, EyeOff, Camera,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { clinicApi, userApi } from '../../services/api';

const inputBase = {
  width: '100%', borderRadius: '0.75rem',
  padding: '0.5rem 0.75rem 0.5rem 2.5rem', fontSize: '0.875rem',
  border: '1px solid var(--border)',
};
const inputEditable = {
  ...inputBase,
  background: 'var(--bg)',
  color: 'var(--text-primary)',
};
const inputDisabled = {
  ...inputBase,
  background: 'var(--bg-secondary)',
  color: 'var(--text-muted)',
};
const labelStyle = {
  display: 'block', fontSize: '0.875rem', fontWeight: 500,
  marginBottom: '0.5rem', color: 'var(--text-secondary)',
};

function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h3 className="font-bold text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{children}</h3>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  );
}

export function AdminProfile() {
  const { user } = useAuth();

  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState(null);
  const [personalForm, setPersonalForm] = useState({ name: '', email: '' });
  const [savingMe, setSavingMe] = useState(false);
  const [pwForm, setPwForm] = useState({ password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwStrength, setPwStrength] = useState(0); // 0–3

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadClinic = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, clinicRes] = await Promise.allSettled([userApi.getMe(), clinicApi.myClinics()]);
      if (meRes.status === 'fulfilled') {
        const u = meRes.value.data;
        setPersonalForm({ name: u.name || '', email: u.email || '' });
      }
      if (clinicRes.status === 'fulfilled') {
        const data = clinicRes.value.data;
        if (data?.length > 0) {
          setClinic(data[0]);
          setFormData({
            name: data[0].name || '',
            phone: data[0].phone || '',
            city: data[0].city || '',
            state: data[0].state || '',
            address: data[0].address || '',
            website: data[0].website || '',
          });
        }
      }
    } catch {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadClinic(); }, [loadClinic]);

  const handleChange = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!clinic) return;
    setSaving(true);
    try {
      await clinicApi.updateClinic(clinic.id, formData);
      showToast('Clinic details updated successfully!');
      setClinic(c => ({ ...c, ...formData }));
    } catch {
      showToast('Failed to update clinic details', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePersonal = async () => {
    setSavingMe(true);
    try {
      await userApi.updateMe({ name: personalForm.name || undefined, email: personalForm.email || undefined });
      showToast('Personal info saved!');
    } catch {
      showToast('Failed to save personal info', 'error');
    } finally {
      setSavingMe(false);
    }
  };

  const calcStrength = pw => {
    let s = 0;
    if (pw.length >= 6) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const handlePwChange = e => {
    const val = e.target.value;
    setPwForm(f => ({ ...f, password: val }));
    setPwStrength(calcStrength(val));
  };

  const handleChangePassword = async () => {
    if (!pwForm.password || pwForm.password.length < 6) { showToast('Min 6 characters', 'error'); return; }
    if (pwForm.password !== pwForm.confirm) { showToast('Passwords do not match', 'error'); return; }
    setPwSaving(true);
    try {
      await userApi.changePassword(pwForm.password);
      setPwForm({ password: '', confirm: '' });
      setPwStrength(0);
      showToast('Password changed successfully!');
    } catch {
      showToast('Failed to change password', 'error');
    } finally {
      setPwSaving(false);
    }
  };

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#22C55E'];

  const permissions = [
    { label: 'Staff Management', active: true },
    { label: 'Patient Records', active: true },
    { label: 'Billing & Finance', active: true },
    { label: 'System Config', active: true },
    { label: 'Audit Logs', active: true },
    { label: 'External APIs', active: false },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div className="flex items-center justify-between pb-6 border-b" style={{ borderColor: 'var(--border)' }}
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Administrator Profile</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Manage your system access and hospital registration.</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={handleSave} disabled={saving || !clinic}>
          {saving && <Loader2 size={14} className="animate-spin" />} Save Clinic
        </Button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* ── Left sidebar ── */}
        <motion.div className="lg:col-span-1 space-y-4"
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>

          {/* Avatar Card */}
          <Card className="text-center overflow-visible">
            <CardContent className="p-6 pt-0">
              {/* Avatar */}
              <div className="relative w-24 h-24 mx-auto -mt-10 mb-4">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                    color: 'white',
                    boxShadow: '0 8px 28px rgba(139,92,246,0.4)',
                  }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors hover:opacity-80"
                  style={{ background: 'var(--primary)', color: '#fff', borderColor: 'var(--card)' }}
                  title="Change photo">
                  <Camera size={12} />
                </button>
              </div>

              <h2 className="text-lg font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Admin User'}</h2>
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>

              <div className="flex justify-center mb-4">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', borderColor: 'rgba(139,92,246,0.25)' }}>
                  <Shield size={11} /> Super Admin
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                {[
                  { icon: Star, label: 'Trust', val: 'L5' },
                  { icon: Calendar, label: 'Since', val: '2021' },
                  { icon: Clock, label: 'Login', val: 'Now' },
                ].map(({ label, val }) => (
                  <div key={label} className="text-center p-1.5">
                    <div className="text-sm font-black mb-0.5" style={{ color: '#A78BFA' }}>{val}</div>
                    <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <SectionHeading>Hospital Verification</SectionHeading>
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <Shield size={16} style={{ color: 'var(--success)' }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--success)' }}>Verified</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All documents approved</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <FileText size={14} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    hospital_registration_cert.pdf
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Registration Certificate · PDF</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>
                  Valid
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <SectionHeading>Access Permissions</SectionHeading>
              <div className="space-y-2">
                {permissions.map(({ label, active }) => (
                  <div key={label} className="flex items-center justify-between p-2.5 rounded-xl border"
                    style={{
                      background: active ? 'rgba(139,92,246,0.07)' : 'var(--bg-secondary)',
                      borderColor: active ? 'rgba(139,92,246,0.2)' : 'var(--border)',
                    }}>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={active
                        ? { background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }
                        : { background: 'var(--bg)', color: 'var(--text-muted)' }}>
                      {active ? 'Granted' : 'Denied'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Right forms ── */}
        <motion.div className="lg:col-span-2 space-y-5"
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>

          {/* Personal Details */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <SectionHeading>Account Details</SectionHeading>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: User, label: 'Full Name', editable: true, field: 'name' },
                  { icon: Mail, label: 'Email Address', editable: true, field: 'email' },
                  { icon: Key, label: 'System Clearance', editable: false, val: 'Level 5 (All Systems)' },
                  { icon: Globe, label: 'Access Region', editable: false, val: 'All India — All Branches' },
                ].map(({ icon: Icon, label, editable, field, val }) => (
                  <div key={label}>
                    <label style={labelStyle}>{label}</label>
                    <div className="relative">
                      <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'var(--text-muted)' }} />
                      <input
                        disabled={!editable}
                        value={editable ? (personalForm[field] || '') : (val || '')}
                        onChange={editable ? e => setPersonalForm(f => ({ ...f, [field]: e.target.value })) : undefined}
                        style={editable ? inputEditable : inputDisabled}
                        className={editable ? 'transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent' : ''}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-1">
                <Button onClick={handleSavePersonal} disabled={savingMe} className="gap-2">
                  {savingMe ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Save Personal Info
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hospital Info */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeading>Hospital Information</SectionHeading>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-10" style={{ color: 'var(--text-muted)' }}>
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : clinic ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { name: 'name', icon: Building2, label: 'Hospital Name', editable: true },
                      { name: 'registration', icon: FileText, label: 'Registration Number', editable: false, val: clinic?.registration_number || `REG-${clinic?.id?.split('-')[0]}` },
                      { name: 'type', icon: Building2, label: 'Hospital Type', editable: false, val: clinic?.clinic_type || 'Clinic' },
                      { name: 'phone', icon: Phone, label: 'Contact Number', editable: true },
                      { name: 'email', icon: Mail, label: 'Hospital Email', editable: false, val: clinic?.email || `${clinic?.slug}@quickcare.com` },
                      { name: 'website', icon: Globe, label: 'Website', editable: true },
                    ].map(({ name, icon: Icon, label, editable, val }) => (
                      <div key={label}>
                        <label style={labelStyle}>{label}</label>
                        <div className="relative">
                          <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: 'var(--text-muted)' }} />
                          {editable ? (
                            <input
                              name={name}
                              value={formData[name] || ''}
                              onChange={handleChange}
                              style={inputEditable}
                              className="transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                            />
                          ) : (
                            <input disabled value={val || ''} style={inputDisabled} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Full Address */}
                  <div>
                    <label style={labelStyle}>Full Address</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-3 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                      <textarea name="address" value={formData.address || ''} onChange={handleChange}
                        className="w-full rounded-xl border pl-9 pr-3 py-2 text-sm resize-none transition-all focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
                        style={{ background: 'var(--bg)', color: 'var(--text-primary)', borderColor: 'var(--border)', minHeight: 72 }} />
                    </div>
                  </div>

                  {/* City/State */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { name: 'city', label: 'City' },
                      { name: 'state', label: 'State' },
                    ].map(({ name, label }) => (
                      <div key={name}>
                        <label style={labelStyle}>{label}</label>
                        <input name={name} value={formData[name] || ''} onChange={handleChange}
                          className="w-full rounded-xl border px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-[var(--primary)] outline-none"
                          style={{ background: 'var(--bg)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                      {saving && <Loader2 size={14} className="animate-spin" />} Save Hospital Info
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center">
                  <Building2 size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No clinic found</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Please complete the registration process.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <SectionHeading>Change Password</SectionHeading>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>New Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <input
                      className="flex h-10 w-full rounded-xl pl-9 pr-10 text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)', paddingLeft: '2.25rem' }}
                      type={showPw ? 'text' : 'password'}
                      value={pwForm.password}
                      onChange={handlePwChange}
                      placeholder="Min 6 characters"
                    />
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-muted)' }}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {pwForm.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(n => (
                          <div key={n} className="h-1 flex-1 rounded-full transition-all"
                            style={{ background: n <= pwStrength ? strengthColors[pwStrength] : 'var(--border)' }} />
                        ))}
                      </div>
                      <p className="text-[11px]" style={{ color: strengthColors[pwStrength] || 'var(--text-muted)' }}>
                        {strengthLabels[pwStrength] || ''}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <input
                      className="flex h-10 w-full rounded-xl pl-9 pr-10 text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)', paddingLeft: '2.25rem' }}
                      type={showConfirm ? 'text' : 'password'}
                      value={pwForm.confirm}
                      onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                      placeholder="Re-enter password"
                    />
                    <button type="button" onClick={() => setShowConfirm(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-muted)' }}>
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {/* Match indicator */}
                  {pwForm.confirm && (
                    <p className="text-[11px] mt-2" style={{
                      color: pwForm.password === pwForm.confirm ? 'var(--success)' : 'var(--danger)',
                    }}>
                      {pwForm.password === pwForm.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <Button onClick={handleChangePassword} disabled={pwSaving} className="gap-2">
                  {pwSaving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
            style={{ background: toast.type === 'error' ? 'var(--danger)' : 'var(--success)', color: '#fff', minWidth: 280 }}>
            {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            <span className="text-sm font-semibold">{toast.msg}</span>
            <button onClick={() => setToast(null)} className="ml-auto"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
