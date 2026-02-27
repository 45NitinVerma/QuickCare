import React from 'react';
import { Users } from 'lucide-react';

export function DoctorPatients() {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: 'var(--primary-muted)', color: 'var(--primary)' }}
      >
        <Users size={40} />
      </div>
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Patients Directory</h2>
      <p className="mt-2" style={{ color: 'var(--text-muted)' }}>Comprehensive list of all your assigned patients. Under development.</p>
    </div>
  );
}
