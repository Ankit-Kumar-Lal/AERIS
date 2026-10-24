import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  PlusCircle, 
  Droplets, 
  CloudRain, 
  Users, 
  Hospital, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { WqiGauge } from '../components/village/WqiGauge';
import { RiskExplainabilityPanel } from '../components/village/RiskExplainabilityPanel';
import { RiskBadge } from '../components/common/RiskBadge';
import { fetchLocationDetail } from '../services/api';
import { LocationDetail } from '../types';

export const VillageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<LocationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchLocationDetail(parseInt(id, 10))
      .then((data) => setDetail(data))
      .catch((err) => setErrorMsg(err.message || 'Failed to load village telemetry.'))
      .finally(() => setLoading(false));
  }, [id]);

  const exportRiskBriefPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-forest/60 dark:text-pale-green/60 font-bold text-xs">
        Connecting to village telemetry stream...
      </div>
    );
  }

  if (errorMsg || !detail) {
    return (
      <div className="p-8 text-center bg-white dark:bg-surface-dark rounded-3xl border border-red-200">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <p className="text-sm font-bold text-red-700">{errorMsg || 'Village not found'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-emerald text-white rounded-xl text-xs font-bold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { location: loc, latest_environmental_data: env, current_risk_score: risk, last_20_reports: reports, case_trend_7day: trend7d, case_trend_30day: trend30d, assigned_ashas: ashas } = detail;

  const wqiVal = env ? env.water_quality_index : 70;
  const rainVal = env ? env.rainfall_mm : 0;
  const mlProb = risk?.ml_risk_probability != null ? risk.ml_risk_probability : loc.ml_risk_probability;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation & Action Row */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-xs font-bold text-forest dark:text-pale-green hover:text-emerald transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={exportRiskBriefPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald/30 hover:bg-emerald/10 text-forest dark:text-pale-green text-xs font-bold transition-all shadow-sentinel-sm"
            title="Print or save PDF risk brief"
          >
            <Download className="w-3.5 h-3.5 text-emerald" />
            <span>Print Risk Brief (PDF)</span>
          </button>
          <button
            onClick={() => navigate(`/report?village=${loc.location_id}`)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald text-white text-xs font-bold hover:bg-emerald-hover transition-all shadow-sentinel-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Log Report for {loc.name}</span>
          </button>
        </div>
      </div>

      {/* Village Hero Card */}
      <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-emerald/20 shadow-sentinel-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-forest/10 dark:border-mint/15">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-forest dark:text-pale-green font-heading">
                {loc.name}
              </h1>
              <RiskBadge level={loc.current_risk_level} size="lg" />
            </div>
            <p className="text-xs text-forest/70 dark:text-pale-green/70 mt-1">
              District: <strong>{loc.district}</strong> • State: <strong>{loc.state}</strong> • Terrain: <strong>{loc.terrain_type}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 text-center sm:text-right">
            <div>
              <span className="text-[10px] text-forest/60 dark:text-pale-green/60 uppercase font-bold block">Population</span>
              <span className="text-base font-extrabold text-forest dark:text-pale-green">{loc.population?.toLocaleString()}</span>
            </div>
            <div className="border-l border-forest/10 dark:border-mint/15 pl-4">
              <span className="text-[10px] text-forest/60 dark:text-pale-green/60 uppercase font-bold block">7-Day Cases</span>
              <span className="text-base font-extrabold text-emerald">{loc.case_count_7day}</span>
            </div>
          </div>
        </div>

        {/* Facility & Assigned ASHA Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs text-forest/80 dark:text-pale-green/80">
          <div className="flex items-center gap-2.5 p-3 bg-pale-green/30 dark:bg-forest-light/20 rounded-2xl border border-forest/10 dark:border-mint/15">
            <Hospital className="w-5 h-5 text-emerald shrink-0" />
            <div>
              <span className="font-bold block">Designated Medical Facility:</span>
              <span className="text-forest/70 dark:text-pale-green/70">{loc.nearest_health_facility || 'Sub-Divisional Civil Hospital'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 bg-pale-green/30 dark:bg-forest-light/20 rounded-2xl border border-forest/10 dark:border-mint/15">
            <UserCheck className="w-5 h-5 text-emerald shrink-0" />
            <div>
              <span className="font-bold block">Sentinel ASHA Health Worker:</span>
              <span className="text-forest/70 dark:text-pale-green/70">
                {ashas && ashas.length > 0 ? `${ashas[0].name} (${ashas[0].phone})` : 'Anamika Saikia (+919876543211)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dual-Engine Explainability & Water Quality Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RiskExplainabilityPanel
            riskLevel={loc.current_risk_level}
            caseCount={loc.case_count_7day}
            wqi={wqiVal}
            rainfall={rainVal}
            mlProbability={mlProb}
            mlConfidence={loc.ml_confidence}
            factorWeights={risk?.contributing_factors?.factor_weights}
            recommendedAction={risk?.recommended_action}
            lastUpdated={risk?.computed_at}
          />
        </div>

        {/* Water Quality Index Gauge & Physico-Chemical Telemetry */}
        <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 border border-emerald/20 shadow-sentinel-sm flex flex-col justify-between">
          <div className="border-b border-forest/10 dark:border-mint/15 pb-2">
            <h3 className="text-sm font-extrabold text-forest dark:text-pale-green flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-emerald" />
              Water Quality Index (WQI)
            </h3>
            <p className="text-[11px] text-forest/60 dark:text-pale-green/60 mt-0.5">
              Automated sensor reading at village community water stand
            </p>
          </div>

          <WqiGauge wqi={wqiVal} size={180} />

          {/* Sensor Parameters */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2 pt-2 border-t border-forest/10 dark:border-mint/15">
            <div className="p-2 bg-pale-green/40 dark:bg-forest-light/30 rounded-xl">
              <span className="text-[10px] text-forest/60 dark:text-pale-green/60 block">pH Level</span>
              <span className="font-extrabold">{env?.ph || 7.2}</span>
            </div>
            <div className="p-2 bg-pale-green/40 dark:bg-forest-light/30 rounded-xl">
              <span className="text-[10px] text-forest/60 dark:text-pale-green/60 block">Turbidity</span>
              <span className="font-extrabold">{env?.turbidity_ntu || 3.8} NTU</span>
            </div>
            <div className="p-2 bg-pale-green/40 dark:bg-forest-light/30 rounded-xl">
              <span className="text-[10px] text-forest/60 dark:text-pale-green/60 block">Chlorine</span>
              <span className="font-extrabold">{env?.chlorine_ppm || 0.2} ppm</span>
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Case Volume & Rainfall Trend Chart */}
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 md:p-6 border border-emerald/20 shadow-sentinel-sm">
        <div className="flex items-center justify-between pb-3 border-b border-forest/10 dark:border-mint/15 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-forest dark:text-pale-green flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald" />
              30-Day Syndromic Case Counts vs Precipitation Runoff
            </h3>
            <p className="text-xs text-forest/60 dark:text-pale-green/60 mt-0.5">
              Historical epidemic correlation window for {loc.name}
            </p>
          </div>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trend30d} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#567C5D" />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="#339966" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="#3b82f6" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#339966',
                  borderRadius: '1rem',
                  fontSize: '11px',
                }}
              />
              <Bar yAxisId="right" dataKey="rainfall" name="Rainfall (mm)" fill="#93c5fd" opacity={0.5} radius={[3, 3, 0, 0]} />
              <Line yAxisId="left" type="monotone" dataKey="cases" name="Daily Symptom Cases" stroke="#102F15" strokeWidth={2.5} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Surveillance Reports Table */}
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 md:p-6 border border-emerald/20 shadow-sentinel-sm">
        <h3 className="text-sm font-extrabold text-forest dark:text-pale-green pb-3 border-b border-forest/10 dark:border-mint/15 mb-4">
          Recent Surveillance Reports Logged in {loc.name} (Last 20)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-forest dark:text-pale-green">
            <thead className="bg-pale-green/40 dark:bg-forest-light/40 text-[10px] font-extrabold uppercase tracking-wider text-forest/70 dark:text-pale-green/70">
              <tr>
                <th className="p-2.5">Tracking ID</th>
                <th className="p-2.5">Reporter</th>
                <th className="p-2.5">Symptoms</th>
                <th className="p-2.5">Severity</th>
                <th className="p-2.5">Age Group</th>
                <th className="p-2.5">Water Source</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/5 dark:divide-mint/10">
              {reports.map((r) => (
                <tr key={r.report_id} className="hover:bg-pale-green/20">
                  <td className="p-2.5 font-mono font-bold text-emerald">{r.tracking_id}</td>
                  <td className="p-2.5 capitalize">{r.reporter_type.replace('_', ' ')}</td>
                  <td className="p-2.5">{r.symptoms.join(', ')}</td>
                  <td className="p-2.5 font-bold uppercase text-[10px]">{r.severity}</td>
                  <td className="p-2.5">{r.patient_age_group}</td>
                  <td className="p-2.5">{r.water_source || 'Tube Well'}</td>
                  <td className="p-2.5">
                    <span className={`font-bold text-[10px] ${r.verification_status === 'verified' ? 'text-emerald' : 'text-amber-600'}`}>
                      {r.verification_status}
                    </span>
                  </td>
                  <td className="p-2.5 text-[10px] text-forest/60">{new Date(r.reported_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
