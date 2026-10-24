import React from 'react';
import { Sun, Moon, Eye } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeMode } from '../../types';

export const ThemeToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { theme, setTheme } = useTheme();

  const options: Array<{ mode: ThemeMode; label: string; icon: React.ReactNode }> = [
    { mode: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { mode: 'dark', label: 'Dark Field', icon: <Moon className="w-4 h-4" /> },
    { mode: 'high-contrast', label: 'High Contrast (Sunlight)', icon: <Eye className="w-4 h-4" /> },
  ];

  if (compact) {
    return (
      <div className="flex items-center bg-forest/5 dark:bg-forest-light/30 rounded-xl p-1 border border-emerald/20">
        {options.map((opt) => (
          <button
            key={opt.mode}
            onClick={() => setTheme(opt.mode)}
            title={opt.label}
            className={`p-1.5 rounded-lg transition-all ${
              theme === opt.mode
                ? 'bg-emerald text-white shadow-sentinel-sm'
                : 'text-forest dark:text-pale-green hover:bg-forest/10 dark:hover:bg-forest-light'
            }`}
          >
            {opt.icon}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center bg-white dark:bg-surface-dark high-contrast:bg-white rounded-xl p-1 border border-emerald/20 shadow-sentinel-sm">
      {options.map((opt) => (
        <button
          key={opt.mode}
          onClick={() => setTheme(opt.mode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            theme === opt.mode
              ? 'bg-emerald text-white shadow-sentinel-sm'
              : 'text-forest dark:text-pale-green hover:bg-emerald/10'
          }`}
        >
          {opt.icon}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
};
