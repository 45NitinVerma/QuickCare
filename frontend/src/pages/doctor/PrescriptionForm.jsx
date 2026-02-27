import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Pill, CheckCircle2, User, UploadCloud } from 'lucide-react';

export function PrescriptionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const patient = { name: `Patient #${id}` };

  const [form, setForm] = useState({
    medicine: '',
    dosage: '',
    duration: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/doctor/patient/' + id);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-200 dark:border-green-700/50">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Prescription Saved!</h2>
        <p className="mt-2" style={{ color: 'var(--text-muted)' }}>The prescription has been successfully added to the patient's record.</p>
        <p className="text-sm font-medium mt-4" style={{ color: 'var(--text-muted)' }}>Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b pb-4 mb-6" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
          <Pill className="text-primary w-6 h-6" /> Add New Prescription
        </h1>
      </div>

      <div className="p-4 rounded-xl border flex items-center gap-4"
        style={{ backgroundColor: 'var(--primary-muted)', borderColor: 'var(--primary-light)' }}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm"
          style={{ backgroundColor: 'var(--card)', color: 'var(--primary)' }}
        >
          {patient.name.charAt(0)}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Prescribing for</p>
          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{patient.name}</h3>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Medication Name</label>
                <Input
                  placeholder="e.g. Amoxicillin 500mg"
                  value={form.medicine}
                  onChange={e => setForm({ ...form, medicine: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Dosage Pattern</label>
                <Input
                  placeholder="e.g. 1 Tablet, twice daily"
                  value={form.dosage}
                  onChange={e => setForm({ ...form, dosage: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Duration</label>
                <Input
                  placeholder="e.g. 5 Days"
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Additional Instructions / Notes</label>
                <textarea
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-colors min-h-[100px]"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="Take after a meals to avoid stomach upset..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="mt-4 pt-6 text-center border-2 border-dashed rounded-xl p-6 transition-colors cursor-pointer group"
              style={{ borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-secondary)' }}
            >
              <UploadCloud className="w-8 h-8 mx-auto mb-2 group-hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Optional: Click to upload scanned prescription copy</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>PDF or image format</p>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" disabled={!form.medicine || !form.dosage || !form.duration} className="min-w-[150px]">
                Save &amp; Issue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
