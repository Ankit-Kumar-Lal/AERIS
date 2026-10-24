import React from 'react';

interface WqiGaugeProps {
  wqi: number;
  size?: number;
}

export const WqiGauge: React.FC<WqiGaugeProps> = ({ wqi, size = 160 }) => {
  const normWqi = Math.max(0, Math.min(100, wqi));
  
  let statusText = "Good / Potable Quality";
  let statusColor = "text-emerald";
  let arcColor = "#339966";

  if (normWqi < 50) {
    statusText = "Severe Contamination (High Pathogen Load)";
    statusColor = "text-red-600";
    arcColor = "#DC2626";
  } else if (normWqi < 60) {
    statusText = "Degraded / Moderate Microbial Risk";
    statusColor = "text-amber-600";
    arcColor = "#D97706";
  }

  // Calculate arc stroke
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (circumference * normWqi) / 100;

  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size * 0.65 }}>
        <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
          {/* Background Arc */}
          <path
            d={`M ${strokeWidth} ${size * 0.6} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${size * 0.6}`}
            fill="none"
            stroke="rgba(16, 47, 21, 0.1)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Value Arc */}
          <path
            d={`M ${strokeWidth} ${size * 0.6} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${size * 0.6}`}
            fill="none"
            stroke={arcColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Value */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <span className="text-3xl font-extrabold tracking-tight font-heading" style={{ color: arcColor }}>
            {normWqi}
          </span>
          <span className="text-[10px] uppercase font-bold text-forest/60 dark:text-pale-green/60 tracking-wider">
            WQI Score / 100
          </span>
        </div>
      </div>

      <p className={`text-xs font-extrabold mt-2 ${statusColor} max-w-[200px] leading-tight`}>
        {statusText}
      </p>
    </div>
  );
};
