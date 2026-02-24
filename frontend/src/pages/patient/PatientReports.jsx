import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Table, TableHead, TableRow, TableHeader, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FileText, Download, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { mockReports } from '../../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

export function PatientReports() {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState(null);
  const myReports = mockReports.filter(r => r.patientId === user.id);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b"
        style={{ borderColor: 'var(--border)' }}
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            My Medical Reports
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            View lab results, imaging scans, and AI-generated summaries.
          </p>
        </div>
      </motion.div>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Report Name</TableHeader>
              <TableHeader>Category</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <tbody>
            {myReports.length === 0 && (
              <TableRow>
                <TableCell colSpan="5">
                  <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No reports found for your account.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {myReports.map((report) => (
              <React.Fragment key={report.id}>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                        <FileText size={17} />
                      </div>
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{report.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{report.type}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{report.date}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={report.status === 'Reviewed' ? 'success' : 'warning'}>{report.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Download PDF">
                        <Download size={15} />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => toggleExpand(report.id)}
                      >
                        {expandedId === report.id ? 'Hide' : 'AI Summary'}
                        {expandedId === report.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Expandable AI Summary */}
                <AnimatePresence>
                  {expandedId === report.id && (
                    <tr key={`expand-${report.id}`}>
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
                                <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>AI-Generated Health Summary</h4>
                                <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                                  Beta
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {report.aiSummary || 'Summary is being generated based on your latest lab results…'}
                              </p>
                              <div className="mt-4 pt-4 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
                                <span className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                                  This summary is AI-generated and does not replace professional medical advice.
                                </span>
                                <Button size="sm" variant="ghost" className="text-xs h-7 ml-3">
                                  Report Inaccuracy
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
