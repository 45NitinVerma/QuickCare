import axios from 'axios';

// ─── Token helpers ────────────────────────────────────────────────────────────
const TOKEN_KEY = 'qc_access';
const REFRESH_KEY = 'qc_refresh';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefresh = () => localStorage.getItem(REFRESH_KEY);
export const setTokens = (a, r) => { localStorage.setItem(TOKEN_KEY, a); localStorage.setItem(REFRESH_KEY, r); };
export const clearTokens = () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(REFRESH_KEY); };

// ─── Axios instance ───────────────────────────────────────────────────────────
// Use the Render URL from env if provided, otherwise fall back to the Vite dev proxy
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach bearer token to every request
api.interceptors.request.use(cfg => {
  const token = getToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// On 401 → try to refresh; on failure → clear tokens and redirect to login
let _refreshing = false;
let _waitQueue = [];

const processQueue = (error, token = null) => {
  _waitQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  _waitQueue = [];
};

api.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config;
    if (err.response?.status !== 401 || orig._retry) {
      return Promise.reject(err);
    }
    const refresh = getRefresh();
    if (!refresh) {
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(err);
    }
    if (_refreshing) {
      return new Promise((resolve, reject) => {
        _waitQueue.push({ resolve, reject });
      }).then(token => {
        orig.headers.Authorization = `Bearer ${token}`;
        return api(orig);
      });
    }
    orig._retry = true;
    _refreshing = true;
    try {
      const { data } = await axios.post(`${BASE_URL}/users/token/refresh/`, { refresh });
      setTokens(data.access, refresh);
      processQueue(null, data.access);
      orig.headers.Authorization = `Bearer ${data.access}`;
      return api(orig);
    } catch (e) {
      processQueue(e);
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(e);
    } finally {
      _refreshing = false;
    }
  }
);

export default api;

// ─── Role mapping (backend ID → frontend string) ──────────────────────────────
export const ROLE_MAP = {
  2: 'Admin',   // Clinic Owner → "Admin" in frontend
  3: 'Patient',
  4: 'Doctor',
  6: 'Lab',
  7: 'Admin',   // also Clinic Owner role ID 7
};

// ─── Namespaced API helpers ───────────────────────────────────────────────────

// Auth
export const authApi = {
  login: (contact, password) => api.post('/users/login/', { contact: Number(contact), password }),
  refresh: (refresh) => api.post('/users/token/refresh/', { refresh }),
  me: () => api.get('/users/me/'),
  updateMe: (data) => api.put('/users/me/', data),
  checkContact: (contact) => api.get(`/users/check/?contact=${contact}`),
  changePass: (password) => api.put('/users/password/change/', { password }),
  medProfile: () => api.get('/users/me/medical-profile/'),
  updateMed: (data) => api.put('/users/me/medical-profile/', data),

  // Patient registration
  patientStep1: (data) => api.post('/users/onboarding/patient/step1/', data),
  patientStep2: (data) => api.post('/users/onboarding/patient/step2/', data),
  patientStep3: (data) => api.patch('/users/onboarding/patient/step3/', data),

  // Clinic owner registration
  clinicStep1: (data) => api.post('/users/onboarding/clinic/step1/', data),
  clinicStep2: (data) => api.post('/users/onboarding/clinic/step2/', data),

  // Staff (doctor / lab / receptionist) first-login profile completion
  memberComplete: (data) => api.patch('/users/onboarding/member/complete/', data),
};

// Clinics
export const clinicApi = {
  publicList: (params) => api.get('/clinics/public/', { params }),
  myClinics: () => api.get('/clinics/'),
  getClinic: (id) => api.get(`/clinics/${id}/`),
  updateClinic: (id, data) => api.put(`/clinics/${id}/`, data),
  onboardStep3: (data) => api.post('/clinics/onboarding/step3/', data),
  memberships: () => api.get('/clinics/my/memberships/'),
  members: (id, params) => api.get(`/clinics/${id}/members/`, { params }),
  addMember: (id, data) => api.post(`/clinics/${id}/members/`, data),
  updateMember: (id, mid, data) => api.put(`/clinics/${id}/members/${mid}/`, data),
  removeMember: (id, mid) => api.delete(`/clinics/${id}/members/${mid}/`),
  slots: (id) => api.get(`/clinics/${id}/slots/`),
  addSlot: (id, data) => api.post(`/clinics/${id}/slots/`, data),
  updateSlot: (id, sid, data) => api.put(`/clinics/${id}/slots/${sid}/`, data),
  deleteSlot: (id, sid) => api.delete(`/clinics/${id}/slots/${sid}/`),
};

// Doctors
export const doctorApi = {
  list: (params) => api.get('/doctors/', { params }),
  detail: (id) => api.get(`/doctors/${id}/`),
  me: () => api.get('/doctors/me/'),
  updateMe: (data) => api.put('/doctors/me/', data),
  availability: (id, params) => api.get(`/doctors/${id}/availability/`, { params }),
  createAvailability: (id, data) => api.post(`/doctors/${id}/availability/`, data),
  deleteAvailability: (id, slotId) => api.delete(`/doctors/${id}/availability/?slot_id=${slotId}`),
  slots: (id, params) => api.get(`/doctors/${id}/availability/slots/`, { params }),
};

// Appointments
export const appointmentApi = {
  myList: (params) => api.get('/appointments/my/', { params }),
  myDetail: (id) => api.get(`/appointments/my/${id}/`),
  book: (data) => api.post('/appointments/my/', data),
  cancel: (id) => api.patch(`/appointments/my/${id}/`, { status: 'cancelled' }),
  doctorList: (params) => api.get('/appointments/doctor/', { params }),
  doctorDetail: (id) => api.get(`/appointments/doctor/${id}/`),
  updateStatus: (id, status) => api.patch(`/appointments/doctor/${id}/`, { status }),
};

// Documents
export const documentApi = {
  // Core CRUD  →  GET/POST /api/documents/
  list: (params) => api.get('/documents/', { params }),
  upload: (form) => api.post('/documents/', form, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Single document  →  GET/DELETE /api/documents/{id}/
  get: (id) => api.get(`/documents/${id}/`),
  delete: (id) => api.delete(`/documents/${id}/`),

  // Access logs
  accessLog: () => api.get('/documents/access-log/'),            // GET /api/documents/access-log/
  docAccessLog: (docId) => api.get(`/documents/${docId}/access-log/`), // GET /api/documents/{doc_id}/access-log/

  // Consent sub-resources
  myConsents: (params) => api.get('/documents/consent/mine/', { params }),       // GET /api/documents/consent/mine/
  doctorConsents: (params) => api.get('/documents/consent/doctor/', { params }), // GET /api/documents/consent/doctor/
  requestConsent: (data) => api.post('/documents/consent/request/', data),       // POST /api/documents/consent/request/
  consentAction: (consentId, action) =>                                          // PATCH /api/documents/consent/{consent_id}/action/
    api.patch(`/documents/consent/${consentId}/action/`, { action }),
};

// User — me, medical profile, addresses, password
export const userApi = {
  getMe: () => api.get('/users/me/'),
  updateMe: (data) => api.put('/users/me/', data),
  getMedical: () => api.get('/users/me/medical-profile/'),
  updateMedical: (data) => api.put('/users/me/medical-profile/', data),
  changePassword: (pw) => api.put('/users/password/change/', { password: pw }),

  // Patient lookup by contact (doctor/lab only)
  lookupByContact: (contact) => api.get(`/users/patient/lookup/?contact=${contact}`),

  // Address
  listAddresses: () => api.get('/users/address/'),
  createAddress: (data) => api.post('/users/address/', data),
  getAddress: (id) => api.get(`/users/address/${id}/`),
  updateAddress: (id, d) => api.put(`/users/address/${id}/`, d),
  deleteAddress: (id) => api.delete(`/users/address/${id}/`),
};

// Prescriptions
export const prescriptionApi = {
  create: (form) => api.post('/prescriptions/', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  myList: (params) => api.get('/prescriptions/', { params }),
};
