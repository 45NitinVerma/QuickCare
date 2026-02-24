import React, { createContext, useState, useContext } from 'react';
import { generateAbhaId } from '../data/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (role, userData = null) => {
    if (userData) {
      setUser({ id: Date.now().toString(), role, ...userData });
      return;
    }
    const defaults = {
      Patient: { id: '1',  role: 'Patient', name: 'Rohan Mehta',      email: 'rohan@patient.com',          abhaId: 'ABHA-4592-8842-1023', bloodGroup: 'O+', mobile: '+91-9876543210', dob: '1991-04-12', gender: 'Male',   state: 'Maharashtra', city: 'Pune',     emergencyContact: { name: 'Priya Mehta',   number: '+91-9898001234' }, medicalInfo: { allergies: 'Penicillin', conditions: 'Hypertension', medications: 'Amlodipine 5mg' } },
      Doctor:  { id: '2',  role: 'Doctor',  name: 'Dr. Priya Venkatesh', email: 'priya.v@quickcare.com',   department: 'Cardiology',  experience: '12 Years', qualification: 'MD, DM Cardiology', licenseNumber: 'MCI-2012-08432', assignedHospital: 'Apollo QuickCare Hospital', mobile: '+91-9845001001' },
      Lab:     { id: '3',  role: 'Lab',     name: 'Sanjay Kudale',      email: 'sanjay@lab.quickcare.com', labDepartment: 'Pathology', qualification: 'B.Sc MLT', employeeId: 'EMP-LAB-001', assignedHospital: 'Apollo QuickCare Hospital', mobile: '+91-9900111001' },
      Admin:   { id: '4',  role: 'Admin',   name: 'Dr. Sunil Varma',    email: 'admin@apolloquickcare.com', hospitalInfo: { name: 'Apollo QuickCare Hospital', registrationNumber: 'MH/HOSP/2018/04821', type: 'Multi-speciality', state: 'Maharashtra', city: 'Mumbai', address: '14, Hiranandani Business Park, Powai, Mumbai – 400076', contactNumber: '+91-22-6780-0000', verificationStatus: 'Verified', certFileName: 'hospital_registration_cert.pdf' } },
    };
    setUser(defaults[role]);
  };

  const register = (role, formData) => {
    const base = { id: Date.now().toString(), role, ...formData };
    if (role === 'Patient') {
      base.abhaId = generateAbhaId();
    }
    if (role === 'Admin') {
      base.hospitalInfo = formData.hospitalInfo || {};
    }
    setUser(base);
    return base;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
