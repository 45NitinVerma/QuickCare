import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { UploadCloud, File, CheckCircle2, AlertCircle } from 'lucide-react';

export function AdmissionStatus() {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Government ID Proof', required: true, uploaded: true, filename: 'id_scan.pdf' },
    { id: 2, name: 'Health Insurance Card', required: true, uploaded: false, filename: null },
    { id: 3, name: 'Previous Discharge Summary', required: false, uploaded: false, filename: null }
  ]);

  const [dragActive, setDragActive] = useState(false);

  const simulateUpload = (id) => {
    setDocuments(documents.map(d =>
      d.id === id ? { ...d, uploaded: true, filename: 'uploaded_doc.jpg' } : d
    ));
  };

  const allRequiredUploaded = documents.filter(d => d.required).every(d => d.uploaded);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b pb-6" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Hospital Admission Status</h1>
        <p className="mt-2" style={{ color: 'var(--text-muted)' }}>Complete the required checklist before your scheduled inpatient admission.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Document Checklist</h3>

          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id} className={doc.uploaded ? "" : "ring-1 ring-[var(--primary)]/10 shadow-sm"}
                style={doc.uploaded
                  ? { backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }
                  : { borderColor: 'var(--primary)', borderWidth: '1px', borderStyle: 'solid' }
                }
              >
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${doc.uploaded ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-primary'}`}>
                      {doc.uploaded ? <CheckCircle2 className="w-6 h-6" /> : <File className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {doc.name}
                        {doc.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      {doc.uploaded ? (
                        <p className="text-sm text-green-600 font-medium flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-4 h-4" /> Uploaded: {doc.filename}
                        </p>
                      ) : (
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Pending upload</p>
                      )}
                    </div>
                  </div>

                  {!doc.uploaded && (
                    <div className="shrink-0 flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <label className="relative flex-1 sm:flex-none cursor-pointer group">
                        <Button variant="secondary" className="w-full" onClick={(e) => { e.preventDefault(); simulateUpload(doc.id) }}>
                          Select File
                        </Button>
                      </label>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {!allRequiredUploaded && (
            <div
              className={`mt-4 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-[var(--primary)] bg-[var(--primary-muted)]' : ''
                }`}
              style={!dragActive ? { borderColor: 'var(--border-strong)' } : {}}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
            >
              <UploadCloud className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Drag and drop any remaining files here</h4>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Supported formats: PDF, JPEG, PNG (Max 5MB)</p>
              <Button variant="secondary" size="sm">Browse Files</Button>
            </div>
          )}
        </div>

        <div>
          <Card className="sticky top-24 border-none shadow-none" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Readiness Status</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Admission Date</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>March 15, 2026</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Location</span>
                  <span className="font-medium text-right" style={{ color: 'var(--text-primary)' }}>Main Hospital<br />Ward B</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                  <Badge variant={allRequiredUploaded ? 'success' : 'warning'}>
                    {allRequiredUploaded ? 'Ready for Admission' : 'Documents Pending'}
                  </Badge>
                </div>
              </div>

              {!allRequiredUploaded ? (
                <div className="bg-yellow-100/50 dark:bg-yellow-900/20 p-4 rounded-xl flex items-start gap-3 border border-yellow-200 dark:border-yellow-700/50">
                  <AlertCircle className="text-yellow-600 w-5 h-5 shrink-0" />
                  <p className="text-xs text-yellow-800 dark:text-yellow-300 font-medium">Please upload all required documents marked with an asterisk to confirm your admission slot.</p>
                </div>
              ) : (
                <div className="bg-green-100/50 dark:bg-green-900/20 p-4 rounded-xl flex items-start gap-3 border border-green-200 dark:border-green-700/50">
                  <CheckCircle2 className="text-green-600 w-5 h-5 shrink-0" />
                  <p className="text-xs text-green-800 dark:text-green-300 font-medium">All set! Your documentation is complete. The hospital will contact you shortly.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
