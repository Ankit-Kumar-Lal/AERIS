import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिन्दी', short: 'HI' },
    { code: 'as', label: 'অসমীয়া', short: 'AS' },
  ];

  const currentLang = i18n.language?.startsWith('hi')
    ? 'hi'
    : i18n.language?.startsWith('as')
    ? 'as'
    : 'en';

  if (compact) {
    return (
      <div className="flex items-center gap-1 bg-white/80 dark:bg-forest-light/40 rounded-xl p-1 border border-emerald/20 text-xs">
        <Languages className="w-3.5 h-3.5 text-emerald ml-1" />
        <select
          value={currentLang}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="bg-transparent text-forest dark:text-pale-green font-semibold py-1 px-1 focus:outline-none cursor-pointer"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code} className="bg-white text-forest dark:bg-forest dark:text-pale-green">
              {l.short}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center rounded-xl p-1 bg-white dark:bg-surface-dark border border-emerald/20 shadow-sentinel-sm">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            currentLang === lang.code
              ? 'bg-emerald text-white shadow-sentinel-sm'
              : 'text-forest dark:text-pale-green hover:bg-emerald/10'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
