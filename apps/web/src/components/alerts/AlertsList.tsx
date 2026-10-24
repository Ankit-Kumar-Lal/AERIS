import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Send, 
  Clock, 
  MessageSquare,
  FileCheck,
  Filter
} from 'lucide-react';
import { AlertItem } from '../../types';
import { performAlertAction, updateAlertStatus } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface AlertsListProps {
  alerts: AlertItem[];
  onRefresh: () => void;
}

export const AlertsList: React.FC<AlertsListProps> = ({ alerts, onRefresh }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'escalated' | 'resolved'>('active');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [actionType, setActionType] = useState<string>('');
  const [actionNote, setActionNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const filtered = alerts.filter((a) => {
    if (activeTab === 'active') return a.status === 'active';
    if (activeTab === 'escalated') return a.status === 'escalated';
    if (activeTab === 'resolved') return a.status === 'resolved';
    return true;
  });

  const isOfficial = user && user.role !== 'CIVILIAN';

  const handleExecuteAction = async () => {
    if (!selectedAlert || !actionType) return;
    setSubmitting(true);
    try {
      if (actionType === 'RESOLVE') {
        await updateAlertStatus(selectedAlert.alert_id, 'resolved', actionNote);
      } else {
        await performAlertAction(selectedAlert.alert_id, actionType, actionNote);
      }
      setSelectedAlert(null);
      setActionType('');
      setActionNote('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 md:p-6 border border-emerald/20 shadow-sentinel-sm">
      {/* Tabs Row */}
      <div className="flex items-center justify-between pb-4 border-b border-forest/10 dark:border-mint/15 mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-pale-green/40 dark:bg-forest-light/30 p-1 rounded-2xl border border-emerald/20">
          {(['active', 'escalated', 'resolved'] as const).map((tab) => {
            const count = alerts.filter((a) => a.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-emerald text-white shadow-sentinel-sm'
                    : 'text-forest/70 dark:text-pale-green/70 hover:bg-emerald/10'
                }`}
              >
                <span>{tab} Warnings</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-forest/10 dark:bg-forest text-forest/70 dark:text-pale-green/70'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-forest/60 dark:text-pale-green/60">
            <CheckCircle2 className="w-10 h-10 text-emerald mx-auto mb-2 opacity-60" />
            <p className="text-sm font-bold">No {activeTab} alerts recorded in this category.</p>
            <p className="text-xs mt-1">Village sentinel nodes operating within epidemiological safety bounds.</p>
          </div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.alert_id}
              className={`p-4 md:p-5 rounded-2xl border transition-all ${
                alert.status === 'active'
                  ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                  : alert.status === 'escalated'
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                  : 'bg-pale-green/20 dark:bg-forest-light/20 border-forest/10 dark:border-mint/15'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-forest/5 dark:border-mint/10">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-xl ${
                    alert.status === 'active' ? 'bg-red-600 text-white' : alert.status === 'escalated' ? 'bg-amber-500 text-white' : 'bg-emerald text-white'
                  }`}>
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-extrabold text-forest dark:text-pale-green">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-forest/60 dark:text-pale-green/60">
                      {alert.location_name} • {alert.district}, {alert.state}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-forest/50 dark:text-pale-green/50 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.triggered_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                    alert.status === 'active'
                      ? 'bg-red-600 text-white'
                      : alert.status === 'escalated'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald text-white'
                  }`}>
                    {alert.status}
                  </span>
                </div>
              </div>

              {/* Message Details */}
              <p className="text-xs text-forest/80 dark:text-pale-green/80 font-medium leading-relaxed my-2">
                {alert.message}
              </p>

              {/* Action Log History */}
              {alert.action_logs && alert.action_logs.length > 0 && (
                <div className="mt-3 p-3 bg-white/70 dark:bg-surface-dark/70 rounded-xl border border-forest/10 dark:border-mint/15 space-y-1.5 text-[11px]">
                  <p className="font-extrabold text-[10px] text-emerald uppercase tracking-wider">Operational Audit Trail</p>
                  {alert.action_logs.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 text-forest/70 dark:text-pale-green/70">
                      <span><strong>{log.action}</strong> by {log.user} ({log.role})</span>
                      <span className="text-[9px] text-forest/50">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Ribbon */}
              {alert.status !== 'resolved' && isOfficial && (
                <div className="mt-4 pt-3 border-t border-forest/10 dark:border-mint/15 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => { setSelectedAlert(alert); setActionType('NOTIFY_OFFICIALS'); }}
                    className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-sentinel-sm flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Notify Officials</span>
                  </button>
                  <button
                    onClick={() => { setSelectedAlert(alert); setActionType('ASSIGN_TEAM'); }}
                    className="px-3 py-1.5 bg-pale-green dark:bg-forest-light text-forest dark:text-pale-green text-xs font-bold rounded-xl hover:bg-emerald hover:text-white transition-colors border border-emerald/30 flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald" />
                    <span>Assign Field Team</span>
                  </button>
                  <button
                    onClick={() => { setSelectedAlert(alert); setActionType('RESOLVE'); }}
                    className="px-3 py-1.5 bg-emerald text-white text-xs font-bold rounded-xl hover:bg-emerald-hover transition-colors shadow-sentinel-sm flex items-center gap-1.5 ml-auto"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Action Dialog Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-emerald/30 shadow-sentinel-xl max-w-md w-full">
            <h4 className="text-base font-extrabold text-forest dark:text-pale-green mb-1">
              {actionType === 'NOTIFY_OFFICIALS' && 'Dispatch Notification to District Health Officials'}
              {actionType === 'ASSIGN_TEAM' && 'Assign Rapid Response Health Team'}
              {actionType === 'RESOLVE' && 'Mark Outbreak Warning as Resolved'}
            </h4>
            <p className="text-xs text-forest/60 dark:text-pale-green/60 mb-4">
              Village: {selectedAlert.location_name} ({selectedAlert.district})
            </p>

            <label className="block text-xs font-bold text-forest dark:text-pale-green mb-1.5">
              Field Action Notes / Chlorination Status
            </label>
            <textarea
              rows={3}
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="e.g. 500 ORS sachets and chlorine tablets dispatched via mobile health camp; water source isolated."
              className="w-full p-2.5 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green focus:ring-2 focus:ring-emerald focus:outline-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-forest dark:text-pale-green hover:bg-forest/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleExecuteAction}
                className="px-5 py-2 rounded-xl bg-emerald text-white text-xs font-bold hover:bg-emerald-hover shadow-sentinel-md"
              >
                {submitting ? 'Executing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
