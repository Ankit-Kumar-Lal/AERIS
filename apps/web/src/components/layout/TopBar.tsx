import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Wifi, 
  WifiOff, 
  User as UserIcon, 
  LogOut, 
  ShieldAlert, 
  RefreshCw,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { LanguageSelector } from '../common/LanguageSelector';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { getPendingCount, syncOfflineReports } from '../../services/offlineQueue';
import { submitReport } from '../../services/api';
import { AlertItem } from '../../types';

interface TopBarProps {
  onOpenAuthModal?: () => void;
  recentAlerts?: AlertItem[];
  onRefreshData?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenAuthModal,
  recentAlerts = [],
  onRefreshData,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const checkQueue = async () => {
    try {
      const cnt = await getPendingCount();
      setPendingCount(cnt);
    } catch {}
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    checkQueue();

    const interval = setInterval(checkQueue, 5000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const triggerSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      await syncOfflineReports(submitReport);
      await checkQueue();
      onRefreshData?.();
    } catch (err) {
      console.warn('Sync attempt failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cases?district=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-surface-dark border-b border-forest/10 dark:border-mint/15 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors shadow-sentinel-sm">
      {/* Mobile Logo View */}
      <div className="flex items-center gap-3 md:hidden">
        <BrandLogo variant="icon" size="sm" />
        <span className="font-extrabold text-forest dark:text-pale-green text-sm tracking-tight">
          AERIS
        </span>
      </div>

      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-forest/40 dark:text-pale-green/40 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search village, district, water-borne symptom..."
          className="w-full pl-9 pr-4 py-1.5 bg-pale-green/40 dark:bg-forest-light/30 border border-emerald/20 rounded-xl text-xs text-forest dark:text-pale-green placeholder-forest/50 dark:placeholder-pale-green/40 focus:outline-none focus:ring-2 focus:ring-emerald transition-all"
        />
      </form>

      {/* Actions & Status Right Ribbon */}
      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        {/* Offline / Online Status Pill */}
        {isOnline ? (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald/10 text-emerald-active dark:text-mint rounded-full text-[11px] font-semibold border border-emerald/20">
            <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
            <Wifi className="w-3.5 h-3.5 text-emerald" />
            <span>Online Sentinel</span>
          </div>
        ) : (
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded-full text-[11px] font-bold border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
            title="App is currently offline. Reports will queue in IndexedDB and automatically sync when online."
          >
            <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            <span>Offline ({pendingCount} Queued)</span>
            {isSyncing && <RefreshCw className="w-3 h-3 animate-spin" />}
          </button>
        )}

        {/* Language Selector */}
        <LanguageSelector compact />

        {/* Theme Switcher */}
        <ThemeToggle compact />

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-forest dark:text-pale-green hover:bg-forest/5 dark:hover:bg-forest-light/40 relative transition-colors"
            title="Active Outbreak Alerts"
          >
            <Bell className="w-4 h-4" />
            {recentAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white dark:ring-surface-dark animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-dark border border-forest/10 dark:border-mint/20 rounded-2xl shadow-sentinel-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-forest/10 dark:border-mint/15 mb-2">
                <span className="text-xs font-bold text-forest dark:text-pale-green flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600" /> Active Outbreak Alerts ({recentAlerts.length})
                </span>
                <button
                  onClick={() => { setShowNotifications(false); navigate('/alerts'); }}
                  className="text-[10px] text-emerald font-semibold hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                {recentAlerts.length === 0 ? (
                  <p className="text-xs text-forest/60 dark:text-pale-green/60 py-3 text-center">
                    No active high-risk alerts at this moment.
                  </p>
                ) : (
                  recentAlerts.slice(0, 4).map((a) => (
                    <div
                      key={a.alert_id}
                      onClick={() => { setShowNotifications(false); navigate('/alerts'); }}
                      className="p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl cursor-pointer hover:bg-red-100/60 dark:hover:bg-red-950/60 transition-colors"
                    >
                      <p className="text-xs font-bold text-red-900 dark:text-red-300 truncate">{a.title}</p>
                      <p className="text-[11px] text-red-700 dark:text-red-400 line-clamp-2 mt-0.5">{a.message}</p>
                      <p className="text-[9px] text-red-600/75 dark:text-red-400/60 mt-1">
                        {new Date(a.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Auth Ribbon */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 bg-pale-green/50 dark:bg-forest-light/40 rounded-xl border border-emerald/20 hover:bg-pale-green transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald text-white flex items-center justify-center font-bold text-xs">
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-forest/70 dark:text-pale-green/70" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-dark border border-forest/10 dark:border-mint/20 rounded-2xl shadow-sentinel-xl p-3 z-50">
                <div className="pb-2 border-b border-forest/10 dark:border-mint/15 mb-2">
                  <p className="text-xs font-bold text-forest dark:text-pale-green">{user.full_name}</p>
                  <p className="text-[10px] text-emerald font-semibold uppercase">{user.role}</p>
                  <p className="text-[10px] text-forest/60 dark:text-pale-green/60 truncate">{user.phone_number}</p>
                </div>
                <button
                  onClick={() => { setShowUserMenu(false); logout(); navigate('/'); }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald text-white text-xs font-bold rounded-xl hover:bg-emerald-hover transition-all shadow-sentinel-sm"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Login / Register</span>
          </button>
        )}
      </div>
    </header>
  );
};
