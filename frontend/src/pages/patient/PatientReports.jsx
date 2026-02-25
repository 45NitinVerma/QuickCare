import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FileText, Download, ChevronDown, ChevronUp, Sparkles, Loader2, Upload, Trash2 } from 'lucide-react';
import { documentApi } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const DOC_TYPE_LABEL = {
  prescription: 'Prescription',
  lab_report: 'Lab Report',
  imaging: 'Imaging',
  discharge_summary: 'Discharge Summary',
  insurance: 'Insurance',
  other: 'Other',
};

export function PatientReports() {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', document_type: 'lab_report', description: '' });
  const [uploadFile, setUploadFile] = useState(null);

  // Delete state
  const [deletingId, setDeletingId] = useState(null);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await documentApi.list();
      setDocuments(Array.isArray(data) ? data : (data.results || []));
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadData.title);
      formData.append('document_type', uploadData.document_type);
      if (uploadData.description) {
        formData.append('description', uploadData.description);
      }
      
      await documentApi.upload(formData);
      setIsUploadModalOpen(false);
      setUploadData({ title: '', document_type: 'lab_report', description: '' });
      setUploadFile(null);
      loadDocs();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    setDeletingId(id);
    try {
      await documentApi.delete(id);
      loadDocs();
    } catch {
      // Ignore errors
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--border)' }}
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            My Medical Documents
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            View your uploaded lab reports, prescriptions, and imaging files.
          </p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2 shrink-0">
          <Upload size={16} /> Upload Document
        </Button>
      </motion.div>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Document</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Uploaded</TableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <tbody>
            {loading ? (
              <TableRow>
                <TableCell colSpan="5" className="text-center py-12">
                  <span className="flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Loader2 size={18} className="animate-spin" /> Loading documents…
                  </span>
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan="5">
                  <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No documents uploaded yet.</p>
                    <p className="text-xs mt-1">Upload documents from the Documents section.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <React.Fragment key={doc.id}>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                          <FileText size={17} />
                        </div>
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{doc.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {DOC_TYPE_LABEL[doc.document_type] || doc.document_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-IN') : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm truncate max-w-[160px] block" style={{ color: 'var(--text-secondary)' }}>
                        {doc.description || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {doc.file && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Download"
                            onClick={() => window.open(doc.file, '_blank')}>
                            <Download size={15} />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Delete" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(doc.id)} disabled={deletingId === doc.id}>
                          {deletingId === doc.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </Button>
                        <Button
                          variant="secondary" size="sm" className="gap-1.5"
                          onClick={() => toggleExpand(doc.id)}
                        >
                          {expandedId === doc.id ? 'Hide' : 'Details'}
                          {expandedId === doc.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expandable details */}
                  <AnimatePresence>
                    {expandedId === doc.id && (
                      <tr key={`expand-${doc.id}`}>
                        <td colSpan="5" className="p-0">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ background: 'var(--bg-secondary)', overflow: 'hidden' }}
                          >
                            <div className="px-6 py-5">
                              <div className="rounded-2xl p-5 border"
                                style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="p-1.5 rounded-lg" style={{ background: 'var(--primary-muted)' }}>
                                    <Sparkles className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                  </div>
                                  <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Document Details</h4>
                                </div>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                  {doc.description || 'No description provided.'}
                                </p>
                                <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                  Document ID: {doc.id}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {/* Upload Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Medical Document">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Document File</label>
            <input 
              type="file" 
              required
              onChange={e => setUploadFile(e.target.files[0])}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[var(--primary-muted)] file:text-[var(--primary)] hover:file:opacity-90"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Title</label>
            <input 
              type="text" 
              required
              value={uploadData.title}
              onChange={e => setUploadData({...uploadData, title: e.target.value})}
              placeholder="e.g. Complete Blood Count"
              className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Document Type</label>
            <select
              value={uploadData.document_type}
              onChange={e => setUploadData({...uploadData, document_type: e.target.value})}
              className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              {Object.entries(DOC_TYPE_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description (Optional)</label>
            <textarea 
              rows={3}
              value={uploadData.description}
              onChange={e => setUploadData({...uploadData, description: e.target.value})}
              placeholder="Any additional details..."
              className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button type="button" variant="ghost" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={uploading}>
              {uploading && <Loader2 size={14} className="animate-spin mr-1" />}
              Upload Document
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
