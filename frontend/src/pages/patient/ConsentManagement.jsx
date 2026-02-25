import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Shield, Check, X, Clock, Settings, AlertTriangle, Loader2, Activity } from 'lucide-react';
import { documentApi } from '../../services/api';

export function ConsentManagement() {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Logs states
  const [activeTab, setActiveTab] = useState('consents');
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const loadConsents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await documentApi.myConsents({});
      setConsents(Array.isArray(data) ? data : (data.results || []));
    } catch {
      setConsents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const { data } = await documentApi.accessLog();
      setLogs(Array.isArray(data) ? data : (data.results || []));
    } catch {
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => { loadConsents(); }, [loadConsents]);

  useEffect(() => {
    if (activeTab === 'logs' && logs.length === 0) {
      loadLogs();
    }
  }, [activeTab, loadLogs, logs.length]);

  const handleAction = async (id, action) => {
    // API action: 'granted' | 'rejected' | 'revoked'
    const apiAction = action === 'approve' ? 'granted' : action === 'deny' ? 'rejected' : 'revoked';
    setActionLoading(id);
    try {
      const { data } = await documentApi.consentAction(id, apiAction);
      setConsents(prev => prev.map(c => c.id === id ? { ...c, status: data.status } : c));
    } catch {
      // silently fail and refetch
      await loadConsents();
    } finally {
      setActionLoading(null);
      setIsModalOpen(false);
    }
  };

  const openApproveModal = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const pendingConsents = consents.filter(c => c.status === 'pending');
  const grantedConsents = consents.filter(c => c.status === 'granted');

  const getDoctorName = (c) => c.doctor_name || c.doctor?.user?.name || 'Doctor';
  const getDocTitle = (c) => c.document_title || c.document?.title || 'Medical Document';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <Shield className="w-6 h-6" style={{ color: 'var(--primary)' }} /> Data Consent &amp; Privacy
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Manage which healthcare providers have access to your medical records.</p>
        </div>
      </div>

      <div className="flex gap-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <button 
          onClick={() => setActiveTab('consents')} 
          className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'consents' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
        >
          Consent Requests
        </button>
        <button 
          onClick={() => setActiveTab('logs')} 
          className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'logs' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
        >
          Access Audit Logs
        </button>
      </div>

      {activeTab === 'consents' && (
        loading ? (
        <div className="flex items-center justify-center gap-2 py-16" style={{ color: 'var(--text-muted)' }}>
          <Loader2 size={22} className="animate-spin" /> Loading consents…
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Requests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Clock className="w-5 h-5" style={{ color: 'var(--warning)' }} /> Pending Access Requests
              {pendingConsents.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                  {pendingConsents.length}
                </span>
              )}
            </h3>
            <div className="space-y-3">
              {pendingConsents.map(req => (
                <Card key={req.id} style={{ borderColor: 'var(--warning)33' }}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>{getDoctorName(req)}</h4>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          For: <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{getDocTitle(req)}</span>
                        </p>
                        {req.purpose && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Purpose: {req.purpose}</p>
                        )}
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <p className="text-sm mb-4 p-3 rounded-lg flex items-start gap-2"
                      style={{ background: 'var(--warning-light)', color: 'var(--text-secondary)', border: '1px solid var(--warning)20' }}>
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                      Doctor is requesting access to your medical record for diagnosis purposes.
                    </p>
                    <div className="flex gap-3">
                      <Button onClick={() => openApproveModal(req)} className="flex-1" size="sm"
                        disabled={actionLoading === req.id}>
                        {actionLoading === req.id ? <Loader2 size={14} className="animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                        Approve
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleAction(req.id, 'deny')}
                        disabled={actionLoading === req.id}>
                        <X className="w-4 h-4 mr-1" /> Deny
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {pendingConsents.length === 0 && (
                <div className="p-8 text-center rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  No pending requests.
                </div>
              )}
            </div>
          </div>

          {/* Active / Granted */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Settings className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /> Active Data Access
            </h3>
            <div className="space-y-3">
              {grantedConsents.map(req => (
                <Card key={req.id}>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                        style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                        {getDoctorName(req).split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>{getDoctorName(req)}</h4>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Document: {getDocTitle(req)}
                        </p>
                        {req.expires_at && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Expires: {new Date(req.expires_at).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" className="text-xs h-8 px-3"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => handleAction(req.id, 'revoke')}
                      disabled={actionLoading === req.id}>
                      {actionLoading === req.id ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
                      Revoke
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {grantedConsents.length === 0 && (
                <div className="p-8 text-center rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  No active grants.
                </div>
              )}
            </div>
          </div>
        </div>
      )
      )}

      {activeTab === 'logs' && (
        loadingLogs ? (
          <div className="flex items-center justify-center gap-2 py-16" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={22} className="animate-spin" /> Loading audit logs…
          </div>
        ) : (
          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Document</TableHeader>
                  <TableHeader>Accessed By</TableHeader>
                  <TableHeader>Date & Time</TableHeader>
                  <TableHeader>IP Address</TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="4">
                      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                        <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No access logs found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {log.document_title || log.document?.title || `Doc ID: ${log.document}`}
                        </span>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>ID: {log.document?.id || log.document}</div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {log.accessed_by_name || log.accessed_by?.name || 'System / User'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(log.accessed_at).toLocaleString('en-IN')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.ip_address || 'Unknown IP'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        )
      )}

      {/* Approval Confirmation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Approve Data Access">
        {selectedRequest && (
          <div className="space-y-6">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to grant <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{getDoctorName(selectedRequest)}</span> access to your document <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{getDocTitle(selectedRequest)}</span>?
            </p>
            <div className="p-4 rounded-xl border flex items-start gap-3"
              style={{ background: 'var(--info-light)', borderColor: 'var(--info)33' }}>
              <Shield className="w-5 h-5 shrink-0" style={{ color: 'var(--primary)' }} />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                You can revoke this access at any time. All access is strictly monitored and logged.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={() => handleAction(selectedRequest.id, 'approve')}
                disabled={actionLoading === selectedRequest.id}>
                {actionLoading === selectedRequest.id && <Loader2 size={14} className="animate-spin mr-1" />}
                Confirm Access
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
