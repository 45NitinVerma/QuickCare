import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Activity, Heart, Pill,
  AlertCircle, ChevronDown, Lock, CheckCircle2, X, Loader2, Eye, EyeOff,
} from 'lucide-react';

// ─── Styles ──────────────────────────────────────────────────────────────────
const inputCls   = 'flex h-10 w-full rounded-xl px-3 text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]';
const inputStyle = { background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' };
const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' };
const selectStyle = { ...inputStyle, height: '2.5rem', width: '100%', borderRadius: '0.75rem', padding: '0 0.75rem', fontSize: '0.875rem', border: '1px solid var(--border)', outline: 'none' };

const BLOOD_GROUPS  = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS       = ['male', 'female', 'others'];
const ADDRESS_TYPES = ['home', 'work'];
const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────


function Accordion({ title, icon: Icon, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-[var(--bg-secondary)]">
        <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          <Icon size={14} style={{ color: 'var(--primary)' }} /> {title}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid var(--border)' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

// ─── Main ─────────────────────────────────────────────────────────────────────
export function PatientProfile() {
  const { user, setUserFromTokens } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: '', email: '', age: '', gender: '', blood_group: '' });
  const [medForm,     setMedForm]     = useState({ allergies: '', chronic_conditions: '', current_medications: '', past_surgeries: '', family_history: '', height_cm: '', weight_kg: '', emergency_contact_name: '', emergency_contact_number: '' });
  const [addresses,   setAddresses]   = useState([]);
  const [addrForm,    setAddrForm]    = useState({ area: '', house_no: '', town: '', state: '', pincode: '', landmark: '', address_type: 'home', is_current: true });
  const [addrMode,    setAddrMode]    = useState('list'); // 'list' | 'add' | `edit-${id}`

  const [toast,   setToast]   = useState(null);
  const [saving,  setSaving]  = useState({});
  const [loading, setLoading] = useState(true);

  // Password
  const [pwForm,    setPwForm]    = useState({ password: '', confirm: '' });
  const [showPw,    setShowPw]    = useState(false);
  const [pwSaving,  setPwSaving]  = useState(false);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, medRes, addrRes] = await Promise.allSettled([
        userApi.getMe(),
        userApi.getMedical(),
        userApi.listAddresses(),
      ]);

      if (meRes.status === 'fulfilled') {
        const u = meRes.value.data;
        setProfileForm({
          name:        u.name        || '',
          email:       u.email       || '',
          age:         u.age         || '',
          gender:      u.gender      || '',
          blood_group: u.blood_group || '',
        });
      } else {
        showToast('Could not load personal info', 'error');
      }

      if (medRes.status === 'fulfilled') {
        const m = medRes.value.data;
        setMedForm({
          allergies:                m.allergies                || '',
          chronic_conditions:       m.chronic_conditions       || '',
          current_medications:      m.current_medications      || '',
          past_surgeries:           m.past_surgeries           || '',
          family_history:           m.family_history           || '',
          height_cm:                m.height_cm                || '',
          weight_kg:                m.weight_kg                || '',
          emergency_contact_name:   m.emergency_contact_name   || '',
          emergency_contact_number: m.emergency_contact_number || '',
        });
      }

      if (addrRes.status === 'fulfilled') {
        setAddresses(addrRes.value.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaveProfile = async () => {
    setSaving(s => ({ ...s, profile: true }));
    try {
      await userApi.updateMe({
        name:        profileForm.name        || undefined,
        email:       profileForm.email       || undefined,
        age:         profileForm.age         ? Number(profileForm.age) : undefined,
        gender:      profileForm.gender      || undefined,
        blood_group: profileForm.blood_group || undefined,
      });
      showToast('Personal info updated!');
    } catch { showToast('Failed to save personal info', 'error'); }
    finally { setSaving(s => ({ ...s, profile: false })); }
  };

  const handleSaveMedical = async () => {
    setSaving(s => ({ ...s, medical: true }));
    try {
      const payload = { ...medForm };
      if (payload.height_cm) payload.height_cm = Number(payload.height_cm);
      if (payload.weight_kg) payload.weight_kg = Number(payload.weight_kg);
      if (payload.emergency_contact_number) payload.emergency_contact_number = Number(payload.emergency_contact_number);
      await userApi.updateMedical(payload);
      showToast('Medical info updated!');
    } catch { showToast('Failed to save medical info', 'error'); }
    finally { setSaving(s => ({ ...s, medical: false })); }
  };

  const handleSaveAddress = async () => {
    setSaving(s => ({ ...s, addr: true }));
    try {
      if (addrMode === 'add') {
        const { data } = await userApi.createAddress(addrForm);
        setAddresses(a => [...a, data]);
        showToast('Address added!');
      } else {
        const id = addrMode.replace('edit-', '');
        const { data } = await userApi.updateAddress(id, addrForm);
        setAddresses(a => a.map(x => x.id === data.id ? data : x));
        showToast('Address updated!');
      }
      setAddrMode('list');
    } catch { showToast('Failed to save address', 'error'); }
    finally { setSaving(s => ({ ...s, addr: false })); }
  };

  const handleDeleteAddr = async (id) => {
    try {
      await userApi.deleteAddress(id);
      setAddresses(a => a.filter(x => x.id !== id));
      showToast('Address removed');
    } catch { showToast('Failed to delete address', 'error'); }
  };

  const handleChangePassword = async () => {
    if (!pwForm.password || pwForm.password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
    if (pwForm.password !== pwForm.confirm) { showToast('Passwords do not match', 'error'); return; }
    setPwSaving(true);
    try {
      await userApi.changePassword(pwForm.password);
      setPwForm({ password: '', confirm: '' });
      showToast('Password changed successfully!');
    } catch { showToast('Failed to change password', 'error'); }
    finally { setPwSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24" style={{ color: 'var(--text-muted)' }}>
      <Loader2 size={28} className="animate-spin" />
    </div>
  );

  const setP = (k, v) => setProfileForm(f => ({ ...f, [k]: v }));
  const setM = (k, v) => setMedForm(f => ({ ...f, [k]: v }));
  const setA = (k, v) => setAddrForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div className="flex items-center justify-between pb-6 border-b"
        style={{ borderColor: 'var(--border)' }} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Manage your personal and health information.</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left */}
        <div className="space-y-5 lg:col-span-1">
          <Card className="text-center overflow-visible mt-8">
            <CardContent className="p-6 pt-0">
              <div className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-4xl font-bold -mt-12 mb-4"
                style={{ background: 'var(--primary-muted)', color: 'var(--primary)', border: '4px solid var(--card)', boxShadow: '0 8px 24px rgba(37,99,235,0.2)' }}>
                {(profileForm.name || user?.name || 'P').charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{profileForm.name || user?.name || 'Patient'}</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{profileForm.email || user?.email || `+91-${user?.contact}`}</p>
              <div className="flex justify-center gap-2 mb-5">
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>Active Patient</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>Verified</span>
              </div>
              <div className="space-y-2 pt-4 border-t text-left" style={{ borderColor: 'var(--border)' }}>
                {[['Blood Group', profileForm.blood_group || '–'], ['Gender', profileForm.gender || '–'], ['Age', profileForm.age ? `${profileForm.age} yrs` : '–']].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span className="font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{val}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Info */}
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><label style={labelStyle}>Full Name</label>
                  <input className={inputCls} style={inputStyle} value={profileForm.name} onChange={e => setP('name', e.target.value)} placeholder="Your full name" /></div>
                <div><label style={labelStyle}>Email</label>
                  <input className={inputCls} style={inputStyle} type="email" value={profileForm.email} onChange={e => setP('email', e.target.value)} placeholder="email@example.com" /></div>
                <div><label style={labelStyle}>Age</label>
                  <input className={inputCls} style={inputStyle} type="number" min={1} max={120} value={profileForm.age} onChange={e => setP('age', e.target.value)} placeholder="28" /></div>
                <div><label style={labelStyle}>Gender</label>
                  <select style={selectStyle} value={profileForm.gender} onChange={e => setP('gender', e.target.value)}>
                    <option value="">Select gender</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                  </select></div>
                <div><label style={labelStyle}>Blood Group</label>
                  <select style={selectStyle} value={profileForm.blood_group} onChange={e => setP('blood_group', e.target.value)}>
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select></div>
                <div><label style={labelStyle}>Mobile Number</label>
                  <input className={inputCls} style={{ ...inputStyle, background: 'var(--bg)' }} readOnly value={`+91-${user?.contact || ''}`} /></div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving.profile} className="gap-2">
                  {saving.profile ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save Personal Info
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><MapPin size={16} /> Addresses</CardTitle>
                {addrMode === 'list' && (
                  <button onClick={() => { setAddrForm({ area: '', house_no: '', town: '', state: '', pincode: '', landmark: '', address_type: 'home', is_current: false }); setAddrMode('add'); }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>+ Add Address</button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {addrMode === 'list' ? (
                addresses.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No addresses saved yet.</p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <div key={addr.id} className="flex items-start justify-between p-4 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                        <div>
                          <p className="text-sm font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>
                            {addr.address_type} {addr.is_current && <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>Current</span>}
                          </p>
                          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            {[addr.house_no, addr.area, addr.town, addr.state, addr.pincode].filter(Boolean).join(', ')}
                          </p>
                          {addr.landmark && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Near: {addr.landmark}</p>}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={() => { setAddrForm({ area: addr.area || '', house_no: addr.house_no || '', town: addr.town || '', state: addr.state || '', pincode: addr.pincode || '', landmark: addr.landmark || '', address_type: addr.address_type || 'home', is_current: addr.is_current || false }); setAddrMode(`edit-${addr.id}`); }}
                            className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>Edit</button>
                          <button onClick={() => handleDeleteAddr(addr.id)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>Del</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label style={labelStyle}>House / Flat No.</label><input className={inputCls} style={inputStyle} value={addrForm.house_no} onChange={e => setA('house_no', e.target.value)} placeholder="12A" /></div>
                    <div><label style={labelStyle}>Area / Street</label><input className={inputCls} style={inputStyle} value={addrForm.area} onChange={e => setA('area', e.target.value)} placeholder="Vaishali Nagar" /></div>
                    <div><label style={labelStyle}>Town / City</label><input className={inputCls} style={inputStyle} value={addrForm.town} onChange={e => setA('town', e.target.value)} placeholder="Jaipur" /></div>
                    <div><label style={labelStyle}>State</label>
                      <select style={selectStyle} value={addrForm.state} onChange={e => setA('state', e.target.value)}>
                        <option value="">Select state</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select></div>
                    <div><label style={labelStyle}>Pincode</label><input className={inputCls} style={inputStyle} placeholder="302021" maxLength={6} value={addrForm.pincode} onChange={e => setA('pincode', e.target.value.replace(/\D/, ''))} /></div>
                    <div><label style={labelStyle}>Landmark</label><input className={inputCls} style={inputStyle} value={addrForm.landmark} onChange={e => setA('landmark', e.target.value)} placeholder="Near SBI Bank" /></div>
                    <div><label style={labelStyle}>Type</label>
                      <select style={selectStyle} value={addrForm.address_type} onChange={e => setA('address_type', e.target.value)}>
                        {ADDRESS_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                      </select></div>
                    <div className="flex items-center gap-3 mt-5">
                      <input type="checkbox" id="is_current" checked={addrForm.is_current} onChange={e => setA('is_current', e.target.checked)} className="w-4 h-4" />
                      <label htmlFor="is_current" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Set as current address</label>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setAddrMode('list')} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>Cancel</button>
                    <Button onClick={handleSaveAddress} disabled={saving.addr} className="gap-2">
                      {saving.addr ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save Address
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Info */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Heart size={16} /> Medical Information</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><label style={labelStyle}>Height (cm)</label><input className={inputCls} style={inputStyle} type="number" placeholder="175" value={medForm.height_cm} onChange={e => setM('height_cm', e.target.value)} /></div>
                <div><label style={labelStyle}>Weight (kg)</label><input className={inputCls} style={inputStyle} type="number" step="0.1" placeholder="70.5" value={medForm.weight_kg} onChange={e => setM('weight_kg', e.target.value)} /></div>
                <div><label style={labelStyle}>Emergency Contact Name</label><input className={inputCls} style={inputStyle} placeholder="Priya Sharma" value={medForm.emergency_contact_name} onChange={e => setM('emergency_contact_name', e.target.value)} /></div>
                <div><label style={labelStyle}>Emergency Contact Number</label><input className={inputCls} style={inputStyle} type="tel" placeholder="9123456789" maxLength={10} value={medForm.emergency_contact_number} onChange={e => setM('emergency_contact_number', e.target.value)} /></div>
              </div>
              <div className="space-y-2">
                {[
                  ['allergies',            'Known Allergies',      AlertCircle, 'e.g. Penicillin, Peanuts'],
                  ['chronic_conditions',   'Chronic Conditions',   Activity,    'e.g. Hypertension, Diabetes'],
                  ['current_medications',  'Current Medications',  Pill,        'e.g. Amlodipine 5mg'],
                  ['past_surgeries',       'Past Surgeries',       AlertCircle, 'e.g. Appendectomy 2020'],
                  ['family_history',       'Family History',       Heart,       'e.g. Diabetes (father)'],
                ].map(([field, title, Icon, placeholder]) => (
                  <Accordion key={field} title={title} icon={Icon}>
                    <input className={inputCls + ' mt-2 pl-3'} style={inputStyle} placeholder={placeholder}
                      value={medForm[field]} onChange={e => setM(field, e.target.value)} />
                  </Accordion>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveMedical} disabled={saving.medical} className="gap-2">
                  {saving.medical ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Save Medical Info
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Lock size={16} /> Change Password</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>New Password</label>
                  <div className="relative">
                    <input className={inputCls + ' pr-10'} style={inputStyle} type={showPw ? 'text' : 'password'} value={pwForm.password} onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" />
                    <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>{showPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                  </div>
                </div>
                <div><label style={labelStyle}>Confirm Password</label>
                  <input className={inputCls} style={inputStyle} type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Re-enter password" /></div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleChangePassword} disabled={pwSaving} className="gap-2">
                  {pwSaving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
