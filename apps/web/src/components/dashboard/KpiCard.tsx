import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface KpiCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  colorScheme?: 'forest' | 'emerald' | 'mint' | 'amber' | 'red';
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = 'neutral',
  colorScheme = 'emerald',
  onClick,
}) => {
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? 0 : value);

  useEffect(() => {
    if (typeof value === 'number') {
      let start = 0;
      const end = value;
      const duration = 1000;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(end);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  const colorStyles = {
    forest: 'border-forest/20 text-forest bg-white dark:bg-surface-dark dark:text-pale-green',
    emerald: 'border-emerald/20 text-forest bg-white dark:bg-surface-dark dark:text-pale-green',
    mint: 'border-mint/30 text-forest bg-white dark:bg-surface-dark dark:text-pale-green',
    amber: 'border-amber-300 dark:border-amber-800 text-amber-900 bg-amber-50/50 dark:bg-amber-950/20 dark:text-amber-200',
    red: 'border-red-300 dark:border-red-800 text-red-900 bg-red-50/50 dark:bg-red-950/20 dark:text-red-200',
  }[colorScheme];

  const iconBgStyles = {
    forest: 'bg-forest/10 text-forest dark:bg-forest-light/40 dark:text-mint',
    emerald: 'bg-emerald/15 text-emerald',
    mint: 'bg-mint/20 text-mint-dark dark:text-mint',
    amber: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
    red: 'bg-red-500/20 text-red-700 dark:text-red-400',
  }[colorScheme];

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`p-4 rounded-3xl border shadow-sentinel-sm ${colorStyles} ${onClick ? 'cursor-pointer hover:border-emerald' : ''} transition-all`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-bold text-forest/75 dark:text-pale-green/75 tracking-tight uppercase">
          {title}
        </span>
        <div className={`p-2 rounded-2xl ${iconBgStyles}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {displayValue}
        </span>
        {trend && (
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              trendType === 'negative'
                ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                : trendType === 'positive'
                ? 'bg-emerald/15 text-emerald-active dark:text-mint'
                : 'bg-forest/10 text-forest/70 dark:text-pale-green/70'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-forest/60 dark:text-pale-green/60 mt-1 font-medium truncate">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
