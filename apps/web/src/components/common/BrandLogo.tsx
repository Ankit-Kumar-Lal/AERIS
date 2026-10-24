import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface BrandLogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  forceWhiteBadge?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  forceWhiteBadge = false,
  className = '',
}) => {
  const { theme } = useTheme();

  // Size mappings
  const heightClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  };

  const iconSizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20',
  };

  // Determine if we need a white card/badge treatment
  const needsWhiteBadge = forceWhiteBadge || theme === 'dark' || theme === 'high-contrast';

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${needsWhiteBadge ? 'bg-white p-1 rounded-xl shadow-sentinel-sm' : ''} ${className}`}>
        <img
          src="/brand/logo_icon.png"
          alt="AERIS Icon"
          className={`${iconSizeClasses[size]} object-contain`}
        />
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-center ${needsWhiteBadge ? 'bg-white px-3 py-1 rounded-xl shadow-sentinel-sm' : ''} ${className}`}>
        <img
          src="/brand/logo_wordmark.png"
          alt="AERIS"
          className={`${heightClasses[size]} object-contain`}
        />
      </div>
    );
  }

  // Full Logo
  const fullLogoImg = (
    <img
      src="/brand/logo.png"
      alt="AERIS — AI-Powered Epidemic Risk Intelligence & Response System"
      className={`${heightClasses[size]} object-contain`}
    />
  );

  if (needsWhiteBadge) {
    return (
      <div className={`inline-flex items-center bg-white px-3 py-1.5 rounded-2xl shadow-sentinel-sm border border-emerald/20 transition-all ${className}`}>
        {fullLogoImg}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      {fullLogoImg}
    </div>
  );
};
