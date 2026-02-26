import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { UploadCloud, File, AlertTriangle, Sparkles, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const labelStyle = {
  display: 'block', fontSize: '0.875rem', fontWeight: 500,
  marginBottom: '0.5rem', color: 'var(--text-secondary)',
};

const selectStyle = {
  width: '100%', height: '2.5rem', borderRadius: '0.75rem',
  padding: '0 0.75rem', fontSize: '0.875rem',
  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
  border: '1px solid var(--border)', outline: 'none',
};

export function UploadReport() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [form, setForm] = useState({ contact: '', type: 'Pathology', notes: '' });
  const [uploadState, setUploadState] = useState('idle'); // idle | generating | done
  const [aiSummary, setAiSummary] = useState('');

  const simulateUpload = (e) => {
    e.preventDefault();
    if (!file || !form.contact) return;
    setUploadState('generating');
    setTimeout(() => {
      setAiSummary('Elevated Mean Corpuscular Volume (MCV) noted. White blood cell count within normal ranges. Trace proteinuria observed. Suggested clinical correlation with attending physician.');
      setUploadState('done');
    }, 2500);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        className="pb-4 mb-2 border-b flex items-center gap-3"
        style={{ borderColor: 'var(--border)' }}
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="p-2 rounded-xl" style={{ background: 'var(--primary-muted)' }}>
          <UploadCloud size={22} style={{ color: 'var(--primary)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Upload Diagnostic Report</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>AI will auto-summarize the report for physician review</p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Form */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}>
          <Card>
            <CardContent className="p-6">
              <form onSubmit={simulateUpload} className="space-y-5">
                {/* Patient Contact Number */}
                <div>
                  <label style={labelStyle}>Patient Contact Number</label>
                  <Input
                    placeholder="e.g. 9876543210"
                    value={form.contact}
                    onChange={e => setForm({ ...form, contact: e.target.value })}
                    required
                    disabled={uploadState !== 'idle'}
                  />
                </div>

                {/* Report Category */}
                <div>
                  <label style={labelStyle}>Report Category</label>
                  <select
                    style={selectStyle}
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    disabled={uploadState !== 'idle'}
                  >
                    <option>Pathology</option>
                    <option>Radiology</option>
                    <option>Microbiology</option>
                    <option>General Scan</option>
                  </select>
                </div>

                {/* File upload */}
                <div>
                  <label style={labelStyle}>Report File (PDF / Image)</label>
                  {file ? (
                    <div className="flex items-center justify-between p-3 rounded-xl border text-sm"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <File size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</span>
                      </div>
                      {uploadState === 'idle' && (
                        <button type="button" onClick={() => setFile(null)}
                          className="shrink-0 ml-2 transition-colors" style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center relative transition-all"
                      style={{
                        borderColor: isDragging ? 'var(--primary)' : 'var(--border)',
                        background: isDragging ? 'var(--primary-muted)' : 'var(--bg-secondary)',
                      }}
                    >
                      <div className="p-3 rounded-xl mb-3" style={{ background: 'var(--primary-muted)' }}>
                        <UploadCloud size={22} style={{ color: 'var(--primary)' }} />
                      </div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Drag & drop or <span style={{ color: 'var(--primary)' }}>click to browse</span>
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>PDF, JPG, PNG up to 10MB</p>
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={e => setFile(e.target.files[0])}
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label style={labelStyle}>Lab Tech Notes <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span></label>
                  <Input
                    placeholder="Additional observations…"
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    disabled={uploadState !== 'idle'}
                  />
                </div>

                {uploadState === 'idle' && (
                  <Button type="submit" className="w-full gap-2">
                    <UploadCloud size={16} /> Upload & Process
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI results panel */}
        <AnimatePresence>
          {uploadState !== 'idle' && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-base font-bold pb-2 border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
                AI Processing Results
              </h3>

              {/* Generating state */}
              {uploadState === 'generating' && (
                <div className="p-8 rounded-2xl border-2 border-dashed flex flex-col items-center text-center"
                  style={{ borderColor: 'rgba(96,165,250,0.3)', background: 'var(--primary-muted)' }}>
                  <Sparkles size={32} className="animate-pulse mb-4" style={{ color: 'var(--primary)' }} />
                  <h4 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Analyzing Lab Report</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Extracting key biomarkers and flags using AI…</p>
                  <div className="w-full h-1.5 rounded-full mt-6 overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full animate-pulse" style={{ background: 'var(--primary)', width: '60%' }} />
                  </div>
                </div>
              )}

              {/* Done state */}
              {uploadState === 'done' && (
                <div className="space-y-4">
                  {/* Success */}
                  <div className="p-4 rounded-2xl border" style={{ background: 'var(--success-light)', borderColor: 'rgba(74,222,128,0.3)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={18} style={{ color: 'var(--accent)' }} />
                      <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Upload Successful</h4>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      The report has been saved to the patient's record and routed to the assigned doctor's queue.
                    </p>
                  </div>

                  {/* AI summary */}
                  <div className="p-5 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg" style={{ background: 'var(--primary-muted)' }}>
                        <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                      </div>
                      <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Structured AI Summary</h4>
                    </div>

                    <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--bg-secondary)' }}>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{aiSummary}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {['Elevated MCV', 'Trace Protein'].map(flag => (
                        <span key={flag} className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                          {flag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t flex items-start gap-2" style={{ borderColor: 'var(--border)' }}>
                      <AlertTriangle size={13} className="shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        <strong>AI-generated summary.</strong> Verification required by attending physician. Does not constitute a final diagnosis.
                      </p>
                    </div>
                  </div>

                  <Button variant="secondary" className="w-full" onClick={() => { setUploadState('idle'); setFile(null); setForm({ contact: '', type: 'Pathology', notes: '' }); }}>
                    Upload Another Report
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
