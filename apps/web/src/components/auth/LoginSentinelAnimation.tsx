import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, Radio } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface LoginSentinelAnimationProps {
  onQuickAccountSelect?: (role: 'civilian' | 'asha' | 'officer' | 'pending') => void;
  className?: string;
}

export const LoginSentinelAnimation: React.FC<LoginSentinelAnimationProps> = ({
  onQuickAccountSelect,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax offsets
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Active state dash animation index for Sentinel Network Card (8 states)
  const [activeDash, setActiveDash] = useState(0);

  // Risk signal progress percentage (fills and resets smoothly)
  const [riskProgress, setRiskProgress] = useState(15);

  useEffect(() => {
    // Check touch device & reduced motion
    const touch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsTouchDevice(touch);
    setPrefersReducedMotion(reducedMotion);

    // 8-dash sequential lighting loop
    if (!reducedMotion) {
      const dashInterval = setInterval(() => {
        setActiveDash((prev) => (prev + 1) % 8);
      }, 350);

      // Smooth progress bar fill and reset
      const progressInterval = setInterval(() => {
        setRiskProgress((prev) => (prev >= 98 ? 10 : prev + 2.5));
      }, 100);

      return () => {
        clearInterval(dashInterval);
        clearInterval(progressInterval);
      };
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || prefersReducedMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normalizedX = (e.clientX - centerX) / (rect.width / 2);
    const normalizedY = (e.clientY - centerY) / (rect.height / 2);
    setParallax({
      x: Math.max(-1, Math.min(1, normalizedX)),
      y: Math.max(-1, Math.min(1, normalizedY)),
    });
  };

  const handleMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  // 4 Sentinel Village Nodes on the regional map
  const nodes = [
    {
      id: 'dhakuakhana',
      name: 'Dhakuakhana',
      district: 'Lakhimpur, Assam',
      x: 320,
      y: 155,
      isActive: true,
      risk: '98%',
      delay: 0,
    },
    {
      id: 'pasighat',
      name: 'Pasighat',
      district: 'East Siang, Arunachal',
      x: 385,
      y: 115,
      isActive: false,
      risk: '97%',
      delay: 0.8,
    },
    {
      id: 'mawsynram',
      name: 'Mawsynram',
      district: 'East Khasi Hills, Meghalaya',
      x: 185,
      y: 245,
      isActive: false,
      risk: '97%',
      delay: 1.6,
    },
    {
      id: 'champhai',
      name: 'Champhai',
      district: 'Champhai, Mizoram',
      x: 295,
      y: 330,
      isActive: false,
      risk: '96%',
      delay: 2.4,
    },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full min-h-[520px] md:min-h-[620px] flex flex-col justify-between p-6 select-none overflow-hidden bg-gradient-to-b from-[#06160d] via-[#0a2e1c] to-[#0f3d26] text-pale-green ${className}`}
    >
      {/* 1. ATMOSPHERIC RADIAL GLOW & VIGNETTE */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: !prefersReducedMotion
            ? `translate3d(${parallax.x * 6}px, ${parallax.y * 6}px, 0)`
            : 'none',
          background: `
            radial-gradient(circle at 50% 42%, rgba(51, 153, 102, 0.28) 0%, rgba(16, 47, 21, 0.15) 50%, transparent 75%),
            radial-gradient(circle at center, transparent 35%, rgba(4, 15, 8, 0.82) 100%)
          `,
        }}
      />

      {/* Subtle geospatial command grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #66CC99 1px, transparent 1px),
            linear-gradient(to bottom, #66CC99 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      {/* 2. TOP BRANDING & LIVE MONITORING BADGE */}
      <div className="relative z-20 flex items-start justify-between">
        <div>
          <BrandLogo variant="full" size="md" forceWhiteBadge />
          <h3 className="mt-3 text-sm font-extrabold text-white tracking-tight font-heading">
            AI-Powered Epidemic Risk Intelligence
          </h3>
          <p className="text-[11px] text-soft-mint/90 mt-0.5">
            Sentinel Northeast India Water-Borne Disease Early Warning
          </p>
        </div>

        {/* Live Monitoring Badge with blinking green dot */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#071d12]/80 border border-mint/30 shadow-sentinel-sm backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75 ${
                !prefersReducedMotion ? 'animate-ping' : ''
              }`}
            />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-mint" />
          </span>
          <span className="text-[9px] font-mono font-bold tracking-widest text-soft-mint uppercase">
            BRAHMAPUTRA BASIN / LIVE
          </span>
        </div>
      </div>

      {/* 3. CENTRAL SENTINEL NETWORK SVG STAGE (Map, River, Orbit Rings, Nodes, Data Pulses) */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-2 pointer-events-none">
        <svg
          viewBox="0 0 500 420"
          className="w-full max-w-[440px] h-auto overflow-visible drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Stylized Northeast India and Brahmaputra Basin Sentinel Map"
        >
          <defs>
            {/* Map Silhouette Gradient */}
            <linearGradient id="neMapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#339966" stopOpacity="0.28" />
              <stop offset="50%" stopColor="#102F15" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#66CC99" stopOpacity="0.14" />
            </linearGradient>

            {/* Glowing River Filter */}
            <filter id="riverGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Pulse Ripple Keyframes */}
            <style>
              {`
                @keyframes orbitSlowCW {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes orbitSlowCCW {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(-360deg); }
                }
                @keyframes riverDashOffset {
                  from { stroke-dashoffset: 0; }
                  to { stroke-dashoffset: -48; }
                }
                @keyframes ripplePulse {
                  0% { r: 6px; opacity: 0.9; stroke-width: 2px; }
                  70% { opacity: 0.4; }
                  100% { r: 24px; opacity: 0; stroke-width: 0.5px; }
                }
                @keyframes dataPulseTravel {
                  0% { offset-distance: 0%; opacity: 0; }
                  20% { opacity: 1; }
                  80% { opacity: 1; }
                  100% { offset-distance: 100%; opacity: 0; }
                }
                .flowing-river {
                  animation: ${!prefersReducedMotion ? 'riverDashOffset 4s linear infinite' : 'none'};
                }
                .orbit-ring-cw {
                  transform-origin: 260px 200px;
                  animation: ${!prefersReducedMotion ? 'orbitSlowCW 75s linear infinite' : 'none'};
                }
                .orbit-ring-ccw {
                  transform-origin: 260px 200px;
                  animation: ${!prefersReducedMotion ? 'orbitSlowCCW 90s linear infinite' : 'none'};
                }
                .ripple-anim {
                  transform-origin: center;
                  animation: ${!prefersReducedMotion ? 'ripplePulse 3s cubic-bezier(0.2, 0.6, 0.4, 1) infinite' : 'none'};
                }
              `}
            </style>
          </defs>

          {/* LAYER A: CONCENTRIC ORBIT RINGS & DRIFTING PARTICLES */}
          <g
            className="orbit-ring-cw"
            style={{
              transform: !prefersReducedMotion
                ? `translate3d(${parallax.x * 5}px, ${parallax.y * 5}px, 0)`
                : 'none',
            }}
          >
            {/* Outer ring */}
            <ellipse
              cx="260"
              cy="200"
              rx="215"
              ry="165"
              fill="none"
              stroke="#66CC99"
              strokeOpacity="0.16"
              strokeWidth="1.2"
              strokeDasharray="4 8"
            />
            {/* Particle 1 */}
            <circle cx="475" cy="200" r="2.5" fill="#D3FEEA" opacity="0.85">
              {!prefersReducedMotion && (
                <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
              )}
            </circle>
            {/* Particle 2 */}
            <circle cx="120" cy="75" r="2" fill="#66CC99" opacity="0.75" />
          </g>

          <g
            className="orbit-ring-ccw"
            style={{
              transform: !prefersReducedMotion
                ? `translate3d(${parallax.x * 9}px, ${parallax.y * 9}px, 0)`
                : 'none',
            }}
          >
            {/* Inner ring */}
            <ellipse
              cx="260"
              cy="200"
              rx="175"
              ry="130"
              fill="none"
              stroke="#339966"
              strokeOpacity="0.22"
              strokeWidth="1"
              strokeDasharray="6 10"
            />
            {/* Particle 3 */}
            <circle cx="85" cy="200" r="2.2" fill="#D3FEEA" opacity="0.9">
              {!prefersReducedMotion && (
                <animate attributeName="opacity" values="0.3;0.9;0.3" dur="4s" repeatCount="indefinite" />
              )}
            </circle>
            {/* Particle 4 */}
            <circle cx="395" cy="290" r="2" fill="#66CC99" opacity="0.6" />
          </g>

          {/* LAYER B: NORTHEAST INDIA & BRAHMAPUTRA BASIN SILHOUETTE */}
          <g
            style={{
              transform: !prefersReducedMotion
                ? `translate3d(${parallax.x * 12}px, ${parallax.y * 12}px, 0)`
                : 'none',
              transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
            }}
          >
            {/* Organic Northeast India Boundary Path */}
            <motion.path
              initial={!prefersReducedMotion ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
              d="M 75,95 
                 L 88,80 L 102,74 L 110,92 L 100,115 L 88,138 L 78,160 
                 L 98,175 L 120,188 L 152,172 L 182,132 L 218,98 
                 L 268,68 L 328,50 L 388,52 L 438,78 L 470,118 
                 L 455,155 L 420,178 L 415,215 L 390,250 L 355,260 
                 L 345,295 L 335,340 L 310,380 L 290,390 L 275,365 
                 L 270,320 L 250,300 L 230,315 L 210,360 L 190,345 
                 L 185,300 L 170,278 L 130,272 L 115,248 L 98,228 
                 L 88,188 Z"
              fill="url(#neMapGradient)"
              stroke="rgba(102, 204, 153, 0.48)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Faint state boundary division hints */}
            <path
              d="M 170,278 Q 230,240 270,320"
              fill="none"
              stroke="#66CC99"
              strokeOpacity="0.12"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            <path
              d="M 345,295 Q 390,250 415,215"
              fill="none"
              stroke="#66CC99"
              strokeOpacity="0.12"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            <path
              d="M 182,132 Q 260,140 355,145"
              fill="none"
              stroke="#66CC99"
              strokeOpacity="0.1"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          </g>

          {/* LAYER C: GLOWING FLOWING BRAHMAPUTRA RIVER PATH */}
          <g
            style={{
              transform: !prefersReducedMotion
                ? `translate3d(${parallax.x * 16}px, ${parallax.y * 16}px, 0)`
                : 'none',
              transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
            }}
          >
            {/* Ambient River Water Underglow */}
            <path
              d="M 448,112 
                 Q 395,122 345,148 
                 T 275,174 
                 T 195,204 
                 T 112,232"
              fill="none"
              stroke="#339966"
              strokeWidth="6"
              strokeOpacity="0.32"
              strokeLinecap="round"
              filter="url(#riverGlow)"
            />

            {/* Continuous Flowing Dashed River */}
            <path
              d="M 448,112 
                 Q 395,122 345,148 
                 T 275,174 
                 T 195,204 
                 T 112,232"
              fill="none"
              stroke="#66CC99"
              strokeWidth="2.4"
              strokeDasharray="8 8"
              strokeLinecap="round"
              className="flowing-river"
              filter="url(#riverGlow)"
            />

            {/* River label */}
            <text
              x="268"
              y="166"
              fill="#D3FEEA"
              fillOpacity="0.75"
              fontSize="8.5"
              fontWeight="bold"
              letterSpacing="2"
              fontFamily="sans-serif"
            >
              BRAHMAPUTRA
            </text>
          </g>

          {/* LAYER D: FAINT DOTTED CONNECTION LINES & DATA PACKETS */}
          <g
            style={{
              transform: !prefersReducedMotion
                ? `translate3d(${parallax.x * 18}px, ${parallax.y * 18}px, 0)`
                : 'none',
            }}
          >
            {/* Pasighat -> Dhakuakhana */}
            <line
              x1="385"
              y1="115"
              x2="320"
              y2="155"
              stroke="#66CC99"
              strokeOpacity="0.35"
              strokeWidth="1.2"
              strokeDasharray="3 4"
            />
            {/* Dhakuakhana -> Mawsynram */}
            <line
              x1="320"
              y1="155"
              x2="185"
              y2="245"
              stroke="#66CC99"
              strokeOpacity="0.35"
              strokeWidth="1.2"
              strokeDasharray="3 4"
            />
            {/* Mawsynram -> Champhai */}
            <line
              x1="185"
              y1="245"
              x2="295"
              y2="330"
              stroke="#66CC99"
              strokeOpacity="0.35"
              strokeWidth="1.2"
              strokeDasharray="3 4"
            />

            {/* Animated Data Packets traveling along links */}
            {!prefersReducedMotion && (
              <>
                {/* Packet 1: Pasighat to Dhakuakhana */}
                <circle r="2.2" fill="#D3FEEA">
                  <animate
                    attributeName="cx"
                    values="385;320"
                    dur="2.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    values="115;155"
                    dur="2.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    dur="2.8s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Packet 2: Dhakuakhana to Mawsynram */}
                <circle r="2.4" fill="#D3FEEA">
                  <animate
                    attributeName="cx"
                    values="320;185"
                    dur="3.4s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    values="155;245"
                    dur="3.4s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    dur="3.4s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Packet 3: Mawsynram to Champhai */}
                <circle r="2" fill="#66CC99">
                  <animate
                    attributeName="cx"
                    values="185;295"
                    dur="3.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    values="245;330"
                    dur="3.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    dur="3.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              </>
            )}
          </g>

          {/* LAYER E: 4 SENTINEL VILLAGE NODES WITH RIPPLE EFFECT */}
          <g
            style={{
              transform: !prefersReducedMotion
                ? `translate3d(${parallax.x * 20}px, ${parallax.y * 20}px, 0)`
                : 'none',
            }}
          >
            {nodes.map((node) => (
              <g key={node.id} className="cursor-pointer pointer-events-auto">
                {/* Pulsing Ripple Circle (staggered delay) */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="6"
                  fill="none"
                  stroke={node.isActive ? '#D3FEEA' : '#66CC99'}
                  className="ripple-anim"
                  style={{
                    animationDelay: `${node.delay}s`,
                  }}
                />

                {/* Secondary Ripple for Active Node */}
                {node.isActive && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="6"
                    fill="none"
                    stroke="#339966"
                    className="ripple-anim"
                    style={{
                      animationDelay: `${node.delay + 1.2}s`,
                    }}
                  />
                )}

                {/* Outer Ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.isActive ? 7 : 5.5}
                  fill={node.isActive ? 'rgba(51, 153, 102, 0.4)' : 'rgba(16, 47, 21, 0.6)'}
                  stroke={node.isActive ? '#D3FEEA' : '#66CC99'}
                  strokeWidth={node.isActive ? 1.8 : 1.2}
                />

                {/* Bright Core Dot */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.isActive ? 3.5 : 2.5}
                  fill={node.isActive ? '#FFFFFF' : '#D3FEEA'}
                  filter={node.isActive ? 'url(#riverGlow)' : undefined}
                />

                {/* Node Label */}
                <text
                  x={node.x + 9}
                  y={node.y + 3.5}
                  fill={node.isActive ? '#FFFFFF' : '#D3FEEA'}
                  fontSize={node.isActive ? '9' : '8'}
                  fontWeight={node.isActive ? '800' : '600'}
                  fontFamily="sans-serif"
                  opacity={node.isActive ? 0.95 : 0.8}
                >
                  {node.name}
                  {node.isActive && (
                    <tspan fill="#66CC99" fontWeight="bold"> (Live)</tspan>
                  )}
                </text>
              </g>
            ))}
          </g>
        </svg>

        {/* 4. TWO FLOATING GLASS-MORPHISM CARDS (Bobbing up and down) */}
        {/* Floating Card 1: SENTINEL NETWORK (8 states connected) */}
        <div
          className="absolute top-2 right-1 sm:right-3 pointer-events-auto"
          style={{
            transform: !prefersReducedMotion
              ? `translate3d(${parallax.x * -16}px, ${parallax.y * -16}px, 0)`
              : 'none',
            transition: 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)',
          }}
        >
          <div
            className={`p-3 rounded-2xl bg-[#071a10]/80 border border-mint/25 backdrop-blur-md shadow-sentinel-lg max-w-[210px] ${
              !prefersReducedMotion ? 'animate-float' : ''
            }`}
            style={{ animationDuration: '6s' }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[9px] font-mono font-bold tracking-wider text-soft-mint uppercase flex items-center gap-1">
                <Radio className="w-3 h-3 text-mint" />
                SENTINEL NETWORK
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
            </div>
            <p className="text-xs font-extrabold text-white tracking-tight">
              8 states connected
            </p>

            {/* 8 Dashes that light up one by one in sequence */}
            <div className="flex items-center gap-1 mt-2">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    activeDash === idx
                      ? 'bg-emerald shadow-emerald-glow scale-y-125'
                      : 'bg-emerald/25'
                  }`}
                  title={`State node ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Floating Card 2: RISK SIGNAL (Verify locally) */}
        <div
          className="absolute bottom-3 left-1 sm:left-3 pointer-events-auto"
          style={{
            transform: !prefersReducedMotion
              ? `translate3d(${parallax.x * -20}px, ${parallax.y * -20}px, 0)`
              : 'none',
            transition: 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)',
          }}
        >
          <div
            className={`p-3 rounded-2xl bg-[#071a10]/80 border border-mint/25 backdrop-blur-md shadow-sentinel-lg max-w-[200px] ${
              !prefersReducedMotion ? 'animate-float' : ''
            }`}
            style={{ animationDuration: '7s', animationDelay: '-3.5s' }}
          >
            <div className="flex items-center gap-1.5 text-amber-300 mb-1">
              <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span className="text-[9px] font-mono font-bold tracking-wider uppercase">
                RISK SIGNAL
              </span>
            </div>
            <p className="text-xs font-extrabold text-white tracking-tight">
              Verify locally
            </p>

            {/* Smooth progress bar that fills and resets */}
            <div className="mt-2 w-full">
              <div className="flex items-center justify-between text-[9px] text-pale-green/75 mb-1">
                <span>Signal calibration</span>
                <span className="font-mono text-soft-mint font-bold">{Math.round(riskProgress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-mint/20">
                <div
                  className="h-full bg-gradient-to-r from-emerald via-mint to-soft-mint rounded-full transition-all duration-100 ease-linear shadow-emerald-glow"
                  style={{ width: `${riskProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM QUICK-ACCESS ACCOUNTS (Preserves 1-click test credentials) */}
      <div className="relative z-20 pt-2 border-t border-mint/15">
        <p className="text-[10px] text-pale-green/80 uppercase tracking-wider font-bold mb-1.5 flex items-center justify-between">
          <span>Quick Access Sentinel Roles:</span>
          <span className="text-[9px] text-mint/75 font-normal">Click to fill</span>
        </p>
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          <button
            type="button"
            onClick={() => onQuickAccountSelect?.('civilian')}
            className="px-2 py-1.5 bg-emerald/20 hover:bg-emerald/35 text-soft-mint rounded-lg font-semibold text-left border border-emerald/30 transition-colors truncate"
          >
            👤 Civilian (Pranab)
          </button>
          <button
            type="button"
            onClick={() => onQuickAccountSelect?.('asha')}
            className="px-2 py-1.5 bg-emerald/20 hover:bg-emerald/35 text-soft-mint rounded-lg font-semibold text-left border border-emerald/30 transition-colors truncate"
          >
            🏥 ASHA Worker
          </button>
          <button
            type="button"
            onClick={() => onQuickAccountSelect?.('officer')}
            className="px-2 py-1.5 bg-emerald/20 hover:bg-emerald/35 text-soft-mint rounded-lg font-semibold text-left border border-emerald/30 transition-colors truncate"
          >
            🩺 Health Officer
          </button>
          <button
            type="button"
            onClick={() => onQuickAccountSelect?.('pending')}
            className="px-2 py-1.5 bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 rounded-lg font-semibold text-left border border-amber-500/40 transition-colors truncate"
          >
            ⏳ Pending Official
          </button>
        </div>
      </div>
    </div>
  );
};
