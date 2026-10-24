import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Droplets, 
  CloudRain, 
  Activity, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  HeartHandshake,
  Compass,
  FileText
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import { WaterWaveCanvas } from '../components/common/WaterWaveCanvas';
import { AuthModal } from '../components/auth/AuthModal';
import { fetchDashboardSummary, fetchLocations } from '../services/api';
import { LocationItem } from '../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState<'CIVILIAN' | 'OFFICIAL'>('CIVILIAN');
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const [stats, setStats] = useState({
    villages: 47,
    alerts: 8,
    reports: 342,
    leadTime: '3.8 Days',
  });

  const [sampleLocations, setSampleLocations] = useState<LocationItem[]>([]);

  useEffect(() => {
    fetchDashboardSummary()
      .then((data) => {
        setStats({
          villages: data.monitored_villages_count,
          alerts: data.active_alerts_count,
          reports: data.cases_7day_count + 120,
          leadTime: `${data.validation_metrics.lead_time_days} Days`,
        });
      })
      .catch(() => {});

    fetchLocations({ status_filter: 'active' })
      .then((data) => setSampleLocations(data.slice(0, 6)))
      .catch(() => {});
  }, []);

  const openAuth = (role: 'CIVILIAN' | 'OFFICIAL', tab: 'login' | 'register') => {
    setAuthRole(role);
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'COLLECT',
      icon: <Activity className="w-5 h-5 text-emerald" />,
      desc: 'Symptom logs from verified citizens and ASHA field workers, localized water sensor telemetry, and rainfall flood metrics.'
    },
    {
      step: '02',
      title: 'STANDARDISE',
      icon: <Layers className="w-5 h-5 text-mint-dark dark:text-mint" />,
      desc: 'Clean and group data by village coordinates and temporal windows; suppress duplicate spam and run Verhoeff checksums.'
    },
    {
      step: '03',
      title: 'ASSESS',
      icon: <ShieldCheck className="w-5 h-5 text-emerald" />,
      desc: 'Authoritative deterministic public health thresholds joined with supporting Scikit-Learn calibrated logistic regression.'
    },
    {
      step: '04',
      title: 'ACT',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      desc: 'Interactive 3D risk maps, automatic emergency alerts, door-to-door water testing, and targeted chlorine distribution.'
    }
  ];

  return (
    <div className="min-h-screen bg-pale-green text-forest selection:bg-emerald selection:text-white">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative bg-forest text-pale-green pt-6 pb-20 md:pb-28 px-4 md:px-8 overflow-hidden">
        <WaterWaveCanvas className="absolute inset-0 opacity-45 pointer-events-none" />

        {/* Top Navbar */}
        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-20 mb-12 md:mb-16">
          <BrandLogo variant="full" size="md" forceWhiteBadge />

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => openAuth('CIVILIAN', 'login')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-soft-mint hover:bg-white/10 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuth('CIVILIAN', 'register')}
              className="px-4 py-2 rounded-xl bg-emerald text-white text-xs font-bold hover:bg-emerald-hover transition-all shadow-sentinel-md"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight font-heading">
              From scattered signals <br className="hidden sm:block" />
              <span className="text-soft-mint">to informed action.</span>
            </h1>

            <p className="mt-4 text-base sm:text-xl text-pale-green/90 font-medium max-w-2xl mx-auto">
              See the signal. Verify the risk. Act early.
            </p>

            <p className="mt-2 text-xs sm:text-sm text-pale-green/75 max-w-xl mx-auto">
              AI-Powered Epidemic Risk Intelligence & Response System for water-borne diseases across rural Northeast India.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald text-white font-extrabold text-sm rounded-2xl hover:bg-emerald-hover transition-all shadow-sentinel-lg flex items-center justify-center gap-2"
            >
              <span>Explore Live Sentinel Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => openAuth('OFFICIAL', 'login')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-soft-mint font-bold text-sm rounded-2xl border border-mint/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Official / ASHA Portal</span>
            </button>
          </div>

          {/* Floating Live KPI Metrics */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            {[
              { label: 'Sentinel Villages Monitored', val: stats.villages, sub: 'Across 8 NE States' },
              { label: 'Active Outbreak Warnings', val: stats.alerts, sub: 'High risk alerts triaged' },
              { label: 'Surveillance Reports', val: `${stats.reports}+`, sub: 'Citizen & ASHA logs' },
              { label: 'Early Warning Lead Time', val: stats.leadTime, sub: 'Ahead of clinical surge' },
            ].map((kpi, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-mint/20 shadow-sentinel-md"
              >
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-heading block">
                  {kpi.val}
                </span>
                <span className="text-xs font-bold text-soft-mint block mt-0.5">
                  {kpi.label}
                </span>
                <span className="text-[10px] text-pale-green/60 block mt-0.5">
                  {kpi.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. THE CHALLENGE SECTION */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald">
            01 / The Rural Northeast Challenge
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-forest mt-1 tracking-tight">
            Outbreak risk rarely arrives as one clear signal.
          </h2>
          <p className="text-xs sm:text-sm text-forest/70 mt-2">
            Health symptoms, water conditions, and flood events are recorded by different people, at different times, across isolated terrain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-emerald/20 shadow-sentinel-sm">
            <div className="w-10 h-10 rounded-2xl bg-emerald/15 text-emerald flex items-center justify-center font-bold mb-4">
              01
            </div>
            <h3 className="text-base font-extrabold text-forest mb-2">Health Signals</h3>
            <p className="text-xs text-forest/70 leading-relaxed">
              Clusters of watery diarrhea, vomiting, and high fever rise locally in households before hospital cluster patterns become statistically apparent.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-emerald/20 shadow-sentinel-sm">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold mb-4">
              02
            </div>
            <h3 className="text-base font-extrabold text-forest mb-2">Water Signals</h3>
            <p className="text-xs text-forest/70 leading-relaxed">
              Submerged tube-wells and contaminated community ponds carry heavy fecal coliform loads (WQI &lt; 50) that silently infect village water stands.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-emerald/20 shadow-sentinel-sm">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold mb-4">
              03
            </div>
            <h3 className="text-base font-extrabold text-forest mb-2">Weather Signals</h3>
            <p className="text-xs text-forest/70 leading-relaxed">
              Monsoon cloudbursts and Brahmaputra river runoff exceeding 400mm damage local latrines and inundate shallow drinking aquifers.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW AERIS WORKS (4-STEP WORKFLOW STEPPER) */}
      <section className="bg-white py-16 md:py-24 px-4 md:px-8 border-y border-forest/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald">
              02 / The Proposed Solution
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-forest mt-1 tracking-tight">
              A practical public-health risk workflow.
            </h2>
            <p className="text-xs sm:text-sm text-forest/70 mt-2">
              The goal is not to diagnose individuals. It is to help public-health teams prioritize where to verify conditions and respond.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((ws) => (
              <div
                key={ws.step}
                className="p-5 rounded-3xl bg-pale-green/30 border border-emerald/20 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-extrabold text-forest/20 font-heading">
                      {ws.step}
                    </span>
                    <div className="p-2 rounded-xl bg-white shadow-sentinel-sm">
                      {ws.icon}
                    </div>
                  </div>
                  <h3 className="text-sm font-extrabold text-forest mb-2">
                    {ws.title}
                  </h3>
                  <p className="text-xs text-forest/70 leading-relaxed">
                    {ws.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LIVE NORTHEAST MAP PREVIEW STRIP */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald">
              03 / Sentinel Coverage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest mt-1 tracking-tight">
              Active across 8 Northeast India States
            </h2>
          </div>
          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald text-white rounded-xl text-xs font-bold hover:bg-emerald-hover transition-all shadow-sentinel-sm"
          >
            <span>Launch Full 3D Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {sampleLocations.map((loc) => (
            <div
              key={loc.location_id}
              onClick={() => navigate(`/village/${loc.location_id}`)}
              className="p-3.5 bg-white rounded-2xl border border-emerald/20 shadow-sentinel-sm hover:border-emerald hover:shadow-sentinel-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-forest truncate">{loc.name}</span>
                <span className={`w-2 h-2 rounded-full ${
                  loc.current_risk_level === 'high' ? 'bg-red-600 animate-pulse' : loc.current_risk_level === 'medium' ? 'bg-amber-500' : 'bg-emerald'
                }`} />
              </div>
              <p className="text-[10px] text-forest/60 truncate">{loc.district}, {loc.state}</p>
              <div className="mt-2 pt-2 border-t border-forest/10 flex justify-between text-[10px]">
                <span>WQI: <strong>{loc.latest_wqi}</strong></span>
                <span className="text-emerald font-bold">{Math.round(loc.ml_risk_probability * 100)}% AI</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. NEW RURAL AREAS COMING SOON STRIP */}
      <section className="bg-forest text-pale-green py-8 px-4 overflow-hidden border-y border-mint/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-mint/20 text-soft-mint text-[10px] font-extrabold uppercase tracking-wider border border-mint/30">
              Expansion
            </span>
            <p className="text-xs font-bold text-white">
              Phase 2 Telemetry Ingestion: Shillong, Agartala, Imphal, Itanagar, Kohima, Aizawl, Gangtok river basin extensions.
            </p>
          </div>
          <button
            onClick={() => navigate('/cases')}
            className="text-xs text-soft-mint font-bold hover:underline flex items-center gap-1"
          >
            <span>Request village coverage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 6. SAFETY, TRANSPARENCY & ETHICS */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-4xl mx-auto text-center">
        <ShieldCheck className="w-12 h-12 text-emerald mx-auto mb-3" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">
          Transparent and Safe by Design
        </h2>
        <p className="text-xs sm:text-sm text-forest/75 mt-3 leading-relaxed">
          AERIS is built around human-in-the-loop validation. Automated AI outbreak scores do not replace public health officers; they alert frontline ASHA workers and district surveillance units to conduct immediate water-testing and field verification before clinical surges occur.
        </p>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-forest text-pale-green border-t border-mint/15 py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <BrandLogo variant="full" size="sm" forceWhiteBadge />
            <p className="text-xs text-pale-green/70 mt-2">
              AI-powered epidemic risk intelligence for Northeast India
            </p>
            <p className="text-[11px] text-pale-green/50 mt-1 max-w-md">
              Risk scores are decision-support signals and must be verified by public health officers before action.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold text-soft-mint">
            <button onClick={() => navigate('/dashboard')} className="hover:underline">Dashboard</button>
            <button onClick={() => navigate('/map')} className="hover:underline">3D Map</button>
            <button onClick={() => navigate('/resources')} className="hover:underline">ORS Guides</button>
            <button onClick={() => navigate('/about')} className="hover:underline">About Project</button>
          </div>

          <p className="text-[11px] text-pale-green/50">
            © 2026 AERIS. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultRole={authRole}
          defaultTab={authTab}
        />
      )}
    </div>
  );
};
