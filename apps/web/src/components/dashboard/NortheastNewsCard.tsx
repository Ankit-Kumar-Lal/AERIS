import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Newspaper, 
  ExternalLink, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight, 
  MapPin, 
  Radio, 
  Droplets,
  CloudRain,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { fetchNortheastNews, NewsItem, NewsCategory } from '../../services/newsService';

type FilterType = 'All' | 'Flood' | 'Disease' | 'Weather' | 'Water';

export const NortheastNewsCard: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSample, setIsSample] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const formatNow = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const loadNews = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    setError(null);

    try {
      const res = await fetchNortheastNews(activeFilter);
      setNews(res.items);
      setIsSample(Boolean(res.is_sample));
      setLastUpdated(formatNow());
    } catch (err: any) {
      setError(err.message || 'Unable to load Northeast regional news.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [activeFilter]);

  // Initial load & filter change
  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // Auto-refresh every 15 minutes and on window focus
  useEffect(() => {
    const handleFocus = () => {
      loadNews();
    };

    const interval = setInterval(() => {
      loadNews();
    }, 15 * 60 * 1000); // 15 mins

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadNews]);

  // Category Badge Color Palette
  const getCategoryBadge = (category: NewsCategory) => {
    switch (category) {
      case 'Flood':
        return {
          icon: <CloudRain className="w-3 h-3" />,
          classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
        };
      case 'Disease Outbreak':
        return {
          icon: <Flame className="w-3 h-3 text-red-600" />,
          classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
        };
      case 'Weather':
        return {
          icon: <CloudRain className="w-3 h-3 text-amber-600" />,
          classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
        };
      case 'Water Quality':
        return {
          icon: <Droplets className="w-3 h-3 text-cyan-600" />,
          classes: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900',
        };
      case 'Health Advisory':
      default:
        return {
          icon: <ShieldCheck className="w-3 h-3 text-emerald" />,
          classes: 'bg-emerald-subtle text-emerald-active border-emerald/30 dark:bg-forest-light/40 dark:text-mint dark:border-mint/20',
        };
    }
  };

  const filterTabs: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'All' },
    { label: 'Flood', value: 'Flood' },
    { label: 'Disease', value: 'Disease' },
    { label: 'Weather', value: 'Weather' },
    { label: 'Water', value: 'Water' },
  ];

  return (
    <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 border border-emerald/20 shadow-sentinel-sm flex flex-col transition-colors">
      {/* 1. CARD HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-forest/10 dark:border-mint/15 mb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-emerald shrink-0" />
          <h3 className="text-sm font-extrabold text-forest dark:text-pale-green tracking-tight font-heading">
            Northeast Health & Water News
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Live vs Sample Data Badge */}
          {isSample ? (
            <span
              className="text-[10px] text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1 bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-300/40"
              title="Backend RSS offline. Displaying verified surveillance sample data."
            >
              Sample Data
            </span>
          ) : (
            <span className="text-[10px] text-emerald font-semibold flex items-center gap-1 bg-emerald/10 px-2 py-0.5 rounded-full">
              <Radio className="w-3 h-3 text-emerald animate-pulse" />
              Live Feed
            </span>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => loadNews(true)}
            disabled={isRefreshing}
            className="p-1 rounded-lg text-forest/50 dark:text-pale-green/50 hover:text-emerald dark:hover:text-mint hover:bg-pale-green/40 dark:hover:bg-forest-light/40 transition-colors"
            title={`Last updated at ${lastUpdated}. Click to refresh.`}
            aria-label="Refresh news"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. CATEGORY FILTER ROW */}
      <nav
        aria-label="News category filters"
        className="flex items-center gap-1.5 pb-3 border-b border-forest/5 dark:border-mint/10 mb-3 overflow-x-auto no-scrollbar"
      >
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveFilter(tab.value)}
            aria-pressed={activeFilter === tab.value}
            aria-label={`Filter by ${tab.label}`}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-emerald shrink-0 ${
              activeFilter === tab.value
                ? 'bg-emerald text-white shadow-sentinel-sm'
                : 'bg-pale-green/30 dark:bg-forest-light/20 text-forest/70 dark:text-pale-green/70 hover:bg-pale-green/60 dark:hover:bg-forest-light/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* 3. CONTENT AREA */}
      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-72 custom-scrollbar pr-1">
        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-2.5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="p-3 bg-pale-green/20 dark:bg-forest-light/10 rounded-2xl border border-forest/10 dark:border-mint/10 animate-pulse"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="h-4 w-20 bg-forest/15 dark:bg-pale-green/15 rounded-md" />
                  <div className="h-3 w-14 bg-forest/10 dark:bg-pale-green/10 rounded-md" />
                </div>
                <div className="h-3.5 w-full bg-forest/15 dark:bg-pale-green/15 rounded-md mb-1.5" />
                <div className="h-3.5 w-4/5 bg-forest/10 dark:bg-pale-green/10 rounded-md mb-2" />
                <div className="flex items-center justify-between">
                  <div className="h-3 w-24 bg-forest/10 dark:bg-pale-green/10 rounded-md" />
                  <div className="h-3 w-16 bg-forest/10 dark:bg-pale-green/10 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl text-center">
            <AlertCircle className="w-5 h-5 text-red-600 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={() => loadNews(true)}
              className="mt-2.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1 shadow-sentinel-sm"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && news.length === 0 && (
          <div className="py-8 text-center bg-pale-green/10 dark:bg-forest-light/10 rounded-2xl border border-dashed border-forest/15 dark:border-mint/20">
            <Newspaper className="w-6 h-6 text-forest/40 dark:text-pale-green/40 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-forest dark:text-pale-green">
              No articles found for "{activeFilter}"
            </p>
            <p className="text-[11px] text-forest/60 dark:text-pale-green/60 mt-0.5">
              Check other regional categories or reset filter.
            </p>
            <button
              onClick={() => setActiveFilter('All')}
              className="mt-2.5 px-3 py-1 bg-emerald text-white text-xs font-bold rounded-lg hover:bg-emerald-hover transition-colors"
            >
              Show All News
            </button>
          </div>
        )}

        {/* News List */}
        {!loading && !error && news.length > 0 && (
          <ul className="space-y-2.5" role="list">
            <AnimatePresence initial={false}>
              {news.map((item, idx) => {
                const badge = getCategoryBadge(item.category);
                return (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    className="group"
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-pale-green/20 dark:bg-forest-light/20 rounded-2xl border border-forest/10 dark:border-mint/15 hover:border-emerald/40 hover:bg-pale-green/40 dark:hover:bg-forest-light/40 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald shadow-sm hover:shadow-sentinel-sm"
                    >
                      {/* Top Meta: Category Chip + Relative Time */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${badge.classes}`}
                        >
                          {badge.icon}
                          <span>{item.category}</span>
                        </span>

                        <span className="text-[10px] text-forest/50 dark:text-pale-green/50 flex items-center gap-1 shrink-0 font-medium">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{item.relativeTime}</span>
                        </span>
                      </div>

                      {/* Headline (Max 2 lines, truncated) */}
                      <h4 className="text-xs font-bold text-forest dark:text-pale-green group-hover:text-emerald dark:group-hover:text-mint transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h4>

                      {/* Footer: Source + State Tag + Link Hint */}
                      <div className="mt-2 flex items-center justify-between text-[10px] text-forest/65 dark:text-pale-green/65 pt-1 border-t border-forest/5 dark:border-mint/10">
                        <span className="truncate max-w-[130px] font-medium" title={item.source}>
                          {item.source}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald/10 text-emerald-active dark:text-mint font-semibold">
                            <MapPin className="w-2.5 h-2.5 text-emerald" />
                            {item.state}
                          </span>

                          <ExternalLink className="w-3 h-3 text-forest/40 dark:text-pale-green/40 group-hover:text-emerald dark:group-hover:text-mint transition-colors shrink-0" />
                        </div>
                      </div>
                    </a>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* 4. CARD FOOTER: "View all news" Link */}
      <div className="mt-3 pt-3 border-t border-forest/10 dark:border-mint/15 flex items-center justify-between text-xs">
        <span className="text-[10px] text-forest/50 dark:text-pale-green/50">
          Refreshed: {lastUpdated}
        </span>

        <a
          href="https://news.google.com/search?q=Northeast+India+health+flood+water&hl=en-IN&gl=IN&ceid=IN%3Aen"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-emerald hover:underline flex items-center gap-1 group"
        >
          <span>View all news</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
};
