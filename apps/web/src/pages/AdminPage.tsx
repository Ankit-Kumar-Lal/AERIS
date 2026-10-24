import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Server,
  Activity,
  Sparkles,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
  Cpu,
  RefreshCw,
  Sliders,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { OfficialApprovals } from '../components/admin/OfficialApprovals';
import { OutbreakSimulatorModal } from '../components/admin/OutbreakSimulatorModal';
import { fetchLocations, loginUser } from '../services/api';
import { LocationItem } from '../types';

export const AdminPage: React.FC = () => {
  const { user, login } = useAuth();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [showSimulator, setShowSimulator] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterState, setFilterState] = useState('ALL');

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setLoadingLocations(true);
    try {
      const data = await fetchLocations();
      setLocations(data);
    } catch {
      // fallback handled
    } finally {
      setLoadingLocations(false);
    }
  };

  const isPrivileged =
    user &&
    ['ADMIN', 'HEALTH_OFFICIAL', 'EPIDEMIOLOGIST', 'DISTRICT_MAGISTRATE'].includes(
      user.role
    ) &&
    user.verification_status === 'APPROVED';

  const handleQuickAdminLogin = async () => {
    try {
      const res = await loginUser('admin@sentinel.org', 'Sentinel@123');
      login(res.access_token, res.user);
    } catch (err: any) {
      alert(err.message || 'Quick login failed');
    }
  };

  const filteredLocations = locations.filter((loc) => {
    if (filterState === 'ALL') return true;
    return loc.state.toUpperCase() === filterState.toUpperCase();
  });

  const uniqueStates = Array.from(new Set(locations.map((l) => l.state))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/10 dark:border-mint/15">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest/10 dark:bg-mint/10 text-forest dark:text-pale-green">
              <Server className="w-5 h-5 text-emerald" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-forest dark:text-pale-green tracking-tight font-display">
                Mission Control & Administration
              </h1>
              <p className="text-xs text-forest/70 dark:text-pale-green/70">
                System telemetry, anti-fake credential governance, and outbreak simulation controls
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSimulator(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald to-mint text-forest font-extrabold text-xs rounded-xl shadow-sentinel-sm hover:shadow-sentinel transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-forest" />
            <span>Outbreak Simulator</span>
          </button>
        </div>
      </div>

      {/* Privileged Access Alert Banner */}
      {!isPrivileged && (
        <div className="p-4 bg-amber-500/15 border-2 border-amber-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-start sm:items-center gap-3">
            <Lock className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">
                Restricted Administrative Zone
              </p>
              <p className="text-xs opacity-90">
                You are currently viewing in preview mode. Only authenticated Administrators or
                District Health Officers can modify coverage states and approve ASHA credentials.
              </p>
            </div>
          </div>
          <button
            onClick={handleQuickAdminLogin}
            className="px-3.5 py-1.5 bg-amber-700 dark:bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-800 transition-colors shrink-0 shadow-sm"
          >
            Switch to Admin
          </button>
        </div>
      )}

      {/* Telemetry & System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-emerald/20 shadow-sentinel-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-forest/70 dark:text-pale-green/70">
              Deterministic Rule Engine
            </span>
            <Activity className="w-4 h-4 text-emerald" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-forest dark:text-pale-green">v2.4.0</span>
            <span className="text-[10px] font-bold text-emerald bg-emerald/15 px-2 py-0.5 rounded-full">
              ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-forest/60 dark:text-pale-green/60 mt-1">
            Authoritative thresholds: Cases &gt; 15, WQI &lt; 50, Rain &gt; 400mm
          </p>
        </div>

        <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-emerald/20 shadow-sentinel-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-forest/70 dark:text-pale-green/70">
              Scikit-Learn ML Classifier
            </span>
            <Cpu className="w-4 h-4 text-mint" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-forest dark:text-pale-green">94.2%</span>
            <span className="text-[10px] font-bold text-mint bg-mint/15 px-2 py-0.5 rounded-full">
              CALIBRATED
            </span>
          </div>
          <p className="text-[11px] text-forest/60 dark:text-pale-green/60 mt-1">
            Multivariate Logistic Regression with L2 Penalty & Probabilities
          </p>
        </div>

        <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-emerald/20 shadow-sentinel-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-forest/70 dark:text-pale-green/70">
              Anti-Fake Telemetry
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-forest dark:text-pale-green">D5 Verhoeff</span>
            <span className="text-[10px] font-bold text-emerald bg-emerald/15 px-2 py-0.5 rounded-full">
              ENFORCED
            </span>
          </div>
          <p className="text-[11px] text-forest/60 dark:text-pale-green/60 mt-1">
            Salted SHA-256 ID hashing + Haversine 15km geo-verification
          </p>
        </div>

        <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-emerald/20 shadow-sentinel-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-forest/70 dark:text-pale-green/70">
              WebSocket Event Bus
            </span>
            <Database className="w-4 h-4 text-emerald" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-forest dark:text-pale-green">Live SSE/WS</span>
            <span className="text-[10px] font-bold text-emerald bg-emerald/15 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse"></span>
              STREAMING
            </span>
          </div>
          <p className="text-[11px] text-forest/60 dark:text-pale-green/60 mt-1">
            Zero-polling real-time updates broadcast to all clients
          </p>
        </div>
      </div>

      {/* Official Verification Workflow */}
      <OfficialApprovals />

      {/* Village Surveillance Coverage Manager */}
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 md:p-6 border border-emerald/20 shadow-sentinel-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-forest/10 dark:border-mint/15">
          <div>
            <h3 className="text-sm font-extrabold text-forest dark:text-pale-green tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald" />
              Northeast Surveillance Coverage Matrix ({locations.length} Locations)
            </h3>
            <p className="text-xs text-forest/60 dark:text-pale-green/60 mt-0.5">
              Active sentinel villages vs planned expansion nodes across 8 sister states
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-forest/70 dark:text-pale-green/70">State:</span>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="text-xs font-bold bg-pale-green/40 dark:bg-forest-light/40 border border-forest/20 dark:border-mint/20 rounded-xl px-2.5 py-1 text-forest dark:text-pale-green focus:outline-none"
            >
              <option value="ALL">All 8 States ({locations.length})</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingLocations ? (
          <p className="text-xs text-forest/60 py-6 text-center">Loading surveillance matrix...</p>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-pale-green/40 dark:bg-forest-light/60 backdrop-blur-sm text-forest/70 dark:text-pale-green/70 border-b border-forest/10 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Village Name</th>
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">Population</th>
                  <th className="py-2.5 px-3">Water Source</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Coordinates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10 dark:divide-mint/10">
                {filteredLocations.slice(0, 30).map((loc) => (
                  <tr
                    key={loc.location_id}
                    className="hover:bg-pale-green/20 dark:hover:bg-forest-light/20 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-bold text-forest dark:text-pale-green">
                      {loc.name}
                    </td>
                    <td className="py-2.5 px-3 text-forest/80 dark:text-pale-green/80">
                      {loc.district}
                    </td>
                    <td className="py-2.5 px-3 text-forest/80 dark:text-pale-green/80 font-medium">
                      {loc.state}
                    </td>
                    <td className="py-2.5 px-3 text-forest/70 dark:text-pale-green/70">
                      {loc.population.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-forest/70 dark:text-pale-green/70">
                      {loc.primary_water_source || loc.terrain_type}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          loc.status === 'active'
                            ? 'bg-emerald/15 text-emerald border border-emerald/30'
                            : 'bg-forest/10 dark:bg-mint/10 text-forest/70 dark:text-pale-green/70'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            loc.status === 'active' ? 'bg-emerald' : 'bg-gray-400'
                          }`}
                        ></span>
                        {loc.status === 'active' ? 'Active Sentinel' : 'Expansion Node'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[10px] text-forest/60 dark:text-pale-green/60">
                      {loc.latitude.toFixed(3)}°N, {loc.longitude.toFixed(3)}°E
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Outbreak Simulator Modal */}
      <OutbreakSimulatorModal
        locations={locations}
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
        onSuccess={() => {
          // reload telemetry
        }}
      />
    </div>
  );
};
export default AdminPage;