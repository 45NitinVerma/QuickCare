import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { User, Shield, Key, Mail, Globe, Clock, Star, Calendar, Building2, FileText, Phone, MapPin, Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { clinicApi } from '../../services/api';

const disabledInputStyle = {
  width: '100%', borderRadius: '0.75rem',
  padding: '0.5rem 0.75rem 0.5rem 2.5rem', fontSize: '0.875rem',
  background: 'var(--bg-secondary)', color: 'var(--text-muted)',
  border: '1px solid var(--border)',
};

const labelStyle = {
  display: 'block', fontSize: '0.875rem', fontWeight: 500,
  marginBottom: '0.5rem', color: 'var(--text-secondary)',
};

export function AdminProfile() {
  const { user } = useAuth();
  
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const loadClinic = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await clinicApi.myClinics();
      if (data && data.length > 0) {
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
    } catch (err) {
      showToast('Failed to load clinic information', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadClinic(); }, [loadClinic]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!clinic) return;
    setSaving(true);
    try {
      await clinicApi.updateClinic(clinic.id, formData);
      showToast('Clinic details updated successfully!');
      setClinic({ ...clinic, ...formData });
    } catch (err) {
      showToast('Failed to update clinic details', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Fall back to mock hospital data
  const hospital = user?.hospitalInfo || {
    name: 'Apollo QuickCare Hospital',
    registrationNumber: 'MH/HOSP/2018/04821',
    type: 'Multi-speciality',
    state: 'Maharashtra',
    city: 'Mumbai',
    address: '14, Hiranandani Business Park, Powai, Mumbai – 400076',
    contactNumber: '+91-22-6780-0000',
    email: 'info@apolloquickcare.com',
    website: 'www.apolloquickcare.com',
    verificationStatus: 'Verified',
    certFileName: 'hospital_registration_cert.pdf',
  };

  const personalFields = [
    { icon: User,   label: 'Full Name',        val: user?.name || '' },
    { icon: Key,    label: 'System Clearance', val: 'Level 5 (All Systems)' },
    { icon: Mail,   label: 'Email Address',    val: user?.email || `${user?.contact}@quickcare.com` },
    { icon: Globe,  label: 'Access Region',    val: 'All India — All Branches' },
  ];

  const hospitalFields = [
    { name: 'name', icon: Building2, label: 'Hospital Name',        val: formData.name },
    { name: 'registration', icon: FileText,  label: 'Registration Number',  val: clinic?.registration_number || `REG-${clinic?.id?.split('-')[0]}` },
    { name: 'type', icon: Building2, label: 'Hospital Type',        val: clinic?.clinic_type || 'clinic' },
    { name: 'phone', icon: Phone,     label: 'Contact Number',       val: formData.phone },
    { name: 'email', icon: Mail,      label: 'Hospital Email',       val: clinic?.email || `${clinic?.slug}@quickcare.com` },
    { name: 'website', icon: Globe,     label: 'Website',              val: formData.website },
  ];

  const stats = [
    { icon: Star,     label: 'Trust Level',  val: 'L5' },
    { icon: Calendar, label: 'Since',        val: '2021' },
    { icon: Clock,    label: 'Last Login',   val: 'Now' },
  ];

  const permissions = [
    { label: 'Staff Management',  active: true },
    { label: 'Patient Records',   active: true },
    { label: 'Billing & Finance', active: true },
    { label: 'System Config',     active: true },
    { label: 'Audit Logs',        active: true },
    { label: 'External APIs',     active: false },
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
          {saving && <Loader2 size={14} className="animate-spin" />} Save Changes
        </Button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left — Avatar */}
        <motion.div className="lg:col-span-1 space-y-5" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="text-center overflow-visible mt-8">
            <CardContent className="p-6 pt-0">
              <div className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-4xl font-black -mt-12 mb-4"
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', color: 'white', boxShadow: '0 8px 32px rgba(139,92,246,0.4)' }}>
                {user?.name?.charAt(0) || 'A'}
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Admin User'}</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
              <div className="flex justify-center mb-5">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', borderColor: 'rgba(139,92,246,0.25)' }}>
                  <Shield size={11} /> Super Admin
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                {stats.map(({ icon: Icon, label, val }) => (
                  <div key={label} className="text-center p-1.5">
                    <div className="text-sm font-black mb-0.5" style={{ color: '#A78BFA' }}>{val}</div>
                    <p className="text-[10px] font-medium leading-tight" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Verification Status Card */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Hospital Verification</h3>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <Shield size={16} style={{ color: 'var(--success)' }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--success)' }}>Verified</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All documents approved</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <FileText size={14} style={{ color: 'var(--text-muted)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>hospital_registration_cert.pdf</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Registration Certificate · PDF</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>Valid</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right */}
        <motion.div className="lg:col-span-2 space-y-5" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
          {/* Personal Details */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="font-semibold text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Account Details</h3>
              <div className="grid md:grid-cols-2 gap-5">
                {personalFields.map(({ icon: Icon, label, val }) => (
                  <div key={label}>
                    <label style={labelStyle}>{label}</label>
                    <div className="relative">
                      <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                      <input disabled defaultValue={val} style={disabledInputStyle} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hospital Details */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="font-semibold text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Hospital Information</h3>
              {loading ? (
                <div className="flex items-center justify-center py-8" style={{ color: 'var(--text-muted)' }}>
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : clinic ? (
                <>
                  <div className="grid md:grid-cols-2 gap-5">
                    {hospitalFields.map(({ name, icon: Icon, label, val }) => (
                      <div key={label}>
                        <label style={labelStyle}>{label}</label>
                        <div className="relative">
                          <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                          {name === 'registration' || name === 'type' || name === 'email' ? (
                            <input disabled value={val || ''} style={disabledInputStyle} />
                          ) : (
                            <input
                              name={name}
                              value={val || ''}
                              onChange={handleChange}
                              className="w-full rounded-xl border pl-9 pr-3 py-2 text-sm transition-all focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
                              style={{ background: 'var(--bg)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label style={labelStyle}>Full Address</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-3 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                      <textarea name="address" value={formData.address || ''} onChange={handleChange}
                        className="w-full rounded-xl border pl-9 pr-3 py-2 text-sm resize-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
                        style={{ background: 'var(--bg)', color: 'var(--text-primary)', borderColor: 'var(--border)', minHeight: 64 }} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label style={labelStyle}>City</label>
                      <input name="city" value={formData.city || ''} onChange={handleChange}
                        className="w-full rounded-xl border px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-[var(--primary)] outline-none"
                        style={{ background: 'var(--bg)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                    </div>
                    <div>
                      <label style={labelStyle}>State</label>
                      <input name="state" value={formData.state || ''} onChange={handleChange}
                        className="w-full rounded-xl border px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-[var(--primary)] outline-none"
                        style={{ background: 'var(--bg)', color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No clinic found. Please complete the registration process.
                </div>
              )}

            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Access Permissions</h3>
              <div className="grid grid-cols-2 gap-3">
                {permissions.map(({ label, active }) => (
                  <div key={label} className="flex items-center justify-between p-3 rounded-xl border"
                    style={{ background: active ? 'rgba(139,92,246,0.07)' : 'var(--bg-secondary)', borderColor: active ? 'rgba(139,92,246,0.25)' : 'var(--border)' }}>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={active ? { background: 'rgba(139,92,246,0.15)', color: '#A78BFA' } : { background: 'var(--bg)', color: 'var(--text-muted)' }}>
                      {active ? 'Granted' : 'Denied'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

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
