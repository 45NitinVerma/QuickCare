import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { User, Mail, Phone, Lock, CheckCircle2, AlertCircle, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const inputCls   = 'flex h-10 w-full rounded-xl px-3 text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]';
const inputStyle = { background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' };
const disabledSt = { ...inputStyle, background: 'var(--bg)', color: 'var(--text-muted)' };
const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' };

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

export function LabProfile() {
  const { user } = useAuth();

  const [form,     setForm]    = useState({ name: '', email: '' });
  const [toast,    setToast]   = useState(null);
  const [saving,   setSaving]  = useState(false);
  const [loading,  setLoading] = useState(true);
  const [pwForm,   setPwForm]  = useState({ password: '', confirm: '' });
  const [showPw,   setShowPw]  = useState(false);
  const [pwSaving, setPwSaving]= useState(false);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userApi.getMe();
      setForm({ name: data.name || '', email: data.email || '' });
    } catch {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updateMe({ name: form.name || undefined, email: form.email || undefined });
      showToast('Profile updated!');
    } catch {
      showToast('Failed to save', 'error');
    } finally {
      setSaving(false);
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

  if (loading) return (
    <div className="flex items-center justify-center py-24" style={{ color: 'var(--text-muted)' }}>
      <Loader2 size={28} className="animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div className="flex items-center justify-between pb-6 border-b" style={{ borderColor: 'var(--border)' }}
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Lab Staff Profile</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Update your personal information.</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Avatar */}
        <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="text-center overflow-visible mt-8">
            <CardContent className="p-6 pt-0">
              <div className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-4xl font-black -mt-12 mb-4"
                style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', boxShadow: '0 8px 32px rgba(16,185,129,0.35)' }}>
                {(form.name || user?.name || 'L').charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{form.name || 'Lab Staff'}</h2>
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{form.email || `+91-${user?.contact}`}</p>
              <div className="flex justify-center gap-2 mb-5">
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>Lab Staff</span>
              </div>
              <div className="pt-4 border-t text-left space-y-2" style={{ borderColor: 'var(--border)' }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Contact</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>+91-{user?.contact || ''}</span>
                </div>
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
                    <input className={inputCls + ' pl-9'} style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input className={inputCls + ' pl-9'} style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Mobile (read-only)</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input className={inputCls + ' pl-9'} style={disabledSt} readOnly value={`+91-${user?.contact || ''}`} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save Profile
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
        </motion.div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
