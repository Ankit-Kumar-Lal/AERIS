import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  HelpCircle, 
  Droplets, 
  CloudRain, 
  Activity, 
  CheckSquare, 
  AlertTriangle 
} from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

interface RiskExplainabilityPanelProps {
  riskLevel: string;
  caseCount: number;
  wqi: number;
  rainfall: number;
  mlProbability: number;
  mlConfidence: string;
  factorWeights?: {
    case_load_contrib_pct: number;
    wqi_contamination_contrib_pct: number;
    rainfall_runoff_contrib_pct: number;
    velocity_anomaly_contrib_pct: number;
    primary_driver: string;
  };
  recommendedAction?: string;
  lastUpdated?: string;
}

export const RiskExplainabilityPanel: React.FC<RiskExplainabilityPanelProps> = ({
  riskLevel,
  caseCount,
  wqi,
  rainfall,
  mlProbability,
  mlConfidence,
  factorWeights = {
    case_load_contrib_pct: 35,
    wqi_contamination_contrib_pct: 35,
    rainfall_runoff_contrib_pct: 15,
    velocity_anomaly_contrib_pct: 15,
    primary_driver: "Multi-signal synthesis"
  },
  recommendedAction = "Deploy Rapid Response Unit and issue boiling advisory.",
  lastUpdated,
}) => {
  const mlPct = Math.round(mlProbability * 100);

  return (
    <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 md:p-6 border border-emerald/20 shadow-sentinel-sm space-y-5">
      {/* Title & Philosophy Banner */}
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald" />
            <h3 className="text-base font-extrabold text-forest dark:text-pale-green tracking-tight">
              Dual-Engine Risk Explainability & Signal Attribution
            </h3>
          </div>
          <RiskBadge level={riskLevel} size="md" />
        </div>

        <div className="p-3 bg-pale-green/40 dark:bg-forest-light/30 border border-emerald/30 rounded-2xl flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald shrink-0" />
          <p className="text-xs font-bold text-forest dark:text-pale-green leading-snug">
            "A risk signal is a prompt to verify, not a confirmed outbreak."
            <span className="font-normal text-forest/70 dark:text-pale-green/70 block text-[11px] mt-0.5">
              Deterministic threshold validation joined with supporting Scikit-Learn probabilistic intelligence.
            </span>
          </p>
        </div>
      </div>

      {/* Dual Engines Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Authoritative Rule Engine */}
        <div className="p-4 bg-pale-green/20 dark:bg-forest-light/20 rounded-2xl border border-forest/10 dark:border-mint/15 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-forest/70 dark:text-pale-green/70">
              Authority Engine 1
            </span>
            <span className="text-xs font-bold text-emerald">Deterministic Rules</span>
          </div>
          <p className="text-xs font-extrabold text-forest dark:text-pale-green">
            Public Health Epidemic Thresholds:
          </p>
          <ul className="text-xs space-y-1.5 text-forest/80 dark:text-pale-green/80 font-medium">
            <li className="flex items-center justify-between">
              <span>7-Day Symptom Cases:</span>
              <strong className={caseCount > 15 ? 'text-red-600' : caseCount > 8 ? 'text-amber-600' : 'text-emerald'}>
                {caseCount} (Limit: &gt;15 High, &gt;8 Med)
              </strong>
            </li>
            <li className="flex items-center justify-between">
              <span>Water Quality Index (WQI):</span>
              <strong className={wqi < 50 ? 'text-red-600' : wqi < 60 ? 'text-amber-600' : 'text-emerald'}>
                {wqi} (Limit: &lt;50 Severe, &lt;60 Degraded)
              </strong>
            </li>
            <li className="flex items-center justify-between">
              <span>7-Day Rainfall Runoff:</span>
              <strong className={rainfall > 400 ? 'text-red-600' : 'text-emerald'}>
                {rainfall}mm (Limit: &gt;400mm Flood Inundation)
              </strong>
            </li>
          </ul>
        </div>

        {/* 2. Supporting ML Layer */}
        <div className="p-4 bg-pale-green/20 dark:bg-forest-light/20 rounded-2xl border border-forest/10 dark:border-mint/15 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-forest/70 dark:text-pale-green/70">
              Supporting Layer 2
            </span>
            <span className="text-xs font-bold text-emerald">Scikit-Learn Calibrated ML</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald font-heading">
              {mlPct}%
            </span>
            <span className="text-xs font-bold text-forest/80 dark:text-pale-green/80">
              Outbreak Probability
            </span>
          </div>
          <p className="text-xs text-forest/70 dark:text-pale-green/70 font-semibold">
            Confidence Status: <span className="text-emerald">{mlConfidence}</span>
          </p>
          <p className="text-[10px] text-forest/60 dark:text-pale-green/60">
            Multinomial Logistic Regression trained on historical Brahmaputra river basin epidemic records.
          </p>
        </div>
      </div>

      {/* Signal Contribution Bars */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-forest dark:text-pale-green mb-2">
          <span>Signal Attribution Breakdown</span>
          <span className="text-emerald">Primary Driver: {factorWeights.primary_driver}</span>
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-semibold text-forest/80 dark:text-pale-green/80">Symptom Cluster Frequency:</span>
              <span className="font-bold text-emerald">{factorWeights.case_load_contrib_pct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-forest/10 dark:bg-forest-light overflow-hidden">
              <div style={{ width: `${factorWeights.case_load_contrib_pct}%` }} className="h-full bg-emerald rounded-full" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-semibold text-forest/80 dark:text-pale-green/80">Microbial Water Contamination (Low WQI):</span>
              <span className="font-bold text-amber-600">{factorWeights.wqi_contamination_contrib_pct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-forest/10 dark:bg-forest-light overflow-hidden">
              <div style={{ width: `${factorWeights.wqi_contamination_contrib_pct}%` }} className="h-full bg-amber-500 rounded-full" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-semibold text-forest/80 dark:text-pale-green/80">Monsoon Rainfall & Flood Runoff:</span>
              <span className="font-bold text-blue-600">{factorWeights.rainfall_runoff_contrib_pct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-forest/10 dark:bg-forest-light overflow-hidden">
              <div style={{ width: `${factorWeights.rainfall_runoff_contrib_pct}%` }} className="h-full bg-blue-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Action Checklist */}
      <div className="p-4 bg-emerald-subtle/50 dark:bg-forest-light/40 border border-emerald/30 rounded-2xl">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-active dark:text-mint mb-1.5 flex items-center gap-1.5">
          <CheckSquare className="w-4 h-4 text-emerald" />
          Recommended Operational Next Steps
        </h4>
        <p className="text-xs text-forest dark:text-pale-green font-bold mb-2">
          {recommendedAction}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-forest/80 dark:text-pale-green/80 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald">✓</span> Test local drinking tube-wells for fecal coliforms
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald">✓</span> Check ASHA household ORS packet inventory
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald">✓</span> Issue community water boiling advisory
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald">✓</span> Escalate telemetry to District IDSP Cell
          </div>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-[10px] text-forest/50 dark:text-pale-green/50 text-right">
          Telemetry Timestamp: {new Date(lastUpdated).toLocaleString()} • Model: Logistic Regression
        </p>
      )}
    </div>
  );
};
