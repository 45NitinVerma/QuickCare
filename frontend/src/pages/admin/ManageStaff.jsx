import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  Stethoscope, TestTube, Plus, Power, Trash2,
  Building2, CheckCircle2, X, Loader2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { clinicApi } from '../../services/api';

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

const DEPARTMENTS = [
  'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology',
  'General Surgery', 'Oncology', 'Psychiatry', 'Radiology', 'General Medicine',
];
const LAB_DEPTS = [
  'Pathology', 'Radiology', 'Microbiology', 'Biochemistry', 'Haematology', 'Immunology',
];

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === 'error' ? 'var(--danger)' : 'var(--success)';
  const Icon = type === 'error' ? AlertTriangle : CheckCircle2;
  return (
    <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
      style={{ background: bg, color: '#fff', minWidth: 280 }}>
      <Icon size={16} />
      <span className="text-sm font-semibold">{msg}</span>
      <button onClick={onClose} className="ml-auto"><X size={14} /></button>
    </motion.div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ isOpen, onClose, onConfirm, title, body, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{body}</p>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="gap-2"
          style={{ background: 'var(--danger)', color: '#fff' }}>
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? 'Removing…' : 'Remove Member'}
        </Button>
      </div>
    </Modal>
  );
}

// ─── Add Member Modal (unified for doctor / lab) ──────────────────────────────
function AddMemberModal({ isOpen, onClose, onAdd, role }) {
  const isDoctor = role === 'doctor';
  const [contact, setContact] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => { setContact(''); setDepartment(''); setError(''); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!contact || !department) { setError('All fields are required.'); return; }
    if (contact.length !== 10) { setError('Enter a valid 10-digit contact number.'); return; }
    setLoading(true);
    try {
      await onAdd({
        contact: Number(contact),
        member_role: isDoctor ? 'doctor' : 'lab_member',
        department,
        joined_at: new Date().toISOString().split('T')[0],
      });
      reset();
      onClose();
    } catch (err) {
      // Extract meaningful error from API response
      const data = err.response?.data;
      const msg =
        data?.message ||
        data?.contact?.[0] ||
        data?.non_field_errors?.[0] ||
        data?.detail ||
        (typeof data === 'string' ? data : null) ||
        'Failed to add member. Ensure the user is already registered.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isDoctor ? 'Add Doctor' : 'Add Lab Personnel'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--info-light)', color: 'var(--info)', border: '1px solid var(--info)30' }}>
          ℹ️ The user must already be registered on QuickCare with a <strong>{isDoctor ? 'Doctor' : 'Lab Member'}</strong> account.
        </div>

        <div>
          <label style={labelStyle}>Contact Number *</label>
          <Input
            type="tel"
            placeholder="e.g. 9876543210"
            value={contact}
            onChange={e => setContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>{isDoctor ? 'Department' : 'Lab Department'} *</label>
          <select style={selectStyle} value={department} onChange={e => setDepartment(e.target.value)} required>
            <option value="">Select department</option>
            {(isDoctor ? DEPARTMENTS : LAB_DEPTS).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm p-3 rounded-xl"
            style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Adding...' : `Add ${isDoctor ? 'Doctor' : 'Lab Tech'}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ManageStaff() {
  const [clinicId, setClinicId] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [activeTab, setActiveTab] = useState('doctors');
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showAddLab, setShowAddLab] = useState(false);
  const [toast, setToast] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null); // member object | null
  const [removingId, setRemovingId] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // ── Load clinic + ALL members (active & inactive) ─────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const { data: clinics } = await clinicApi.myClinics();
      if (!clinics?.length) {
        setFetchError('No clinic found. Please complete clinic onboarding first.');
        return;
      }
      const id = clinics[0].id;
      setClinicId(id);
      // Pass status='' so the backend skips the status filter and returns ALL members
      const { data } = await clinicApi.members(id, { status: '' });
      setMembers(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Failed to load staff. Please check your connection and try again.';
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const doctors    = members.filter(m => m.member_role === 'doctor');
  const labMembers = members.filter(m => m.member_role === 'lab_member');
  const displayed  = activeTab === 'doctors' ? doctors : labMembers;

  // ── Add member ────────────────────────────────────────────────────────────
  const handleAdd = async (payload) => {
    await clinicApi.addMember(clinicId, payload);
    showToast('Member added successfully!');
    // Refresh the full list to stay in sync with server state
    await loadData();
  };

  // ── Toggle active / inactive ──────────────────────────────────────────────
  const handleToggleStatus = async (member) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    setTogglingId(member.id);
    try {
      await clinicApi.updateMember(clinicId, member.id, { status: newStatus });
      showToast(`Member ${newStatus === 'active' ? 'activated' : 'deactivated'}.`);
      // Optimistic update in local state
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: newStatus } : m));
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Failed to update status.';
      showToast(msg, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Soft-remove (DELETE) ──────────────────────────────────────────────────
  const handleRemove = async () => {
    if (!confirmRemove) return;
    setRemovingId(confirmRemove.id);
    try {
      await clinicApi.removeMember(clinicId, confirmRemove.id);
      showToast(`${confirmRemove.user?.name || 'Member'} has been removed.`);
      setConfirmRemove(null);
      await loadData();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Failed to remove member.';
      showToast(msg, 'error');
      setConfirmRemove(null);
    } finally {
      setRemovingId(null);
    }
  };

  const tabs = [
    { id: 'doctors', label: 'Doctors',       icon: Stethoscope, count: doctors.length },
    { id: 'lab',     label: 'Lab Personnel',  icon: TestTube,    count: labMembers.length },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--border)' }} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Manage Staff</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Add and manage doctors and lab personnel for your clinic.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="ghost" onClick={loadData} disabled={loading} className="gap-2" title="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
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
          { label: 'Total Doctors',   value: doctors.length,                                   color: '#3b82f6', icon: Stethoscope },
          { label: 'Active Doctors',  value: doctors.filter(d => d.status === 'active').length, color: '#10b981', icon: CheckCircle2 },
          { label: 'Lab Personnel',   value: labMembers.length,                                 color: '#8b5cf6', icon: TestTube },
          { label: 'Clinic Branches', value: '1',                                               color: '#f59e0b', icon: Building2 },
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
              {loading ? (
                <div className="flex items-center justify-center gap-3 py-16" style={{ color: 'var(--text-muted)' }}>
                  <Loader2 size={22} className="animate-spin" /> Loading staff…
                </div>
              ) : fetchError ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center" style={{ color: 'var(--danger)' }}>
                  <AlertTriangle size={28} />
                  <p className="text-sm font-medium">{fetchError}</p>
                  <Button size="sm" variant="secondary" onClick={loadData}>Retry</Button>
                </div>
              ) : displayed.length === 0 ? (
                <div className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>
                  <p className="text-sm">No {activeTab === 'doctors' ? 'doctors' : 'lab personnel'} yet.</p>
                  <p className="text-xs mt-1">Click "+ Add" to add a registered user to your clinic.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                      {['Name', 'Contact', 'Department', 'Status', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest"
                          style={{ color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map((member, i) => {
                      const name = member.user?.name || '—';
                      const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                      const isActive = member.status === 'active';
                      const isLab = activeTab === 'lab';
                      const isToggling = togglingId === member.id;
                      const isRemoving = removingId === member.id;
                      return (
                        <motion.tr key={member.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                          className="transition-colors hover:bg-[var(--bg-secondary)]"
                          style={{ borderBottom: '1px solid var(--border)' }}>

                          {/* Name */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                                style={{
                                  background: isLab ? 'rgba(139,92,246,0.12)' : 'var(--primary-muted)',
                                  color: isLab ? '#a78bfa' : 'var(--primary)',
                                }}>
                                {initials}
                              </div>
                              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</p>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                            {member.user?.contact ? `+91 ${member.user.contact}` : '—'}
                          </td>

                          {/* Department */}
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {member.department || '—'}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                              style={{
                                background: isActive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                color: isActive ? 'var(--success)' : 'var(--danger)',
                              }}>
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          {/* Joined */}
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {member.joined_at || '—'}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {/* Toggle active/inactive */}
                              <button
                                onClick={() => handleToggleStatus(member)}
                                disabled={isToggling || isRemoving}
                                title={isActive ? 'Deactivate' : 'Activate'}
                                className="p-1.5 rounded-lg transition-colors hover:bg-[var(--border)] text-xs font-semibold flex items-center gap-1 px-2"
                                style={{ color: isActive ? 'var(--danger)' : 'var(--success)' }}>
                                {isToggling
                                  ? <Loader2 size={12} className="animate-spin" />
                                  : <Power size={12} />}
                                {isActive ? 'Deactivate' : 'Activate'}
                              </button>

                              {/* Soft remove */}
                              <button
                                onClick={() => setConfirmRemove(member)}
                                disabled={isToggling || isRemoving}
                                title="Remove from clinic"
                                className="p-1.5 rounded-lg transition-colors hover:bg-[var(--border)] flex items-center gap-1 px-2 text-xs font-semibold"
                                style={{ color: 'var(--text-muted)' }}>
                                {isRemoving
                                  ? <Loader2 size={12} className="animate-spin" />
                                  : <Trash2 size={12} />}
                                Remove
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <AddMemberModal
        isOpen={showAddDoctor}
        onClose={() => setShowAddDoctor(false)}
        onAdd={handleAdd}
        role="doctor"
      />
      <AddMemberModal
        isOpen={showAddLab}
        onClose={() => setShowAddLab(false)}
        onAdd={handleAdd}
        role="lab_member"
      />
      <ConfirmModal
        isOpen={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={handleRemove}
        loading={!!removingId}
        title="Remove Staff Member"
        body={`Are you sure you want to remove ${confirmRemove?.user?.name || 'this member'} from the clinic? Their account will not be deleted — only their clinic membership will be deactivated.`}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
