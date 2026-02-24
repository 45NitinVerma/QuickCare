import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { User, Mail, Phone, Activity, Award, Star, Calendar, Clock, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';

const disabledInputStyle = {
  width: '100%', borderRadius: '0.75rem',
  padding: '0.5rem 0.75rem 0.5rem 2.5rem', fontSize: '0.875rem',
  background: 'var(--bg-secondary)', color: 'var(--text-muted)',
  border: '1px solid var(--border)',
};
const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' };

export function DoctorProfile() {
  const { user } = useAuth();

  const fields = [
    { icon: User,      label: 'Full Name',         val: user?.name || 'Dr. Priya Venkatesh' },
    { icon: Activity,  label: 'Department',         val: user?.department || 'Cardiology' },
    { icon: Award,     label: 'Qualification',      val: user?.qualification || 'MD, DM Cardiology' },
    { icon: Award,     label: 'License Number',     val: user?.licenseNumber || 'MCI-2012-08432' },
    { icon: Mail,      label: 'Email Address',      val: user?.email || 'priya.v@quickcare.com' },
    { icon: Phone,     label: 'Mobile Number',      val: user?.mobile || '+91-9845001001' },
    { icon: Clock,     label: 'Experience',         val: user?.experience || '12 Years' },
    { icon: Building2, label: 'Assigned Hospital',  val: user?.assignedHospital || 'Apollo QuickCare Hospital' },
  ];

  const stats = [
    { label: 'Avg Rating',    val: '4.9' },
    { label: 'Years Active',  val: '12' },
    { label: 'Consultations', val: '2,847' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div className="flex items-center justify-between pb-6 border-b" style={{ borderColor: 'var(--border)' }}
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Physician Profile</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Your credentials, qualifications, and hospital assignment.</p>
        </div>
        <Button className="gap-2 shrink-0">Save Changes</Button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left */}
        <motion.div className="space-y-4 lg:col-span-1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="text-center overflow-visible mt-8">
            <CardContent className="p-6 pt-0">
              <div className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-4xl font-black -mt-12 mb-4 shadow-[var(--shadow-glow-primary)]"
                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)', color: 'white' }}>
                {user?.name?.charAt(0) || 'D'}
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Doctor'}</h2>
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
              <p className="text-xs mb-4 font-medium" style={{ color: 'var(--primary)' }}>{user?.department || 'Cardiology'}</p>
              <div className="flex justify-center gap-2 mb-5">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>Active</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>Verified MD</span>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                {stats.map(({ label, val }) => (
                  <div key={label} className="text-center p-2">
                    <div className="text-lg font-black mb-0.5" style={{ color: 'var(--primary)' }}>{val}</div>
                    <p className="text-[10px] font-medium leading-tight" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right */}
        <motion.div className="lg:col-span-2 space-y-6" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="font-semibold text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Professional Details</h3>
              <div className="grid md:grid-cols-2 gap-5">
                {fields.map(({ icon: Icon, label, val }) => (
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

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Work Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[['Monday – Friday', '09:00 AM – 05:00 PM'], ['Saturday', '10:00 AM – 02:00 PM']].map(([day, time]) => (
                  <div key={day} className="p-4 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>{day}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
