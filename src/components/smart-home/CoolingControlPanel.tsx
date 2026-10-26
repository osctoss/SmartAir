import React from 'react';
import { Tv, Minus, Plus, Activity, Clock, Sun } from 'lucide-react';
import { useSimulationStore } from '@/state/useSimulationStore';

export const CoolingControlPanel: React.FC = () => {
  const {
    acInstalled,
    coolingEnabled,
    coolingSetpointC,
    compressorState,
    currentCoolingWatts,
    outdoorTempC,
    acActivationDelayRemainingSeconds,
    setCoolingEnabled,
    setCoolingSetpoint,
  } = useSimulationStore();

  if (!acInstalled) return null;

  return (
    <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-['Outfit'] text-white">Air Conditioner</h4>
            <span className="text-[11px] text-slate-400">Wall Inverter AC with Step Cooling</span>
          </div>
        </div>

        {/* AC Power Toggle */}
        <button
          onClick={() => setCoolingEnabled(!coolingEnabled)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            coolingEnabled
              ? 'bg-sky-500/15 border border-sky-500/40 text-sky-300'
              : 'bg-slate-800 border border-slate-700 text-slate-500 hover:text-white'
          }`}
        >
          {coolingEnabled ? 'Power ON' : 'Off'}
        </button>
      </div>

      {/* Target Setpoint Stepper */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#131b26] border border-slate-700/80">
        <div>
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
            Target Cooling Setpoint
          </span>
          <span className="text-2xl font-bold font-['Outfit'] text-white">
            {coolingSetpointC.toFixed(1)}°C
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={!coolingEnabled || coolingSetpointC <= 18}
            onClick={() => setCoolingSetpoint(coolingSetpointC - 0.5)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-600 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            disabled={!coolingEnabled || coolingSetpointC >= 30}
            onClick={() => setCoolingSetpoint(coolingSetpointC + 0.5)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-600 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5-Minute Activation Countdown indicator */}
      {acActivationDelayRemainingSeconds !== null && acActivationDelayRemainingSeconds > 0 && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400 animate-spin" />
            <span>AC Activation Countdown:</span>
          </div>
          <span className="font-mono font-bold">
            {Math.floor(acActivationDelayRemainingSeconds / 60)}m{' '}
            {acActivationDelayRemainingSeconds % 60}s
          </span>
        </div>
      )}

      {/* Environmental Context & Compressor Status */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Outdoor Context Reference:</span>
          </span>
          <span className="font-mono text-amber-300 font-bold">{outdoorTempC.toFixed(1)}°C</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Compressor Activity:</span>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold border ${
                !coolingEnabled
                  ? 'bg-slate-800 border-slate-700 text-slate-500'
                  : compressorState === 'cooling'
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 animate-pulse'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span className="capitalize">{coolingEnabled ? compressorState : 'Off'}</span>
            </span>
            <span className="text-slate-500 font-mono">({currentCoolingWatts}W)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
