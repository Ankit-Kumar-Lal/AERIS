import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const normLevel = (level || 'low').toLowerCase() as RiskLevel;

  const config = {
    high: {
      label: 'High Risk',
      bg: 'bg-red-50 dark:bg-red-950/40',
      border: 'border-red-300 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      icon: <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600 dark:text-red-400" />,
      dot: 'bg-red-600 animate-pulse',
    },
    medium: {
      label: 'Medium Risk',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-300 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      icon: <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />,
      dot: 'bg-amber-500',
    },
    low: {
      label: 'Low / Safe',
      bg: 'bg-emerald-subtle dark:bg-forest-light/40',
      border: 'border-emerald/30 dark:border-emerald/50',
      text: 'text-emerald-active dark:text-mint',
      icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald" />,
      dot: 'bg-emerald',
    },
  }[normLevel] || {
    label: 'Low / Safe',
    bg: 'bg-emerald-subtle dark:bg-forest-light/40',
    border: 'border-emerald/30',
    text: 'text-emerald-active dark:text-mint',
    icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald" />,
    dot: 'bg-emerald',
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.border} ${config.text} ${sizeClasses} transition-all shadow-sentinel-sm ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};
