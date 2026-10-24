import React, { useState, useEffect } from 'react';
import { AlertsList } from '../components/alerts/AlertsList';
import { fetchAlerts } from '../services/api';
import { AlertItem } from '../types';
import { ShieldAlert, Info, RefreshCw } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (err) {
      console.warn('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl border border-emerald/20 shadow-sentinel-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-forest dark:text-pale-green tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            Epidemic Outbreak Alerts Operations Command
          </h2>
          <p className="text-xs text-forest/60 dark:text-pale-green/60 mt-0.5">
            Automated emergency signals dispatched when 7-day cases &gt; 15, WQI &lt; 50 (microbial contamination), and rainfall &gt; 400mm
          </p>
        </div>

        <button
          onClick={loadAlerts}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-pale-green/40 dark:bg-forest-light text-forest dark:text-pale-green rounded-xl text-xs font-bold hover:bg-emerald hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Alerts</span>
        </button>
      </div>

      <AlertsList
        alerts={alerts}
        onRefresh={loadAlerts}
      />
    </div>
  );
};
