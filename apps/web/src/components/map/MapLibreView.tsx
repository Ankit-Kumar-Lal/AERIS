import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Layers, 
  Search, 
  MapPin, 
  AlertTriangle, 
  Navigation, 
  Maximize2, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { LocationItem } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import neStatesGeoJson from '../../data/ne_states.json';

interface MapLibreViewProps {
  locations: LocationItem[];
  onSelectVillage?: (locationId: number) => void;
  selectedVillageId?: number | null;
  height?: string;
  showTimeScrubber?: boolean;
}

export const MapLibreView: React.FC<MapLibreViewProps> = ({
  locations,
  onSelectVillage,
  selectedVillageId,
  height = '600px',
  showTimeScrubber = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Layer toggles
  const [showMarkers, setShowMarkers] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  // Time scrubber (0 = 30 days ago, 30 = today)
  const [dayOffset, setDayOffset] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState<LocationItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Map Setup
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Centered around Northeast India (Assam, Meghalaya, etc.)
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors • AERIS Sentinel Telemetry'
          }
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [92.9376, 26.2006], // Northeast India
      zoom: 6.2,
      pitch: 35, // 3D hillshade angle
      bearing: -5,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.FullscreenControl(), 'top-right');

    map.on('load', () => {
      // Add 8 NE States Boundary Source & Fill Layer
      if (!map.getSource('ne-states')) {
        map.addSource('ne-states', {
          type: 'geojson',
          data: neStatesGeoJson as any
        });

        map.addLayer({
          id: 'ne-states-fill',
          type: 'fill',
          source: 'ne-states',
          paint: {
            'fill-color': '#102F15',
            'fill-opacity': 0.08
          }
        });

        map.addLayer({
          id: 'ne-states-outline',
          type: 'line',
          source: 'ne-states',
          paint: {
            'line-color': '#339966',
            'line-width': 2,
            'line-dasharray': [2, 2]
          }
        });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Update Village Markers & Popups
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!showMarkers) return;

    locations.forEach((loc) => {
      const el = document.createElement('div');
      el.className = 'custom-sentinel-marker cursor-pointer group transition-transform hover:scale-125';

      const isHigh = loc.current_risk_level === 'high';
      const isMed = loc.current_risk_level === 'medium';
      const isComingSoon = loc.status === 'coming_soon';

      let pinColor = '#339966'; // Low emerald
      let pulseRing = '';

      if (isHigh) {
        pinColor = '#DC2626'; // High red
        pulseRing = '<div class="absolute -inset-2 rounded-full bg-red-600/30 animate-ping"></div>';
      } else if (isMed) {
        pinColor = '#D97706'; // Medium amber
      } else if (isComingSoon) {
        pinColor = '#A1A1AA';
      }

      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          ${isHigh ? pulseRing : ''}
          <div style="background-color: ${pinColor};" class="w-7 h-7 rounded-full border-2 border-white shadow-sentinel-md flex items-center justify-center text-white text-[10px] font-bold">
            ${isComingSoon ? '⏳' : isHigh ? '⚠️' : isMed ? '⚡' : '🛡️'}
          </div>
          <div class="hidden group-hover:block absolute bottom-8 left-1/2 -translate-x-1/2 bg-forest text-pale-green text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sentinel-lg whitespace-nowrap z-50">
            ${loc.name} (${Math.round(loc.ml_risk_probability * 100)}% Risk)
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedVillage(loc);
        if (onSelectVillage) onSelectVillage(loc.location_id);
        map.flyTo({
          center: [loc.longitude, loc.latitude],
          zoom: 10,
          speed: 1.2,
          curve: 1.4,
          pitch: 45
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([loc.longitude, loc.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [locations, showMarkers]);

  // Handle selected village fly-to from props
  useEffect(() => {
    if (!selectedVillageId || !mapRef.current) return;
    const target = locations.find((l) => l.location_id === selectedVillageId);
    if (target) {
      setSelectedVillage(target);
      mapRef.current.flyTo({
        center: [target.longitude, target.latitude],
        zoom: 10,
        pitch: 45
      });
    }
  }, [selectedVillageId, locations]);

  // Handle Time Scrubber Playback
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setDayOffset((prev) => (prev >= 30 ? 1 : prev + 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  const handleSearchFly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current) return;
    const match = locations.find(
      (l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.district.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match) {
      setSelectedVillage(match);
      mapRef.current.flyTo({
        center: [match.longitude, match.latitude],
        zoom: 10,
        pitch: 45
      });
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition((pos) => {
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 11,
          pitch: 40
        });
      });
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-emerald/20 shadow-sentinel-lg bg-white dark:bg-surface-dark" style={{ height }}>
      {/* Search & Action Bar (Floating Overlay) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 max-w-sm w-full">
        <form onSubmit={handleSearchFly} className="relative flex-1">
          <Search className="w-4 h-4 text-forest/40 dark:text-pale-green/40 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search village or district on map..."
            className="w-full pl-9 pr-3 py-2 bg-white/95 dark:bg-forest/95 backdrop-blur-md border border-forest/20 dark:border-mint/30 rounded-2xl text-xs text-forest dark:text-pale-green placeholder-forest/50 dark:placeholder-pale-green/50 shadow-sentinel-md focus:outline-none focus:ring-2 focus:ring-emerald"
          />
        </form>

        <button
          onClick={handleLocateMe}
          className="p-2 bg-white/95 dark:bg-forest/95 text-forest dark:text-pale-green rounded-2xl border border-forest/20 dark:border-mint/30 shadow-sentinel-md hover:bg-emerald hover:text-white transition-colors"
          title="Locate my position"
        >
          <Navigation className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className={`p-2 rounded-2xl border shadow-sentinel-md transition-colors ${
            showLayerPanel 
              ? 'bg-emerald text-white border-emerald' 
              : 'bg-white/95 dark:bg-forest/95 text-forest dark:text-pale-green border-forest/20 dark:border-mint/30 hover:bg-emerald/10'
          }`}
          title="Toggle Layers & Filters"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Layers Popover Menu */}
      {showLayerPanel && (
        <div className="absolute top-16 left-4 z-20 w-64 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md rounded-2xl border border-forest/20 dark:border-mint/30 p-3 shadow-sentinel-xl text-xs space-y-2">
          <p className="font-extrabold uppercase text-[10px] tracking-wider text-forest/70 dark:text-pale-green/70 mb-1 border-b border-forest/10 pb-1">
            Map Layers & Filters
          </p>
          <label className="flex items-center gap-2 cursor-pointer text-forest dark:text-pale-green font-semibold">
            <input
              type="checkbox"
              checked={showMarkers}
              onChange={(e) => setShowMarkers(e.target.checked)}
              className="accent-emerald w-4 h-4 rounded"
            />
            <span>Village Risk Markers</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-forest dark:text-pale-green font-semibold">
            <input
              type="checkbox"
              checked={showBoundaries}
              onChange={(e) => {
                setShowBoundaries(e.target.checked);
                const map = mapRef.current;
                if (map && map.getLayer('ne-states-fill')) {
                  map.setLayoutProperty('ne-states-fill', 'visibility', e.target.checked ? 'visible' : 'none');
                  map.setLayoutProperty('ne-states-outline', 'visibility', e.target.checked ? 'visible' : 'none');
                }
              }}
              className="accent-emerald w-4 h-4 rounded"
            />
            <span>8 NE States Boundaries</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-forest dark:text-pale-green font-semibold">
            <input
              type="checkbox"
              checked={showRivers}
              onChange={(e) => setShowRivers(e.target.checked)}
              className="accent-emerald w-4 h-4 rounded"
            />
            <span>Brahmaputra Flood Basin Overlay</span>
          </label>
        </div>
      )}

      {/* Map Legend (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/95 dark:bg-forest/95 backdrop-blur-md p-3 rounded-2xl border border-forest/20 dark:border-mint/30 shadow-sentinel-lg text-[11px] text-forest dark:text-pale-green flex flex-col gap-1.5 select-none">
        <p className="font-extrabold text-[10px] uppercase tracking-wider text-forest/70 dark:text-pale-green/70 mb-0.5">
          Epidemic Risk Legend
        </p>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 ring-2 ring-red-400 animate-pulse" />
          <span className="font-bold text-red-700 dark:text-red-400">High Risk (Cases&gt;15 & WQI&lt;50)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="font-bold text-amber-700 dark:text-amber-400">Medium Risk (Cases&gt;8 or WQI&lt;60)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald" />
          <span className="font-bold text-emerald">Low / Baseline Safe</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-400 border border-dashed border-gray-600" />
          <span className="font-semibold text-gray-500">Coming Soon Rural Node</span>
        </div>
      </div>

      {/* Selected Village Fly-to Drawer Panel (Bottom Left) */}
      {selectedVillage && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm w-full bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md p-4 rounded-3xl border border-emerald/30 shadow-sentinel-xl text-forest dark:text-pale-green animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold">{selectedVillage.name}</h4>
                <RiskBadge level={selectedVillage.current_risk_level} size="sm" />
              </div>
              <p className="text-xs text-forest/60 dark:text-pale-green/60 mt-0.5">
                {selectedVillage.district}, {selectedVillage.state} • Pop: {selectedVillage.population?.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setSelectedVillage(null)}
              className="text-forest/40 dark:text-pale-green/40 hover:text-forest p-1"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-forest/10 dark:border-mint/15 text-center">
            <div className="p-2 bg-pale-green/40 dark:bg-forest-light/30 rounded-xl">
              <span className="text-[10px] text-forest/60 dark:text-pale-green/60 block">7d Cases</span>
              <span className="text-xs font-extrabold">{selectedVillage.case_count_7day}</span>
            </div>
            <div className="p-2 bg-pale-green/40 dark:bg-forest-light/30 rounded-xl">
              <span className="text-[10px] text-forest/60 dark:text-pale-green/60 block">WQI</span>
              <span className={`text-xs font-extrabold ${selectedVillage.latest_wqi < 50 ? 'text-red-600' : 'text-emerald'}`}>
                {selectedVillage.latest_wqi}
              </span>
            </div>
            <div className="p-2 bg-pale-green/40 dark:bg-forest-light/30 rounded-xl">
              <span className="text-[10px] text-forest/60 dark:text-pale-green/60 block">AI Risk</span>
              <span className="text-xs font-extrabold text-emerald">
                {Math.round(selectedVillage.ml_risk_probability * 100)}%
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => onSelectVillage ? onSelectVillage(selectedVillage.location_id) : (window.location.href = `/village/${selectedVillage.location_id}`)}
              className="flex-1 py-1.5 bg-emerald text-white rounded-xl text-xs font-bold hover:bg-emerald-hover transition-colors text-center"
            >
              Open Full Health Profile
            </button>
            <button
              onClick={() => (window.location.href = `/report?village=${selectedVillage.location_id}`)}
              className="px-3 py-1.5 bg-emerald/10 text-emerald rounded-xl text-xs font-bold hover:bg-emerald/20 transition-colors"
            >
              + Report
            </button>
          </div>
        </div>
      )}

      {/* 30-Day Historical Playback Time Scrubber (Top Right) */}
      {showTimeScrubber && (
        <div className="absolute top-4 right-14 z-10 hidden sm:flex items-center gap-2 bg-white/95 dark:bg-forest/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-forest/20 dark:border-mint/30 shadow-sentinel-md text-xs">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded-lg bg-emerald text-white hover:bg-emerald-hover transition-colors"
            title={isPlaying ? 'Pause timeline playback' : 'Play 30-day timeline playback'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-3 text-[10px] font-bold text-forest/70 dark:text-pale-green/70">
              <span>Day {dayOffset} / 30</span>
              <span className="text-emerald">{dayOffset === 30 ? 'Live Today' : `${30 - dayOffset}d ago`}</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={dayOffset}
              onChange={(e) => setDayOffset(parseInt(e.target.value, 10))}
              className="w-28 h-1 bg-forest/20 rounded-lg accent-emerald cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* MapLibre DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
