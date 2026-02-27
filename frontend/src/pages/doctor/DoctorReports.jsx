import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  Eye, FileText, Shield, Plus, Loader2,
  Sparkles, X, User, Activity, AlertTriangle,
  BedDouble, Stethoscope, CheckCircle2, Info,
  FileSearch, MessageSquare, ClipboardList, Download, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { documentApi, appointmentApi } from '../../services/api';

/* ─── View Report Modal ────────────────────────────────────── */
function ViewReportModal({ isOpen, onClose, fileUrl, filename }) {
  if (!isOpen) return null;

  const isImage = fileUrl && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileUrl.split('?')[0]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-4xl flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xl)',
              height: '88vh',
            }}
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            {/* Header */}
            <div
              className="shrink-0 flex items-center gap-3 px-5 py-4 border-b"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
              >
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {filename || 'Report'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Document Preview</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={fileUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{ background: 'var(--primary-muted)', color: 'var(--primary)', border: '1px solid var(--border)' }}
                >
                  <Download size={13} />
                  Download
                </a>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  <ExternalLink size={13} />
                  Open
                </a>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Viewer body */}
            <div className="flex-1 overflow-hidden bg-neutral-900">
              {isImage ? (
                <div className="w-full h-full flex items-center justify-center p-6 overflow-auto">
                  <img
                    src={fileUrl}
                    alt={filename}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
                  />
                </div>
              ) : (
                <iframe
                  src={fileUrl}
                  title={filename}
                  className="w-full h-full"
                  style={{ border: 'none' }}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Quick Summary Modal ───────────────────────────────────── */
function SummaryModal({ isOpen, onClose, summary, filename, loading, error }) {
  if (!isOpen) return null;
  const s = summary;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-lg flex flex-col rounded-2xl overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            {/* Header */}
            <div className="shrink-0 relative overflow-hidden p-5 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' }}>
              <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-end pr-4">
                <FileSearch size={90} />
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative z-10"
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
                <FileSearch size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <h2 className="font-bold text-white text-base leading-tight">Quick Summary</h2>
                <p className="text-xs text-blue-100 mt-0.5 truncate">{filename || 'Medical Report'}</p>
              </div>
              <button onClick={onClose} className="relative z-10 text-white/70 hover:text-white transition-colors ml-2">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-14 gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(14,165,233,0.1)' }}>
                    <Loader2 size={26} className="animate-spin" style={{ color: '#0ea5e9' }} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Generating Summary…</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Reading the report for key insights.</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                  <AlertTriangle size={32} style={{ color: '#ef4444' }} />
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Summary Failed</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
                </div>
              )}

              {/* Results */}
              {!loading && !error && s && (
                <motion.div className="space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

                  {/* Patient chip */}
                  {s.patient_info?.name && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(14,165,233,0.12)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.25)' }}>
                      <User size={11} />
                      {s.patient_info.name}{s.patient_info.age ? `, ${s.patient_info.age} yrs` : ''}{s.patient_info.gender ? ` · ${s.patient_info.gender}` : ''}
                    </div>
                  )}

                  {/* One-line summary hero card */}
                  {s.one_line_summary && (
                    <div className="relative rounded-2xl overflow-hidden p-5"
                      style={{ background: 'linear-gradient(135deg,rgba(14,165,233,0.08) 0%,rgba(99,102,241,0.08) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      {/* decorative icon */}
                      <div className="absolute top-3 right-3 opacity-10">
                        <MessageSquare size={48} />
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: 'linear-gradient(135deg,#0ea5e9,#6366f1)' }}>
                          <MessageSquare size={14} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#0ea5e9' }}>Summary</p>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{s.one_line_summary}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {s.recommendations && (
                    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      <div className="flex items-center gap-2 px-4 py-2.5"
                        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                        <ClipboardList size={14} style={{ color: 'var(--primary)' }} />
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Recommendations</span>
                      </div>
                      <div className="p-4">
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{s.recommendations}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {!loading && (
              <div className="shrink-0 flex justify-end px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <Button onClick={onClose}>Close</Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── AI Analysis Modal ─────────────────────────────────────── */
function AnalysisModal({ isOpen, onClose, analysis, filename, loading, error }) {
  if (!isOpen) return null;

  const a = analysis;

  const severityColor = (s) => {
    if (!s) return 'var(--text-muted)';
    const l = s.toLowerCase();
    if (l === 'normal' || l === 'low') return '#22c55e';
    if (l === 'moderate' || l === 'medium') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            {/* Header */}
            <div className="shrink-0 relative overflow-hidden p-5 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)' }}>
              <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-end pr-4">
                <Sparkles size={90} />
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
                <Sparkles size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <h2 className="font-bold text-white text-base leading-tight">AI Report Analysis</h2>
                <p className="text-xs text-blue-100 mt-0.5 truncate">{filename || 'Medical Report'}</p>
              </div>
              <button onClick={onClose} className="relative z-10 text-white/70 hover:text-white transition-colors ml-2">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--primary-muted)' }}>
                    <Loader2 size={26} className="animate-spin" style={{ color: 'var(--primary)' }} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Analysing Report…</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Our AI is reading the document. This may take a moment.</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <AlertTriangle size={36} style={{ color: 'var(--error, #ef4444)' }} />
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Analysis Failed</p>
                  <p className="text-sm max-w-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
                </div>
              )}

              {/* Results */}
              {!loading && !error && a && (
                <motion.div className="space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

                  {/* Patient Info */}
                  {a.patient_info && (
                    <Section icon={<User size={15} />} title="Patient Information" accent="var(--primary)">
                      <div className="grid grid-cols-2 gap-3">
                        <Info2 label="Name" value={a.patient_info.name} />
                        <Info2 label="Age" value={a.patient_info.age != null ? `${a.patient_info.age} yrs` : '—'} />
                        <Info2 label="Gender" value={a.patient_info.gender} />
                        <Info2 label="Patient ID" value={a.patient_info.patient_id} mono />
                      </div>
                    </Section>
                  )}

                  {/* One-line Summary */}
                  {a.summary?.one_line_summary && (
                    <div className="flex items-start gap-3 p-4 rounded-xl"
                      style={{ background: 'var(--primary-muted)', border: '1px solid var(--primary)', borderOpacity: 0.3 }}>
                      <Info size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{a.summary.one_line_summary}</p>
                    </div>
                  )}

                  {/* Lab Analysis + Risk Assessment side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {a.lab_analysis && (
                      <Section icon={<Activity size={15} />} title="Lab Analysis" accent={severityColor(a.lab_analysis.overall_severity)}>
                        <div className="space-y-2.5">
                          <BigStat
                            emoji={a.lab_analysis.overall_emoji}
                            label="Severity"
                            value={a.lab_analysis.overall_severity}
                            color={severityColor(a.lab_analysis.overall_severity)}
                          />
                          <Info2 label="Normal Results" value={`${a.lab_analysis.normal_count ?? '—'} markers`} />
                          <div className="flex items-center gap-2 text-xs">
                            <span style={{ color: 'var(--text-muted)' }}>Immediate Attention</span>
                            {a.lab_analysis.requires_immediate_attention
                              ? <Badge variant="danger">Required</Badge>
                              : <Badge variant="success">Not Required</Badge>}
                          </div>
                        </div>
                      </Section>
                    )}

                    {a.risk_assessment && (
                      <Section icon={<AlertTriangle size={15} />} title="Risk Assessment" accent={severityColor(a.risk_assessment.overall_risk_level)}>
                        <div className="space-y-2.5">
                          <BigStat
                            emoji={a.risk_assessment.risk_emoji}
                            label="Risk Level"
                            value={a.risk_assessment.overall_risk_level}
                            color={severityColor(a.risk_assessment.overall_risk_level)}
                          />
                          {a.risk_assessment.priority_message && (
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                              {a.risk_assessment.priority_message}
                            </p>
                          )}
                        </div>
                      </Section>
                    )}
                  </div>

                  {/* Bed Management */}
                  {a.bed_management && (
                    <Section icon={<BedDouble size={15} />} title="Bed Management">
                      <div className="grid grid-cols-2 gap-3">
                        <Info2 label="Recommended Ward" value={a.bed_management.recommended_ward} />
                        <Info2 label="Estimated Stay" value={`${a.bed_management.estimated_stay_days ?? 0} day(s)`} />
                      </div>
                    </Section>
                  )}

                  {/* Doctor Advice */}
                  {a.doctor_advice && (
                    <Section icon={<Stethoscope size={15} />} title="Doctor's Advice" accent="#6366f1">
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{a.doctor_advice}</p>
                    </Section>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {!loading && (
              <div className="shrink-0 flex justify-end px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <Button onClick={onClose}>Close</Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── small helpers ── */
function Section({ icon, title, accent = 'var(--primary)', children }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 px-4 py-2.5"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: accent }}>{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Info2({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className={`text-sm font-medium ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--text-primary)' }}>
        {value || '—'}
      </p>
    </div>
  );
}

function BigStat({ emoji, label, value, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-sm font-bold" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────── */
export function DoctorReports() {
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Modal
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [reqData, setReqData] = useState({ patientId: '', documentId: '', manualUuid: '', purpose: '', expires_at: '' });
  const [reqPatients, setReqPatients] = useState([]);
  const [reqDocs, setReqDocs] = useState([]);   // known docs from existing consents
  const [reqPatientsLoading, setReqPatientsLoading] = useState(false);
  const [reqDocsError, setReqDocsError] = useState(null);

  // Quick Summary Modal
  const [summaryModal, setSummaryModal] = useState({ open: false, loading: false, summary: null, filename: '', error: null });

  // AI Analysis Modal
  const [analysisModal, setAnalysisModal] = useState({ open: false, loading: false, analysis: null, filename: '', error: null });

  // View Report Modal
  const [viewModal, setViewModal] = useState({ open: false, fileUrl: '', filename: '' });

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const [docsRes, reqsRes] = await Promise.all([
        documentApi.list(),
        documentApi.doctorConsents()
      ]);
      setDocuments(Array.isArray(docsRes.data) ? docsRes.data : (docsRes.data.results || []));
      setRequests(Array.isArray(reqsRes.data) ? reqsRes.data : (reqsRes.data.results || []));
    } catch {
      setDocuments([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  // Open Request Modal and fetch appointed patients from appointments
  const openReqModal = async () => {
    setReqData({ patientId: '', documentId: '', purpose: '', expires_at: '' });
    setReqDocs([]);
    setReqDocsError(null);
    setIsReqModalOpen(true);
    setReqPatientsLoading(true);
    try {
      const { data } = await appointmentApi.doctorList({ page_size: 200 });
      const appts = Array.isArray(data) ? data : (data.results || []);
      // De-duplicate patients
      const seen = new Set();
      const patients = [];
      for (const appt of appts) {
        const p = appt.patient;
        if (p && !seen.has(p.id)) {
          seen.add(p.id);
          patients.push({ id: p.id, name: p.name || `Patient #${p.id}` });
        }
      }
      setReqPatients(patients);
    } catch {
      setReqPatients([]);
    } finally {
      setReqPatientsLoading(false);
    }
  };

  // When a patient is selected, surface known docs from existing consent requests
  const handlePatientChange = (patientId) => {
    setReqData(prev => ({ ...prev, patientId, documentId: '', manualUuid: '' }));
    setReqDocsError(null);
    if (!patientId) { setReqDocs([]); return; }
    // Mine known document info from the doctor's existing consent requests
    const known = requests
      .filter(r => {
        const pid = r.patient?.id ?? r.patient;
        return String(pid) === String(patientId);
      })
      .reduce((acc, r) => {
        const doc = r.document;
        if (!doc) return acc;
        const id = typeof doc === 'object' ? doc.id : doc;
        const title = typeof doc === 'object' ? (doc.title || doc.document_type || id) : id;
        if (id && !acc.find(d => d.id === id)) acc.push({ id, title });
        return acc;
      }, []);
    setReqDocs(known);
    if (known.length === 0) setReqDocsError('No previously requested documents found for this patient. Enter the document UUID below.');
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const docId = reqData.documentId || reqData.manualUuid.trim();
    if (!docId) { alert('Please select a document or enter a Document UUID.'); return; }
    setRequesting(true);
    try {
      const payload = { document: docId, purpose: reqData.purpose || undefined };
      if (reqData.expires_at) payload.expires_at = new Date(reqData.expires_at).toISOString();
      await documentApi.requestConsent(payload);
      setIsReqModalOpen(false);
      setReqData({ patientId: '', documentId: '', manualUuid: '', purpose: '', expires_at: '' });
      setReqDocs([]);
      loadDocs();
    } catch (err) {
      console.error(err);
      alert('Failed to request access. Ensure the document UUID is correct.');
    } finally {
      setRequesting(false);
    }
  };

  const handleAnalyse = async (doc) => {
    setAnalysisModal({ open: true, loading: true, analysis: null, filename: doc.title || doc.file, error: null });

    try {
      // 1. Fetch the actual file blob from doc.file URL
      const fileRes = await fetch(doc.file);
      if (!fileRes.ok) throw new Error('Could not fetch the document file.');
      const blob = await fileRes.blob();

      // Determine a sensible filename
      const urlParts = doc.file.split('/');
      const inferredFilename = urlParts[urlParts.length - 1] || 'report.pdf';

      // 2. Build multipart/form-data for the AI endpoint
      const form = new FormData();
      form.append('file', new File([blob], inferredFilename, { type: blob.type || 'application/pdf' }));
      form.append('age', doc.patient?.age ?? 0);
      form.append('gender', doc.patient?.gender ?? 'Unknown');
      form.append('prev_admissions', 0);

      const baseUrl = import.meta.env.VITE_AI_URL?.replace(/\/$/, '');
      const apiRes = await fetch(`${baseUrl}/report/full-analysis`, {
        method: 'POST',
        headers: { accept: 'application/json' },
        body: form,
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        throw new Error(errText || `Server error ${apiRes.status}`);
      }

      const data = await apiRes.json();
      if (data.status !== 'success') throw new Error('Analysis returned a non-success status.');

      setAnalysisModal(prev => ({ ...prev, loading: false, analysis: data.analysis, filename: data.filename }));
    } catch (err) {
      setAnalysisModal(prev => ({ ...prev, loading: false, error: err.message || 'Analysis failed. Please try again.' }));
    }
  };

  const handleSummary = async (doc) => {
    setSummaryModal({ open: true, loading: true, summary: null, filename: doc.title || doc.file, error: null });
    try {
      const fileRes = await fetch(doc.file);
      if (!fileRes.ok) throw new Error('Could not fetch the document file.');
      const blob = await fileRes.blob();
      const urlParts = doc.file.split('/');
      const inferredFilename = urlParts[urlParts.length - 1] || 'report.pdf';

      const form = new FormData();
      form.append('file', new File([blob], inferredFilename, { type: blob.type || 'application/pdf' }));

      const baseUrl = import.meta.env.VITE_AI_URL?.replace(/\/$/, '');
      const apiRes = await fetch(`${baseUrl}/report/summary`, {
        method: 'POST',
        headers: { accept: 'application/json' },
        body: form,
      });
      if (!apiRes.ok) throw new Error(`Server error ${apiRes.status}`);
      const data = await apiRes.json();
      if (data.status !== 'success') throw new Error('Summary returned a non-success status.');
      setSummaryModal(prev => ({ ...prev, loading: false, summary: data.summary, filename: data.filename }));
    } catch (err) {
      setSummaryModal(prev => ({ ...prev, loading: false, error: err.message || 'Summary failed. Please try again.' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Patient Documents</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>View documents you have access to, or request new access.</p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" onClick={openReqModal}>
            <Plus size={16} /> Request Access
          </Button>
        </div>
      </motion.div>

      <div className="flex gap-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'documents' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
        >
          View Documents
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'requests' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
        >
          Consent Requests
        </button>
      </div>

      <Card>
        {activeTab === 'documents' && (
          loading ? (
            <div className="flex items-center justify-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Loader2 size={18} className="animate-spin mr-2" /> Loading documents...
            </div>
          ) : (
            <div className="overflow-x-auto text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="uppercase tracking-wide text-xs" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                    <th className="px-5 py-3.5 font-semibold" style={{ color: 'var(--text-muted)' }}>Document</th>
                    <th className="px-5 py-3.5 font-semibold" style={{ color: 'var(--text-muted)' }}>Patient</th>
                    <th className="px-5 py-3.5 font-semibold" style={{ color: 'var(--text-muted)' }}>Date</th>
                    <th className="px-5 py-3.5 font-semibold text-right" style={{ color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-12">
                        <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
                        <p style={{ color: 'var(--text-muted)' }}>No accessible documents found.</p>
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc, idx) => (
                      <motion.tr
                        key={doc.id}
                        className="group transition-colors"
                        style={{ borderBottom: '1px solid var(--border)' }}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                              <FileText size={15} />
                            </div>
                            <div>
                              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{doc.title}</p>
                              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{doc.document_type || 'Unknown'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                          {doc.patient?.name || doc.patient_name || 'Patient'}
                        </td>
                        <td className="px-5 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* Quick Summary Button */}
                            {doc.file && (
                              <motion.button
                                onClick={() => handleSummary(doc)}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold overflow-hidden"
                                style={{
                                  background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                                  color: 'white',
                                  boxShadow: '0 2px 8px rgba(14,165,233,0.35)',
                                }}
                              >
                                <FileSearch size={12} />
                                Quick Summary
                              </motion.button>
                            )}

                            {/* AI Analysis Button */}
                            {doc.file && (
                              <motion.button
                                onClick={() => handleAnalyse(doc)}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold overflow-hidden"
                                style={{
                                  background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)',
                                  color: 'white',
                                  boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                                }}
                              >
                                <Sparkles size={12} />
                                AI Analysis
                              </motion.button>
                            )}

                            {/* View Button */}
                            {doc.file && (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 gap-1.5"
                                onClick={() => setViewModal({ open: true, fileUrl: doc.file, filename: doc.title || doc.file.split('/').pop() })}
                              >
                                <Eye size={13} /> View
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === 'requests' && (
          loading ? (
            <div className="flex items-center justify-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Loader2 size={18} className="animate-spin mr-2" /> Loading requests...
            </div>
          ) : (
            <div className="overflow-x-auto text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="uppercase tracking-wide text-xs" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                    <th className="px-5 py-3.5 font-semibold" style={{ color: 'var(--text-muted)' }}>Document ID / Title</th>
                    <th className="px-5 py-3.5 font-semibold" style={{ color: 'var(--text-muted)' }}>Patient</th>
                    <th className="px-5 py-3.5 font-semibold" style={{ color: 'var(--text-muted)' }}>Status</th>
                    <th className="px-5 py-3.5 font-semibold" style={{ color: 'var(--text-muted)' }}>Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-12">
                        <Shield className="w-8 h-8 mx-auto mb-3 opacity-30" />
                        <p style={{ color: 'var(--text-muted)' }}>No consent requests sent.</p>
                      </td>
                    </tr>
                  ) : (
                    requests.map((req, idx) => (
                      <motion.tr
                        key={req.id}
                        className="group transition-colors"
                        style={{ borderBottom: '1px solid var(--border)' }}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{req.document?.title || req.document_title || req.document}</p>
                          <p className="text-xs mt-0.5 max-w-[200px] truncate" style={{ color: 'var(--text-muted)' }}>{req.purpose || 'No purpose'}</p>
                        </td>
                        <td className="px-5 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                          {req.patient?.name || req.patient_name || 'Patient'}
                        </td>
                        <td className="px-5 py-4">
                          {req.status === 'pending' && <Badge variant="warning">Pending</Badge>}
                          {req.status === 'granted' && <Badge variant="success">Granted</Badge>}
                          {req.status === 'rejected' && <Badge variant="danger">Rejected</Badge>}
                          {req.status === 'revoked' && <Badge variant="secondary">Revoked</Badge>}
                        </td>
                        <td className="px-5 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {req.expires_at ? new Date(req.expires_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )
        )}
      </Card>

      {/* Request Consent Modal */}
      <Modal isOpen={isReqModalOpen} onClose={() => setIsReqModalOpen(false)} title="Request Document Access">
        <form onSubmit={handleRequestSubmit} className="space-y-4">

          {/* Step 1 — Select Patient */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Select Patient
            </label>
            {reqPatientsLoading ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <Loader2 size={14} className="animate-spin shrink-0" /> Loading patients…
              </div>
            ) : (
              <select
                required
                value={reqData.patientId}
                onChange={e => handlePatientChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ background: 'var(--bg-secondary)', color: reqData.patientId ? 'var(--text-primary)' : 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                <option value="">— Choose an appointed patient —</option>
                {reqPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
            {!reqPatientsLoading && reqPatients.length === 0 && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>No appointed patients found.</p>
            )}
          </div>

          {/* Step 2 — Select Document */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Select Document
            </label>
            {reqDocs.length > 0 ? (
              <select
                value={reqData.documentId}
                disabled={!reqData.patientId}
                onChange={e => setReqData(prev => ({ ...prev, documentId: e.target.value, manualUuid: '' }))}
                className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{ background: 'var(--bg-secondary)', color: reqData.documentId ? 'var(--text-primary)' : 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                <option value="">— Pick a previously requested document —</option>
                {reqDocs.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
                <option value="__manual__">✏️ Enter UUID manually…</option>
              </select>
            ) : (
              reqData.patientId && (
                <p className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>
                  No previously requested documents for this patient.
                </p>
              )
            )}
          </div>

          {/* Manual UUID — shown when no known docs, or doctor picks "Enter manually" */}
          {(reqData.patientId && (reqDocs.length === 0 || reqData.documentId === '__manual__')) && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Document UUID
              </label>
              <input
                type="text"
                value={reqData.manualUuid}
                onChange={e => setReqData(prev => ({ ...prev, manualUuid: e.target.value }))}
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 font-mono"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Ask the patient to share their document ID from their Documents page.
              </p>
            </div>
          )}

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Purpose</label>
            <input
              type="text"
              required
              value={reqData.purpose}
              onChange={e => setReqData(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="e.g. For reviewing upcoming surgical history"
              className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Expiry Date (Optional)</label>
            <input
              type="datetime-local"
              value={reqData.expires_at}
              onChange={e => setReqData(prev => ({ ...prev, expires_at: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsReqModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={requesting}>
              {requesting && <Loader2 size={14} className="animate-spin mr-1" />}
              Send Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quick Summary Modal */}
      <SummaryModal
        isOpen={summaryModal.open}
        onClose={() => setSummaryModal(prev => ({ ...prev, open: false }))}
        loading={summaryModal.loading}
        summary={summaryModal.summary}
        filename={summaryModal.filename}
        error={summaryModal.error}
      />

      {/* AI Analysis Modal */}
      <AnalysisModal
        isOpen={analysisModal.open}
        onClose={() => setAnalysisModal(prev => ({ ...prev, open: false }))}
        loading={analysisModal.loading}
        analysis={analysisModal.analysis}
        filename={analysisModal.filename}
        error={analysisModal.error}
      />

      {/* View Report Modal */}
      <ViewReportModal
        isOpen={viewModal.open}
        onClose={() => setViewModal(prev => ({ ...prev, open: false }))}
        fileUrl={viewModal.fileUrl}
        filename={viewModal.filename}
      />
    </div>
  );
}
