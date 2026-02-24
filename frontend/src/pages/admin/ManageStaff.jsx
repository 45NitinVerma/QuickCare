import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  Stethoscope, TestTube, Plus, Pencil, Power, Building2,
  Mail, Phone, Award, Key, User, CheckCircle2, X
} from 'lucide-react';
import { mockDoctors, mockLabPersonnel } from '../../data/mockData';
import { motion as m } from 'framer-motion';

const selectStyle = {
  width: '100%', height: '2.5rem', borderRadius: '0.75rem',
  padding: '0 0.75rem', fontSize: '0.875rem',
  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
  border: '1px solid var(--border)', outline: 'none',
};
const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: 'var(--text-secondary)' };

const DEPARTMENTS = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'General Surgery', 'Oncology', 'Psychiatry', 'Radiology', 'General Medicine'];
const LAB_DEPTS = ['Pathology', 'Radiology', 'Microbiology', 'Biochemistry', 'Haematology', 'Immunology'];

const genTempPassword = () => 'QC@' + Math.random().toString(36).slice(2, 8).toUpperCase();
const genEmpId = () => 'EMP-LAB-' + String(Math.floor(Math.random() * 900) + 100);

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
      style={{ background: 'var(--success)', color: '#fff', minWidth: 260 }}>
      <CheckCircle2 size={16} />
      <span className="text-sm font-semibold">{msg}</span>
      <button onClick={onClose} className="ml-auto"><X size={14} /></button>
    </motion.div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const active = status === 'Active';
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={{
        background: active ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
        color: active ? 'var(--success)' : 'var(--danger)',
      }}>
      {status}
    </span>
  );
}

// ─── Staff Row ────────────────────────────────────────────────────────────────
function StaffRow({ member, onEdit, onToggle, isLab }) {
  const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  return (
    <tr className="transition-colors hover:bg-[var(--bg-secondary)]" style={{ borderBottom: '1px solid var(--border)' }}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
            style={{ background: isLab ? 'rgba(139,92,246,0.12)' : 'var(--primary-muted)', color: isLab ? '#a78bfa' : 'var(--primary)' }}>
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {isLab ? member.labDepartment : member.department}
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {isLab ? member.employeeId : member.experience}
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {member.qualification}
      </td>
      <td className="px-4 py-3"><StatusBadge status={member.status} /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end">
          <button onClick={() => onEdit(member)} className="p-1.5 rounded-lg transition-colors hover:bg-[var(--border)]" style={{ color: 'var(--text-muted)' }}>
            <Pencil size={13} />
          </button>
          <button onClick={() => onToggle(member.id)}
            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--border)]"
            style={{ color: member.status === 'Active' ? 'var(--danger)' : 'var(--success)' }}>
            <Power size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Add Doctor Modal ─────────────────────────────────────────────────────────
function AddDoctorModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', department: '', qualification: '', experience: '', licenseNumber: '' });
  const [tempPwd] = useState(genTempPassword());
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...form, id: 'd' + Date.now(), assignedHospital: 'Apollo QuickCare Hospital', status: 'Active', rating: 0, activePatients: 0, tempPassword: tempPwd });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Doctor">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label style={labelStyle}>Full Name *</label><Input placeholder="Dr. Jane Smith" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
          <div><label style={labelStyle}>Email *</label><Input type="email" placeholder="doctor@quickcare.com" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
          <div><label style={labelStyle}>Mobile *</label><Input type="tel" placeholder="+91 98765 43210" value={form.mobile} onChange={e => set('mobile', e.target.value)} required /></div>
          <div><label style={labelStyle}>Department *</label>
            <select style={selectStyle} value={form.department} onChange={e => set('department', e.target.value)} required>
              <option value="">Select department</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Experience (Years) *</label><Input type="number" min="0" max="60" placeholder="10" value={form.experience} onChange={e => set('experience', e.target.value)} required /></div>
          <div><label style={labelStyle}>Qualification *</label><Input placeholder="MD, DM Cardiology" value={form.qualification} onChange={e => set('qualification', e.target.value)} required /></div>
          <div><label style={labelStyle}>License Number *</label><Input placeholder="MCI-2015-12345" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} required /></div>
        </div>
        <div className="p-3 rounded-xl border flex items-center gap-3" style={{ background: 'var(--primary-muted)', borderColor: 'rgba(37,99,235,0.2)' }}>
          <Key size={14} style={{ color: 'var(--primary)' }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Temporary Password</p>
            <p className="text-sm font-mono font-bold" style={{ color: 'var(--primary)' }}>{tempPwd}</p>
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Login credentials will be sent to the registered email.</p>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Create Doctor Account</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Add Lab Modal ────────────────────────────────────────────────────────────
function AddLabModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', labDepartment: '', qualification: '' });
  const [tempPwd] = useState(genTempPassword());
  const [empId] = useState(genEmpId());
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...form, id: 'l' + Date.now(), employeeId: empId, assignedHospital: 'Apollo QuickCare Hospital', status: 'Active', tempPassword: tempPwd });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Lab Personnel">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label style={labelStyle}>Full Name *</label><Input placeholder="Sanjay Kumar" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
          <div><label style={labelStyle}>Email *</label><Input type="email" placeholder="lab@quickcare.com" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
          <div><label style={labelStyle}>Mobile *</label><Input type="tel" placeholder="+91 98765 43210" value={form.mobile} onChange={e => set('mobile', e.target.value)} required /></div>
          <div><label style={labelStyle}>Lab Department *</label>
            <select style={selectStyle} value={form.labDepartment} onChange={e => set('labDepartment', e.target.value)} required>
              <option value="">Select department</option>
              {LAB_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Qualification *</label><Input placeholder="B.Sc MLT" value={form.qualification} onChange={e => set('qualification', e.target.value)} required /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Employee ID</p>
            <p className="text-sm font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{empId}</p>
          </div>
          <div className="p-3 rounded-xl border" style={{ background: 'var(--primary-muted)', borderColor: 'rgba(37,99,235,0.2)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Temp Password</p>
            <p className="text-sm font-mono font-bold" style={{ color: 'var(--primary)' }}>{tempPwd}</p>
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Login credentials will be sent to the registered email.</p>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Create Lab Account</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ManageStaff() {
  const [activeTab, setActiveTab] = useState('doctors');
  const [doctors, setDoctors] = useState(mockDoctors);
  const [lab, setLab] = useState(mockLabPersonnel);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showAddLab, setShowAddLab] = useState(false);
  const [toast, setToast] = useState(null);

  const toggleStatus = (list, setList, id) => {
    setList(list.map(m => m.id === id ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m));
  };

  const tabs = [
    { id: 'doctors', label: 'Doctors', icon: Stethoscope, count: doctors.length },
    { id: 'lab', label: 'Lab Personnel', icon: TestTube, count: lab.length },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--border)' }} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Manage Staff</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Create and manage doctor and lab personnel accounts.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="secondary" onClick={() => setShowAddLab(true)} className="gap-2">
            <Plus size={14} /> Add Lab Tech
          </Button>
          <Button size="sm" onClick={() => setShowAddDoctor(true)} className="gap-2">
            <Plus size={14} /> Add Doctor
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Doctors', value: doctors.length, color: '#3b82f6', icon: Stethoscope },
          { label: 'Active Doctors', value: doctors.filter(d => d.status === 'Active').length, color: '#10b981', icon: CheckCircle2 },
          { label: 'Lab Personnel', value: lab.length, color: '#8b5cf6', icon: TestTube },
          { label: 'Assigned Hospital', value: 1, color: '#f59e0b', icon: Building2 },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card style={{ borderLeft: `3px solid ${color}` }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${color}1a`, color }}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <h3 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: 'var(--bg-secondary)' }}>
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === id ? 'var(--card)' : 'transparent',
              color: activeTab === id ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === id ? 'var(--shadow-sm)' : 'none',
            }}>
            <Icon size={15} />
            {label}
            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: activeTab === id ? 'var(--primary-muted)' : 'transparent', color: activeTab === id ? 'var(--primary)' : 'var(--text-muted)' }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                    {['Name & Email', activeTab === 'doctors' ? 'Department' : 'Lab Department', activeTab === 'doctors' ? 'Experience' : 'Employee ID', 'Qualification', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === 'doctors' ? doctors : lab).map((member, i) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="transition-colors hover:bg-[var(--bg-secondary)]"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                            style={{
                              background: activeTab === 'lab' ? 'rgba(139,92,246,0.12)' : 'var(--primary-muted)',
                              color: activeTab === 'lab' ? '#a78bfa' : 'var(--primary)'
                            }}>
                            {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{member.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{activeTab === 'doctors' ? member.department : member.labDepartment}</td>
                      <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{activeTab === 'doctors' ? member.experience : member.employeeId}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{member.qualification}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{
                            background: member.status === 'Active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                            color: member.status === 'Active' ? 'var(--success)' : 'var(--danger)',
                          }}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => {
                              if (activeTab === 'doctors') toggleStatus(doctors, setDoctors, member.id);
                              else toggleStatus(lab, setLab, member.id);
                            }}
                            className="p-1.5 rounded-lg transition-colors hover:bg-[var(--border)] text-xs font-semibold flex items-center gap-1 px-2"
                            style={{ color: member.status === 'Active' ? 'var(--danger)' : 'var(--success)' }}>
                            <Power size={12} /> {member.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {(activeTab === 'doctors' ? doctors : lab).length === 0 && (
                <div className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>
                  <p className="text-sm">No {activeTab === 'doctors' ? 'doctors' : 'lab personnel'} found. Click "+ Add" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <AddDoctorModal isOpen={showAddDoctor} onClose={() => setShowAddDoctor(false)}
        onAdd={d => { setDoctors(prev => [...prev, { ...d, experience: d.experience + ' Years' }]); setToast('Login credentials sent to registered email.'); }} />
      <AddLabModal isOpen={showAddLab} onClose={() => setShowAddLab(false)}
        onAdd={l => { setLab(prev => [...prev, l]); setToast('Login credentials sent to registered email.'); }} />

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
