import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  CalendarDays, Clock, Plus, Trash2, Edit3,
  CheckCircle2, X, Loader2, AlertTriangle, RefreshCw
} from 'lucide-react';
import api, { clinicApi } from '../../services/api';

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
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

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

function SlotModal({ isOpen, onClose, onSave, clinicId, initialData }) {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    slot_duration_minutes: 15,
    max_appointments: 20
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          day_of_week: initialData.day_of_week,
          start_time: initialData.start_time.substring(0, 5),
          end_time: initialData.end_time.substring(0, 5),
          slot_duration_minutes: initialData.slot_duration_minutes,
          max_appointments: initialData.max_appointments
        });
      } else {
        setFormData({
          day_of_week: 1,
          start_time: '09:00',
          end_time: '17:00',
          slot_duration_minutes: 15,
          max_appointments: 20
        });
      }
      setError('');
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'slot_duration_minutes' || name === 'max_appointments' || name === 'day_of_week'
        ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await clinicApi.updateClinic(clinicId, initialData.id, formData); // Wait, clinic slots endpoint is PUT /api/clinics/<clinic_id>/slots/<slot_id>/
      } else {
        await clinicApi.slots(clinicId); // POST slot
      }
      // Actually we need to call explicit API methods for slot operations or just use axios on the service side if missing
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // The onSubmit handler below will be replaced to call `onSave(formData)` instead, let's keep it simple
  const handleFormSubmit = async (e) => {
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
        <div>
          <label style={labelStyle}>Day of Week *</label>
          <select style={selectStyle} name="day_of_week" value={formData.day_of_week} onChange={handleChange} required>
            {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
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

export function AdminSlots() {
  const [clinicId, setClinicId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [toast, setToast] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

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
    try {
      if (slotId) {
         await clinicApi.updateSlot(clinicId, slotId, slotData);
         showToast('Slot updated successfully!');
      } else {
         await clinicApi.addSlot(clinicId, slotData);
         showToast('Slot added successfully!');
      }
      await loadData();
    } catch(err) {
      showToast('Failed to save slot.', 'error');
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Are you sure you want to deactivate this slot?')) return;
    setRemovingId(slotId);
    try {
       await clinicApi.deleteSlot(clinicId, slotId);
       showToast('Slot deactivated successfully!');
       await loadData();
    } catch (err) {
       showToast('Failed to delete slot.', 'error');
    } finally {
       setRemovingId(null);
    }
  };

  const openAddModal = () => {
      setEditingSlot(null);
      setIsModalOpen(true);
  };

  const openEditModal = (slot) => {
      setEditingSlot(slot);
      setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--border)' }} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Manage Time Slots</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Configure operating hours and appointment slot definitions.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="ghost" onClick={loadData} disabled={loading} className="gap-2" title="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Button size="sm" onClick={openAddModal} className="gap-2" disabled={!clinicId}>
            <Plus size={14} /> Add Slot
          </Button>
        </div>
      </motion.div>

      {/* Stats/Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Active Slots', value: slots.filter(s => s.is_active !== false).length, color: '#3b82f6', icon: CalendarDays },
          { label: 'Deactivated Slots', value: slots.filter(s => s.is_active === false).length, color: '#ef4444', icon: Trash2 },
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

      {/* List */}
      <AnimatePresence mode="wait">
        <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <Card>
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
              ) : slots.length === 0 ? (
                <div className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>
                  <p className="text-sm">No time slots configured.</p>
                  <p className="text-xs mt-1">Click "+ Add Slot" to set up your clinic operating hours.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                      {['Day', 'Time Range', 'Duration', 'Capacity', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest"
                          style={{ color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((slot, i) => {
                      const isActive = slot.is_active !== false; // Assuming it might be missing or explicitly false
                      const isRemoving = removingId === slot.id;
                      return (
                        <motion.tr key={slot.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                          className="transition-colors hover:bg-[var(--bg-secondary)]"
                          style={{ borderBottom: '1px solid var(--border)' }}>

                          {/* Day */}
                          <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {slot.day_name || DAYS.find(d => d.value === slot.day_of_week)?.label || `Day ${slot.day_of_week}`}
                          </td>

                          {/* Time Range */}
                          <td className="px-4 py-3 text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                            <Clock size={14} />
                            {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                          </td>

                          {/* Duration */}
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {slot.slot_duration_minutes} mins
                          </td>

                          {/* Capacity */}
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {slot.max_appointments} appts
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
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openEditModal(slot)}
                                    className="p-1.5 rounded-lg transition-colors hover:bg-[var(--border)] text-[var(--primary)]"
                                    title="Edit Slot">
                                    <Edit3 size={14} />
                                </button>
                                {isActive && (
                                    <button
                                        onClick={() => handleDelete(slot.id)}
                                        disabled={isRemoving}
                                        className="p-1.5 rounded-lg transition-colors hover:bg-[var(--border)] text-[var(--danger)]"
                                        title="Deactivate Slot">
                                        {isRemoving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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

      <SlotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSlot}
        clinicId={clinicId}
        initialData={editingSlot}
      />

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
