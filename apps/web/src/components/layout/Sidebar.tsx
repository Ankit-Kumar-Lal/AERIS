import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  FileText, 
  PlusCircle, 
  ShieldAlert, 
  Droplets, 
  BarChart3, 
  BookOpen, 
  ShieldCheck, 
  Info,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  unreadAlertsCount = 0,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const isOfficial = user && user.role !== 'CIVILIAN';
  const isAdmin = user && (user.role === 'DISTRICT_ADMIN' || user.role === 'SUPER_ADMIN');

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
    { to: '/map', label: t('nav.map'), icon: <MapIcon className="w-5 h-5 shrink-0" /> },
    { to: '/cases', label: t('nav.cases'), icon: <FileText className="w-5 h-5 shrink-0" /> },
    { to: '/report', label: t('nav.report'), icon: <PlusCircle className="w-5 h-5 shrink-0 text-mint" /> },
    { 
      to: '/alerts', 
      label: t('nav.alerts'), 
      icon: <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400" />,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : null
    },
    { to: '/water-weather', label: t('nav.water'), icon: <Droplets className="w-5 h-5 shrink-0 text-soft-mint" /> },
    ...(isOfficial ? [{ to: '/analytics', label: t('nav.analytics'), icon: <BarChart3 className="w-5 h-5 shrink-0" /> }] : []),
    { to: '/resources', label: t('nav.resources'), icon: <BookOpen className="w-5 h-5 shrink-0" /> },
    ...(isAdmin || isOfficial ? [{ to: '/admin', label: t('nav.admin'), icon: <ShieldCheck className="w-5 h-5 shrink-0" /> }] : []),
    { to: '/about', label: t('nav.about'), icon: <Info className="w-5 h-5 shrink-0" /> },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-forest text-pale-green border-r border-mint/20 transition-all duration-300 relative z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center px-4 border-b border-mint/15 justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <BrandLogo variant="full" size="md" forceWhiteBadge />
          </div>
        ) : (
          <div className="mx-auto">
            <BrandLogo variant="icon" size="sm" forceWhiteBadge />
          </div>
        )}
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-24 bg-emerald text-white p-1 rounded-full shadow-sentinel-md hover:bg-emerald-hover transition-colors z-40 border-2 border-forest"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* User Status Card (when expanded) */}
      {!collapsed && user && (
        <div className="mx-3 my-3 p-3 bg-white/5 border border-mint/15 rounded-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald flex items-center justify-center font-bold text-white text-xs">
              {user.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user.full_name}</p>
              <p className="text-[10px] text-mint uppercase tracking-wider font-semibold truncate">
                {user.role} {user.district ? `• ${user.district}` : ''}
              </p>
            </div>
          </div>
          {user.verification_status === 'PENDING_VERIFICATION' && (
            <div className="mt-2 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg px-2 py-1 flex items-center gap-1 font-semibold">
              <UserCheck className="w-3 h-3 shrink-0" />
              <span>Pending Admin Approval</span>
            </div>
          )}
        </div>
      )}

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1.5 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                isActive
                  ? 'bg-soft-mint text-forest font-bold shadow-sentinel-sm'
                  : 'text-pale-green/85 hover:bg-white/10 hover:text-white'
              } ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span className="truncate">{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {item.badge}
              </span>
            )}
            {collapsed && item.badge && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Branding Info */}
      {!collapsed && (
        <div className="p-4 border-t border-mint/15 text-[11px] text-pale-green/60 flex flex-col gap-0.5">
          <p className="font-semibold text-pale-green/80">AERIS</p>
          <p className="text-[10px] text-mint">8 Northeast States Active</p>
        </div>
      )}
    </aside>
  );
};
