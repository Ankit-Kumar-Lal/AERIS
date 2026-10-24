import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Shield, Droplets, CloudRain, Activity } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';

interface AttentionVillage {
  location_id: number;
  name: string;
  district: string;
  state: string;
  risk_level: string;
  case_count_7day: number;
  ml_risk_probability: number;
  ml_confidence: string;
  wqi: number;
  rainfall: number;
  factor_weights?: {
    case_load_contrib_pct: number;
    wqi_contamination_contrib_pct: number;
    rainfall_runoff_contrib_pct: number;
    velocity_anomaly_contrib_pct: number;
    primary_driver: string;
  };
  recommended_action: string;
}

export const TopAttentionVillages: React.FC<{ villages: AttentionVillage[] }> = ({ villages }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 border border-emerald/20 shadow-sentinel-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-forest dark:text-pale-green tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Top 5 Villages Requiring Public Health Attention
          </h3>
          <p className="text-xs text-forest/60 dark:text-pale-green/60 mt-0.5">
            Ranked by multi-signal risk fusion (Rules + Scikit-Learn ML + Anomaly Velocity)
          </p>
        </div>
        <button
          onClick={() => navigate('/cases')}
          className="text-xs font-bold text-emerald hover:underline flex items-center gap-1"
        >
          <span>All Villages</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {villages.map((v) => {
          const weights = v.factor_weights || {
            case_load_contrib_pct: 35,
            wqi_contamination_contrib_pct: 35,
            rainfall_runoff_contrib_pct: 15,
            velocity_anomaly_contrib_pct: 15,
            primary_driver: "Multi-signal elevation"
          };

          return (
            <div
              key={v.location_id}
              onClick={() => navigate(`/village/${v.location_id}`)}
              className="p-3.5 bg-pale-green/20 dark:bg-forest-light/20 rounded-2xl border border-forest/10 dark:border-mint/15 hover:border-emerald/40 hover:bg-pale-green/40 dark:hover:bg-forest-light/40 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-extrabold text-forest dark:text-pale-green">
                      {v.name}
                    </span>
                    <span className="text-xs text-forest/60 dark:text-pale-green/60 font-medium">
                      ({v.district}, {v.state})
                    </span>
                    <RiskBadge level={v.risk_level} size="sm" />
                  </div>

                  <p className="text-[11px] text-forest/70 dark:text-pale-green/70 mt-1 flex items-center gap-3">
                    <span><strong>7d Cases:</strong> {v.case_count_7day}</span>
                    <span><strong>WQI:</strong> {v.wqi}</span>
                    <span><strong>7d Rain:</strong> {v.rainfall}mm</span>
                    <span className="text-emerald font-bold">
                      <strong>AI Risk:</strong> {Math.round(v.ml_risk_probability * 100)}%
                    </span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-mint-dark dark:text-mint uppercase tracking-wider block">
                    Driver
                  </span>
                  <span className="text-[11px] font-extrabold text-forest dark:text-pale-green">
                    {weights.primary_driver}
                  </span>
                </div>
              </div>

              {/* Explainability Signal Contribution Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] text-forest/60 dark:text-pale-green/60 mb-1 font-semibold">
                  <span>Contributing Signals Breakdown:</span>
                  <span>Cases {weights.case_load_contrib_pct}% • WQI {weights.wqi_contamination_contrib_pct}% • Flood {weights.rainfall_runoff_contrib_pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-forest/10 dark:bg-forest-light overflow-hidden flex">
                  <div
                    style={{ width: `${weights.case_load_contrib_pct}%` }}
                    className="bg-emerald h-full"
                    title={`Case Load: ${weights.case_load_contrib_pct}%`}
                  />
                  <div
                    style={{ width: `${weights.wqi_contamination_contrib_pct}%` }}
                    className="bg-amber-500 h-full"
                    title={`Water Quality Degradation: ${weights.wqi_contamination_contrib_pct}%`}
                  />
                  <div
                    style={{ width: `${weights.rainfall_runoff_contrib_pct}%` }}
                    className="bg-blue-500 h-full"
                    title={`Monsoon Flood Runoff: ${weights.rainfall_runoff_contrib_pct}%`}
                  />
                  <div
                    style={{ width: `${weights.velocity_anomaly_contrib_pct}%` }}
                    className="bg-mint h-full"
                    title={`Velocity Anomaly: ${weights.velocity_anomaly_contrib_pct}%`}
                  />
                </div>
              </div>

              {/* Recommended Next Step */}
              <div className="mt-2 text-[11px] bg-white/80 dark:bg-surface-dark/80 p-2 rounded-xl border border-emerald/20 text-forest/80 dark:text-pale-green/80 font-medium">
                <strong className="text-emerald">Recommended Step:</strong> {v.recommended_action}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
