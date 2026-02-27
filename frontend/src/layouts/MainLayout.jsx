import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AIAssistant } from '../components/ui/AIAssistant';
import { ToastProvider } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { appointmentApi, documentApi } from '../services/api';
import {
  HeartPulse, Menu, Bell, Search, LogOut, User as UserIcon,
  Calendar, FileText, Activity, Users, X, ClipboardList,
  Moon, Sun, Shield, ChevronRight, LayoutDashboard, Microscope,
  Pill, BarChart3, Loader2
} from 'lucide-react';

export function MainLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('qc_notif_read') || '[]')); }
    catch { return new Set(); }
  });
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Build human-readable relative time string
  const relTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  // Fetch notifications from real API data, role-aware
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setNotifsLoading(true);
    const items = [];
    try {
      if (user.role === 'Patient') {
        const [apptRes, consentRes] = await Promise.allSettled([
          appointmentApi.myList(),
          documentApi.myConsents({ status: 'pending' }),
        ]);
        const todayStr = new Date().toISOString().split('T')[0];
        if (apptRes.status === 'fulfilled') {
          const appts = Array.isArray(apptRes.value.data)
            ? apptRes.value.data
            : (apptRes.value.data?.results || []);
          appts
            .filter(a => a.appointment_date >= todayStr)
            .slice(0, 5)
            .forEach(a => {
              const drName = a.doctor?.user?.name || a.doctor?.name || 'your doctor';
              const dateLabel = a.appointment_date === todayStr ? 'Today' : a.appointment_date;
              items.push({
                id: `appt-${a.id}`,
                icon: '🗓️',
                title: a.status === 'confirmed' ? 'Appointment Confirmed' : 'Appointment Scheduled',
                body: `${a.status === 'confirmed' ? 'Confirmed' : 'Pending'} appointment with Dr. ${drName} — ${dateLabel} at ${a.appointment_time || '—'}.`,
                time: relTime(a.created_at || a.appointment_date),
                link: '/patient/book',
              });
            });
        }
        if (consentRes.status === 'fulfilled') {
          const consents = Array.isArray(consentRes.value.data)
            ? consentRes.value.data
            : (consentRes.value.data?.results || []);
          consents.slice(0, 3).forEach(c => {
            const drName = c.requested_by?.name || 'A doctor';
            items.push({
              id: `consent-${c.id}`,
              icon: '🔐',
              title: 'Document Access Request',
              body: `Dr. ${drName} has requested access to your medical document.`,
              time: relTime(c.created_at),
              link: '/patient/consent',
            });
          });
        }
      } else if (user.role === 'Doctor') {
        const todayStr = new Date().toISOString().split('T')[0];
        const [apptRes, consentRes] = await Promise.allSettled([
          appointmentApi.doctorList(),
          documentApi.doctorConsents({ status: 'pending' }),
        ]);
        if (apptRes.status === 'fulfilled') {
          const appts = Array.isArray(apptRes.value.data)
            ? apptRes.value.data
            : (apptRes.value.data?.results || []);
          appts
            .filter(a => a.appointment_date === todayStr)
            .slice(0, 5)
            .forEach(a => {
              const patName = a.patient?.name || 'a patient';
              items.push({
                id: `appt-${a.id}`,
                icon: '👤',
                title: 'Patient Appointment Today',
                body: `${patName} is scheduled at ${a.appointment_time || '—'} for ${a.appointment_type || 'a consultation'}.`,
                time: relTime(a.created_at || a.appointment_date),
                link: '/doctor/queue',
              });
            });
          // Also upcoming (next 2 days)
          appts
            .filter(a => a.appointment_date > todayStr)
            .slice(0, 3)
            .forEach(a => {
              const patName = a.patient?.name || 'a patient';
              items.push({
                id: `upcoming-${a.id}`,
                icon: '🗓️',
                title: 'Upcoming Appointment',
                body: `${patName} on ${a.appointment_date} at ${a.appointment_time || '—'}.`,
                time: relTime(a.created_at || a.appointment_date),
                link: '/doctor/queue',
              });
            });
        }
        if (consentRes.status === 'fulfilled') {
          const consents = Array.isArray(consentRes.value.data)
            ? consentRes.value.data
            : (consentRes.value.data?.results || []);
          consents.slice(0, 3).forEach(c => {
            const patName = c.patient?.name || 'A patient';
            items.push({
              id: `consent-${c.id}`,
              icon: '📋',
              title: 'Consent Request Update',
              body: `${patName} has responded to your document access request.`,
              time: relTime(c.updated_at || c.created_at),
              link: '/doctor/reports',
            });
          });
        }
      } else if (user.role === 'Lab') {
        const docsRes = await documentApi.list().catch(() => null);
        if (docsRes) {
          const docs = Array.isArray(docsRes.data) ? docsRes.data : (docsRes.data?.results || []);
          docs.slice(0, 5).forEach(d => {
            items.push({
              id: `doc-${d.id}`,
              icon: '🔬',
              title: 'Lab Report Uploaded',
              body: `${d.title || d.document_type || 'Report'} for ${d.patient?.name || 'patient'} is available.`,
              time: relTime(d.created_at),
              link: '/lab/upload',
            });
          });
        }
      } else if (user.role === 'Admin') {
        const apptRes = await appointmentApi.doctorList().catch(() => null);
        if (apptRes) {
          const todayStr = new Date().toISOString().split('T')[0];
          const appts = Array.isArray(apptRes.data) ? apptRes.data : (apptRes.data?.results || []);
          const todayAppts = appts.filter(a => a.appointment_date === todayStr);
          if (todayAppts.length > 0) {
            items.push({
              id: 'admin-today',
              icon: '📊',
              title: 'Daily Summary',
              body: `${todayAppts.length} appointment(s) are scheduled today across your clinic.`,
              time: 'today',
              link: '/admin',
            });
          }
        }
      }
    } catch {
      // silently fail — show empty state
    }
    setNotifications(items);
    setNotifsLoading(false);
  }, [user]);

  // Fetch on mount
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    const next = new Set([...readIds, ...allIds]);
    setReadIds(next);
    localStorage.setItem('qc_notif_read', JSON.stringify([...next]));
  };

  const handleBellClick = () => {
    setBellAnimating(true);
    setShowNotifications(prev => !prev);
    setTimeout(() => setBellAnimating(false), 800);
  };

  const roleLinks = {
    Patient: [
      { name: 'Dashboard', path: '/patient', icon: LayoutDashboard },
      { name: 'Book Appointment', path: '/patient/book', icon: Calendar },
      { name: 'My Reports', path: '/patient/reports', icon: FileText },
      { name: 'Admission & Docs', path: '/patient/admission', icon: ClipboardList },
      { name: 'Consent & Data', path: '/patient/consent', icon: Shield },
      { name: 'My Profile', path: '/patient/profile', icon: UserIcon },
    ],
    Doctor: [
      { name: 'Dashboard', path: '/doctor', icon: LayoutDashboard },
      { name: 'Patient Queue', path: '/doctor/queue', icon: Users },
      { name: 'Reports Review', path: '/doctor/reports', icon: Microscope },
      { name: 'My Patients', path: '/doctor/patients', icon: Activity },
      { name: 'Prescriptions', path: '/doctor/prescriptions', icon: Pill },
      { name: 'My Profile', path: '/doctor/profile', icon: UserIcon },
    ],
    Lab: [
      { name: 'Dashboard', path: '/lab', icon: LayoutDashboard },
      { name: 'Upload Report', path: '/lab/upload', icon: FileText },
      { name: 'My Profile', path: '/lab/profile', icon: UserIcon },
    ],
    Admin: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Manage Staff', path: '/admin/staff', icon: Users },
      { name: 'Time Slots', path: '/admin/slots', icon: Calendar },
      { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
      { name: 'My Profile', path: '/admin/profile', icon: UserIcon },
    ],
  };

  const links = user ? (roleLinks[user.role] || []) : [];

  const roleColor = {
    Patient: 'bg-blue-500',
    Doctor: 'bg-emerald-500',
    Lab: 'bg-violet-500',
    Admin: 'bg-rose-500',
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex overflow-x-hidden" style={{ backgroundColor: 'var(--bg)' }}>

        {/* Mobile Sidebar Backdrop */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[1px] lg:hidden"
              onClick={() => setSidebarOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* ===================== SIDEBAR ===================== */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ backgroundColor: 'var(--sidebar)', borderRight: '1px solid var(--border)' }}
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-5 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <Link to="/" onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <img src="/logo.jpeg" alt="QuickCare" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Quick<span style={{ color: 'var(--primary)' }}>Care</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-secondary)] lg:hidden"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* User Info strip */}
          <div className="mx-4 mt-4 mb-2 p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors" onClick={() => navigate(`/${user?.role?.toLowerCase()}/profile`)}>
            <div className={`w-9 h-9 rounded-full ${roleColor[user?.role] || 'bg-gray-500'} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
              {user?.name?.charAt(0) || '?'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.role}</p>
            </div>
            <ChevronRight size={16} className="ml-auto shrink-0" style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 mb-1" style={{ color: 'var(--text-muted)' }}>
              Navigation
            </p>
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end
                  onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 group relative ${isActive ? 'sidebar-nav-active' : ''}`}
                  style={!isActive ? { color: 'var(--text-secondary)' } : {}}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[var(--primary)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <Icon
                    size={18}
                    className={`transition-colors shrink-0 ${isActive ? 'text-[var(--primary)]' : 'group-hover:text-[var(--primary)]'}`}
                    style={!isActive ? { color: 'var(--text-muted)' } : {}}
                  />
                  {link.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 group"
              style={{ color: 'var(--text-muted)' }}
            >
              <LogOut size={18} className="group-hover:text-red-600 transition-colors shrink-0" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ===================== MAIN CONTENT ===================== */}
        <div className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>

          {/* ====== GLASSMORPHISM NAVBAR ====== */}
          <header
            className="h-16 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0 shrink-0 glass"
            style={{ boxShadow: '0 1px 0 var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl transition-all duration-150 hover:bg-[var(--bg-secondary)] active:scale-95"
                style={{ color: 'var(--text-muted)' }}
              >
                <Menu size={20} />
              </button>
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="pl-10 pr-4 py-2 w-56 lg:w-64 text-sm rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:w-72"
                  style={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl transition-all duration-150 hover:bg-[var(--bg-secondary)] active:scale-95"
                style={{ color: 'var(--text-muted)' }}
                title="Toggle theme"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={handleBellClick}
                  className={`relative p-2 rounded-xl transition-all duration-150 hover:bg-[var(--bg-secondary)] active:scale-95 ${bellAnimating ? 'animate-bell' : ''}`}
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[var(--danger)] rounded-full border-2 border-white dark:border-[var(--card)]" />
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      className="absolute right-0 mt-2 w-80 rounded-2xl shadow-[var(--shadow-xl)] border overflow-hidden z-50"
                      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      {/* Header */}
                      <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--danger)] text-white leading-none">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        {notifications.length > 0 && unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-semibold transition-opacity hover:opacity-70"
                            style={{ color: 'var(--primary)' }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Body */}
                      <div className="max-h-72 overflow-y-auto divide-y" style={{ borderColor: 'var(--border)' }}>
                        {notifsLoading ? (
                          <div className="flex items-center justify-center gap-2 py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
                            <Loader2 size={16} className="animate-spin" /> Loading…
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 gap-2" style={{ color: 'var(--text-muted)' }}>
                            <Bell size={28} className="opacity-20" />
                            <p className="text-sm font-medium">No new notifications</p>
                          </div>
                        ) : (
                          notifications.map((n) => {
                            const isUnread = !readIds.has(n.id);
                            return (
                              <div
                                key={n.id}
                                onClick={() => { navigate(n.link || '#'); setShowNotifications(false); }}
                                className="p-4 flex gap-3 cursor-pointer transition-colors hover:bg-[var(--bg-secondary)] relative"
                              >
                                {/* Unread dot */}
                                {isUnread && (
                                  <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-[var(--primary)]" />
                                )}
                                <span className="text-lg shrink-0">{n.icon}</span>
                                <div className="flex-1 min-w-0 pr-3">
                                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{n.body}</p>
                                  {n.time && (
                                    <p className="text-[11px] mt-1 font-medium" style={{ color: 'var(--primary)' }}>{n.time}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Footer */}
                      {!notifsLoading && notifications.length > 0 && (
                        <div className="p-3 text-center" style={{ borderTop: '1px solid var(--border)' }}>
                          <button
                            onClick={() => { fetchNotifications(); }}
                            className="text-xs font-semibold transition-opacity hover:opacity-70"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            Refresh
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-150 hover:bg-[var(--bg-secondary)] active:scale-95"
                >
                  <div className={`h-8 w-8 rounded-full ${roleColor[user?.role] || 'bg-gray-500'} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
                    {user?.name?.charAt(0) || '?'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.role}</p>
                  </div>
                </button>

                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      className="absolute right-0 mt-2 w-60 rounded-2xl shadow-[var(--shadow-xl)] border overflow-hidden z-50"
                      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${roleColor[user?.role] || 'bg-gray-500'} flex items-center justify-center text-white font-bold shrink-0`}>
                            {user?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email || `${user?.role?.toLowerCase()}@quickcare.com`}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 space-y-0.5">
                        {[
                          { label: 'My Profile', icon: UserIcon, path: `/${user?.role?.toLowerCase()}/profile` },
                          { label: 'Account Settings', icon: Shield, path: `/${user?.role?.toLowerCase()}/profile` },
                        ].map(item => (
                          <button
                            key={item.label}
                            onClick={() => { setShowProfile(false); navigate(item.path); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-xl transition-all duration-150 hover:bg-[var(--bg-secondary)]"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <item.icon size={15} />
                            {item.label}
                          </button>
                        ))}
                      </div>
                      <div className="p-2" style={{ borderTop: '1px solid var(--border)' }}>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-150"
                        >
                          <LogOut size={15} /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* ====== PAGE CONTENT WITH TRANSITIONS ====== */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <AIAssistant />
      </div>
    </ToastProvider>
  );
}
