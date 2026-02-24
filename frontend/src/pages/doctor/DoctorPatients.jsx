import React from 'react';
import { Users } from 'lucide-react';

export function DoctorPatients() {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
        <Users size={40} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">My Patients Directory</h2>
      <p className="text-gray-500 mt-2">Comprehensive list of all your assigned patients. Under development.</p>
    </div>
  );
}
