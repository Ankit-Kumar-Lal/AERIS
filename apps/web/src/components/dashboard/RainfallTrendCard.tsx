import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { CloudRain, Activity } from 'lucide-react';

interface MonsoonTrendProps {
  trendData?: Array<{ date: string; cases: number; avg_rainfall: number }>;
}

export const RainfallTrendCard: React.FC<MonsoonTrendProps> = ({ trendData = [] }) => {
  return (
    <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 border border-emerald/20 shadow-sentinel-sm flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-forest/10 dark:border-mint/15 mb-3">
        <div>
          <h3 className="text-sm font-extrabold text-forest dark:text-pale-green tracking-tight flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-blue-500" />
            Monsoon Rainfall vs Water-Borne Case Velocity
          </h3>
          <p className="text-xs text-forest/60 dark:text-pale-green/60 mt-0.5">
            30-day cumulative precipitation runoff overlay with syndromic hospital cases
          </p>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                color: '#102F15',
                boxShadow: '0 4px 12px rgba(16, 47, 21, 0.1)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar yAxisId="right" dataKey="avg_rainfall" name="Rainfall Runoff (mm)" fill="#93c5fd" radius={[4, 4, 0, 0]} opacity={0.6} />
            <Line yAxisId="left" type="monotone" dataKey="cases" name="Daily Symptom Cases" stroke="#102F15" strokeWidth={3} dot={{ r: 2, fill: '#339966' }} activeDot={{ r: 5 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-forest/70 dark:text-pale-green/70 bg-pale-green/30 dark:bg-forest-light/20 p-2.5 rounded-xl border border-emerald/15">
        <span>⚠️ <strong>Hydrological Runoff Threshold:</strong> &gt;400mm 7-day cumulative rainfall triggers soil saturation flood alarm.</span>
      </div>
    </div>
  );
};
