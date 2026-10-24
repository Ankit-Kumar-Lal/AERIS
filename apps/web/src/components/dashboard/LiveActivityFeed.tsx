import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, AlertTriangle, FileText, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { connectRealtimeStream } from '../../services/api';

interface ActivityItem {
  id: string;
  type: 'report' | 'alert' | 'verify' | 'simulation';
  title: string;
  description: string;
  time: string;
}

export const LiveActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'report',
      title: 'New Symptom Log • Dhakuakhana',
      description: 'ASHA Anamika Saikia logged 2 cases of watery diarrhea & severe dehydration.',
      time: 'Just now'
    },
    {
      id: '2',
      type: 'verify',
      title: 'Field Verification Complete • Mayong',
      description: 'Primary tube-well tested with H2S strip; moderate pathogen load confirmed.',
      time: '12m ago'
    },
    {
      id: '3',
      type: 'alert',
      title: 'Emergency Advisory Dispatched • Mawsynram',
      description: 'Halazone chlorine tablets & ORS distributed across 4 sub-centres.',
      time: '28m ago'
    },
    {
      id: '4',
      type: 'report',
      title: 'Citizen Report • Kaliabor',
      description: 'Citizen logged mild enteric fever. Status: unverified (queued for ASHA check).',
      time: '45m ago'
    }
  ]);

  useEffect(() => {
    const disconnect = connectRealtimeStream((event) => {
      const nowStr = 'Just now';
      if (event.type === 'NEW_SYMPTOM_REPORT') {
        setActivities((prev) => [
          {
            id: String(Date.now()),
            type: 'report',
            title: `New Report • ${event.data.location_name || 'Sentinel Village'}`,
            description: `Logged symptoms: ${event.data.symptoms?.join(', ') || 'water-borne symptoms'} (${event.data.severity}).`,
            time: nowStr
          },
          ...prev.slice(0, 9)
        ]);
      } else if (event.type === 'REPORT_VERIFIED') {
        setActivities((prev) => [
          {
            id: String(Date.now()),
            type: 'verify',
            title: `Report ${event.data.status?.toUpperCase()}`,
            description: `Verified by ${event.data.verified_by}. Trust score updated.`,
            time: nowStr
          },
          ...prev.slice(0, 9)
        ]);
      } else if (event.type === 'ALERT_STATUS_UPDATED') {
        setActivities((prev) => [
          {
            id: String(Date.now()),
            type: 'alert',
            title: `Alert Status: ${event.data.status?.toUpperCase()}`,
            description: `Action logged by ${event.data.user}.`,
            time: nowStr
          },
          ...prev.slice(0, 9)
        ]);
      } else if (event.type === 'OUTBREAK_SIMULATION_TRIGGERED') {
        setActivities((prev) => [
          {
            id: String(Date.now()),
            type: 'simulation',
            title: `🚨 OUTBREAK SURGE • ${event.data.village_name}`,
            description: event.data.message,
            time: nowStr
          },
          ...prev.slice(0, 9)
        ]);
      }
    });

    return () => disconnect();
  }, []);

  return (
    <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 border border-emerald/20 shadow-sentinel-sm flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-forest/10 dark:border-mint/15 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald animate-ping" />
          <h3 className="text-sm font-extrabold text-forest dark:text-pale-green tracking-tight">
            Live Field Activity Stream
          </h3>
        </div>
        <span className="text-[10px] text-emerald font-semibold flex items-center gap-1 bg-emerald/10 px-2 py-0.5 rounded-full">
          <Radio className="w-3 h-3 text-emerald" />
          Real-Time Bus
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-72 custom-scrollbar">
        <AnimatePresence initial={false}>
          {activities.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-pale-green/20 dark:bg-forest-light/20 rounded-2xl border border-forest/10 dark:border-mint/15 flex items-start gap-3"
            >
              <div className="p-2 rounded-xl bg-white dark:bg-surface-dark shrink-0 shadow-sentinel-sm">
                {item.type === 'report' && <FileText className="w-4 h-4 text-emerald" />}
                {item.type === 'alert' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                {item.type === 'verify' && <CheckCircle2 className="w-4 h-4 text-emerald" />}
                {item.type === 'simulation' && <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-forest dark:text-pale-green truncate">
                    {item.title}
                  </p>
                  <span className="text-[10px] text-forest/50 dark:text-pale-green/50 flex items-center gap-0.5 shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    {item.time}
                  </span>
                </div>
                <p className="text-[11px] text-forest/70 dark:text-pale-green/70 line-clamp-2 mt-0.5">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
