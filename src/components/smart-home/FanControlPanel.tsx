import React from 'react';
import { FanSpeed } from '@/domain/types';
import { Fan, Volume2, Sparkles } from 'lucide-react';
import { useSimulationStore } from '@/state/useSimulationStore';

export const FanControlPanel: React.FC = () => {
  const { fanSpeed, fanAutoMode, quietMode, setFanSpeed, setFanAutoMode, setQuietMode } =
    useSimulationStore();

  const speeds: FanSpeed[] = ['off', 'low', 'medium', 'high'];

  return (
    <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Fan className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-['Outfit'] text-white">Smart Ceiling Fan</h4>
            <span className="text-[11px] text-slate-400">Atomberg BLDC Digital Model</span>
          </div>
        </div>

        {/* Auto Mode Toggle */}
        <button
          onClick={() => setFanAutoMode(!fanAutoMode)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            fanAutoMode
              ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-cyan-950/40'
              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>{fanAutoMode ? 'Auto Mode Active' : 'Manual'}</span>
        </button>
      </div>

      {/* Speed Buttons */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Fan Speed {fanAutoMode && <span className="text-cyan-400 lowercase">(auto-selected)</span>}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {speeds.map((spd) => {
            const isSelected = fanSpeed === spd;
            return (
              <button
                key={spd}
                disabled={fanAutoMode}
                onClick={() => setFanSpeed(spd)}
                className={`py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-600 to-sky-500 text-white shadow-md shadow-cyan-950/40'
                    : 'bg-[#131b26] hover:bg-slate-800 text-slate-300 border border-slate-700'
                } ${fanAutoMode ? 'cursor-not-allowed opacity-80' : ''}`}
              >
                {spd}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quiet Mode Switch */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className={`w-4 h-4 ${quietMode ? 'text-cyan-400' : 'text-slate-500'}`} />
          <div>
            <span className="text-xs font-semibold text-white block">Quiet Video Call Mode</span>
            <span className="text-[11px] text-slate-400 block">Caps fan speed at Low to eliminate noise</span>
          </div>
        </div>

        <button
          onClick={() => setQuietMode(!quietMode)}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            quietMode ? 'bg-cyan-600' : 'bg-slate-800 border border-slate-700'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
              quietMode ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
