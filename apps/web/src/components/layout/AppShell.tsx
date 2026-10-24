import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { AuthModal } from '../auth/AuthModal';
import { connectRealtimeStream, fetchAlerts } from '../../services/api';
import { AlertItem } from '../../types';

export const AppShell: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState<AlertItem[]>([]);
  const [liveToast, setLiveToast] = useState<{ title: string; message: string } | null>(null);

  const loadAlerts = async () => {
    try {
      const data = await fetchAlerts({ status_filter: 'active' });
      setRecentAlerts(data);
    } catch {}
  };

  useEffect(() => {
    loadAlerts();

    // Subscribe to live WebSocket events
    const disconnect = connectRealtimeStream((event) => {
      if (event.type === 'NEW_SYMPTOM_REPORT' || event.type === 'ALERT_STATUS_UPDATED' || event.type === 'OUTBREAK_SIMULATION_TRIGGERED') {
        loadAlerts();
        if (event.type === 'OUTBREAK_SIMULATION_TRIGGERED') {
          setLiveToast({
            title: 'OUTBREAK SURGE DETECTED',
            message: event.data.message || 'Critical epidemic elevation triggered in monitored village.'
          });
        }
      }
    });

    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-pale-green dark:bg-pale-green-deep text-forest dark:text-pale-green font-sans transition-colors duration-200">
      {/* 1. Main Flex Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Collapsible Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          unreadAlertsCount={recentAlerts.length}
        />

        {/* Content Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-20 md:pb-6">
          <TopBar
            onOpenAuthModal={() => setShowAuthModal(true)}
            recentAlerts={recentAlerts}
            onRefreshData={loadAlerts}
          />

          {/* Live Alert Toast Notification Banner */}
          {liveToast && (
            <div className="mx-4 mt-3 p-3 bg-red-600 text-white rounded-2xl shadow-sentinel-lg flex items-center justify-between gap-3 animate-bounce">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">{liveToast.title}</p>
                <p className="text-xs text-red-100">{liveToast.message}</p>
              </div>
              <button
                onClick={() => setLiveToast(null)}
                className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Page Outlet */}
          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* 3. Mobile Phone Bottom Navigation */}
      <MobileBottomNav unreadAlerts={recentAlerts.length} />

      {/* 4. Auth Modal Dialog */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};
