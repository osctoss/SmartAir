import React, { useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, ShieldAlert, Sparkles } from 'lucide-react';
import { useSimulationClock } from '@/hooks/useSimulationClock';
import { useSimulationStore } from '@/state/useSimulationStore';
import { ScenarioSelectorModal } from './ScenarioSelectorModal';

export const SimulationToolbar: React.FC = () => {
  const { isRunning, speedMultiplier, togglePlay, setSpeed, advanceOneMinute, reset } =
    useSimulationClock();
  const { careEventDetected, setVirtualLoadState } = useSimulationStore();

  const [presetsOpen, setPresetsOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e141f] p-3 sm:px-4 rounded-2xl border border-slate-800 shadow-xl">
        {/* Play / Step / Reset Group */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/40'
            }`}
            title={isRunning ? 'Pause simulation (Space)' : 'Start simulation (Space)'}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Sim</span>
              </>
            )}
          </button>

          <button
            onClick={advanceOneMinute}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#131b26] hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="Deterministically advance simulated time by 1 minute"
          >
            <FastForward className="w-3.5 h-3.5 text-cyan-400" />
            <span>+1 Min</span>
          </button>

          <button
            onClick={reset}
            className="p-2 text-slate-400 hover:text-white bg-[#131b26] hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Reset scenario run time and telemetry"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setPresetsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded-xl text-xs font-semibold border border-cyan-500/30 transition-colors cursor-pointer"
            title="Open scenario presets library"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>

          {careEventDetected && (
            <button
              onClick={() => setVirtualLoadState(0, false)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-semibold border border-rose-500/30 transition-colors cursor-pointer"
              title="Remove placed virtual weight and re-arm detector"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Re-arm Detector</span>
            </button>
          )}
        </div>

      {/* Speed Multiplier Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:inline">
          Speed:
        </span>
        <div className="flex bg-[#131b26] p-1 rounded-xl border border-slate-700">
          {([1, 5, 20] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => setSpeed(spd)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                speedMultiplier === spd
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {spd}×
            </button>
          ))}
        </div>
      </div>
    </div>

    <ScenarioSelectorModal
      isOpen={presetsOpen}
      onClose={() => setPresetsOpen(false)}
    />
  </>
);
};
