import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Pill, CheckCircle2, User, UploadCloud } from 'lucide-react';
import { mockUsers } from '../../data/mockData';

export function PrescriptionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const patient = mockUsers.find(u => u.id === id) || { name: 'Unknown Patient' };

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
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-200">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Prescription Saved!</h2>
        <p className="text-gray-500 mt-2">The prescription has been successfully added to the patient's record.</p>
        <p className="text-sm font-medium text-gray-400 mt-4">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Pill className="text-primary w-6 h-6" /> Add New Prescription
        </h1>
      </div>

      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary font-bold shadow-sm">
          {patient.name.charAt(0)}
        </div>
        <div>
          <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider">Prescribing for</p>
          <h3 className="font-bold text-gray-900">{patient.name}</h3>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Medication Name</label>
                <Input 
                  placeholder="e.g. Amoxicillin 500mg" 
                  value={form.medicine}
                  onChange={e => setForm({...form, medicine: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dosage Pattern</label>
                <Input 
                  placeholder="e.g. 1 Tablet, twice daily" 
                  value={form.dosage}
                  onChange={e => setForm({...form, dosage: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <Input 
                  placeholder="e.g. 5 Days" 
                  value={form.duration}
                  onChange={e => setForm({...form, duration: e.target.value})}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Instructions / Notes</label>
                <textarea
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors min-h-[100px]"
                  placeholder="Take after a meals to avoid stomach upset..."
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                ></textarea>
              </div>
            </div>

            <div className="mt-4 pt-6 text-center border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">
              <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-primary transition-colors" />
              <p className="text-sm font-medium text-gray-700">Optional: Click to upload scanned prescription copy</p>
              <p className="text-xs text-gray-500 mt-1">PDF or image format</p>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" disabled={!form.medicine || !form.dosage || !form.duration} className="min-w-[150px]">
                Save & Issue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
