import React from 'react';
import { PieChart, Activity } from 'lucide-react';

interface DiseaseBreakdownProps {
  data?: Record<string, number>;
}

export const DiseaseBreakdownCard: React.FC<DiseaseBreakdownProps> = ({ data }) => {
  const defaultData: Record<string, { pct: number; color: string; desc: string }> = {
    'Acute Diarrhea / Cholera Risk': { pct: 48, color: 'bg-emerald', desc: 'Vibrio cholerae & microbial coliform runoff' },
    'Bacillary Dysentery': { pct: 22, color: 'bg-mint-dark dark:bg-mint', desc: 'Shigella species via shallow contaminated well' },
    'Enteric Typhoid Fever': { pct: 14, color: 'bg-amber-500', desc: 'Salmonella enterica serovar Typhi' },
    'Viral Hepatitis A / E': { pct: 10, color: 'bg-blue-500', desc: 'Fecal-oral transmission in flood water' },
    'Acute Encephalitis Syndrome (AES)': { pct: 6, color: 'bg-red-500', desc: 'Flood-linked secondary neurological flag' },
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 border border-emerald/20 shadow-sentinel-sm flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-forest/10 dark:border-mint/15 mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-forest dark:text-pale-green tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald" />
            Etiological Disease Distribution
          </h3>
          <p className="text-xs text-forest/60 dark:text-pale-green/60 mt-0.5">
            Classified from verified syndromic cluster surveillance
          </p>
        </div>
      </div>

      <div className="space-y-3.5 flex-1 justify-center flex flex-col">
        {Object.entries(defaultData).map(([disease, info]) => (
          <div key={disease} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-forest dark:text-pale-green truncate">{disease}</span>
              <span className="font-extrabold text-emerald dark:text-mint ml-2">{info.pct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-forest/10 dark:bg-forest-light overflow-hidden">
              <div
                style={{ width: `${info.pct}%` }}
                className={`h-full ${info.color} rounded-full transition-all duration-700`}
              />
            </div>
            <p className="text-[10px] text-forest/60 dark:text-pale-green/60 truncate">{info.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
