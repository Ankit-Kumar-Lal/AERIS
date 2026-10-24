import React from 'react';
import { BookOpen, Phone, Droplets, HeartPulse, Flame, CheckCircle2, Shield } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const helplines = [
    { title: 'National Emergency Ambulance', number: '108', desc: 'Toll-free 24x7 emergency medical transport' },
    { title: 'National Health Helpline', number: '104', desc: 'Free medical consultation and disease guidance' },
    { title: 'Disaster Management Helpline', number: '1070', desc: 'State disaster response and flood rescue' },
    { title: 'Childline Emergency Support', number: '1098', desc: 'Immediate pediatric medical assistance' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl border border-emerald/20 shadow-sentinel-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-forest dark:text-pale-green tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald" />
            Community Water Safety & Epidemic Awareness
          </h2>
          <p className="text-xs text-forest/60 dark:text-pale-green/60 mt-0.5">
            Essential guidelines for flood inundation, water disinfection, ORS preparation, and emergency response
          </p>
        </div>
      </div>

      {/* Emergency Helplines Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {helplines.map((h, i) => (
          <div key={i} className="p-4 bg-white dark:bg-surface-dark rounded-3xl border border-emerald/20 shadow-sentinel-sm flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald/15 text-emerald shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-forest dark:text-pale-green block">{h.title}</span>
              <a href={`tel:${h.number}`} className="text-xl font-extrabold text-emerald hover:underline block mt-0.5">
                {h.number}
              </a>
              <span className="text-[10px] text-forest/60 dark:text-pale-green/60 block mt-0.5">{h.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Essential Public Health Guides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. ORS Preparation Guide */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-emerald/20 shadow-sentinel-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald/15 text-emerald flex items-center justify-center font-bold">
            <HeartPulse className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-forest dark:text-pale-green">
            How to Prepare Oral Rehydration Salts (ORS)
          </h3>
          <p className="text-xs text-forest/70 dark:text-pale-green/70 leading-relaxed">
            For rapid fluid replacement during acute watery diarrhea or cholera symptoms:
          </p>
          <ul className="text-xs space-y-1.5 text-forest/80 dark:text-pale-green/80 font-medium">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald font-bold">1.</span>
              <span>Dissolve 1 entire packet of WHO-standard ORS into exactly 1 Litre of clean, boiled and cooled drinking water.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald font-bold">2.</span>
              <span>Stir well until the powder is fully dissolved. Do not add sugar or milk.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald font-bold">3.</span>
              <span>Administer in small, frequent sips using a clean cup. Use within 24 hours.</span>
            </li>
          </ul>
        </div>

        {/* 2. Water Boiling & Disinfection */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-emerald/20 shadow-sentinel-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-forest dark:text-pale-green">
            Safe Water Boiling & Disinfection
          </h3>
          <p className="text-xs text-forest/70 dark:text-pale-green/70 leading-relaxed">
            During monsoon runoff or tube-well flood submergence:
          </p>
          <ul className="text-xs space-y-1.5 text-forest/80 dark:text-pale-green/80 font-medium">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald font-bold">1.</span>
              <span>Bring drinking water to a rolling, bubbling boil for at least 3 minutes to destroy Vibrio and Shigella bacteria.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald font-bold">2.</span>
              <span>If boiling is unavailable, use government-distributed Halazone/Chlorine tablets (1 tablet per 20 Litres of clear water).</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald font-bold">3.</span>
              <span>Allow treated chlorinated water to stand covered for 30 minutes before drinking.</span>
            </li>
          </ul>
        </div>

        {/* 3. Hygiene & Sanitation */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-emerald/20 shadow-sentinel-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold">
            <Droplets className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-forest dark:text-pale-green">
            Sanitation in Flood Environments
          </h3>
          <p className="text-xs text-forest/70 dark:text-pale-green/70 leading-relaxed">
            Prevent cross-contamination between surface floodwater and food sources:
          </p>
          <ul className="text-xs space-y-1.5 text-forest/80 dark:text-pale-green/80 font-medium">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald font-bold">1.</span>
              <span>Wash hands thoroughly with soap for 20 seconds before preparing food and after toilet use.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald font-bold">2.</span>
              <span>Store drinking water in narrow-necked covered containers; use a long-handled ladle rather than dipping fingers.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald font-bold">3.</span>
              <span>Immediately report any dead fish or oily surface sheen in community ponds to sentinel ASHA.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
