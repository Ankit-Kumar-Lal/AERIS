import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapLibreView } from '../components/map/MapLibreView';
import { fetchLocations } from '../services/api';
import { LocationItem } from '../types';
import { Map, Layers, Filter } from 'lucide-react';

export const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations({ status_filter: 'all' })
      .then((data) => setLocations(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const NE_STATES = [
    'All',
    'Assam',
    'Meghalaya',
    'Tripura',
    'Manipur',
    'Arunachal Pradesh',
    'Nagaland',
    'Mizoram',
    'Sikkim'
  ];

  const filtered = locations.filter((loc) => {
    if (selectedState !== 'All' && loc.state !== selectedState) return false;
    if (selectedRisk !== 'All' && loc.current_risk_level.toLowerCase() !== selectedRisk.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Filter Chips Bar */}
      <div className="bg-white dark:bg-surface-dark p-4 rounded-3xl border border-emerald/20 shadow-sentinel-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-forest dark:text-pale-green tracking-tight flex items-center gap-2">
            <Map className="w-5 h-5 text-emerald" />
            Northeast India 3D Sentinel Geospatial Command
          </h2>
          <p className="text-xs text-forest/60 dark:text-pale-green/60 mt-0.5">
            Real-time multi-signal telemetry, Brahmaputra flood corridors, and risk contours
          </p>
        </div>

        {/* State Selection Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 custom-scrollbar">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-1.5 bg-pale-green/40 dark:bg-forest-light/40 border border-emerald/20 rounded-xl text-xs font-bold text-forest dark:text-pale-green focus:outline-none focus:ring-2 focus:ring-emerald"
          >
            {NE_STATES.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All 8 NE States' : s}</option>
            ))}
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="px-3 py-1.5 bg-pale-green/40 dark:bg-forest-light/40 border border-emerald/20 rounded-xl text-xs font-bold text-forest dark:text-pale-green focus:outline-none focus:ring-2 focus:ring-emerald"
          >
            <option value="All">All Risk Levels</option>
            <option value="High">⚠️ High Risk Only</option>
            <option value="Medium">⚡ Medium Risk Only</option>
            <option value="Low">🛡️ Low / Safe Only</option>
          </select>
        </div>
      </div>

      {/* Full Interactive Map */}
      <MapLibreView
        locations={filtered}
        onSelectVillage={(id) => navigate(`/village/${id}`)}
        height="calc(100vh - 200px)"
        showTimeScrubber={true}
      />
    </div>
  );
};
