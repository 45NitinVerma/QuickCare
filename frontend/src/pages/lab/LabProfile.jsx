import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { User, Mail, Phone, Activity, TestTube, MapPin, Star, Calendar, Building2, Hash } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';

const disabledInputStyle = {
  width: '100%', borderRadius: '0.75rem',
  padding: '0.5rem 0.75rem 0.5rem 2.5rem', fontSize: '0.875rem',
  background: 'var(--bg-secondary)', color: 'var(--text-muted)',
  border: '1px solid var(--border)',
};
const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' };

export function LabProfile() {
  const { user } = useAuth();

  const fields = [
    { icon: User,      label: 'Full Name',         val: user?.name || 'Sanjay Kudale' },
    { icon: TestTube,  label: 'Lab Department',     val: user?.labDepartment || 'Pathology' },
    { icon: Activity,  label: 'Qualification',      val: user?.qualification || 'B.Sc MLT' },
    { icon: Hash,      label: 'Employee ID',        val: user?.employeeId || 'EMP-LAB-001' },
    { icon: Mail,      label: 'Email Address',      val: user?.email || 'sanjay@lab.quickcare.com' },
    { icon: Phone,     label: 'Mobile Number',      val: user?.mobile || '+91-9900111001' },
    { icon: Building2, label: 'Assigned Hospital',  val: user?.assignedHospital || 'Apollo QuickCare Hospital' },
    { icon: MapPin,    label: 'Location',           val: 'Mumbai, Maharashtra' },
  ];

  const stats = [
    { label: 'Accuracy',  val: '99.2%' },
    { label: 'Yrs Active', val: '7' },
    { label: 'Tests Done', val: '5,840' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div className="flex items-center justify-between pb-6 border-b" style={{ borderColor: 'var(--border)' }}
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Lab Technician Profile</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Your credentials, employee ID, and hospital assignment.</p>
        </div>
        <Button className="gap-2 shrink-0">Save Changes</Button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left */}
        <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="text-center overflow-visible mt-8">
            <CardContent className="p-6 pt-0">
              <div className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-4xl font-black -mt-12 mb-4"
                style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', boxShadow: '0 8px 32px rgba(16,185,129,0.35)' }}>
                {user?.name?.charAt(0) || 'L'}
              </div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Lab Staff'}</h2>
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
              <p className="text-xs mb-4 font-medium" style={{ color: '#10b981' }}>{user?.labDepartment || 'Pathology'}</p>
              <div className="flex justify-center gap-2 mb-5">
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>Certified Tech</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                {stats.map(({ label, val }) => (
                  <div key={label} className="text-center p-1.5">
                    <div className="text-base font-black mb-0.5" style={{ color: '#10B981' }}>{val}</div>
                    <p className="text-[10px] font-medium leading-tight" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right */}
        <motion.div className="lg:col-span-2 space-y-5" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
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
              <h3 className="font-semibold text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Lab Shift Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[['Monday – Friday', '07:00 AM – 03:00 PM'], ['Saturday', '08:00 AM – 12:00 PM']].map(([day, time]) => (
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
