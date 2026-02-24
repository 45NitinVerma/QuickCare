import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Users, Building, Activity, ShieldCheck, Stethoscope, Briefcase, Bell, Info, AlertCircle, Users2, TestTube, ArrowRight } from 'lucide-react';
import { mockDoctors, mockLabPersonnel, mockUsers } from '../../data/mockData';
import { motion } from 'framer-motion';

const selectStyle = {
  width: '100%', height: '2.5rem', borderRadius: '0.75rem',
  padding: '0 0.75rem', fontSize: '0.875rem',
  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
  border: '1px solid var(--border)', outline: 'none',
};

const labelStyle = {
  display: 'block', fontSize: '0.875rem', fontWeight: 500,
  marginBottom: '0.375rem', color: 'var(--text-secondary)',
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState(mockDoctors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: '', department: '', experience: '' });

  const activePatientsCount = mockUsers.filter(u => u.role === 'Patient').length + 1200;

  const handleAddDoctor = (e) => {
    e.preventDefault();
    const d = {
      id: 'd' + (doctors.length + 1),
      name: newDoctor.name,
      department: newDoctor.department,
      experience: newDoctor.experience + ' Years',
      rating: 0,
    };
    setDoctors([...doctors, d]);
    setIsModalOpen(false);
    setNewDoctor({ name: '', department: '', experience: '' });
  };

  const removeDoctor = (id) => setDoctors(doctors.filter(d => d.id !== id));

  const statCards = [
    { label: 'Total Staff',     value: doctors.length + mockLabPersonnel.length, icon: Stethoscope, accent: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  thick: '#3B82F6' },
    { label: 'Active Patients', value: activePatientsCount.toLocaleString(),       icon: Users,       accent: '#10B981', bg: 'rgba(16,185,129,0.12)', thick: '#10B981' },
    { label: 'Departments',     value: '8',                                         icon: Building,    accent: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  thick: '#F59E0B' },
    { label: 'System Health',   value: '100%',                                      icon: ShieldCheck, accent: '#10B981', bg: 'rgba(16,185,129,0.12)', thick: '#10B981' },
  ];

  const alerts = [
    {
      type: 'info',
      label: 'System Update',
      body: 'The platform has been updated to v1.2 with new automated AI Summary integrations for lab reports.',
      icon: Info,
      bg: 'var(--info-light)',
      accentColor: 'var(--info)',
    },
    {
      type: 'warning',
      label: 'Action Required',
      body: '2 new patient admission documents are awaiting manual verification by administrative staff.',
      icon: AlertCircle,
      bg: 'var(--warning-light)',
      accentColor: 'var(--warning)',
      action: 'Review Now',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--border)' }}
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Hospital Administration</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Platform management, staff directories, and global settings.</p>
        </div>
        <Button onClick={() => navigate('/admin/analytics')} variant="secondary" className="gap-2 shrink-0">
          <Activity size={16} style={{ color: 'var(--primary)' }} /> View Analytics
        </Button>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, accent, bg, thick }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="hover:shadow-[var(--shadow-md)] transition-shadow" style={{ borderLeft: `3px solid ${thick}` }}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-xl shrink-0" style={{ background: bg, color: accent }}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium leading-tight mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <h3 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Manage Staff', sub: 'Doctors & Lab Personnel', icon: Users2, path: '/admin/staff', accent: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'View Analytics', sub: 'Reports & Insights', icon: Activity, path: '/admin/analytics', accent: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'My Profile', sub: 'Hospital & Account Info', icon: ShieldCheck, path: '/admin/profile', accent: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
        ].map(({ label, sub, icon: Icon, path, accent, bg }) => (
          <motion.button key={label} onClick={() => navigate(path)} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4 p-4 rounded-2xl border text-left transition-all hover:shadow-[var(--shadow-md)] w-full"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="p-3 rounded-xl shrink-0" style={{ background: bg, color: accent }}><Icon size={20} /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{label}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
          </motion.button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Staff Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase size={18} style={{ color: 'var(--text-muted)' }} /> Staff Directory
                </CardTitle>
                <Button size="sm" onClick={() => setIsModalOpen(true)}>+ Add Staff</Button>
              </div>
            </CardHeader>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Staff Name</TableHeader>
                  <TableHeader>Department</TableHeader>
                  <TableHeader>Experience</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                {doctors.map((d, i) => (
                  <motion.tr
                    key={d.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.04 }}
                    className="transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                          style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                          {d.name.charAt(4)}
                        </div>
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{d.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{d.department}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{d.experience}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => removeDoctor(d.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                        style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                      >
                        Remove
                      </button>
                    </TableCell>
                  </motion.tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>

        {/* Alerts sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={17} style={{ color: 'var(--text-muted)' }} /> Admin Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map(({ label, body, icon: Icon, bg, accentColor, action }) => (
                <div key={label} className="p-4 rounded-xl border"
                  style={{ background: bg, borderColor: `${accentColor}33` }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon size={13} style={{ color: accentColor }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: accentColor }}>{label}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{body}</p>
                  {action && (
                    <button
                      className="mt-3 w-full h-8 text-xs font-semibold rounded-lg border transition-colors"
                      style={{ borderColor: `${accentColor}44`, color: accentColor, background: 'transparent' }}
                    >
                      {action}
                    </button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Doctor">
        <form onSubmit={handleAddDoctor} className="space-y-4">
          <div>
            <label style={labelStyle}>Full Name</label>
            <Input placeholder="Dr. Jane Smith" value={newDoctor.name} onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })} required />
          </div>
          <div>
            <label style={labelStyle}>Department</label>
            <select style={selectStyle} value={newDoctor.department} onChange={e => setNewDoctor({ ...newDoctor, department: e.target.value })} required>
              <option value="">Select a department</option>
              {['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Experience (Years)</label>
            <Input type="number" placeholder="10" value={newDoctor.experience} onChange={e => setNewDoctor({ ...newDoctor, experience: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Staff Profile</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
