import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { AlertTriangle, Sparkles, CheckCircle2, Flame, RefreshCw } from 'lucide-react';
import { LocationItem } from '../../types';
import { simulateOutbreak } from '../../services/api';

interface OutbreakSimulatorModalProps {
  locations: LocationItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OutbreakSimulatorModal: React.FC<OutbreakSimulatorModalProps> = ({
  locations,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedVillageId, setSelectedVillageId] = useState<number>(locations[0]?.location_id || 1);
  const [surgeCases, setSurgeCases] = useState<number>(20);
  const [wqiDrop, setWqiDrop] = useState<number>(32.0);
  const [rainfallSurge, setRainfallSurge] = useState<number>(480.0);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await simulateOutbreak(selectedVillageId, surgeCases, wqiDrop, rainfallSurge);
      setResult(res);
      // Trigger festive celebration / alert confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      onSuccess?.();
    } catch (err: any) {
      setErrorMsg(err.message || 'Simulation failed. Ensure you are signed in with an official admin account.');
    } finally {
      setLoading(false);
    }
  };

  const selectedLoc = locations.find((l) => l.location_id === selectedVillageId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-emerald/30 shadow-sentinel-xl max-w-lg w-full">
        <div className="flex items-center justify-between pb-3 border-b border-forest/10 dark:border-mint/15 mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-600 animate-pulse" />
            <h3 className="text-base font-extrabold text-forest dark:text-pale-green">
              Outbreak Simulation Sandbox
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-forest/40 dark:text-pale-green/40 hover:text-forest p-1"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-forest/70 dark:text-pale-green/70 mb-4 leading-relaxed">
          Inject sudden water-borne case surges and microbial contamination into any sentinel village to observe real-time dual-engine risk elevation, map pulse, and automated alert triggering.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {result ? (
          <div className="p-4 bg-emerald-subtle dark:bg-forest-light/40 border border-emerald/30 rounded-2xl text-center space-y-3 animate-in zoom-in-95">
            <CheckCircle2 className="w-10 h-10 text-emerald mx-auto" />
            <h4 className="text-sm font-extrabold text-forest dark:text-pale-green">
              Simulation Successfully Injected!
            </h4>
            <div className="text-xs space-y-1 text-forest/80 dark:text-pale-green/80">
              <p>Village: <strong>{result.location_name}</strong></p>
              <p>Risk Elevated: <strong className="text-red-600 uppercase">{result.previous_risk_level} → {result.new_risk_level}</strong></p>
              <p>AI Outbreak Probability: <strong className="text-emerald">{Math.round(result.new_ml_probability * 100)}%</strong></p>
              <p>Emergency Alert Triggered: <strong>{result.alert_triggered ? 'YES (Active Alert #' + result.alert_id + ')' : 'No'}</strong></p>
            </div>
            <button
              onClick={() => { setResult(null); onClose(); }}
              className="mt-2 px-5 py-2 bg-emerald text-white text-xs font-bold rounded-xl hover:bg-emerald-hover transition-colors"
            >
              Done • Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-forest dark:text-pale-green mb-1">
                Select Target Village for Outbreak Simulation
              </label>
              <select
                value={selectedVillageId}
                onChange={(e) => setSelectedVillageId(parseInt(e.target.value, 10))}
                className="w-full p-2.5 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green font-semibold focus:ring-2 focus:ring-emerald focus:outline-none"
              >
                {locations.filter((l) => l.status === 'active').map((l) => (
                  <option key={l.location_id} value={l.location_id}>
                    {l.name} ({l.district}, {l.state}) — Current: {l.current_risk_level.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-forest dark:text-pale-green mb-1">
                  Surge Diarrhea Cases
                </label>
                <input
                  type="number"
                  min="10"
                  max="50"
                  value={surgeCases}
                  onChange={(e) => setSurgeCases(parseInt(e.target.value, 10))}
                  className="w-full p-2 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs font-bold text-forest dark:text-pale-green"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-forest dark:text-pale-green mb-1">
                  Target Contaminated WQI
                </label>
                <input
                  type="number"
                  min="15"
                  max="45"
                  value={wqiDrop}
                  onChange={(e) => setWqiDrop(parseFloat(e.target.value))}
                  className="w-full p-2 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs font-bold text-red-600"
                />
              </div>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl text-[11px] text-red-800 dark:text-red-300">
              ⚡ This will inject {surgeCases} acute watery diarrhea reports into {selectedLoc?.name || 'village'}, degrade WQI to {wqiDrop}, and trigger immediate high-priority emergency alerts.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-forest dark:text-pale-green hover:bg-forest/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSimulate}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sentinel-md flex items-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Flame className="w-3.5 h-3.5" />}
                <span>{loading ? 'Simulating Surge...' : 'Inject Outbreak Surge'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
