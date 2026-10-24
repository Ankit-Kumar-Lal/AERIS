import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Download, 
  ExternalLink, 
  PlusCircle, 
  Filter, 
  AlertTriangle,
  ArrowUpDown,
  Building
} from 'lucide-react';
import { LocationItem } from '../../types';
import { RiskBadge } from '../common/RiskBadge';

interface VillageTableProps {
  locations: LocationItem[];
  onSelectVillage?: (locationId: number) => void;
}

export const VillageTable: React.FC<VillageTableProps> = ({ locations, onSelectVillage }) => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [sortField, setSortField] = useState<'name' | 'cases' | 'wqi' | 'prob'>('prob');
  const [sortAsc, setSortAsc] = useState(false);

  // States & Districts
  const states = useMemo(() => ['All', ...new Set(locations.map((l) => l.state))], [locations]);
  
  const districts = useMemo(() => {
    const list = selectedState === 'All' 
      ? locations 
      : locations.filter((l) => l.state === selectedState);
    return ['All', ...new Set(list.map((l) => l.district))];
  }, [locations, selectedState]);

  // Filtered & Sorted locations
  const filtered = useMemo(() => {
    return locations.filter((loc) => {
      if (selectedState !== 'All' && loc.state !== selectedState) return false;
      if (selectedDistrict !== 'All' && loc.district !== selectedDistrict) return false;
      if (selectedRisk !== 'All' && loc.current_risk_level.toLowerCase() !== selectedRisk.toLowerCase()) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return loc.name.toLowerCase().includes(q) || loc.district.toLowerCase().includes(q) || loc.state.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => {
      let res = 0;
      if (sortField === 'name') res = a.name.localeCompare(b.name);
      else if (sortField === 'cases') res = a.case_count_7day - b.case_count_7day;
      else if (sortField === 'wqi') res = a.latest_wqi - b.latest_wqi;
      else if (sortField === 'prob') res = a.ml_risk_probability - b.ml_risk_probability;
      return sortAsc ? res : -res;
    });
  }, [locations, selectedState, selectedDistrict, selectedRisk, search, sortField, sortAsc]);

  const handleSort = (field: 'name' | 'cases' | 'wqi' | 'prob') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Village', 'District', 'State', 'Status', 'Risk Level', '7-Day Cases', 'WQI', 'AI Probability', 'Terrain'];
    const rows = filtered.map((l) => [
      l.name,
      l.district,
      l.state,
      l.status,
      l.current_risk_level,
      l.case_count_7day,
      l.latest_wqi,
      `${Math.round(l.ml_risk_probability * 100)}%`,
      `"${l.terrain_type}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aeris_villages_data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 border border-emerald/20 shadow-sentinel-sm flex flex-col">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-forest/10 dark:border-mint/15 mb-4">
        <div>
          <h3 className="text-base font-extrabold text-forest dark:text-pale-green tracking-tight flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald" />
            Monitored Villages Surveillance Directory
          </h3>
          <p className="text-xs text-forest/60 dark:text-pale-green/60 mt-0.5">
            47 sentinel locations across all 8 Northeast states with dual-engine risk classification
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
            <span>Log Field Report</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-forest/40 dark:text-pale-green/40 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search village or district..."
            className="w-full pl-9 pr-3 py-1.5 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green focus:outline-none focus:ring-2 focus:ring-emerald"
          />
        </div>

        {/* State Filter */}
        <select
          value={selectedState}
          onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict('All'); }}
          className="px-3 py-1.5 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green font-semibold focus:outline-none focus:ring-2 focus:ring-emerald"
        >
          {states.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>
          ))}
        </select>

        {/* District Filter */}
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="px-3 py-1.5 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green font-semibold focus:outline-none focus:ring-2 focus:ring-emerald"
        >
          {districts.map((d) => (
            <option key={d} value={d}>{d === 'All' ? 'All Districts' : d}</option>
          ))}
        </select>

        {/* Risk Level Filter Chips */}
        <div className="flex items-center gap-1 bg-pale-green/40 dark:bg-forest-light/30 p-1 rounded-xl border border-emerald/20 text-xs">
          {['All', 'High', 'Medium', 'Low'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRisk(r)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedRisk === r
                  ? 'bg-emerald text-white shadow-sentinel-sm'
                  : 'text-forest/70 dark:text-pale-green/70 hover:bg-emerald/10'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-2xl border border-forest/10 dark:border-mint/15">
        <table className="w-full text-left text-xs text-forest dark:text-pale-green">
          <thead className="bg-pale-green/60 dark:bg-forest-light/50 text-forest/75 dark:text-pale-green/75 uppercase text-[10px] font-extrabold tracking-wider border-b border-forest/10 dark:border-mint/15 select-none">
            <tr>
              <th className="py-3 px-3 cursor-pointer hover:text-emerald" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>Village</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">District & State</th>
              <th className="py-3 px-3">Risk Level</th>
              <th className="py-3 px-3 cursor-pointer hover:text-emerald" onClick={() => handleSort('cases')}>
                <div className="flex items-center gap-1">
                  <span>7d Cases</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-emerald" onClick={() => handleSort('wqi')}>
                <div className="flex items-center gap-1">
                  <span>WQI</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-emerald" onClick={() => handleSort('prob')}>
                <div className="flex items-center gap-1">
                  <span>AI Probability</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/5 dark:divide-mint/10 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-forest/60 dark:text-pale-green/60">
                  No villages match the active filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((loc) => {
                const isComingSoon = loc.status === 'coming_soon';
                return (
                  <tr
                    key={loc.location_id}
                    className="hover:bg-pale-green/30 dark:hover:bg-forest-light/30 transition-colors group cursor-pointer"
                    onClick={() => {
                      if (!isComingSoon) {
                        onSelectVillage ? onSelectVillage(loc.location_id) : navigate(`/village/${loc.location_id}`);
                      }
                    }}
                  >
                    <td className="py-3 px-3 font-extrabold text-forest dark:text-pale-green">
                      <div className="flex items-center gap-1.5">
                        <span>{loc.name}</span>
                        {isComingSoon && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-500/30">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-forest/70 dark:text-pale-green/70">
                      {loc.district}, {loc.state}
                    </td>
                    <td className="py-3 px-3">
                      {isComingSoon ? (
                        <span className="text-[10px] text-forest/50 dark:text-pale-green/50 italic">Phase 2 Pipeline</span>
                      ) : (
                        <RiskBadge level={loc.current_risk_level} size="sm" />
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold">
                      {isComingSoon ? '—' : loc.case_count_7day}
                    </td>
                    <td className="py-3 px-3 font-bold">
                      {isComingSoon ? '—' : (
                        <span className={loc.latest_wqi < 50 ? 'text-red-600 font-extrabold' : loc.latest_wqi < 60 ? 'text-amber-600' : 'text-emerald'}>
                          {loc.latest_wqi}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold">
                      {isComingSoon ? '—' : (
                        <span className="text-emerald dark:text-mint">
                          {Math.round(loc.ml_risk_probability * 100)}%
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {!isComingSoon && (
                          <>
                            <button
                              onClick={() => navigate(`/village/${loc.location_id}`)}
                              className="px-2.5 py-1 rounded-lg bg-pale-green/50 dark:bg-forest-light hover:bg-emerald hover:text-white text-forest dark:text-pale-green text-xs font-bold transition-colors"
                              title="View village detail"
                            >
                              Detail
                            </button>
                            <button
                              onClick={() => navigate(`/report?village=${loc.location_id}`)}
                              className="px-2 py-1 rounded-lg bg-emerald/10 text-emerald hover:bg-emerald hover:text-white text-xs font-bold transition-colors"
                              title="Submit report for this village"
                            >
                              + Report
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-forest/60 dark:text-pale-green/60">
        <span>Showing {filtered.length} of {locations.length} villages</span>
        <span className="font-semibold text-emerald">ASDMA Sentinel Telemetry Active</span>
      </div>
    </div>
  );
};
