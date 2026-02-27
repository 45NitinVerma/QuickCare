import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  CalendarDays, Clock, Plus, Trash2, Edit3,
  CheckCircle2, X, Loader2, AlertTriangle, RefreshCw, CalendarClock,
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

const DAYS = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
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

// ─── Slot Modal ───────────────────────────────────────────────────────────────
function SlotModal({ isOpen, onClose, onSave, initialData }) {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    day_of_week: 1, start_time: '09:00', end_time: '17:00',
    slot_duration_minutes: 15, max_appointments: 20,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    if (initialData) {
      setFormData({
        day_of_week: initialData.day_of_week,
        start_time: initialData.start_time.substring(0, 5),
        end_time: initialData.end_time.substring(0, 5),
        slot_duration_minutes: initialData.slot_duration_minutes,
        max_appointments: initialData.max_appointments,
      });
    } else {
      setFormData({ day_of_week: 1, start_time: '09:00', end_time: '17:00', slot_duration_minutes: 15, max_appointments: 20 });
    }
  }, [isOpen, initialData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['slot_duration_minutes', 'max_appointments', 'day_of_week'].includes(name) ? Number(value) : value,
    }));
  };

  // Compute how many total slots would be generated
  const totalMinutes = (() => {
    const [sh, sm] = formData.start_time.split(':').map(Number);
    const [eh, em] = formData.end_time.split(':').map(Number);
    return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
  })();
  const estimatedSlots = formData.slot_duration_minutes > 0
    ? Math.floor(totalMinutes / formData.slot_duration_minutes)
    : 0;

  const handleFormSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave(formData, initialData?.id);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Failed to save slot.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Time Slot' : 'Add Time Slot'}>
      <form onSubmit={handleFormSubmit} className="space-y-4">

        {/* Day */}
        <div>
          <label style={labelStyle}>Day of Week *</label>
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map(d => (
              <button key={d.value} type="button"
                onClick={() => setFormData(f => ({ ...f, day_of_week: d.value }))}
                className="py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: formData.day_of_week === d.value ? 'var(--primary)' : 'var(--bg-secondary)',
                  color: formData.day_of_week === d.value ? '#fff' : 'var(--text-muted)',
                  border: formData.day_of_week === d.value ? '1px solid var(--primary)' : '1px solid var(--border)',
                }}>
                {d.short}
              </button>
            ))}
          </div>
        </div>

        {/* Time range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Start Time *</label>
            <Input type="time" name="start_time" value={formData.start_time} onChange={handleChange} required />
          </div>
          <div>
            <label style={labelStyle}>End Time *</label>
            <Input type="time" name="end_time" value={formData.end_time} onChange={handleChange} required />
          </div>
        </div>

        {/* Duration + Capacity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Duration (mins) *</label>
            <Input type="number" name="slot_duration_minutes" value={formData.slot_duration_minutes} onChange={handleChange} min="5" required />
          </div>
          <div>
            <label style={labelStyle}>Max Appointments *</label>
            <Input type="number" name="max_appointments" value={formData.max_appointments} onChange={handleChange} min="1" required />
          </div>
        </div>

        {/* Summary preview */}
        {estimatedSlots > 0 && (
          <div className="p-3 rounded-xl text-sm flex items-center gap-2"
            style={{ background: 'var(--primary-muted)', color: 'var(--primary)', border: '1px solid rgba(37,99,235,0.2)' }}>
            <CalendarClock size={14} />
            This slot covers <strong>{estimatedSlots}</strong> time windows · up to{' '}
            <strong>{formData.max_appointments}</strong> appts each
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm p-3 rounded-xl"
            style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? 'Saving...' : (isEdit ? 'Update Slot' : 'Add Slot')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AdminSlots() {
  const [clinicId, setClinicId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [filterDay, setFilterDay] = useState('all');

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const loadData = useCallback(async () => {
    setLoading(true); setFetchError('');
    try {
      const { data: clinics } = await clinicApi.myClinics();
      if (!clinics?.length) { setFetchError('No clinic found. Please complete clinic onboarding first.'); return; }
      const id = clinics[0].id;
      setClinicId(id);
      const { data } = await clinicApi.slots(id);
      setSlots(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      setFetchError(err.response?.data?.detail || 'Failed to load clinic slots.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSaveSlot = async (slotData, slotId) => {
    if (slotId) {
      await clinicApi.updateSlot(clinicId, slotId, slotData);
      showToast('Slot updated successfully!');
    } else {
      await clinicApi.addSlot(clinicId, slotData);
      showToast('Slot added successfully!');
    }
    await loadData();
  };

  const confirmDelete = async (slotId) => {
    setRemovingId(slotId);
    try {
      await clinicApi.deleteSlot(clinicId, slotId);
      showToast('Slot deactivated successfully!');
      await loadData();
      setDeleteConfirmId(null);
    } catch {
      showToast('Failed to delete slot.', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  const activeSlots = slots.filter(s => s.is_active !== false);
  const inactiveSlots = slots.filter(s => s.is_active === false);

  const displayedSlots = filterDay === 'all'
    ? slots
    : slots.filter(s => s.day_of_week === Number(filterDay));

  // Covered days
  const coveredDays = new Set(activeSlots.map(s => s.day_of_week));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--border)' }} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Manage Time Slots</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Configure operating hours and appointment slot definitions for your clinic.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="ghost" onClick={loadData} disabled={loading} className="gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Button size="sm" onClick={() => { setEditingSlot(null); setIsModalOpen(true); }} className="gap-2" disabled={!clinicId}>
            <Plus size={14} /> Add Slot
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Slots', value: loading ? '…' : activeSlots.length, color: '#3b82f6', icon: CalendarDays },
          { label: 'Days Covered', value: loading ? '…' : coveredDays.size, color: '#10b981', icon: CheckCircle2 },
          { label: 'Deactivated', value: loading ? '…' : inactiveSlots.length, color: '#ef4444', icon: Trash2 },
          { label: 'Max Daily Appts', value: loading ? '…' : (activeSlots.reduce((s, sl) => s + (sl.max_appointments || 0), 0) || '—'), color: '#f59e0b', icon: Clock },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card style={{ borderLeft: `3px solid ${color}` }} className="hover:shadow-[var(--shadow-md)] transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl shrink-0" style={{ background: `${color}1a`, color }}>
                    <Icon size={16} />
                  </div>
                </div>
                <h3 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : value}
                </h3>
                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weekly Coverage Visual */}
      {!loading && activeSlots.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                Weekly Coverage
              </p>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map(d => {
                  const daySlots = activeSlots.filter(s => s.day_of_week === d.value);
                  const covered = daySlots.length > 0;
                  return (
                    <button key={d.value}
                      onClick={() => setFilterDay(prev => prev === String(d.value) ? 'all' : String(d.value))}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all hover:shadow-sm"
                      style={{
                        background: covered ? 'rgba(59,130,246,0.08)' : 'var(--bg-secondary)',
                        borderColor: filterDay === String(d.value) ? 'var(--primary)' : (covered ? 'rgba(59,130,246,0.25)' : 'var(--border)'),
                      }}>
                      <span className="text-xs font-bold" style={{ color: covered ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {d.short}
                      </span>
                      <span className="text-[10px] font-semibold" style={{ color: covered ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                        {covered ? `${daySlots.length} slot${daySlots.length > 1 ? 's' : ''}` : 'Off'}
                      </span>
                    </button>
                  );
                })}
              </div>
              {filterDay !== 'all' && (
                <button className="mt-2 text-xs font-semibold" style={{ color: 'var(--primary)' }}
                  onClick={() => setFilterDay('all')}>
                  ← Show all days
                </button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Slots Table */}
      <AnimatePresence mode="wait">
        <motion.div key={filterDay} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock size={17} style={{ color: 'var(--text-muted)' }} />
                  {filterDay === 'all' ? 'All Slots' : `${DAYS.find(d => d.value === Number(filterDay))?.label} Slots`}
                </CardTitle>
                {displayedSlots.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                    {displayedSlots.length} slot{displayedSlots.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-3 py-16" style={{ color: 'var(--text-muted)' }}>
                  <Loader2 size={22} className="animate-spin" /> Loading slots…
                </div>
              ) : fetchError ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center" style={{ color: 'var(--danger)' }}>
                  <AlertTriangle size={28} />
                  <p className="text-sm font-medium">{fetchError}</p>
                  <Button size="sm" variant="secondary" onClick={loadData}>Retry</Button>
                </div>
              ) : displayedSlots.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl mb-3 flex items-center justify-center"
                    style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                    <CalendarDays size={22} />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No time slots configured</p>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                    {filterDay === 'all'
                      ? 'Click "+ Add Slot" to set up your clinic\'s operating hours.'
                      : 'No slots for this day. Switch day or add a new slot.'}
                  </p>
                  <Button size="sm" onClick={() => { setEditingSlot(null); setIsModalOpen(true); }} className="gap-2">
                    <Plus size={14} /> Add Slot
                  </Button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                      {['Day', 'Time Range', 'Duration', 'Capacity', 'Est. Windows', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest"
                          style={{ color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedSlots.map((slot, i) => {
                      const isActive = slot.is_active !== false;
                      const isRemoving = removingId === slot.id;
                      const [sh, sm] = (slot.start_time || '00:00').split(':').map(Number);
                      const [eh, em] = (slot.end_time || '00:00').split(':').map(Number);
                      const totalMins = Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
                      const windows = slot.slot_duration_minutes > 0 ? Math.floor(totalMins / slot.slot_duration_minutes) : '—';

                      return (
                        <motion.tr key={slot.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                          className="transition-colors hover:bg-[var(--bg-secondary)]"
                          style={{ borderBottom: '1px solid var(--border)', opacity: isActive ? 1 : 0.55 }}>

                          {/* Day */}
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {slot.day_name || DAYS.find(d => d.value === slot.day_of_week)?.label || `Day ${slot.day_of_week}`}
                            </span>
                          </td>

                          {/* Time Range */}
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                              <Clock size={13} />
                              {slot.start_time?.substring(0, 5)} – {slot.end_time?.substring(0, 5)}
                            </span>
                          </td>

                          {/* Duration */}
                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                              {slot.slot_duration_minutes} min
                            </span>
                          </td>

                          {/* Capacity */}
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {slot.max_appointments} appts
                          </td>

                          {/* Estimated windows */}
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                            {windows} windows
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

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => { setEditingSlot(slot); setIsModalOpen(true); }}
                                className="p-1.5 rounded-lg transition-colors hover:bg-[var(--border)] flex items-center gap-1 px-2 text-xs font-semibold"
                                style={{ color: 'var(--primary)' }}
                                title="Edit slot">
                                <Edit3 size={12} /> Edit
                              </button>
                              {isActive && (
                                <button
                                  onClick={() => setDeleteConfirmId(slot.id)}
                                  disabled={isRemoving}
                                  className="p-1.5 rounded-lg transition-colors hover:bg-[var(--border)] flex items-center gap-1 px-2 text-xs font-semibold"
                                  style={{ color: 'var(--danger)' }}
                                  title="Deactivate slot">
                                  {isRemoving ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                  Deactivate
                                </button>
                              )}
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

      <AnimatePresence>
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Deactivation">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Are you sure you want to deactivate this slot? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button type="button" variant="ghost" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button type="button" disabled={removingId === deleteConfirmId} onClick={() => confirmDelete(deleteConfirmId)} style={{ background: 'var(--danger)', color: 'white', border: 'none' }}>
              {removingId === deleteConfirmId && <Loader2 size={14} className="animate-spin mr-1" />}
              Deactivate
            </Button>
          </div>
        </div>
      </Modal>

      <SlotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSlot}
        initialData={editingSlot}
      />

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
