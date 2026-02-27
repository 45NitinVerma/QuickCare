import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, ArrowRight, User, Stethoscope, TestTube, Settings, Moon, Sun, Phone, Lock, Sparkles, CheckCircle2, UserPlus, Building2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const roles = [
  { id: 'Patient', icon: User, label: 'Patient', desc: 'Access your health records', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-500', canRegister: true, registerPath: '/register/patient', registerLabel: 'Register as Patient', registerIcon: UserPlus },
  { id: 'Doctor', icon: Stethoscope, label: 'Doctor', desc: 'Manage your patient queue', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-500', canRegister: false },
  { id: 'Lab', icon: TestTube, label: 'Lab Personnel', desc: 'Upload & analyze reports', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-500', canRegister: false },
  { id: 'Admin', icon: Settings, label: 'Administrator', desc: 'Manage hospital operations', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-500', canRegister: true, registerPath: '/register/admin', registerLabel: 'Register Hospital', registerIcon: Building2 },
];

const roleRoutes = { Patient: '/patient', Doctor: '/doctor', Lab: '/lab', Admin: '/admin' };

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [apiError, setApiError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    setApiError('');
    const formData = new FormData(e.target);
    const contact = formData.get('contact');
    const password = formData.get('password');
    setIsLoading(true);
    const result = await login(contact, password, selectedRole);
    setIsLoading(false);
    if (result.success) {
      // First-time staff (doctor/lab/receptionist) added by admin → complete their profile first
      if (result.is_partial_onboarding && ['Doctor', 'Lab'].includes(result.role)) {
        navigate('/onboarding/member');
      } else {
        navigate(roleRoutes[result.role] || '/');
      }
    } else {
      setApiError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col hero-gradient relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)', animation: 'blobFloat 12s ease-in-out infinite' }} />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)', animation: 'blobFloat 10s ease-in-out infinite reverse' }} />

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 relative z-10">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.jpeg" alt="QuickCare" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-bold text-sm">Quick<span style={{ color: 'var(--primary)' }}>Care</span></span>
        </Link>
        <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-all" style={{ color: 'var(--text-muted)' }}>
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <img src="/logo.jpeg" alt="QuickCare" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4 shadow-[var(--shadow-glow-primary)]" />
            <h1 className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to access your QuickCare dashboard.</p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
            className="rounded-3xl border shadow-[var(--shadow-xl)] overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            {/* Role Selector */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                1. Select your role
              </p>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <motion.button
                      key={role.id}
                      onClick={() => { setSelectedRole(role.id); setApiError(''); }}
                      whileTap={{ scale: 0.97 }}
                      className={`relative flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 text-left transition-all duration-200 ${isSelected ? `${role.border} bg-[var(--primary-muted)]` : 'border-[var(--border)] hover:border-[var(--border-strong)]'}`}
                    >
                      {isSelected && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--primary)] flex items-center justify-center">
                          <CheckCircle2 size={12} className="text-white" />
                        </motion.span>
                      )}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role.bg}`}>
                        <Icon size={16} className={role.color} />
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{role.label}</p>
                        <p className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>{role.desc}</p>
                      </div>
                      {!role.canRegister && (
                        <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                          Login only
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              {selectedRole && (
                <motion.form
                  key={selectedRole}
                  onSubmit={handleAuthSubmit}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="p-6 space-y-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                    2. Sign in
                  </p>

                  {/* Contact number field */}
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                    <input name="contact" type="tel" inputMode="numeric" placeholder="Mobile number (10 digits)" required
                      maxLength={10}
                      className="flex h-10 w-full rounded-xl px-3 pl-9 text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                    />
                  </div>

                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 z-10" style={{ color: 'var(--text-muted)' }} />
                    <input name="password" type={showPwd ? 'text' : 'password'} placeholder="Password" required
                      className="flex h-10 w-full rounded-xl px-3 pl-9 pr-9 text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                    />
                    <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                      {showPwd ? '🙈' : '👁'}
                    </button>
                  </div>

                  {/* API error */}
                  {apiError && (
                    <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                      <AlertCircle size={13} /> {apiError}
                    </div>
                  )}

                  <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                    {isLoading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>Sign In <ArrowRight size={16} /></>
                    )}
                  </Button>

                  {/* Role-conditional Register Link */}
                  {selectedRoleData?.canRegister && (
                    <AnimatePresence>
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
                        <p className="text-center text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                          {selectedRole === 'Patient' ? "Don't have an account?" : 'New hospital?'}
                        </p>
                        <Link to={selectedRoleData.registerPath}
                          className="flex items-center justify-center gap-2 w-full h-9 rounded-xl border text-xs font-semibold transition-all hover:bg-[var(--primary-muted)]"
                          style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                          {React.createElement(selectedRoleData.registerIcon, { size: 14 })}
                          {selectedRoleData.registerLabel}
                        </Link>
                      </motion.div>
                    </AnimatePresence>
                  )}

                  {/* Login-only badge for Doctor/Lab */}
                  {selectedRoleData && !selectedRoleData.canRegister && (
                    <p className="text-center text-xs py-2 rounded-xl" style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
                      🔒 {selectedRole} accounts are created by Hospital Admin only
                    </p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            {!selectedRole && (
              <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>
                <p className="text-sm">← Select a role above to continue</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
