import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Shield, Activity, Heart, Pill,
  AlertCircle, ChevronDown, CreditCard
} from 'lucide-react';

// ABHA Card Component
function AbhaCard({ abhaId }) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)' }}>
      <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-10"
        style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full opacity-10"
        style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />
      <div className="flex items-center gap-2 mb-3">
        <CreditCard size={14} className="text-white/80" />
        <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Ayushman Bharat Health Account</span>
      </div>
      <p className="text-xl font-black tracking-widest text-white mb-2">{abhaId || '–'}</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <p className="text-xs text-white/70">Verified · QuickCare Health Network</p>
      </div>
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

const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' };
const fieldStyle = { fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', width: '100%' };

export function PatientProfile() {
  const { user } = useAuth();

  // Fallback profile data
  const profile = {
    name: user?.name || 'Rohan Mehta',
    email: user?.email || 'rohan@patient.com',
    mobile: user?.mobile || '+91-9876543210',
    dob: user?.dob || '1991-04-12',
    gender: user?.gender || 'Male',
    bloodGroup: user?.bloodGroup || 'O+',
    state: user?.state || 'Maharashtra',
    city: user?.city || 'Pune',
    address: user?.address || '12, Shivaji Nagar, Pune',
    abhaId: user?.abhaId || 'ABHA-4592-8842-1023',
    emergencyContact: user?.emergencyContact || { name: 'Priya Mehta', number: '+91-9898001234' },
    medicalInfo: user?.medicalInfo || { allergies: 'Penicillin', conditions: 'Hypertension', medications: 'Amlodipine 5mg' },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div className="flex items-center justify-between pb-6 border-b"
        style={{ borderColor: 'var(--border)' }} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Manage your personal and health information.</p>
        </div>
        <Button className="gap-2 shrink-0">Save Changes</Button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left */}
        <div className="space-y-5 lg:col-span-1">
          {/* Avatar Card */}
          <Card className="text-center overflow-visible mt-8">
            <CardContent className="p-6 pt-0">
              <div className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-4xl font-bold -mt-12 mb-4"
                style={{ background: 'var(--primary-muted)', color: 'var(--primary)', border: '4px solid var(--card)', boxShadow: '0 8px 24px rgba(37,99,235,0.2)' }}>
                {profile.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{profile.name}</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{profile.email}</p>
              <div className="flex justify-center gap-2 mb-5">
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>Active Patient</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>Verified</span>
              </div>
              {/* Quick stats */}
              <div className="space-y-2 pt-4 border-t text-left" style={{ borderColor: 'var(--border)' }}>
                {[['Blood Group', profile.bloodGroup], ['Gender', profile.gender], ['City', profile.city]].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{val}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ABHA Card */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Shield size={15} style={{ color: 'var(--primary)' }} /> ABHA Identity</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0">
              <AbhaCard abhaId={profile.abhaId} />
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                Your Ayushman Bharat Health Account ID is linked to all records across India.
              </p>
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
                {[
                  { label: 'Full Name', icon: User, val: profile.name },
                  { label: 'Email Address', icon: Mail, val: profile.email },
                  { label: 'Mobile Number', icon: Phone, val: profile.mobile },
                  { label: 'Date of Birth', icon: null, val: profile.dob },
                ].map(({ label, icon: Icon, val }) => (
                  <div key={label}>
                    <label style={labelStyle}>{label}</label>
                    <div className="relative">
                      {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />}
                      <input readOnly defaultValue={val} style={{ ...fieldStyle, paddingLeft: Icon ? '2.5rem' : '0.75rem' }} />
                    </div>
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label style={labelStyle}>Address</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-3" style={{ color: 'var(--text-muted)' }} />
                    <textarea readOnly defaultValue={`${profile.address}, ${profile.city}, ${profile.state}`}
                      className="w-full rounded-xl border pl-9 pr-3 py-2 text-sm resize-none"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)', minHeight: 64 }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Phone size={16} /> Emergency Contact</CardTitle></CardHeader>
            <CardContent className="p-6 grid md:grid-cols-2 gap-4">
              <div><label style={labelStyle}>Contact Name</label><input readOnly defaultValue={profile.emergencyContact.name} style={fieldStyle} /></div>
              <div><label style={labelStyle}>Phone Number</label><input readOnly defaultValue={profile.emergencyContact.number} style={fieldStyle} /></div>
            </CardContent>
          </Card>

          {/* Medical Info Accordion */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Heart size={16} /> Medical Information</CardTitle></CardHeader>
            <CardContent className="p-6 space-y-2">
              <Accordion title="Known Allergies" icon={AlertCircle}>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{profile.medicalInfo.allergies || 'None reported'}</p>
              </Accordion>
              <Accordion title="Existing Conditions" icon={Activity}>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{profile.medicalInfo.conditions || 'None reported'}</p>
              </Accordion>
              <Accordion title="Current Medications" icon={Pill}>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{profile.medicalInfo.medications || 'None reported'}</p>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
