import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { mockDoctors } from '../../data/mockData';
import { Building, Stethoscope, Calendar as CalendarIcon, FileQuestion, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StepPanel = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

const branchDepartments = {
  main:  ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'General'],
  north: ['General', 'Pediatrics', 'Orthopedics'],
  south: ['Cardiology', 'Dermatology', 'General', 'Neurology'],
};

export function BookAppointment() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    hospital: '', department: '', doctorId: '', date: '', time: '', reason: ''
  });
  const navigate = useNavigate();

  const availableDepartments = formData.hospital ? (branchDepartments[formData.hospital] ?? []) : [];

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));
  const handleSubmit = (e) => { e.preventDefault(); setStep(5); };

  const steps = [
    { num: 1, title: 'Location',   icon: Building },
    { num: 2, title: 'Doctor',     icon: Stethoscope },
    { num: 3, title: 'Schedule',   icon: CalendarIcon },
    { num: 4, title: 'Details',    icon: FileQuestion },
  ];

  const selectBtnStyle = (active) => ({
    padding: '0.875rem 1rem',
    borderRadius: '0.75rem',
    textAlign: 'left',
    transition: 'all 0.2s',
    cursor: 'pointer',
    border: active ? '2px solid var(--primary)' : '1px solid var(--border)',
    background: active ? 'var(--primary-muted)' : 'var(--bg-secondary)',
    color: active ? 'var(--primary)' : 'var(--text-primary)',
    boxShadow: active ? 'var(--shadow-sm)' : 'none',
  });

  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-secondary)' };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <motion.div className="text-center" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Book an Appointment</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Follow the steps below to schedule a new visit.</p>
      </motion.div>

      {/* Progress Stepper */}
      {step < 5 && (
        <div className="relative py-4">
          <div className="absolute top-[34px] left-0 w-full h-0.5 rounded-full" style={{ background: 'var(--border)' }} />
          <div
            className="absolute top-[34px] left-0 h-0.5 rounded-full transition-all duration-500"
            style={{ background: 'var(--primary)', width: `${((step - 1) / 3) * 100}%` }}
          />
          <div className="relative flex justify-between">
            {steps.map(s => {
              const isActive = step >= s.num;
              const Icon = s.icon;
              return (
                <div key={s.num} className="flex flex-col items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                    style={{
                      background: isActive ? 'var(--primary)' : 'var(--card)',
                      borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                      color: isActive ? 'white' : 'var(--text-muted)',
                      boxShadow: isActive ? 'var(--shadow-glow-primary)' : 'none',
                    }}
                  >
                    <Icon size={17} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Card className="overflow-visible">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">

            {/* Step 1: Location & Department */}
            {step === 1 && (
              <StepPanel key="step1">
                <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Select Location & Department</h2>
                <div className="space-y-5">
                  <div>
                    <label style={labelStyle}>Hospital Branch</label>
                    <select
                      className="w-full h-11 rounded-xl px-3 text-sm transition-all focus:outline-none focus:ring-2"
                      style={{
                        background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                        border: '1px solid var(--border)', focusRingColor: 'var(--primary)'
                      }}
                      value={formData.hospital}
                      onChange={(e) => setFormData({ ...formData, hospital: e.target.value, department: '' })}
                    >
                      <option value="">Select a branch</option>
                      <option value="main">Main Hospital – Downtown</option>
                      <option value="north">North Clinic</option>
                      <option value="south">South Annex</option>
                    </select>
                  </div>
                  {formData.hospital && (
                    <div>
                      <label style={labelStyle}>Department</label>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {availableDepartments.map(dept => (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => setFormData({ ...formData, department: dept })}
                            style={selectBtnStyle(formData.department === dept)}
                          >
                            <span className="font-semibold text-sm">{dept}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end pt-6 mt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                  <Button onClick={handleNext} disabled={!formData.hospital || !formData.department}>Continue</Button>
                </div>
              </StepPanel>
            )}

            {/* Step 2: Doctor */}
            {step === 2 && (
              <StepPanel key="step2">
                <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Choose a Doctor</h2>
                <div className="space-y-3">
                  {mockDoctors.filter(d => !formData.department || d.department === formData.department).map(doctor => {
                    const isSelected = formData.doctorId === doctor.id;
                    return (
                      <div
                        key={doctor.id}
                        onClick={() => setFormData({ ...formData, doctorId: doctor.id })}
                        className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all"
                        style={{
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: isSelected ? 'var(--primary-muted)' : 'var(--bg-secondary)',
                          boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                        }}
                      >
                        <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                          style={{ background: isSelected ? 'var(--primary)' : 'var(--border)', color: isSelected ? 'white' : 'var(--text-primary)' }}>
                          {doctor.name.charAt(4)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{doctor.name}</h3>
                          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{doctor.department} · {doctor.experience}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold text-amber-500">★ {doctor.rating}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between pt-6 mt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                  <Button variant="ghost" onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext} disabled={!formData.doctorId}>Continue</Button>
                </div>
              </StepPanel>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <StepPanel key="step3">
                <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Select Date & Time</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label style={labelStyle}>Preferred Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full h-11 rounded-xl px-3 text-sm focus:outline-none focus:ring-2"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Time Slot</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'].map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setFormData({ ...formData, time })}
                          className="py-2.5 px-3 rounded-xl text-sm font-medium transition-all"
                          style={selectBtnStyle(formData.time === time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-6 mt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                  <Button variant="ghost" onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext} disabled={!formData.date || !formData.time}>Continue</Button>
                </div>
              </StepPanel>
            )}

            {/* Step 4: Reason */}
            {step === 4 && (
              <StepPanel key="step4">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Reason for Visit</h2>
                  <div>
                    <label style={labelStyle}>Briefly describe your symptoms or reason for this visit</label>
                    <textarea
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 min-h-[120px] resize-none transition-all"
                      style={{
                        background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                      }}
                      placeholder="E.g., I've been experiencing mild chest pain for the last 2 days..."
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                    />
                  </div>

                  {/* Summary */}
                  <div className="p-4 rounded-xl border space-y-2" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <h3 className="font-semibold text-sm pb-2 mb-1 border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
                      Booking Summary
                    </h3>
                    {[['Department', formData.department], ['Doctor ID', formData.doctorId], ['Date & Time', `${formData.date} at ${formData.time}`]].map(([label, val]) => (
                      <p key={label} className="text-sm flex justify-between">
                        <span style={{ color: 'var(--text-muted)' }}>{label}:</span>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{val}</span>
                      </p>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <Button type="button" variant="ghost" onClick={handleBack}>Back</Button>
                    <Button type="submit">Confirm Booking</Button>
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
                    <Button onClick={() => { setStep(1); setFormData({ hospital: '', department: '', doctorId: '', date: '', time: '', reason: '' }); }}>
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
