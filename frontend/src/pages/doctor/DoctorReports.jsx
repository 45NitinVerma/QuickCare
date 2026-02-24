import React, { useState } from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Eye, CheckCircle, FileText, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const reports = [
  { id: 'REP-7412', patient: 'Sarah Jenkins',   type: 'Complete Blood Count (CBC)',          date: 'Oct 24, 2026', status: 'pending_review', urgency: 'high',   lab: 'QuickLabs Central' },
  { id: 'REP-7413', patient: 'Michael Chen',    type: 'Lipid Panel',                         date: 'Oct 23, 2026', status: 'reviewed',       urgency: 'normal', lab: 'QuickLabs North'   },
  { id: 'REP-7414', patient: 'Emma Wilson',     type: 'Thyroid Function (TSH)',               date: 'Oct 23, 2026', status: 'pending_review', urgency: 'normal', lab: 'QuickLabs Central' },
  { id: 'REP-7415', patient: 'David Thompson',  type: 'Comprehensive Metabolic Panel',        date: 'Oct 22, 2026', status: 'reviewed',       urgency: 'high',   lab: 'QuickLabs East'    },
];

export function DoctorReports() {
  const [filter, setFilter] = useState('all');

  const filteredReports = reports.filter(r =>
    filter === 'all' ? true : filter === 'pending' ? r.status === 'pending_review' : r.status === 'reviewed'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Lab Reports Review</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Review newly uploaded patient lab results and AI summaries.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2"><Filter size={15} /> Filter</Button>
          <Button className="gap-2">Batch Review</Button>
        </div>
      </motion.div>

      <Card>
        {/* Filter Tabs + Search */}
        <CardHeader className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
            <div className="flex gap-1.5">
              {[['all', 'All Reports'], ['pending', 'Pending'], ['reviewed', 'Reviewed']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFilter(val)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: filter === val ? 'var(--primary)' : 'transparent',
                    color: filter === val ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              <input
                placeholder="Search patients or IDs…"
                className="w-full h-9 pl-9 pr-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ background: 'var(--card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>
        </CardHeader>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase tracking-wide" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                {['Report Details', 'Patient', 'Urgency', 'Status', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-3.5 font-semibold ${i === 4 ? 'text-right' : ''}`} style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report, idx) => (
                <motion.tr
                  key={report.id}
                  className="group transition-colors"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Report details */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg"
                        style={{ background: report.status === 'pending_review' ? 'var(--primary-muted)' : 'var(--bg-secondary)', color: report.status === 'pending_review' ? 'var(--primary)' : 'var(--text-muted)' }}>
                        <FileText size={15} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{report.type}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{report.id} · {report.date}</p>
                      </div>
                    </div>
                  </td>

                  {/* Patient */}
                  <td className="px-5 py-4">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{report.patient}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{report.lab}</p>
                  </td>

                  {/* Urgency */}
                  <td className="px-5 py-4">
                    {report.urgency === 'high'
                      ? <Badge variant="danger">High Priority</Badge>
                      : <Badge variant="default">Normal</Badge>}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    {report.status === 'pending_review'
                      ? <Badge variant="warning">Needs Review</Badge>
                      : (
                        <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--accent)' }}>
                          <CheckCircle size={14} /> Reviewed
                        </span>
                      )
                    }
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Download PDF">
                        <Download size={13} />
                      </Button>
                      <Button variant="secondary" size="sm" className="h-8 gap-1.5">
                        <Eye size={13} /> {report.status === 'pending_review' ? 'Review & Sign' : 'View'}
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
