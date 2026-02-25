import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Search, Filter, Eye, CheckCircle, FileText, Download, Clock, Shield, Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { documentApi } from '../../services/api';

export function DoctorReports() {
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'requests'
  const [documents, setDocuments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Request Modal
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [reqData, setReqData] = useState({ document: '', purpose: '', expires_at: '' });

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

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequesting(true);
    try {
      const payload = {
        document: reqData.document.trim(),
        purpose: reqData.purpose || undefined,
      };
      if (reqData.expires_at) {
        payload.expires_at = new Date(reqData.expires_at).toISOString();
      }
      await documentApi.requestConsent(payload);
      setIsReqModalOpen(false);
      setReqData({ document: '', purpose: '', expires_at: '' });
      loadDocs();
    } catch (err) {
      console.error(err);
      alert('Failed to request access. Ensure UUID is correct.');
    } finally {
      setRequesting(false);
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
          <Button className="gap-2" onClick={() => setIsReqModalOpen(true)}>
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
                            <div className="p-2 rounded-lg" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}><FileText size={15} /></div>
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
                        <td className="px-5 py-4 text-right">
                           {doc.file && (
                             <Button variant="secondary" size="sm" className="h-8 gap-1.5" onClick={() => window.open(doc.file, '_blank')}>
                               <Eye size={13} /> View
                             </Button>
                           )}
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
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Document UUID</label>
            <input 
              type="text" 
              required
              value={reqData.document}
              onChange={e => setReqData({...reqData, document: e.target.value})}
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 font-mono"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Enter the exact Document ID provided by the patient.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Purpose</label>
            <input 
              type="text" 
              required
              value={reqData.purpose}
              onChange={e => setReqData({...reqData, purpose: e.target.value})}
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
              onChange={e => setReqData({...reqData, expires_at: e.target.value})}
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
    </div>
  );
}
