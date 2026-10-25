import React from 'react';
import { Weight, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useSimulationStore } from '@/state/useSimulationStore';

interface SmartCareLoadControlsProps {
  thresholdKg?: number;
  onUpdateThreshold?: (kg: number) => void;
}

export const SmartCareLoadControls: React.FC<SmartCareLoadControlsProps> = ({
  thresholdKg = 10,
  onUpdateThreshold,
}) => {
  const { loadKg, loadPlacedOnFan, careEventDetected, setVirtualLoadState } =
    useSimulationStore();

  const handleWeightChange = (newWeight: number) => {
    setVirtualLoadState(newWeight, loadPlacedOnFan);
  };

  const handleTogglePlacement = () => {
    if (loadPlacedOnFan) {
      setVirtualLoadState(loadKg, false);
    } else {
      const activeWeight = loadKg > 0 ? loadKg : 12;
      setVirtualLoadState(activeWeight, true);
    }
  };

  const isOverThreshold = loadPlacedOnFan && loadKg > thresholdKg;

  return (
    <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Weight className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-['Outfit'] text-white">Virtual Load Generator</h4>
            <span className="text-[11px] text-slate-400">Ceiling Mount Sensor Test Fixture</span>
          </div>
        </div>

        {/* Status Pill */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            isOverThreshold
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse'
              : loadPlacedOnFan
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          {isOverThreshold ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Above Threshold</span>
            </>
          ) : loadPlacedOnFan ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Below Threshold</span>
            </>
          ) : (
            <span>No Load Placed</span>
          )}
        </span>
      </div>

      {/* Mass Slider & Stepper */}
      <div className="space-y-2 p-3.5 rounded-xl bg-[#131b26] border border-slate-700/80">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider">
            Virtual Weight Applied
          </span>
          <span className="text-lg font-bold font-mono text-cyan-300">{loadKg} kg</span>
        </div>

        <input
          type="range"
          min={0}
          max={30}
          step={0.5}
          value={loadKg}
          onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
          className="w-full accent-cyan-500 cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0 kg (Clean Fan)</span>
          <span className="text-amber-400 font-bold">{thresholdKg} kg (Trigger Point)</span>
          <span>30 kg</span>
        </div>
      </div>

      {/* Threshold Slider (if editable) */}
      {onUpdateThreshold && (
        <div className="space-y-1.5 px-3 py-2.5 rounded-xl bg-[#0b0f17] border border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Illustrative Event Threshold:</span>
            <span className="font-mono text-amber-400 font-bold">{thresholdKg} kg</span>
          </div>
          <input
            type="range"
            min={4}
            max={25}
            step={0.5}
            value={thresholdKg}
            onChange={(e) => onUpdateThreshold(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleTogglePlacement}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
            loadPlacedOnFan
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/40'
          }`}
        >
          {loadPlacedOnFan ? 'Remove Weight from Fan' : 'Place Weight on Fan'}
        </button>

        {careEventDetected && (
          <button
            onClick={() => setVirtualLoadState(0, false)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            Clear / Re-arm
          </button>
        )}
      </div>

      {/* Safety Notice Banner */}
      <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-500">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <p>
          Virtual simulation only. Crossing threshold tests the software radio pipeline; it does not determine intent or confirm emergencies. Never hang weights from real fans.
        </p>
      </div>
    </div>
  );
};
