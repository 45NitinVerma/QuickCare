import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Shield, Check, X, Clock, Settings, AlertTriangle } from 'lucide-react';
import { patientConsents } from '../../data/mockData';

export function ConsentManagement() {
  const [consents, setConsents] = useState(patientConsents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleAction = (id, action) => {
    setConsents(consents.map(c => 
      c.id === id ? { ...c, status: action === 'approve' ? 'Granted' : 'Denied' } : c
    ));
    setIsModalOpen(false);
  };

  const openApproveModal = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const revokeAccess = (id) => {
    setConsents(consents.map(c => 
      c.id === id ? { ...c, status: 'Revoked' } : c
    ));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flexitems-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="text-primary w-6 h-6" /> Data Consent & Privacy
          </h1>
          <p className="text-gray-500 mt-2">Manage which healthcare providers have access to your medical records.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pending Requests */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Pending Access Requests
          </h3>
          <div className="space-y-3">
            {consents.filter(c => c.status === 'Pending').map(req => (
              <Card key={req.id} className="border-amber-100 shadow-md shadow-amber-500/5">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900">{req.doctorName}</h4>
                      <p className="text-sm text-gray-500">Requested on: {req.requestDate}</p>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    Doctor is requesting full access to your medical history and recent lab reports for diagnosis.
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => openApproveModal(req)} className="flex-1 bg-green-500 hover:bg-green-600" size="sm">
                      <Check className="w-4 h-4 mr-1" /> Review & Approve
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleAction(req.id, 'deny')}>
                      <X className="w-4 h-4 mr-1" /> Deny
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {consents.filter(c => c.status === 'Pending').length === 0 && (
              <div className="p-8 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl">
                No pending requests.
              </div>
            )}
          </div>
        </div>

        {/* Active Access */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" /> Active Data Access
          </h3>
          <div className="space-y-3">
            {consents.filter(c => c.status === 'Granted').map(req => (
              <Card key={req.id}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {req.doctorName.charAt(4)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{req.doctorName}</h4>
                      <p className="text-xs text-gray-500">Granted on: {req.requestDate}</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-3 text-xs" onClick={() => revokeAccess(req.id)}>
                    Revoke Access
                  </Button>
                </CardContent>
              </Card>
            ))}
            {consents.filter(c => c.status === 'Granted').length === 0 && (
              <div className="p-8 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl">
                No active grants.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Approve Data Access">
        {selectedRequest && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Customize the level of access you want to grant to <span className="font-bold text-gray-900">{selectedRequest.doctorName}</span>.
            </p>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" />
                <div>
                  <h5 className="font-medium text-gray-900 text-sm">Recent Lab Reports</h5>
                  <p className="text-xs text-gray-500">Access to pathology and radiology reports from the last 6 months.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" />
                <div>
                  <h5 className="font-medium text-gray-900 text-sm">Medical History Timeline</h5>
                  <p className="text-xs text-gray-500">Past diagnoses, allergies, and chronic conditions.</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" />
                <div>
                  <h5 className="font-medium text-gray-900 text-sm">Prescription History</h5>
                  <p className="text-xs text-gray-500">All previously prescribed medications.</p>
                </div>
              </label>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary shrink-0" />
              <p className="text-xs text-blue-800 leading-relaxed">
                You can revoke this access at any time from your consent dashboard. All access logs are strictly monitored for compliance.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={() => handleAction(selectedRequest.id, 'approve')}>Confirm Access</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
