import React, { useState, useEffect } from 'react';
import { Droplets, CloudRain, ShieldCheck, AlertTriangle, RefreshCw, Compass } from 'lucide-react';
import { fetchLocations } from '../services/api';
import { LocationItem } from '../types';

export const WaterWeatherPage: React.FC = () => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedState, setSelectedState] = useState('All');

  useEffect(() => {
    fetchLocations({ status_filter: 'active' })
      .then((data) => setLocations(data))
      .catch(() => {});
  }, []);

  const filtered = locations.filter((l) => selectedState === 'All' || l.state === selectedState);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl border border-emerald/20 shadow-sentinel-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-forest dark:text-pale-green tracking-tight flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-600" />
            Water Quality & Hydrological Weather Intelligence
          </h2>
          <p className="text-xs text-forest/60 dark:text-pale-green/60 mt-0.5">
            Village-level physico-chemical water observations and monsoon precipitation telemetry
          </p>
        </div>

        {/* 3 to 5-Day Indicative Outlook Chip */}
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>3-Day Outlook: Elevated runoff alert for Brahmaputra lower valley (Indicative).</span>
        </div>
      </div>

      {/* Water Source Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Community Tube Wells', total: '184 Sensors', status: '82% Potable', alert: '18% Contaminated', icon: '🚰' },
          { title: 'Surface Ponds / Pukhuri', total: '92 Locations', status: '64% Degraded', alert: 'Severe coliform risk', icon: '🌊' },
          { title: 'River & Flood Corridors', total: '46 River Stations', status: 'High Runoff', alert: 'Peak sediment load', icon: '🏞️' },
          { title: 'JJM Piped Standposts', total: '128 Piped Points', status: '91% Safe', alert: 'Residual chlorine 0.2ppm', icon: '💧' },
        ].map((item, idx) => (
          <div key={idx} className="p-4 bg-white dark:bg-surface-dark rounded-3xl border border-emerald/20 shadow-sentinel-sm space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald bg-emerald/10 px-2 py-0.5 rounded-full">
                {item.status}
              </span>
            </div>
            <h4 className="text-xs font-extrabold text-forest dark:text-pale-green">{item.title}</h4>
            <p className="text-[11px] text-forest/70 dark:text-pale-green/70">{item.total}</p>
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">{item.alert}</p>
          </div>
        ))}
      </div>

      {/* Village Water Telemetry Grid */}
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 md:p-6 border border-emerald/20 shadow-sentinel-sm">
        <h3 className="text-sm font-extrabold text-forest dark:text-pale-green pb-3 border-b border-forest/10 dark:border-mint/15 mb-4">
          Sentinel Village Water Telemetry Readings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((loc) => {
            const isContaminated = loc.latest_wqi < 50;
            return (
              <div
                key={loc.location_id}
                className={`p-4 rounded-2xl border transition-all ${
                  isContaminated
                    ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                    : 'bg-pale-green/20 dark:bg-forest-light/20 border-forest/10 dark:border-mint/15'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-extrabold text-forest dark:text-pale-green">{loc.name}</h4>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    isContaminated ? 'bg-red-600 text-white' : 'bg-emerald text-white'
                  }`}>
                    WQI: {loc.latest_wqi}
                  </span>
                </div>
                <p className="text-[11px] text-forest/60 dark:text-pale-green/60 mb-2">
                  {loc.district}, {loc.state} • 7d Rain: {loc.latest_rainfall}mm
                </p>

                <div className="text-[11px] space-y-1 pt-2 border-t border-forest/10 dark:border-mint/15 text-forest/80 dark:text-pale-green/80">
                  <p>Status: <strong>{isContaminated ? 'Severe Pathogen Contamination' : 'Potable Normal'}</strong></p>
                  <p>Tested Source: <strong>Community Tube Well</strong></p>
                  <p>Flood Runoff Risk: <strong>{loc.latest_rainfall > 400 ? 'High Inundation' : 'Normal Seasonal'}</strong></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
