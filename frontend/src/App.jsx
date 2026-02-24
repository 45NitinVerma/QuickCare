import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { HospitalAdminRegister } from './pages/HospitalAdminRegister';
import { PatientRegister } from './pages/PatientRegister';

// Patient Routes
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { BookAppointment } from './pages/patient/BookAppointment';
import { PatientReports } from './pages/patient/PatientReports';
import { ConsentManagement } from './pages/patient/ConsentManagement';
import { AdmissionStatus } from './pages/patient/AdmissionStatus';
import { PatientProfile } from './pages/patient/PatientProfile';

// Doctor Routes
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { PatientQueue } from './pages/doctor/PatientQueue';
import { PatientDetails } from './pages/doctor/PatientDetails';
import { PrescriptionForm } from './pages/doctor/PrescriptionForm';
import { DoctorProfile } from './pages/doctor/DoctorProfile';
import { DoctorPatients } from './pages/doctor/DoctorPatients';
import { DoctorPrescriptions } from './pages/doctor/DoctorPrescriptions';
import { DoctorReports } from './pages/doctor/DoctorReports';

// Lab Routes
import { LabDashboard } from './pages/lab/LabDashboard';
import { UploadReport } from './pages/lab/UploadReport';
import { LabProfile } from './pages/lab/LabProfile';

// Admin Routes
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AnalyticsViewer } from './pages/admin/AnalyticsViewer';
import { AdminProfile } from './pages/admin/AdminProfile';
import { ManageStaff } from './pages/admin/ManageStaff';
import { AdminSlots } from './pages/admin/AdminSlots';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/admin" element={<HospitalAdminRegister />} />
          <Route path="/register/patient" element={<PatientRegister />} />

          {/* Protected Routes inside MainLayout */}
          <Route element={<MainLayout />}>
            
            {/* Patient Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Patient']} />}>
              <Route path="/patient" element={<PatientDashboard />} />
              <Route path="/patient/book" element={<BookAppointment />} />
              <Route path="/patient/reports" element={<PatientReports />} />
              <Route path="/patient/consent" element={<ConsentManagement />} />
              <Route path="/patient/admission" element={<AdmissionStatus />} />
              <Route path="/patient/profile" element={<PatientProfile />} />
            </Route>

            {/* Doctor Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Doctor']} />}>
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/queue" element={<PatientQueue />} />
              <Route path="/doctor/patient/:id" element={<PatientDetails />} />
              <Route path="/doctor/prescribe/:id" element={<PrescriptionForm />} />
              <Route path="/doctor/profile" element={<DoctorProfile />} />
              <Route path="/doctor/patients" element={<DoctorPatients />} />
              <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
              <Route path="/doctor/reports" element={<DoctorReports />} />
            </Route>

            {/* Lab Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Lab']} />}>
              <Route path="/lab" element={<LabDashboard />} />
              <Route path="/lab/upload" element={<UploadReport />} />
              <Route path="/lab/profile" element={<LabProfile />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/analytics" element={<AnalyticsViewer />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/staff" element={<ManageStaff />} />
              <Route path="/admin/slots" element={<AdminSlots />} />
            </Route>

          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
