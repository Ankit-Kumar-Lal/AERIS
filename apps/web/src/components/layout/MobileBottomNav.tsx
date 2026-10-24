import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, Plus, ShieldAlert, BookOpen } from 'lucide-react';

export const MobileBottomNav: React.FC<{ unreadAlerts?: number }> = ({ unreadAlerts = 0 }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-forest text-pale-green border-t border-mint/20 flex items-center justify-around px-2 z-40 shadow-sentinel-xl">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-soft-mint font-bold' : 'text-pale-green/70'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/map"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-soft-mint font-bold' : 'text-pale-green/70'
          }`
        }
      >
        <MapIcon className="w-5 h-5 mb-0.5" />
        <span>3D Map</span>
      </NavLink>

      {/* Floating Center Report Button */}
      <NavLink
        to="/report"
        className="flex flex-col items-center justify-center -mt-6 bg-emerald text-white w-12 h-12 rounded-full shadow-sentinel-lg border-2 border-forest transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </NavLink>

      <NavLink
        to="/alerts"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium relative transition-colors ${
            isActive ? 'text-soft-mint font-bold' : 'text-pale-green/70'
          }`
        }
      >
        <ShieldAlert className="w-5 h-5 mb-0.5 text-amber-400" />
        <span>Alerts</span>
        {unreadAlerts > 0 && (
          <span className="absolute top-1 right-5 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </NavLink>

      <NavLink
        to="/resources"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-soft-mint font-bold' : 'text-pale-green/70'
          }`
        }
      >
        <BookOpen className="w-5 h-5 mb-0.5" />
        <span>Guides</span>
      </NavLink>
    </nav>
  );
};
