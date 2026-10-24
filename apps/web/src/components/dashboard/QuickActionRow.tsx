import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Map, 
  FileText, 
  PlusCircle, 
  ShieldAlert, 
  Droplets, 
  CloudRain, 
  BookOpen 
} from 'lucide-react';

export const QuickActionRow: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'View 3D Map', to: '/map', icon: <Map className="w-4 h-4 text-emerald" />, desc: '8 NE States' },
    { label: 'New Cases', to: '/cases', icon: <FileText className="w-4 h-4 text-mint-dark dark:text-mint" />, desc: 'Case Stream' },
    { label: 'Report Case', to: '/report', icon: <PlusCircle className="w-4 h-4 text-emerald" />, desc: 'Field Log', highlight: true },
    { label: 'Alerts', to: '/alerts', icon: <ShieldAlert className="w-4 h-4 text-amber-500" />, desc: 'Active Warnings' },
    { label: 'Water Quality', to: '/water-weather', icon: <Droplets className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />, desc: 'Sensor Telemetry' },
    { label: 'Weather & Flood', to: '/water-weather', icon: <CloudRain className="w-4 h-4 text-blue-600 dark:text-blue-400" />, desc: 'Rainfall Inundation' },
    { label: 'Resources', to: '/resources', icon: <BookOpen className="w-4 h-4 text-emerald" />, desc: 'ORS & Hygiene' },
  ];

  return (
    <div className="bg-white dark:bg-surface-dark rounded-3xl p-3 border border-emerald/20 shadow-sentinel-sm">
      <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-forest/10 dark:border-mint/15">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-forest/70 dark:text-pale-green/70">
          ⚡ Operations Fast Actions
        </span>
        <span className="text-[10px] text-emerald font-semibold">
          Sentinel Rapid Response
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {actions.map((act) => (
          <button
            key={act.label}
            onClick={() => navigate(act.to)}
            className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-center group ${
              act.highlight
                ? 'bg-soft-mint text-forest border-emerald/40 hover:bg-emerald hover:text-white font-bold'
                : 'bg-pale-green/30 dark:bg-forest-light/20 text-forest dark:text-pale-green border-transparent hover:border-emerald/30 hover:bg-white dark:hover:bg-forest-light'
            }`}
          >
            <div className="p-1.5 rounded-xl bg-white/80 dark:bg-forest/60 group-hover:scale-110 transition-transform mb-1 shadow-sentinel-sm">
              {act.icon}
            </div>
            <span className="text-xs font-bold leading-tight truncate w-full">{act.label}</span>
            <span className="text-[10px] text-forest/60 dark:text-pale-green/60 truncate w-full">{act.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
