import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Search,
  User,
  ShieldCheck
} from 'lucide-react';
import { SymptomReport } from '../types';
import { fetchReports, verifyReport } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [reports, setReports] = useState<SymptomReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState(searchParams.get('district') || 'All');
  const [severityFilter, setSeverityFilter] = useState(searchParams.get('severity') || 'All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [actionReportId, setActionReportId] = useState<number | null>(null);

  const isOfficial = user && user.role !== 'CIVILIAN';

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchReports({
        district: districtFilter !== 'All' ? districtFilter : undefined,
        severity: severityFilter !== 'All' ? severityFilter : undefined,
        status_filter: statusFilter !== 'All' ? statusFilter : undefined,
      });
      setReports(data);
    } catch (err) {
      console.warn('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [districtFilter, severityFilter, statusFilter]);

  const handleVerify = async (reportId: number, status: 'verified' | 'rejected') => {
    setActionReportId(reportId);
    try {
      await verifyReport(reportId, status, `Verified by ${user?.full_name || 'Official'} (${user?.role})`);
      await loadReports();
    } catch (err: any) {
      alert(err.message || 'Verification update failed.');
    } finally {
      setActionReportId(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const loc = (r.location_name || '').toLowerCase();
      const syms = (r.symptoms || []).join(' ').toLowerCase();
      return loc.includes(q) || syms.includes(q) || r.tracking_id.toLowerCase().includes(q);
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Tracking ID', 'Village', 'District', 'State', 'Reporter', 'Symptoms', 'Severity', 'Age Group', 'Affected', 'Status', 'Timestamp'];
    const rows = filteredReports.map((r) => [
      r.tracking_id,
      r.location_name,
      r.district,
      r.state,
      r.reporter_type,
      `"${r.symptoms.join(', ')}"`,
      r.severity,
      r.patient_age_group,
      r.affected_count,
      r.verification_status,
      r.reported_at
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aeris_case_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-surface-dark p-5 rounded-3xl border border-emerald/20 shadow-sentinel-sm">
        <div>
          <h2 className="text-xl font-extrabold text-forest dark:text-pale-green tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald" />
            Epidemiological Case Feed & Verification Center
          </h2>
          <p className="text-xs text-forest/60 dark:text-pale-green/60 mt-0.5">
            Frontline syndromic reports submitted by verified citizens and accredited ASHA workers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald/30 hover:bg-emerald/10 text-forest dark:text-pale-green text-xs font-bold transition-all shadow-sentinel-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => navigate('/report')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald text-white text-xs font-bold hover:bg-emerald-hover transition-all shadow-sentinel-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report a Case</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-forest/40 dark:text-pale-green/40 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symptoms, village, or tracking ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-surface-dark border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green focus:ring-2 focus:ring-emerald focus:outline-none shadow-sentinel-sm"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-1.5 bg-white dark:bg-surface-dark border border-forest/20 dark:border-mint/20 rounded-xl text-xs font-bold text-forest dark:text-pale-green focus:outline-none focus:ring-2 focus:ring-emerald shadow-sentinel-sm"
        >
          <option value="All">All Severities</option>
          <option value="severe">🔴 Severe Only</option>
          <option value="moderate">🟡 Moderate Only</option>
          <option value="mild">🟢 Mild Only</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-white dark:bg-surface-dark border border-forest/20 dark:border-mint/20 rounded-xl text-xs font-bold text-forest dark:text-pale-green focus:outline-none focus:ring-2 focus:ring-emerald shadow-sentinel-sm"
        >
          <option value="All">All Statuses</option>
          <option value="unverified">⏳ Unverified (Pending)</option>
          <option value="verified">✅ Ground-Verified</option>
          <option value="rejected">❌ False Alarms</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-surface-dark rounded-3xl border border-emerald/20 shadow-sentinel-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-forest dark:text-pale-green">
            <thead className="bg-pale-green/50 dark:bg-forest-light/40 text-forest/75 dark:text-pale-green/75 uppercase text-[10px] font-extrabold tracking-wider border-b border-forest/10 dark:border-mint/15">
              <tr>
                <th className="py-3 px-3">Tracking ID</th>
                <th className="py-3 px-3">Village & District</th>
                <th className="py-3 px-3">Reporter</th>
                <th className="py-3 px-3">Symptoms Logged</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Time</th>
                {isOfficial && <th className="py-3 px-3 text-right">Verification Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/5 dark:divide-mint/10 font-medium">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-forest/60 dark:text-pale-green/60">
                    No surveillance reports match this query.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.report_id} className="hover:bg-pale-green/20 dark:hover:bg-forest-light/20 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-emerald">
                      {r.tracking_id}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold">{r.location_name}</span>
                      <span className="text-[10px] text-forest/60 dark:text-pale-green/60 block">{r.district}, {r.state}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.reporter_type === 'asha_worker'
                          ? 'bg-emerald/15 text-emerald'
                          : 'bg-forest/10 dark:bg-forest-light text-forest/80 dark:text-pale-green/80'
                      }`}>
                        {r.reporter_type === 'asha_worker' ? '🏥 ASHA Worker' : '👤 Citizen'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {r.symptoms.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 bg-pale-green dark:bg-forest-light text-forest dark:text-pale-green rounded text-[10px] font-semibold">
                            {s.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                        r.severity === 'severe'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                          : r.severity === 'moderate'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                          : 'bg-emerald-subtle text-emerald-active'
                      }`}>
                        {r.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        r.verification_status === 'verified'
                          ? 'text-emerald'
                          : r.verification_status === 'rejected'
                          ? 'text-red-600'
                          : 'text-amber-600'
                      }`}>
                        {r.verification_status === 'verified' ? '✓ Ground Verified' : r.verification_status === 'rejected' ? '✗ False Alarm' : '⏳ Unverified'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[10px] text-forest/60 dark:text-pale-green/60">
                      {new Date(r.reported_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    {isOfficial && (
                      <td className="py-3 px-3 text-right">
                        {r.verification_status === 'unverified' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              disabled={actionReportId === r.report_id}
                              onClick={() => handleVerify(r.report_id, 'verified')}
                              className="px-2.5 py-1 bg-emerald text-white rounded-lg text-xs font-bold hover:bg-emerald-hover transition-colors shadow-sentinel-sm flex items-center gap-1"
                              title="Confirm case following field check"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verify</span>
                            </button>
                            <button
                              disabled={actionReportId === r.report_id}
                              onClick={() => handleVerify(r.report_id, 'rejected')}
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                              title="Mark as false alarm or duplicate"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
