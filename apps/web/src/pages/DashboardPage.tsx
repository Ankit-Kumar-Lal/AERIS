import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  ShieldAlert, 
  Activity, 
  Droplets, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { KpiCard } from '../components/dashboard/KpiCard';
import { QuickActionRow } from '../components/dashboard/QuickActionRow';
import { TopAttentionVillages } from '../components/dashboard/TopAttentionVillages';
import { LiveActivityFeed } from '../components/dashboard/LiveActivityFeed';
import { NortheastNewsCard } from '../components/dashboard/NortheastNewsCard';
import { DiseaseBreakdownCard } from '../components/dashboard/DiseaseBreakdownCard';
import { RainfallTrendCard } from '../components/dashboard/RainfallTrendCard';
import { VillageTable } from '../components/dashboard/VillageTable';
import { OutbreakSimulatorModal } from '../components/admin/OutbreakSimulatorModal';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardSummary, fetchLocations, triggerRiskCompute } from '../services/api';
import { DashboardSummary, LocationItem } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const formatLiveTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(formatLiveTime);

  const loadData = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const [sumData, locsData] = await Promise.all([
        fetchDashboardSummary(),
        fetchLocations({ status_filter: 'all' })
      ]);
      setSummary(sumData);
      setLocations(locsData);
      setLastSyncTime(formatLiveTime());
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const handleManualRecompute = async () => {
    setRecomputing(true);
    try {
      await triggerRiskCompute();
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to recompute scores.');
    } finally {
      setRecomputing(false);
    }
  };

  const isOfficial = user && user.role !== 'CIVILIAN';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Greeting & Telemetry Status Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-surface-dark p-5 rounded-3xl border border-emerald/20 shadow-sentinel-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-forest dark:text-pale-green tracking-tight font-heading">
              {user ? `Welcome, ${user.full_name}` : 'AERIS Epidemic Risk Intelligence Node'}
            </h1>
          </div>
          <p className="text-xs text-forest/70 dark:text-pale-green/70 mt-1">
            Jurisdiction: <strong>{user?.district ? `${user.district} District • ${user.state || 'Assam'}` : '8 Northeast India Sentinel States Active'}</strong>
            <span className="mx-2">•</span>
            Last telemetry refresh: <span className="font-semibold text-emerald">{lastSyncTime}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Outbreak Simulator Button (Admin / Simulation) */}
          <button
            onClick={() => setShowSimulator(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sentinel-md"
            title="Inject simulated water-borne outbreak surge"
          >
            <Flame className="w-4 h-4 text-white animate-pulse" />
            <span className="hidden sm:inline">Simulate Outbreak</span>
          </button>

          {/* Recompute Scores Button */}
          <button
            onClick={handleManualRecompute}
            disabled={recomputing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald/10 hover:bg-emerald/20 text-emerald text-xs font-bold rounded-xl border border-emerald/30 transition-all shadow-sentinel-sm"
            title="Recompute dual-engine risk scores for all villages"
          >
            <RefreshCw className={`w-4 h-4 ${recomputing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{recomputing ? 'Analyzing...' : 'Recompute Scores'}</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards Grid (7 key indicators with animated count-up) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          title="Monitored Villages"
          value={summary?.monitored_villages_count || locations.length || 47}
          subtitle="8 States Active"
          icon={<Building className="w-4 h-4" />}
          colorScheme="forest"
          onClick={() => navigate('/cases')}
        />

        <KpiCard
          title="Active Warnings"
          value={summary?.active_alerts_count || 0}
          subtitle="Priority Triage"
          icon={<ShieldAlert className="w-4 h-4 text-red-600" />}
          trend={summary && summary.active_alerts_count > 0 ? 'Urgent' : 'Safe'}
          trendType={summary && summary.active_alerts_count > 0 ? 'negative' : 'positive'}
          colorScheme="red"
          onClick={() => navigate('/alerts')}
        />

        <KpiCard
          title="New Cases Today"
          value={summary?.cases_today_count || 14}
          subtitle="Last 24 Hours"
          icon={<Activity className="w-4 h-4" />}
          colorScheme="emerald"
          onClick={() => navigate('/cases')}
        />

        <KpiCard
          title="7-Day Case Load"
          value={summary?.cases_7day_count || 98}
          subtitle="Surveillance Window"
          icon={<Calendar className="w-4 h-4" />}
          colorScheme="mint"
          onClick={() => navigate('/cases')}
        />

        <KpiCard
          title="High Risk Villages"
          value={summary?.high_risk_villages_count || 6}
          subtitle="Action Threshold Met"
          icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
          colorScheme="amber"
          onClick={() => navigate('/cases?severity=severe')}
        />

        <KpiCard
          title="Average WQI"
          value={summary?.avg_wqi || 68.4}
          subtitle="Scale 0 (Bad) - 100 (Clean)"
          icon={<Droplets className="w-4 h-4 text-cyan-600" />}
          trend={summary && summary.avg_wqi < 60 ? 'Degraded' : 'Potable'}
          trendType={summary && summary.avg_wqi < 60 ? 'negative' : 'positive'}
          colorScheme="emerald"
          onClick={() => navigate('/water-weather')}
        />
      </div>

      {/* 3. Fast Quick Action Ribbon */}
      <QuickActionRow />

      {/* 4. Top 5 Attention Villages & Real-Time Activity Feed + Regional Health News */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TopAttentionVillages
            villages={summary?.top_attention_villages || []}
          />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <LiveActivityFeed />
          <NortheastNewsCard />
        </div>
      </div>

      {/* 5. Monsoon & Case Trend Overlay + Disease Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RainfallTrendCard
            trendData={summary?.monsoon_trend || []}
          />
        </div>
        <div className="lg:col-span-1">
          <DiseaseBreakdownCard
            data={summary?.disease_distribution}
          />
        </div>
      </div>

      {/* 6. Comprehensive Filterable Villages Table */}
      <VillageTable
        locations={locations}
        onSelectVillage={(id) => navigate(`/village/${id}`)}
      />

      {/* Decision-Support Footer Notice */}
      <footer className="pt-2 pb-4 text-center border-t border-emerald/15">
        <p className="text-xs text-forest/60 dark:text-pale-green/60 font-medium">
          Risk scores are decision-support signals and must be verified by public health officers before action.
        </p>
      </footer>

      {/* Outbreak Simulator Modal */}
      {showSimulator && (
        <OutbreakSimulatorModal
          locations={locations}
          isOpen={showSimulator}
          onClose={() => setShowSimulator(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};
