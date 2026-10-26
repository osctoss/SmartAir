import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ShieldAlert,
  Sparkles,
  Clock,
  BatteryCharging,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useSimulationClock } from '@/hooks/useSimulationClock';
import { useSimulationStore } from '@/state/useSimulationStore';
import { ScenarioSelectorModal } from './ScenarioSelectorModal';
import { StatusBadge } from '@/components/common/StatusBadge';

export const SimulationToolbar: React.FC = () => {
  const { isRunning, speedMultiplier, togglePlay, setSpeed, advanceOneMinute, reset } =
    useSimulationClock();
  const {
    runState,
    simTimeMs,
    occupancy,
    vacancyTimerRemainingSeconds,
    cumulativeTotalKWh,
    careEventDetected,
    setVirtualLoadState,
  } = useSimulationStore();

  const [presetsOpen, setPresetsOpen] = useState(false);

  const totalSeconds = Math.floor(simTimeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hours = Math.floor(minutes / 60);

  const formattedTime = `${hours.toString().padStart(2, '0')}:${(minutes % 60)
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e141f] p-3 sm:px-4 rounded-2xl border border-slate-800 shadow-xl">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-run-sim"
            onClick={togglePlay}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40 ring-2 ring-amber-500/30'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/40 ring-1 ring-cyan-400/30'
            }`}
            title={isRunning ? 'Pause simulation' : 'Start simulation'}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current animate-pulse" />
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
            id="btn-step-minute"
            onClick={advanceOneMinute}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#131b26] hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="Advance simulated time by 1 minute"
          >
            <FastForward className="w-3.5 h-3.5 text-cyan-400" />
            <span>+1 Min</span>
          </button>

          <button
            id="btn-reset-sim"
            onClick={reset}
            className="p-2 text-slate-400 hover:text-white bg-[#131b26] hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Reset simulation to initial turn-off standby mode"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="btn-presets-modal"
            onClick={() => setPresetsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded-xl text-xs font-semibold border border-cyan-500/30 transition-colors cursor-pointer"
            title="Open scenario presets library"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>

          {careEventDetected && (
            <button
              id="btn-rearm-detector"
              onClick={() => setVirtualLoadState(0, false)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-semibold border border-rose-500/30 transition-colors cursor-pointer"
              title="Remove placed virtual weight and re-arm detector"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Re-arm Detector</span>
            </button>
          )}
        </div>

        {/* Center: Clock, Status & Speed */}
        <div className="flex items-center gap-3">
          {/* Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131b26] border border-slate-700 font-mono text-cyan-300 font-bold text-xs sm:text-sm shadow-inner">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{formattedTime}</span>
          </div>

          {/* Status Badge */}
          <StatusBadge
            status={
              runState === 'running'
                ? 'running'
                : runState === 'paused'
                ? 'warning'
                : 'offline'
            }
            label={
              runState === 'running'
                ? 'Simulating'
                : runState === 'paused'
                ? 'Paused'
                : 'Standby (Off)'
            }
            size="sm"
          />

          {/* Speed Multiplier */}
          <div className="flex items-center gap-1 bg-[#131b26] p-1 rounded-xl border border-slate-700">
            {([1, 5, 20] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeed(spd)}
                className={`px-2.5 py-0.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
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

        {/* Right: Live Telemetry Metrics */}
        <div className="flex items-center gap-3 text-xs font-medium">
          {/* Occupancy Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#131b26] border border-slate-700/60 text-slate-300">
            {occupancy === 'present' ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Occupied</span>
              </>
            ) : (
              <>
                <UserX className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-semibold">
                  Vacant
                  {vacancyTimerRemainingSeconds !== null && (
                    <span className="ml-1 font-mono">({vacancyTimerRemainingSeconds}s)</span>
                  )}
                </span>
              </>
            )}
          </div>

          {/* Modeled Energy Counter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#131b26] border border-slate-700/60 text-slate-300">
            <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 hidden sm:inline">Energy:</span>
            <strong className="font-mono text-cyan-300 text-xs">
              {cumulativeTotalKWh.toFixed(3)} kWh
            </strong>
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
