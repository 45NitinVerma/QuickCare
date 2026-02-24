// mockData.js
// Expanded dataset for full functionality testing across all QuickCare roles

// ─── Hospital ────────────────────────────────────────────────────────────────
export const mockHospital = {
  id: 'h1',
  name: 'Apollo QuickCare Hospital',
  registrationNumber: 'MH/HOSP/2018/04821',
  type: 'Multi-speciality',
  state: 'Maharashtra',
  city: 'Mumbai',
  address: '14, Hiranandani Business Park, Powai, Mumbai – 400076',
  pincode: '400076',
  contactNumber: '+91-22-6780-0000',
  email: 'info@apolloquickcare.com',
  website: 'www.apolloquickcare.com',
  gstNumber: '27AACCA0001B1ZQ',
  panNumber: 'AACCA0001B',
  verificationStatus: 'Verified',
  certFileName: 'hospital_registration_cert.pdf',
  adminId: '4',
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const mockUsers = [
  // Patients (10 with ABHA IDs)
  { id: '1',  role: 'Patient', name: 'Rohan Mehta',       email: 'rohan@patient.com',   age: 34, gender: 'Male',   dob: '1991-04-12', bloodGroup: 'O+',  mobile: '+91-9876543210', abhaId: 'ABHA-4592-8842-1023', emergencyContact: { name: 'Priya Mehta', number: '+91-9898001234' }, address: '12, Shivaji Nagar, Pune', state: 'Maharashtra', city: 'Pune',   medicalInfo: { allergies: 'Penicillin', conditions: 'Hypertension', medications: 'Amlodipine 5mg' } },
  { id: '5',  role: 'Patient', name: 'Anjali Sharma',     email: 'anjali@patient.com',  age: 28, gender: 'Female', dob: '1997-08-22', bloodGroup: 'B+',  mobile: '+91-9845001122', abhaId: 'ABHA-3311-7742-9988', emergencyContact: { name: 'Raj Sharma', number: '+91-9845551234' },  address: '45, Banjara Hills, Hyderabad', state: 'Telangana',   city: 'Hyderabad', medicalInfo: { allergies: 'None', conditions: 'None', medications: 'None' } },
  { id: '6',  role: 'Patient', name: 'Vikram Nair',       email: 'vikram@patient.com',  age: 45, gender: 'Male',   dob: '1980-01-30', bloodGroup: 'A+',  mobile: '+91-9711023344', abhaId: 'ABHA-2244-9931-5571', emergencyContact: { name: 'Suma Nair', number: '+91-9711009988' },   address: '22, MG Road, Kochi', state: 'Kerala',       city: 'Kochi',     medicalInfo: { allergies: 'Sulfa drugs', conditions: 'Type 2 Diabetes', medications: 'Metformin 500mg' } },
  { id: '7',  role: 'Patient', name: 'Lakshmi Pillai',    email: 'lakshmi@patient.com', age: 62, gender: 'Female', dob: '1963-03-18', bloodGroup: 'AB+', mobile: '+91-9944332211', abhaId: 'ABHA-7781-6620-4492', emergencyContact: { name: 'Suresh Pillai', number: '+91-9944001122' }, address: '3, Besant Nagar, Chennai', state: 'Tamil Nadu',   city: 'Chennai',   medicalInfo: { allergies: 'Aspirin', conditions: 'Arthritis, Hypothyroidism', medications: 'Levothyroxine 50mcg' } },
  { id: '8',  role: 'Patient', name: 'Arjun Kapoor',      email: 'arjun@patient.com',   age: 50, gender: 'Male',   dob: '1975-11-05', bloodGroup: 'B-',  mobile: '+91-9820001144', abhaId: 'ABHA-8890-1123-6634', emergencyContact: { name: 'Meera Kapoor', number: '+91-9820551234' },  address: '7, Jubilee Hills, Hyderabad', state: 'Telangana',  city: 'Hyderabad', medicalInfo: { allergies: 'None', conditions: 'Asthma', medications: 'Salbutamol inhaler' } },
  { id: '9',  role: 'Patient', name: 'Divya Reddy',       email: 'divya@patient.com',   age: 22, gender: 'Female', dob: '2003-07-14', bloodGroup: 'O-',  mobile: '+91-9966112233', abhaId: 'ABHA-5519-3381-2207', emergencyContact: { name: 'Ramesh Reddy', number: '+91-9966001234' },  address: '18, Film Nagar, Hyderabad', state: 'Telangana',    city: 'Hyderabad', medicalInfo: { allergies: 'Latex', conditions: 'None', medications: 'None' } },
  { id: '10', role: 'Patient', name: 'Suresh Iyer',       email: 'suresh@patient.com',  age: 39, gender: 'Male',   dob: '1986-09-27', bloodGroup: 'A-',  mobile: '+91-9445001234', abhaId: 'ABHA-6673-4420-8819', emergencyContact: { name: 'Kavitha Iyer', number: '+91-9445551234' },  address: '9, T Nagar, Chennai', state: 'Tamil Nadu',         city: 'Chennai',   medicalInfo: { allergies: 'None', conditions: 'Migraine', medications: 'Sumatriptan 50mg' } },
  { id: '11', role: 'Patient', name: 'Pooja Singh',       email: 'pooja@patient.com',   age: 71, gender: 'Female', dob: '1954-12-03', bloodGroup: 'O+',  mobile: '+91-9811233445', abhaId: 'ABHA-1182-5591-3374', emergencyContact: { name: 'Rahul Singh', number: '+91-9811001234' },   address: '15, Civil Lines, Delhi', state: 'Delhi',        city: 'New Delhi', medicalInfo: { allergies: 'None', conditions: 'Hypertension, Diabetes', medications: 'Lisinopril 10mg, Insulin' } },
  { id: '12', role: 'Patient', name: 'Kiran Desai',       email: 'kiran@patient.com',   age: 33, gender: 'Male',   dob: '1992-06-18', bloodGroup: 'B+',  mobile: '+91-9619001234', abhaId: 'ABHA-9923-6680-1145', emergencyContact: { name: 'Neha Desai', number: '+91-9619551234' },   address: '56, Dadar, Mumbai', state: 'Maharashtra',           city: 'Mumbai',    medicalInfo: { allergies: 'None', conditions: 'None', medications: 'None' } },
  { id: '13', role: 'Patient', name: 'Sunita Gupta',      email: 'sunita@patient.com',  age: 47, gender: 'Female', dob: '1978-02-28', bloodGroup: 'AB-', mobile: '+91-9971112233', abhaId: 'ABHA-4401-2293-7758', emergencyContact: { name: 'Ramesh Gupta', number: '+91-9971001234' },  address: '33, Karol Bagh, Delhi', state: 'Delhi',        city: 'New Delhi', medicalInfo: { allergies: 'Amoxicillin', conditions: 'Thyroid disorder', medications: 'Eltroxin 100mcg' } },
  // Staff
  { id: '2',  role: 'Doctor', name: 'Dr. Priya Venkatesh',  email: 'priya.v@quickcare.com',    department: 'Cardiology' },
  { id: 'd2', role: 'Doctor', name: 'Dr. Arun Krishnan',    email: 'arun.k@quickcare.com',     department: 'Neurology' },
  { id: 'd3', role: 'Doctor', name: 'Dr. Sneha Patil',      email: 'sneha.p@quickcare.com',    department: 'Pediatrics' },
  { id: 'd4', role: 'Doctor', name: 'Dr. Rajan Bose',       email: 'rajan.b@quickcare.com',    department: 'Orthopedics' },
  { id: 'd5', role: 'Doctor', name: 'Dr. Kavya Menon',      email: 'kavya.m@quickcare.com',    department: 'Dermatology' },
  { id: '3',  role: 'Lab',    name: 'Sanjay Kudale',        email: 'sanjay@lab.quickcare.com'  },
  { id: 'l2', role: 'Lab',    name: 'Pritha Chatterjee',    email: 'pritha@lab.quickcare.com'  },
  { id: 'l3', role: 'Lab',    name: 'Mohan Rao',            email: 'mohan@lab.quickcare.com'   },
  { id: '4',  role: 'Admin',  name: 'Dr. Sunil Varma',      email: 'admin@apolloquickcare.com' },
];

// ─── Doctors (extended) ───────────────────────────────────────────────────────
export const mockDoctors = [
  { id: '2',  name: 'Dr. Priya Venkatesh', department: 'Cardiology',     experience: '12 Years', rating: 4.9, activePatients: 145, email: 'priya.v@quickcare.com',    mobile: '+91-9845001001', qualification: 'MD, DM Cardiology', licenseNumber: 'MCI-2012-08432', assignedHospital: 'Apollo QuickCare Hospital', status: 'Active' },
  { id: 'd2', name: 'Dr. Arun Krishnan',   department: 'Neurology',       experience: '8 Years',  rating: 4.7, activePatients: 89,  email: 'arun.k@quickcare.com',     mobile: '+91-9845002002', qualification: 'MD, DM Neurology',   licenseNumber: 'MCI-2016-11204', assignedHospital: 'Apollo QuickCare Hospital', status: 'Active' },
  { id: 'd3', name: 'Dr. Sneha Patil',     department: 'Pediatrics',      experience: '15 Years', rating: 4.8, activePatients: 210, email: 'sneha.p@quickcare.com',    mobile: '+91-9845003003', qualification: 'MBBS, MD Pediatrics', licenseNumber: 'MCI-2009-05812', assignedHospital: 'Apollo QuickCare Hospital', status: 'Active' },
  { id: 'd4', name: 'Dr. Rajan Bose',      department: 'Orthopedics',     experience: '20 Years', rating: 4.6, activePatients: 305, email: 'rajan.b@quickcare.com',    mobile: '+91-9845004004', qualification: 'MS Orthopedics',      licenseNumber: 'MCI-2004-02183', assignedHospital: 'Apollo QuickCare Hospital', status: 'Active' },
  { id: 'd5', name: 'Dr. Kavya Menon',     department: 'Dermatology',     experience: '5 Years',  rating: 4.5, activePatients: 120, email: 'kavya.m@quickcare.com',    mobile: '+91-9845005005', qualification: 'MBBS, MD Dermatology', licenseNumber: 'MCI-2019-18921', assignedHospital: 'Apollo QuickCare Hospital', status: 'Active' },
];

// ─── Lab Personnel (new) ──────────────────────────────────────────────────────
export const mockLabPersonnel = [
  { id: '3',  name: 'Sanjay Kudale',     labDepartment: 'Pathology',  qualification: 'B.Sc MLT', employeeId: 'EMP-LAB-001', email: 'sanjay@lab.quickcare.com',  mobile: '+91-9900111001', assignedHospital: 'Apollo QuickCare Hospital', status: 'Active' },
  { id: 'l2', name: 'Pritha Chatterjee', labDepartment: 'Radiology',  qualification: 'B.Sc Radiology', employeeId: 'EMP-LAB-002', email: 'pritha@lab.quickcare.com',  mobile: '+91-9900111002', assignedHospital: 'Apollo QuickCare Hospital', status: 'Active' },
  { id: 'l3', name: 'Mohan Rao',         labDepartment: 'Microbiology', qualification: 'M.Sc Microbiology', employeeId: 'EMP-LAB-003', email: 'mohan@lab.quickcare.com', mobile: '+91-9900111003', assignedHospital: 'Apollo QuickCare Hospital', status: 'Active' },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
const getDateStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

// ─── Appointments ─────────────────────────────────────────────────────────────
export const mockAppointments = [
  { id: 'a1',  patientId: '1',  patientName: 'Rohan Mehta',    doctorId: '2',  doctorName: 'Dr. Priya Venkatesh', date: getDateStr(0),   time: '10:00 AM', status: 'Confirmed', reason: 'Routine Checkup' },
  { id: 'a2',  patientId: '5',  patientName: 'Anjali Sharma',  doctorId: '2',  doctorName: 'Dr. Priya Venkatesh', date: getDateStr(0),   time: '11:30 AM', status: 'Pending',   reason: 'Heart Palpitations' },
  { id: 'a6',  patientId: '9',  patientName: 'Divya Reddy',    doctorId: '2',  doctorName: 'Dr. Priya Venkatesh', date: getDateStr(0),   time: '02:00 PM', status: 'Confirmed', reason: 'ECG Follow-up' },
  { id: 'a7',  patientId: '10', patientName: 'Suresh Iyer',    doctorId: 'd2', doctorName: 'Dr. Arun Krishnan',   date: getDateStr(0),   time: '09:00 AM', status: 'Confirmed', reason: 'Chronic Headaches' },
  { id: 'a3',  patientId: '6',  patientName: 'Vikram Nair',    doctorId: 'd2', doctorName: 'Dr. Arun Krishnan',   date: getDateStr(1),   time: '02:00 PM', status: 'Confirmed', reason: 'Migraines' },
  { id: 'a4',  patientId: '1',  patientName: 'Rohan Mehta',    doctorId: 'd3', doctorName: 'Dr. Sneha Patil',     date: getDateStr(2),   time: '09:30 AM', status: 'Confirmed', reason: 'Child Checkup' },
  { id: 'a5',  patientId: '5',  patientName: 'Anjali Sharma',  doctorId: '2',  doctorName: 'Dr. Priya Venkatesh', date: getDateStr(5),   time: '03:15 PM', status: 'Pending',   reason: 'Follow-up' },
  { id: 'a8',  patientId: '7',  patientName: 'Lakshmi Pillai', doctorId: 'd4', doctorName: 'Dr. Rajan Bose',      date: getDateStr(3),   time: '10:45 AM', status: 'Confirmed', reason: 'Knee Pain Consult' },
  { id: 'a9',  patientId: '8',  patientName: 'Arjun Kapoor',   doctorId: 'd5', doctorName: 'Dr. Kavya Menon',     date: getDateStr(7),   time: '01:00 PM', status: 'Confirmed', reason: 'Skin Rash Assessment' },
  { id: 'pa1', patientId: '1',  patientName: 'Rohan Mehta',    doctorId: '2',  doctorName: 'Dr. Priya Venkatesh', date: getDateStr(-15), time: '11:00 AM', status: 'Completed', reason: 'Initial Consultation' },
  { id: 'pa2', patientId: '11', patientName: 'Pooja Singh',    doctorId: '2',  doctorName: 'Dr. Priya Venkatesh', date: getDateStr(-2),  time: '03:00 PM', status: 'Completed', reason: 'Blood Pressure Monitoring' },
];

// ─── Reports ──────────────────────────────────────────────────────────────────
export const mockReports = [
  { id: 'r1', patientId: '1',  name: 'Complete Blood Count',  type: 'Pathology', date: getDateStr(-5),  aiSummary: 'All values within normal limits. WBC slightly elevated. Maintain hydration.', status: 'Reviewed',      labTech: 'Sanjay Kudale' },
  { id: 'r2', patientId: '1',  name: 'ECG Scan',              type: 'Radiology', date: getDateStr(-10), aiSummary: 'Normal sinus rhythm. No acute ST-T wave changes. Stable baseline.', status: 'Reviewed',          labTech: 'Pritha Chatterjee' },
  { id: 'r5', patientId: '7',  name: 'X-Ray Knee',            type: 'Radiology', date: getDateStr(-4),  aiSummary: 'Mild osteoarthritis in medial compartment right knee. No fractures.', status: 'Reviewed',          labTech: 'Pritha Chatterjee' },
  { id: 'r6', patientId: '8',  name: 'Allergy Panel Profile', type: 'Pathology', date: getDateStr(-12), aiSummary: 'Severe reaction to peanuts and shellfish. Moderate to dust mites. Prescribe EpiPen.', status: 'Reviewed', labTech: 'Sanjay Kudale' },
  { id: 'r3', patientId: '5',  name: 'Lipid Panel',           type: 'Pathology', date: getDateStr(-2),  aiSummary: 'Mildly elevated LDL (135 mg/dL). HDL normal. Recommend dietary changes.', status: 'Needs Review',   labTech: 'Sanjay Kudale' },
  { id: 'r4', patientId: '6',  name: 'MRI Brain',             type: 'Radiology', date: getDateStr(-1),  aiSummary: 'No acute intracranial abnormality. Stable small vessel ischemic changes.', status: 'Needs Review',  labTech: 'Pritha Chatterjee' },
  { id: 'r7', patientId: '9',  name: 'Thyroid Function Test', type: 'Pathology', date: getDateStr(0),   aiSummary: 'TSH slightly below normal (0.3 mIU/L). Mild hyperthyroidism. T3, T4 normal.', status: 'Needs Review', labTech: 'Sanjay Kudale' },
  { id: 'r8', patientId: '10', name: 'Urinalysis',            type: 'Pathology', date: getDateStr(-1),  aiSummary: 'Trace leukocytes detected. Suggestive of early asymptomatic UTI. Clinical correlation required.', status: 'Needs Review', labTech: 'Pritha Chatterjee' },
];

// ─── Admissions ───────────────────────────────────────────────────────────────
export const mockAdmissions = [
  { id: 'ad1', patientId: '1',  status: 'Pending Documents', date: getDateStr(10),  department: 'Cardiology',    reason: 'Angiography',        documents: [{ name: 'ID Proof', uploaded: true, type: 'pdf' }, { name: 'Insurance Card', uploaded: false, type: 'pdf' }, { name: 'Consent Form', uploaded: false, type: 'pdf' }] },
  { id: 'ad2', patientId: '5',  status: 'Approved',          date: getDateStr(15),  department: 'General Surgery', reason: 'Appendectomy',      documents: [{ name: 'ID Proof', uploaded: true, type: 'pdf' }, { name: 'Insurance Card', uploaded: true, type: 'pdf' }] },
  { id: 'ad3', patientId: '7',  status: 'Discharged',        date: getDateStr(-30), department: 'Orthopedics',   reason: 'Knee Replacement',   documents: [{ name: 'ID Proof', uploaded: true, type: 'pdf' }, { name: 'Discharge Summary', uploaded: true, type: 'pdf' }] },
  { id: 'ad4', patientId: '10', status: 'Pending Documents', date: getDateStr(5),   department: 'Neurology',     reason: 'Overnight Observation', documents: [{ name: 'ID Proof', uploaded: false, type: 'pdf' }] },
];

// ─── Prescriptions ────────────────────────────────────────────────────────────
export const mockPrescriptions = [
  { id: 'pr1', patientId: '1',  doctorId: '2',  date: getDateStr(-15), medicine: 'Aspirin 81mg',              dosage: '1 tablet daily',             duration: '30 days',    notes: 'Take after meals.' },
  { id: 'pr2', patientId: '5',  doctorId: '2',  date: getDateStr(-3),  medicine: 'Atorvastatin 20mg',         dosage: '1 tablet tonight',           duration: '90 days',    notes: 'Cholesterol control. No grapefruit juice.' },
  { id: 'pr3', patientId: '6',  doctorId: 'd2', date: getDateStr(-10), medicine: 'Sumatriptan 50mg',          dosage: '1 tablet at onset of migraine', duration: 'As needed', notes: 'Max 2 tablets in 24 hours.' },
  { id: 'pr4', patientId: '8',  doctorId: 'd5', date: getDateStr(-7),  medicine: 'Hydrocortisone 1% Cream',   dosage: 'Apply thin layer twice daily', duration: '14 days',   notes: 'Affected areas only. Avoid eyes.' },
  { id: 'pr5', patientId: '11', doctorId: '2',  date: getDateStr(-2),  medicine: 'Lisinopril 10mg',           dosage: '1 tablet every morning',     duration: '60 days',    notes: 'Monitor BP weekly.' },
  { id: 'pr6', patientId: '1',  doctorId: 'd3', date: getDateStr(-45), medicine: 'Amoxicillin 500mg',         dosage: '1 capsule every 8 hours',    duration: '7 days',     notes: 'Complete full course.' },
];

// ─── Consents ─────────────────────────────────────────────────────────────────
export const patientConsents = [
  { id: 'c1', patientId: '1',  doctorId: '2',  doctorName: 'Dr. Priya Venkatesh', status: 'Granted', requestDate: getDateStr(-20) },
  { id: 'c2', patientId: '5',  doctorId: 'd2', doctorName: 'Dr. Arun Krishnan',   status: 'Pending', requestDate: getDateStr(-1) },
  { id: 'c3', patientId: '1',  doctorId: 'd3', doctorName: 'Dr. Sneha Patil',     status: 'Granted', requestDate: getDateStr(-60) },
  { id: 'c4', patientId: '6',  doctorId: 'd2', doctorName: 'Dr. Arun Krishnan',   status: 'Granted', requestDate: getDateStr(-15) },
  { id: 'c5', patientId: '9',  doctorId: '2',  doctorName: 'Dr. Priya Venkatesh', status: 'Granted', requestDate: getDateStr(-5) },
  { id: 'c6', patientId: '11', doctorId: 'd4', doctorName: 'Dr. Rajan Bose',      status: 'Revoked', requestDate: getDateStr(-100) },
];

// ─── ABHA generator utility ───────────────────────────────────────────────────
export const generateAbhaId = () => {
  const seg = () => Math.floor(1000 + Math.random() * 9000);
  return `ABHA-${seg()}-${seg()}-${seg()}`;
};
