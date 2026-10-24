import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  Activity, 
  Droplets, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  Navigation,
  FileCheck,
  Shield,
  WifiOff,
  Sparkles,
  HeartPulse
} from 'lucide-react';
import { LocationItem } from '../../types';
import { submitReport } from '../../services/api';
import { enqueueReport } from '../../services/offlineQueue';
import { useAuth } from '../../context/AuthContext';

interface ReportWizardProps {
  locations: LocationItem[];
  preselectedVillageId?: number;
  onSuccess?: (trackingId: string) => void;
}

const SYMPTOM_OPTIONS = [
  { id: 'diarrhea', label: 'Watery Diarrhea', desc: 'Frequent watery stools >3 times/day (Cholera risk)', icon: '💧', priority: 'high' },
  { id: 'vomiting', label: 'Severe Vomiting', desc: 'Frequent emesis, unable to retain fluids', icon: '🤢', priority: 'high' },
  { id: 'dehydration', label: 'Severe Dehydration', desc: 'Sunken eyes, skin pinch delay, dry mouth', icon: '⚠️', priority: 'high' },
  { id: 'abdominal_pain', label: 'Abdominal Cramps', desc: 'Acute lower colic and gastrointestinal spasms', icon: '⚡', priority: 'medium' },
  { id: 'fever', label: 'High Enteric Fever', desc: 'Temperature >38.5°C with chills & malaise', icon: '🌡️', priority: 'medium' },
  { id: 'fever_with_neurological_symptoms', label: 'Fever with Neurological Symptoms (AES)', desc: 'Altered sensorium, convulsions, stiff neck (AES flag)', icon: '🧠', priority: 'critical' },
  { id: 'jaundice', label: 'Jaundice / Yellow Eyes', desc: 'Hepatitis A/E risk from contaminated water', icon: '👁️', priority: 'medium' },
  { id: 'nausea_headache', label: 'Nausea & Severe Headache', desc: 'Systemic malaise following water consumption', icon: '🤕', priority: 'low' },
];

const WATER_SOURCES = [
  { id: 'tube_well', label: 'Community Tube Well / Handpump', desc: 'Groundwater well' },
  { id: 'pond', label: 'Local Pond / Pukhuri', desc: 'Surface reservoir' },
  { id: 'river', label: 'River / Stream Water', desc: 'Riverine flood water' },
  { id: 'piped_supply', label: 'JJM Piped Water Supply', desc: 'Public tap stand' },
  { id: 'open_well', label: 'Open Dug Well', desc: 'Uncovered well' },
];

const AGE_GROUPS = [
  { id: 'under_5', label: 'Under 5 Years', desc: 'Infants & toddlers (High vulnerability)' },
  { id: '5_18', label: '5 to 18 Years', desc: 'School children & teenagers' },
  { id: '18_60', label: '18 to 60 Years', desc: 'Working adult population' },
  { id: '60_plus', label: '60+ Years', desc: 'Elderly community members' },
];

export const ReportWizard: React.FC<ReportWizardProps> = ({
  locations,
  preselectedVillageId,
  onSuccess,
}) => {
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [locationId, setLocationId] = useState<number>(preselectedVillageId || (locations[0]?.location_id || 1));
  const [gpsCoords, setGpsCoords] = useState<{ lat?: number; lng?: number }>({});
  const [gpsStatus, setGpsStatus] = useState<string>('');

  const [patientAgeGroup, setPatientAgeGroup] = useState('under_5');
  const [affectedCount, setAffectedCount] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['diarrhea']);
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [waterSource, setWaterSource] = useState('tube_well');
  const [onsetDate, setOnsetDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submittedTrackingId, setSubmittedTrackingId] = useState<string | null>(null);
  const [isOfflineQueued, setIsOfflineQueued] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (preselectedVillageId) {
      setLocationId(preselectedVillageId);
    }
  }, [preselectedVillageId]);

  const toggleSymptom = (id: string) => {
    if (selectedSymptoms.includes(id)) {
      if (selectedSymptoms.length > 1) {
        setSelectedSymptoms(selectedSymptoms.filter((s) => s !== id));
      }
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  const handleAutoGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported on this device.');
      return;
    }
    setGpsStatus('Detecting sentinel coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus(`GPS Acquired: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      () => {
        setGpsStatus('Unable to access GPS. Using chosen village reference.');
      }
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');

    const payload = {
      location_id: locationId,
      reporter_type: user && user.role !== 'CIVILIAN' ? 'asha_worker' : 'citizen',
      symptoms: selectedSymptoms,
      patient_age_group: patientAgeGroup,
      severity,
      affected_count: affectedCount,
      water_source: waterSource,
      notes: notes || undefined,
      gps_lat: gpsCoords.lat,
      gps_lng: gpsCoords.lng,
    };

    if (!navigator.onLine) {
      // Offline mode: queue in IndexedDB
      try {
        const queueId = await enqueueReport(payload);
        const offlineTrackingId = `OFFLINE-QUEUE-${queueId}`;
        setIsOfflineQueued(true);
        setSubmittedTrackingId(offlineTrackingId);
        onSuccess?.(offlineTrackingId);
      } catch (err: any) {
        setErrorMsg('Failed to queue offline report in device storage.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    try {
      const res = await submitReport(payload);
      setSubmittedTrackingId(res.tracking_id);
      setIsOfflineQueued(false);
      onSuccess?.(res.tracking_id);
    } catch (err: any) {
      // If network fails during fetch, fallback to IndexedDB
      try {
        const queueId = await enqueueReport(payload);
        const offlineTrackingId = `OFFLINE-QUEUE-${queueId}`;
        setIsOfflineQueued(true);
        setSubmittedTrackingId(offlineTrackingId);
        onSuccess?.(offlineTrackingId);
      } catch {
        setErrorMsg(err.message || 'Error submitting report. Please retry.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Step 4: Confirmation Screen
  if (submittedTrackingId) {
    return (
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 md:p-8 border border-emerald/20 shadow-sentinel-xl max-w-2xl mx-auto text-center animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald/20 text-emerald flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-extrabold text-forest dark:text-pale-green">
          {isOfflineQueued ? 'Report Safely Queued in Offline Storage' : 'Symptom Report Successfully Registered'}
        </h3>

        <div className="my-4 p-3 bg-pale-green/40 dark:bg-forest-light/40 border border-emerald/30 rounded-2xl inline-block">
          <span className="text-xs text-forest/60 dark:text-pale-green/60 uppercase font-bold tracking-wider block">
            Sentinel Tracking Reference ID
          </span>
          <span className="text-lg font-mono font-extrabold text-emerald">
            {submittedTrackingId}
          </span>
        </div>

        {isOfflineQueued ? (
          <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold max-w-md mx-auto">
            You are currently offline in a remote field node. Your report has been saved locally and will auto-sync with the district server as soon as internet connectivity returns.
          </p>
        ) : (
          <p className="text-xs text-forest/70 dark:text-pale-green/70 max-w-md mx-auto">
            Your report has been received by the AERIS dual-engine surveillance pipeline. Risk indicators for this village have been automatically recalculated.
          </p>
        )}

        {/* Triage Safety Warning */}
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl text-left text-xs text-amber-900 dark:text-amber-200">
          <p className="font-extrabold flex items-center gap-1.5 mb-1 text-amber-800 dark:text-amber-300">
            <HeartPulse className="w-4 h-4 text-red-600" />
            Frontline Emergency Triage Guidance
          </p>
          <p className="leading-relaxed">
            AERIS does not provide personal medical diagnosis. If the patient exhibits severe dehydration, sunken eyes, or profuse watery diarrhea:
          </p>
          <ul className="list-disc pl-5 mt-1.5 space-y-0.5 font-medium">
            <li>Administer freshly prepared Oral Rehydration Salts (ORS) solution immediately in clean boiled water.</li>
            <li>Transport patient to the nearest Primary Health Centre (PHC) or call National Ambulance Service (108).</li>
            <li>Notify sentinel ASHA worker for community drinking tube-well testing.</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => {
              setSubmittedTrackingId(null);
              setStep(1);
            }}
            className="px-5 py-2.5 bg-emerald text-white font-bold rounded-xl text-xs hover:bg-emerald-hover transition-all shadow-sentinel-md"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 md:p-8 border border-emerald/20 shadow-sentinel-xl max-w-3xl mx-auto">
      {/* Wizard Progress Stepper */}
      <div className="flex items-center justify-between pb-4 border-b border-forest/10 dark:border-mint/15 mb-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald">
            Step {step} of 4
          </span>
          <h3 className="text-base font-extrabold text-forest dark:text-pale-green">
            {step === 1 && '1. Location & Demographics'}
            {step === 2 && '2. Symptoms & Clinical Severity'}
            {step === 3 && '3. Water Source & Epidemiological Context'}
            {step === 4 && '4. Review & Ground Submission'}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i === step
                  ? 'bg-emerald text-white scale-110 shadow-sentinel-sm'
                  : i < step
                  ? 'bg-soft-mint text-emerald-active font-extrabold'
                  : 'bg-forest/10 dark:bg-forest-light text-forest/40 dark:text-pale-green/40'
              }`}
            >
              {i < step ? '✓' : i}
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Location & Demographics */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-forest dark:text-pale-green mb-1.5">
              Select Sentinel Village
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green font-semibold focus:ring-2 focus:ring-emerald focus:outline-none"
            >
              {locations.filter((l) => l.status === 'active').map((loc) => (
                <option key={loc.location_id} value={loc.location_id}>
                  {loc.name} — {loc.district}, {loc.state} (Pop: {loc.population.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* GPS Auto Detect */}
          <div className="p-3 bg-pale-green/30 dark:bg-forest-light/20 rounded-2xl border border-emerald/20 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-forest dark:text-pale-green flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald" />
                Automatic Sentinel GPS Verification
              </p>
              <p className="text-[11px] text-forest/60 dark:text-pale-green/60 mt-0.5">
                {gpsStatus || 'Capture current device coordinates for anti-fake geo-consistency check.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoGPS}
              className="px-3 py-1.5 bg-emerald/15 hover:bg-emerald/30 text-emerald-active dark:text-mint rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              Detect GPS
            </button>
          </div>

          {/* Demographics & Affected Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-forest dark:text-pale-green mb-1.5">
                Patient Vulnerability Age Group
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AGE_GROUPS.map((ag) => (
                  <button
                    type="button"
                    key={ag.id}
                    onClick={() => setPatientAgeGroup(ag.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      patientAgeGroup === ag.id
                        ? 'bg-soft-mint text-forest border-emerald font-bold shadow-sentinel-sm'
                        : 'bg-pale-green/20 dark:bg-forest-light/20 border-forest/10 dark:border-mint/15 text-forest/80 dark:text-pale-green/80 hover:bg-white'
                    }`}
                  >
                    <span className="text-xs block font-bold leading-tight">{ag.label}</span>
                    <span className="text-[9px] text-forest/60 dark:text-pale-green/60 block mt-0.5">{ag.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest dark:text-pale-green mb-1.5">
                Number of People Affected in Cluster
              </label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 5, 8].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setAffectedCount(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      affectedCount === num
                        ? 'bg-emerald text-white border-emerald shadow-sentinel-sm'
                        : 'bg-pale-green/30 dark:bg-forest-light/30 border-forest/15 dark:border-mint/15 text-forest dark:text-pale-green hover:bg-emerald/10'
                    }`}
                  >
                    {num} {num === 8 ? '+' : ''}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-forest/60 dark:text-pale-green/60 mt-1.5">
                Report cluster count if multiple family or neighboring households share identical symptoms.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 2: Symptoms & Severity */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-forest dark:text-pale-green mb-1.5">
              Select Observed Symptoms (Tap all that apply)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SYMPTOM_OPTIONS.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym.id);
                return (
                  <div
                    key={sym.id}
                    onClick={() => toggleSymptom(sym.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      isSelected
                        ? 'bg-soft-mint text-forest border-emerald shadow-sentinel-sm'
                        : 'bg-pale-green/20 dark:bg-forest-light/20 border-forest/10 dark:border-mint/15 text-forest/80 dark:text-pale-green/80 hover:bg-white'
                    }`}
                  >
                    <span className="text-xl">{sym.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold truncate">{sym.label}</span>
                        {isSelected && <span className="text-emerald font-bold text-xs">✓</span>}
                      </div>
                      <p className="text-[10px] text-forest/70 dark:text-pale-green/70 line-clamp-1 mt-0.5">
                        {sym.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest dark:text-pale-green mb-1.5">
              Clinical Severity Level
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'mild', label: 'Mild', desc: 'Alert, retaining fluids, ambulatory', color: 'border-emerald text-emerald-active' },
                { id: 'moderate', label: 'Moderate', desc: 'Dehydrated, weak, needs oral rehydration', color: 'border-amber-500 text-amber-700' },
                { id: 'severe', label: 'Severe', desc: 'Incapacitated, severe shock, sunken eyes', color: 'border-red-600 text-red-700' },
              ].map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSeverity(s.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    severity === s.id
                      ? `bg-white dark:bg-surface-dark ${s.color} border-2 shadow-sentinel-md font-bold`
                      : 'bg-pale-green/20 dark:bg-forest-light/20 border-forest/10 dark:border-mint/15 text-forest/80 dark:text-pale-green/80 hover:bg-white'
                  }`}
                >
                  <span className="text-xs block font-bold capitalize">{s.label}</span>
                  <span className="text-[10px] text-forest/60 dark:text-pale-green/60 block mt-0.5">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 3: Water Source & Context */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-forest dark:text-pale-green mb-1.5">
              Primary Drinking Water Source Used
            </label>
            <div className="space-y-2">
              {WATER_SOURCES.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => setWaterSource(ws.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    waterSource === ws.id
                      ? 'bg-soft-mint text-forest border-emerald font-bold shadow-sentinel-sm'
                      : 'bg-pale-green/20 dark:bg-forest-light/20 border-forest/10 dark:border-mint/15 text-forest/80 dark:text-pale-green/80 hover:bg-white'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold">{ws.label}</span>
                    <span className="text-[10px] text-forest/60 dark:text-pale-green/60 block">{ws.desc}</span>
                  </div>
                  {waterSource === ws.id && <span className="text-emerald font-bold">✓</span>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest dark:text-pale-green mb-1.5">
              Field Observations & Patient Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Drinking tube-well submerged in flood overflow 2 days ago; 3 neighboring homes reporting diarrhea."
              className="w-full p-3 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-2xl text-xs text-forest dark:text-pale-green placeholder-forest/50 focus:ring-2 focus:ring-emerald focus:outline-none"
            />
          </div>
        </motion.div>
      )}

      {/* STEP 4: Review & Submit */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="bg-pale-green/40 dark:bg-forest-light/30 p-4 rounded-2xl border border-emerald/20 space-y-2 text-xs">
            <div className="flex justify-between border-b border-forest/10 pb-1.5">
              <span className="text-forest/60 dark:text-pale-green/60">Target Village:</span>
              <span className="font-bold">{locations.find((l) => l.location_id === locationId)?.name}</span>
            </div>
            <div className="flex justify-between border-b border-forest/10 pb-1.5">
              <span className="text-forest/60 dark:text-pale-green/60">Patient Group / Count:</span>
              <span className="font-bold">{patientAgeGroup} • {affectedCount} affected</span>
            </div>
            <div className="flex justify-between border-b border-forest/10 pb-1.5">
              <span className="text-forest/60 dark:text-pale-green/60">Symptoms:</span>
              <span className="font-bold">{selectedSymptoms.join(', ')}</span>
            </div>
            <div className="flex justify-between border-b border-forest/10 pb-1.5">
              <span className="text-forest/60 dark:text-pale-green/60">Severity:</span>
              <span className="font-bold uppercase text-amber-600">{severity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-forest/60 dark:text-pale-green/60">Water Source:</span>
              <span className="font-bold">{waterSource}</span>
            </div>
          </div>

          <div className="p-3 bg-forest/5 dark:bg-forest-light/20 rounded-2xl border border-emerald/20 text-[11px] text-forest/70 dark:text-pale-green/70">
            <p className="font-bold text-emerald mb-0.5">🛡️ Automated Anti-Fake & Verification Policy</p>
            <p>
              Your verified identity will be logged with this submission. Reports submitted by citizens enter as <em>unverified</em> until on-ground confirmation by the local sentinel ASHA worker. Duplicate submissions within 12 hours are suppressed.
            </p>
          </div>
        </motion.div>
      )}

      {/* Wizard Footer Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-forest/10 dark:border-mint/15 mt-6">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-forest dark:text-pale-green hover:bg-forest/5 dark:hover:bg-forest-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
        ) : <div />}

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald text-white text-xs font-bold hover:bg-emerald-hover transition-all shadow-sentinel-md"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald text-white text-xs font-bold hover:bg-emerald-hover transition-all shadow-sentinel-lg disabled:opacity-50"
          >
            <FileCheck className="w-4 h-4" />
            <span>{submitting ? 'Transmitting Telemetry...' : 'Submit Sentinel Report'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
