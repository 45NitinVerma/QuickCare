import React, { useState, useEffect } from 'react';
import { clinicApi, doctorApi, appointmentApi } from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Building, Stethoscope, Calendar as CalendarIcon, FileQuestion, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const StepPanel = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
    {children}
  </motion.div>
);

export function BookAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clinicId: '', clinicName: '', doctorId: '', doctorProfileId: '', doctorName: '', date: '', time: '', type: 'first_visit', notes: ''
  });

  const [clinics, setClinics]   = useState([]);
  const [doctors, setDoctors]   = useState([]);
  const [slots, setSlots]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [booked, setBooked]     = useState(false);
  const [error, setError]       = useState('');

  // Load clinics on mount
  useEffect(() => {
    clinicApi.publicList()
      .then(r => {
        const data = r.data;
        setClinics(Array.isArray(data) ? data : (data?.results || []));
      })
      .catch(() => setClinics([]));
  }, []);

  // Load doctors when clinic selected
  useEffect(() => {
    if (!formData.clinicId) { setDoctors([]); return; }
    setLoading(true);
    doctorApi.list({ clinic: formData.clinicId })
      .then(r => {
        const data = r.data;
        setDoctors(Array.isArray(data) ? data : (data?.results || []));
      })
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, [formData.clinicId]);

  const [availableDates, setAvailableDates] = useState([]);

  // Load slots when doctor + date selected
  useEffect(() => {
    if (!formData.doctorProfileId || !formData.date || !formData.clinicId) { setSlots([]); return; }
    setLoading(true);
    doctorApi.slots(formData.doctorProfileId, { date: formData.date, clinic_id: formData.clinicId })
      .then(r => setSlots(r.data?.available_slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [formData.doctorProfileId, formData.date, formData.clinicId]);

  // Load doctor's general availability to calculate available dates
  useEffect(() => {
    if (!formData.doctorProfileId || !formData.clinicId) {
      setAvailableDates([]);
      return;
    }
    
    // Fetch the weekly schedule for this doctor at this clinic
    doctorApi.availability(formData.doctorProfileId, { clinic_id: formData.clinicId })
      .then(res => {
        const schedule = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (schedule.length === 0) {
          setAvailableDates([]);
          return;
        }

        const availableDaysOfWeek = new Set(schedule.map(s => s.day.toLowerCase()));
        
        // Generate next 30 days
        const dates = [];
        const today = new Date();
        const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        for (let i = 0; i < 30; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          const dayName = daysMap[d.getDay()];
          
          if (availableDaysOfWeek.has(dayName)) {
            const isoDate = d.toISOString().split('T')[0];
            const displayDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            dates.push({ iso: isoDate, display: displayDate });
          }
        }
        
        setAvailableDates(dates);
        // Auto-select the first available date if not already set or invalid
        if (dates.length > 0) {
          setFormData(f => ({ ...f, date: dates[0].iso, time: '' }));
        }
      })
      .catch(err => {
        console.error("Failed to load doctor availability", err);
        setAvailableDates([]);
      });
  }, [formData.doctorProfileId, formData.clinicId]);

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await appointmentApi.book({
        doctor:           formData.doctorProfileId,
        appointment_date: formData.date,
        appointment_time: formData.time,
        appointment_type: formData.type,
        mode:             'in_clinic',
        notes:            formData.notes,
      });
      setBooked(true);
      setStep(5);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Clinic',    icon: Building },
    { num: 2, title: 'Doctor',    icon: Stethoscope },
    { num: 3, title: 'Schedule',  icon: CalendarIcon },
    { num: 4, title: 'Confirm',   icon: FileQuestion },
  ];

  const selectBtnStyle = (active) => ({
    padding: '0.875rem 1rem', borderRadius: '0.75rem', textAlign: 'left',
    transition: 'all 0.2s', cursor: 'pointer',
    border: active ? '2px solid var(--primary)' : '1px solid var(--border)',
    background: active ? 'var(--primary-muted)' : 'var(--bg-secondary)',
    color: active ? 'var(--primary)' : 'var(--text-primary)',
  });

  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <motion.div className="text-center" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Book an Appointment</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Follow the steps below to schedule a new visit.</p>
      </motion.div>

      {/* Progress Stepper */}
      {step < 5 && (
        <div className="relative py-4">
          <div className="absolute top-[34px] left-0 w-full h-0.5 rounded-full" style={{ background: 'var(--border)' }} />
          <div className="absolute top-[34px] left-0 h-0.5 rounded-full transition-all duration-500"
            style={{ background: 'var(--primary)', width: `${((step - 1) / 3) * 100}%` }} />
          <div className="relative flex justify-between">
            {steps.map(s => {
              const isActive = step >= s.num;
              const Icon = s.icon;
              return (
                <div key={s.num} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                    style={{ background: isActive ? 'var(--primary)' : 'var(--card)', borderColor: isActive ? 'var(--primary)' : 'var(--border)', color: isActive ? 'white' : 'var(--text-muted)', boxShadow: isActive ? 'var(--shadow-glow-primary)' : 'none' }}>
                    <Icon size={17} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>{s.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Card className="overflow-visible">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">

            {/* Step 1: Clinic */}
            {step === 1 && (
              <StepPanel key="step1">
                <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Select a Clinic</h2>
                {clinics.length === 0 ? (
                  <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                    <Loader2 className="animate-spin mx-auto mb-3" size={28} />
                    <p className="text-sm">Loading clinics…</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clinics.map(c => (
                      <button key={c.id} type="button"
                        onClick={() => setFormData(f => ({ ...f, clinicId: c.id, clinicName: c.name, doctorId: '', doctorProfileId: '', time: '' }))}
                        className="w-full text-left"
                        style={selectBtnStyle(formData.clinicId === c.id)}>
                        <p className="font-semibold text-sm">{c.name}</p>
                        <p className="text-xs opacity-70 mt-0.5">{c.city} · {c.clinic_type} · {c.member_count} doctors</p>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex justify-end pt-6 mt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                  <Button onClick={handleNext} disabled={!formData.clinicId}>Continue</Button>
                </div>
              </StepPanel>
            )}

            {/* Step 2: Doctor */}
            {step === 2 && (
              <StepPanel key="step2">
                <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Choose a Doctor</h2>
                {loading ? (
                  <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}><Loader2 className="animate-spin mx-auto" size={28} /></div>
                ) : doctors.length === 0 ? (
                  <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                    <p className="text-sm">No doctors found for this clinic.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {doctors.map(doctor => {
                      const isSelected = formData.doctorProfileId === doctor.id;
                      return (
                        <div key={doctor.id}
                          onClick={() => setFormData(f => ({ ...f, doctorProfileId: doctor.id, doctorId: doctor.user?.id, doctorName: doctor.user?.name || `Doctor #${doctor.id}`, time: '' }))}
                          className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all"
                          style={{ border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)', background: isSelected ? 'var(--primary-muted)' : 'var(--bg-secondary)' }}>
                          <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                            style={{ background: isSelected ? 'var(--primary)' : 'var(--border)', color: isSelected ? 'white' : 'var(--text-primary)' }}>
                            {(doctor.user?.name || 'D')[0]}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{doctor.user?.name}</h3>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                              {doctor.specialty} · {doctor.experience_years} yrs · ₹{doctor.first_visit_fee}
                            </p>
                          </div>
                          {doctor.qualification && <p className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{doctor.qualification}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex justify-between pt-6 mt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                  <Button variant="ghost" onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext} disabled={!formData.doctorProfileId}>Continue</Button>
                </div>
              </StepPanel>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <StepPanel key="step3">
                <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Select Date & Time</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Select Date</label>
                    {availableDates.length === 0 ? (
                       <p className="text-sm border rounded-xl p-4 text-center" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                         No available dates found for this doctor at this clinic.
                       </p>
                    ) : (
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                        {availableDates.map(d => (
                          <button
                            key={d.iso}
                            type="button"
                            onClick={() => setFormData(f => ({ ...f, date: d.iso, time: '' }))}
                            className="flex-col items-center justify-center min-w-[5.5rem] py-2.5 rounded-xl border transition-all shrink-0"
                            style={{
                              background: formData.date === d.iso ? 'var(--primary)' : 'var(--bg-secondary)',
                              borderColor: formData.date === d.iso ? 'var(--primary)' : 'var(--border)',
                              color: formData.date === d.iso ? '#fff' : 'var(--text-primary)',
                              boxShadow: formData.date === d.iso ? '0 4px 12px rgba(var(--primary-rgb), 0.25)' : 'none'
                            }}
                          >
                            <span className="block text-xs font-medium opacity-80 mb-0.5">{d.display.split(',')[0]}</span>
                            <span className="block text-sm font-bold">{d.display.split(',')[1].trim()}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Available Slots</label>
                    {loading ? (
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}><Loader2 size={16} className="animate-spin" /> Loading slots…</div>
                    ) : formData.date && slots.length === 0 ? (
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No slots available for this date.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5">
                        {(formData.date ? slots : []).map(time => (
                          <button key={time} type="button" onClick={() => setFormData(f => ({ ...f, time }))}
                            className="py-2.5 px-3 rounded-xl text-sm font-medium transition-all"
                            style={selectBtnStyle(formData.time === time)}>
                            {time}
                          </button>
                        ))}
                      </div>
                    )}
                    {!formData.date && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a date to see slots.</p>}
                  </div>
                </div>
                <div>
                  <label style={{ ...labelStyle, marginTop: '1.5rem', display: 'block' }}>Appointment Type</label>
                  <div className="flex gap-3">
                    {[['first_visit','First Visit'],['follow_up','Follow-up']].map(([val, label]) => (
                      <button key={val} type="button" onClick={() => setFormData(f => ({ ...f, type: val }))}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={selectBtnStyle(formData.type === val)}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between pt-6 mt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                  <Button variant="ghost" onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext} disabled={!formData.date || !formData.time}>Continue</Button>
                </div>
              </StepPanel>
            )}

            {/* Step 4: Notes & Confirm */}
            {step === 4 && (
              <StepPanel key="step4">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Reason for Visit</h2>
                  <textarea
                    className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 min-h-[120px] resize-none transition-all"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    placeholder="E.g., I've been experiencing mild chest pain for the last 2 days…"
                    value={formData.notes}
                    onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                  />

                  {/* Summary */}
                  <div className="p-4 rounded-xl border space-y-2" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <h3 className="font-semibold text-sm pb-2 mb-1 border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>Booking Summary</h3>
                    {[['Clinic', formData.clinicName], ['Doctor', formData.doctorName || formData.doctorProfileId], ['Date & Time', `${formData.date} at ${formData.time}`], ['Type', formData.type.replace('_', ' ')]].map(([label, val]) => (
                      <p key={label} className="text-sm flex justify-between">
                        <span style={{ color: 'var(--text-muted)' }}>{label}:</span>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{val}</span>
                      </p>
                    ))}
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <div className="flex justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <Button type="button" variant="ghost" onClick={handleBack}>Back</Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Booking'}
                    </Button>
                  </div>
                </form>
              </StepPanel>
            )}

            {/* Step 5: Confirmation */}
            {step === 5 && (
              <StepPanel key="step5">
                <div className="text-center py-10">
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-glow-accent)]"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Booking Confirmed! 🎉</h2>
                  <p className="mb-8 max-w-sm mx-auto text-sm" style={{ color: 'var(--text-muted)' }}>
                    Your appointment request has been submitted and is pending confirmation from the clinic.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="secondary" onClick={() => navigate('/patient')}>Go to Dashboard</Button>
                    <Button onClick={() => { setStep(1); setFormData({ clinicId: '', clinicName: '', doctorId: '', doctorProfileId: '', doctorName: '', date: '', time: '', type: 'first_visit', notes: '' }); setBooked(false); }}>
                      Book Another
                    </Button>
                  </div>
                </div>
              </StepPanel>
            )}

          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
