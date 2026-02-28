import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { UploadCloud, File, CheckCircle2, AlertCircle, Loader2, Hospital } from 'lucide-react';
import { appointmentApi, clinicApi, documentApi } from '../../services/api';

const REQUIRED_DOCS = [
  { type: 'id_proof', name: 'Government ID Proof', required: true },
  { type: 'insurance', name: 'Health Insurance Card', required: true },
  { type: 'discharge_summary', name: 'Previous Discharge Summary', required: false },
  { type: 'other', name: 'Other Supporting Documents', required: false }
];

export function AdmissionStatus() {
  const [clinics, setClinics] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState('');
  const [loadingClinics, setLoadingClinics] = useState(true);
  
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(null);
  
  const [dragActive, setDragActive] = useState(false);

  // 1. Load user's clinics from appointments
  useEffect(() => {
    let ignore = false;
    appointmentApi.myList()
      .then(res => {
        if (ignore) return;
        const apps = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        
        // Extract unique clinics
        const clinicMap = new Map();
        apps.forEach(app => {
          if (app.clinic && app.clinic.id && !clinicMap.has(app.clinic.id)) {
            clinicMap.set(app.clinic.id, app.clinic);
          }
        });
        
        const uniqueClinics = Array.from(clinicMap.values());
        setClinics(uniqueClinics);
        if (uniqueClinics.length > 0) {
          setSelectedClinicId(uniqueClinics[0].id);
        }
      })
      .catch(err => console.error("Failed to load clinical context", err))
      .finally(() => { if (!ignore) setLoadingClinics(false); });
      
    return () => { ignore = true; };
  }, []);

  // 2. Load admissions documents for selected clinic
  useEffect(() => {
    if (!selectedClinicId) {
      setDocuments([]);
      return;
    }
    let ignore = false;
    setLoadingDocs(true);
    clinicApi.admissionDocsPatient(selectedClinicId)
      .then(res => {
        if (ignore) return;
        setDocuments(Array.isArray(res.data) ? res.data : (res.data?.results || []));
      })
      .catch(err => {
        console.error("Failed to load admission documents", err);
        if (!ignore) setDocuments([]);
      })
      .finally(() => { if (!ignore) setLoadingDocs(false); });
      
    return () => { ignore = true; };
  }, [selectedClinicId]);

  const handleFileUpload = async (e, type) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file || !selectedClinicId) return;
    
    setUploading(type);
    try {
      // Step 1: Upload to document storage API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', 'other'); 
      
      const docRes = await documentApi.upload(formData);
      const uploadedDocId = docRes.data.id;
      
      // Step 2: Link the uploaded file to the admission context
      await clinicApi.addAdmissionDoc(selectedClinicId, {
        document: uploadedDocId,
        document_type: type,
        notes: ''
      });
      
      // Step 3: Refresh the document checklist
      const docsRes = await clinicApi.admissionDocsPatient(selectedClinicId);
      setDocuments(Array.isArray(docsRes.data) ? docsRes.data : (docsRes.data?.results || []));
      
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploading(null);
      e.target.value = ''; // Reset input to allow re-uploading the same file if needed
    }
  };

  // derived state
  const getDocStatus = (type) => documents.find(d => d.document_type === type);
  const allRequiredUploaded = REQUIRED_DOCS.filter(d => d.required).every(d => !!getDocStatus(d.type));
  const selectedClinic = clinics.find(c => c.id === selectedClinicId);

  if (loadingClinics) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading clinical data...</p>
      </div>
    );
  }

  if (clinics.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-10 text-center">
         <Hospital className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
         <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>No Clinical Records Found</h2>
         <p className="mt-2" style={{ color: 'var(--text-muted)' }}>You need an active appointment with a clinic to contextually manage admission documents.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Hospital Admission Status</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Complete the required checklist before your scheduled inpatient admission.</p>
        </div>
        
        {clinics.length > 1 && (
          <div className="min-w-[200px]">
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Select Clinic</label>
            <select 
              value={selectedClinicId} 
              onChange={e => setSelectedClinicId(e.target.value)}
              className="w-full text-sm rounded-lg p-2 focus:ring-2 focus:outline-none transition-all"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              {clinics.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            Document Checklist
            {loadingDocs && <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />}
          </h3>

          <div className="space-y-4">
            {REQUIRED_DOCS.map((docDef) => {
              const uploadedDoc = getDocStatus(docDef.type);
              const isUploaded = !!uploadedDoc;
              const isUploading = uploading === docDef.type;
              
              return (
                <Card key={docDef.type} className={isUploaded ? "" : "ring-1 ring-[var(--primary)]/10 shadow-sm"}
                  style={isUploaded
                    ? { backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }
                    : { borderColor: 'var(--primary)', borderWidth: '1px', borderStyle: 'solid' }
                  }
                >
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 overflow-hidden">
                      <div className={`p-2 rounded-full shrink-0 flex items-center justify-center`} 
                        style={{ 
                          backgroundColor: isUploaded ? 'var(--success-muted, #dcfce7)' : 'var(--primary-muted, #e0e7ff)',
                          color: isUploaded ? 'var(--success, #16a34a)' : 'var(--primary, #3b82f6)'
                        }}>
                        {isUploaded ? <CheckCircle2 className="w-6 h-6" /> : <File className="w-6 h-6" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {docDef.name}
                          {docDef.required && <span className="text-red-500 ml-1">*</span>}
                        </h4>
                        {isUploaded ? (
                          <p className="text-sm font-medium flex items-center gap-1 mt-1 truncate" style={{ color: 'var(--success, #16a34a)' }}>
                            <CheckCircle2 className="w-4 h-4 shrink-0" /> Uploaded on {new Date(uploadedDoc.uploaded_at || new Date()).toLocaleDateString()}
                          </p>
                        ) : (
                          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Pending upload</p>
                        )}
                      </div>
                    </div>

                    {!isUploaded && (
                      <div className="shrink-0 flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <label className="relative flex-1 sm:flex-none cursor-pointer group">
                          <Button variant="secondary" className="w-full relative overflow-hidden" disabled={isUploading}>
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Select File'}
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                              onChange={(e) => handleFileUpload(e, docDef.type)}
                              accept=".pdf,.jpg,.jpeg,.png"
                              disabled={isUploading}
                            />
                          </Button>
                        </label>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
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
              <div className="relative inline-block">
                <Button variant="secondary" size="sm">Browse Files</Button>
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={(e) => handleFileUpload(e, 'other')}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            </div>
          )}
        </div>

        <div>
           <Card className="sticky top-24 border-none shadow-none" style={{ backgroundColor: 'var(--bg-secondary)' }}>
             <CardContent className="p-6">
               <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Readiness Status</h3>
 
               <div className="space-y-4 mb-6">
                 <div className="flex justify-between items-center text-sm">
                   <span style={{ color: 'var(--text-secondary)' }}>Clinic</span>
                   <span className="font-medium text-right max-w-[150px] truncate" style={{ color: 'var(--text-primary)' }}>{selectedClinic?.name}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span style={{ color: 'var(--text-secondary)' }}>City</span>
                   <span className="font-medium text-right" style={{ color: 'var(--text-primary)' }}>{selectedClinic?.city || 'Unknown'}</span>
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
