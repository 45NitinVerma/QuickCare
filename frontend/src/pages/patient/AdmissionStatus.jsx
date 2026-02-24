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
    // In real app, this would be a file input change handler
    setDocuments(documents.map(d => 
      d.id === id ? { ...d, uploaded: true, filename: 'uploaded_doc.jpg' } : d
    ));
  };

  const allRequiredUploaded = documents.filter(d => d.required).every(d => d.uploaded);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hospital Admission Status</h1>
        <p className="text-gray-500 mt-2">Complete the required checklist before your scheduled inpatient admission.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Document Checklist</h3>
          
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id} className={doc.uploaded ? "bg-gray-50/50 border-gray-200" : "border-primary/30 ring-1 ring-primary/10 shadow-sm"}>
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${doc.uploaded ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-primary'}`}>
                      {doc.uploaded ? <CheckCircle2 className="w-6 h-6" /> : <File className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {doc.name} 
                        {doc.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      {doc.uploaded ? (
                        <p className="text-sm text-green-600 font-medium flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-4 h-4" /> Uploaded: {doc.filename}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 mt-1">Pending upload</p>
                      )}
                    </div>
                  </div>

                  {!doc.uploaded && (
                    <div className="shrink-0 flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <label className="relative flex-1 sm:flex-none cursor-pointer group">
                        <Button variant="secondary" className="w-full bg-white group-hover:bg-gray-50" onClick={(e) => {e.preventDefault(); simulateUpload(doc.id)}}>
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
              className={`mt-4 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
            >
              <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h4 className="text-gray-900 font-semibold mb-1">Drag and drop any remaining files here</h4>
              <p className="text-sm text-gray-500 mb-4">Supported formats: PDF, JPEG, PNG (Max 5MB)</p>
              <Button variant="secondary" size="sm">Browse Files</Button>
            </div>
          )}
        </div>

        <div>
          <Card className="sticky top-24 bg-gray-50 border-none shadow-none">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Readiness Status</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Admission Date</span>
                  <span className="font-medium">March 15, 2026</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium text-right">Main Hospital<br/>Ward B</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Status</span>
                  <Badge variant={allRequiredUploaded ? 'success' : 'warning'}>
                    {allRequiredUploaded ? 'Ready for Admission' : 'Documents Pending'}
                  </Badge>
                </div>
              </div>

              {!allRequiredUploaded ? (
                <div className="bg-yellow-100/50 p-4 rounded-xl flex items-start gap-3 border border-yellow-200">
                  <AlertCircle className="text-yellow-600 w-5 h-5 shrink-0" />
                  <p className="text-xs text-yellow-800 font-medium">Please upload all required documents marked with an asterisk to confirm your admission slot.</p>
                </div>
              ) : (
                <div className="bg-green-100/50 p-4 rounded-xl flex items-start gap-3 border border-green-200">
                  <CheckCircle2 className="text-green-600 w-5 h-5 shrink-0" />
                  <p className="text-xs text-green-800 font-medium">All set! Your documentation is complete. The hospital will contact you shortly.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
