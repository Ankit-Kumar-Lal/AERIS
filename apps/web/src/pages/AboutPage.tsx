import React from 'react';
import {
  ShieldCheck,
  Droplets,
  HeartPulse,
  Leaf,
  Cpu,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Award,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto py-2">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest via-forest to-forest-light text-pale-green p-8 sm:p-12 shadow-sentinel">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald/20 text-mint text-xs font-bold border border-mint/30">
            <Award className="w-3.5 h-3.5" />
            <span>Public Health Early Warning Initiative</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-display leading-tight">
            AI-Powered Epidemic Risk Intelligence for Rural Northeast India
          </h1>

          <p className="text-sm sm:text-base text-pale-green/90 leading-relaxed">
            AERIS (Automated Epidemic Risk Intelligence System) bridges the critical 7-to-14 day
            surveillance gap in flood-prone, remote rural communities across the Brahmaputra basin and
            Northeastern hill tracts.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald text-white text-xs font-extrabold hover:bg-emerald-hover transition-all shadow-sentinel-sm"
            >
              <span>Explore Live Sentinel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-extrabold hover:bg-white/20 transition-all border border-white/20"
            >
              <span>Log Field Report</span>
            </Link>
          </div>
        </div>

        {/* Brand logo watermark overlay */}
        <div className="absolute -right-8 -bottom-10 opacity-20 pointer-events-none w-72 h-72">
          <img
            src="/brand/logo_icon.png"
            alt="Sentinel Watermark"
            className="w-full h-full object-contain filter brightness-200"
          />
        </div>
      </div>

      {/* The Core Public Health Ethos */}
      <div className="p-6 rounded-3xl bg-soft-mint/60 dark:bg-forest-light/40 border-2 border-emerald/30 shadow-sentinel-sm text-forest dark:text-pale-green">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-emerald text-white shrink-0 shadow-md">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald">
              Core Operating Philosophy
            </span>
            <blockquote className="text-base sm:text-lg font-black italic tracking-tight text-forest dark:text-pale-green">
              "A risk signal is a prompt to verify, not a confirmed outbreak."
            </blockquote>
            <p className="text-xs sm:text-sm text-forest/80 dark:text-pale-green/80 leading-relaxed">
              In clinical epidemiology, false alarms waste scarce medical inventory, while silence
              costs human lives. AERIS never outputs black-box opacity. Every risk score is
              decomposed into authoritative environmental triggers, ML confidence intervals, and a
              clear set of actionable verification steps for District Rapid Response Teams.
            </p>
          </div>
        </div>
      </div>

      {/* Anatomy of the Sentinel Logo & Symbolism */}
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 sm:p-8 border border-emerald/20 shadow-sentinel-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-forest/10 dark:bg-mint/10 text-emerald">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-forest dark:text-pale-green font-display">
              The Sentinel Brand Anatomy
            </h2>
            <p className="text-xs text-forest/70 dark:text-pale-green/70">
              The four essential pillars embedded in our official emblem
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-pale-green/30 dark:bg-forest-light/20 border border-forest/10 dark:border-mint/15 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-black text-forest dark:text-pale-green">
              Pure Water Droplet
            </h3>
            <p className="text-[11px] text-forest/70 dark:text-pale-green/70 leading-relaxed">
              Water quality surveillance (turbidity, coliform, pH, TDS) across vulnerable surface
              ponds and borewells.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-pale-green/30 dark:bg-forest-light/20 border border-forest/10 dark:border-mint/15 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald/20 text-emerald flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-black text-forest dark:text-pale-green">
              Ecological Sentinel
            </h3>
            <p className="text-[11px] text-forest/70 dark:text-pale-green/70 leading-relaxed">
              Monsoon cloudburst tracking, upstream runoff velocity, and environmental disease
              vectors.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-pale-green/30 dark:bg-forest-light/20 border border-forest/10 dark:border-mint/15 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-black text-forest dark:text-pale-green">
              The Pulse of Life
            </h3>
            <p className="text-[11px] text-forest/70 dark:text-pale-green/70 leading-relaxed">
              Syndromic reports from frontline ASHA workers detecting acute diarrhoea, dehydration,
              and jaundice spikes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-pale-green/30 dark:bg-forest-light/20 border border-forest/10 dark:border-mint/15 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-mint/20 text-forest dark:text-mint flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-black text-forest dark:text-pale-green">
              The Sentinel "A"
            </h3>
            <p className="text-[11px] text-forest/70 dark:text-pale-green/70 leading-relaxed">
              Dual-engine intelligence pairing transparent public-health deterministic rules with
              scikit-learn ML.
            </p>
          </div>
        </div>
      </div>

      {/* The 8 Sister States of Northeast India */}
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 sm:p-8 border border-emerald/20 shadow-sentinel-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-forest/10 dark:bg-mint/10 text-emerald">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-forest dark:text-pale-green font-display">
              Regional Surveillance Scope: The 8 Sister States
            </h2>
            <p className="text-xs text-forest/70 dark:text-pale-green/70">
              Targeted epidemiological monitoring across Northeast India's complex terrain
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { state: 'Assam', desc: 'Brahmaputra flood plains & tea estates', code: 'AS' },
            { state: 'Meghalaya', desc: 'Khasi & Garo hills heavy rainfall zones', code: 'ML' },
            { state: 'Tripura', desc: 'Gomati & Manu river basin settlements', code: 'TR' },
            { state: 'Manipur', desc: 'Loktak lake & Imphal valley watercourses', code: 'MN' },
            { state: 'Arunachal Pradesh', desc: 'Subansiri & Siang Himalayan watersheds', code: 'AR' },
            { state: 'Nagaland', desc: 'Doyang valley & high-altitude villages', code: 'NL' },
            { state: 'Mizoram', desc: 'Tlawng river valley & remote hills', code: 'MZ' },
            { state: 'Sikkim', desc: 'Teesta basin mountain tributaries', code: 'SK' },
          ].map((st) => (
            <div
              key={st.state}
              className="p-3.5 rounded-2xl bg-pale-green/20 dark:bg-forest-light/20 border border-forest/10 dark:border-mint/10 hover:border-emerald/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-forest dark:text-pale-green">
                  {st.state}
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald">{st.code}</span>
              </div>
              <p className="text-[10px] text-forest/60 dark:text-pale-green/60 mt-1 leading-snug">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Anti-Fake Technology Highlights */}
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 sm:p-8 border border-emerald/20 shadow-sentinel-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-forest/10 dark:bg-mint/10 text-emerald">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-forest dark:text-pale-green font-display">
              Anti-Fake Telemetry & Ground-Truth Assurance
            </h2>
            <p className="text-xs text-forest/70 dark:text-pale-green/70">
              Why health authorities can trust AERIS risk intelligence
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-pale-green/20 dark:bg-forest-light/20 border border-forest/10 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald" />
              <h3 className="text-xs font-bold text-forest dark:text-pale-green">
                Government ID Format Verification
              </h3>
            </div>
            <p className="text-[11px] text-forest/70 dark:text-pale-green/70 leading-relaxed">
              Standard 12-digit format and structural validation catches entry errors and invalid inputs
              in Aadhaar credentials.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-pale-green/20 dark:bg-forest-light/20 border border-forest/10 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald" />
              <h3 className="text-xs font-bold text-forest dark:text-pale-green">
                Salted SHA-256 Hashing
              </h3>
            </div>
            <p className="text-[11px] text-forest/70 dark:text-pale-green/70 leading-relaxed">
              Zero plain-text national IDs stored in database. Encrypted with high-entropy salt;
              masked for UI display (`XXXX-XXXX-1234`).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-pale-green/20 dark:bg-forest-light/20 border border-forest/10 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald" />
              <h3 className="text-xs font-bold text-forest dark:text-pale-green">
                GPS Haversine Verification
              </h3>
            </div>
            <p className="text-[11px] text-forest/70 dark:text-pale-green/70 leading-relaxed">
              Reports verify device GPS coordinates against village coordinates within a 15 km
              geofence to prevent remote spam attacks.
            </p>
          </div>
        </div>
      </div>

      {/* Platform Mission Footer Card */}
      <div className="p-6 rounded-3xl bg-forest text-pale-green flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" variant="icon" forceWhiteBadge={true} />
          <div>
            <h3 className="text-sm font-extrabold text-white">AERIS Public Health Platform</h3>
            <p className="text-xs text-mint">
              AI-powered epidemic risk intelligence for Northeast India
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-pale-green/70">
          <span>React 18 + Vite</span>
          <span>•</span>
          <span>FastAPI + ML Intelligence</span>
          <span>•</span>
          <span>MapLibre GL 3D</span>
        </div>
      </div>

      <p className="text-xs text-center text-forest/60 dark:text-pale-green/60 pt-1 pb-4">
        Risk scores are decision-support signals and must be verified by public health officers before action.
      </p>
    </div>
  );
};
export default AboutPage;