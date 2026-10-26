import React from 'react';
import { Thermometer, Sun, Droplets } from 'lucide-react';
import { useSimulationStore } from '@/state/useSimulationStore';

export const EnvironmentalControlsCard: React.FC = () => {
  const { indoorTempC, outdoorTempC, relativeHumidityPct, updateInputs } = useSimulationStore();

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
          Environmental Controls
        </h4>
        <span className="text-[11px] text-slate-500 font-mono">Live Inputs</span>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Indoor Temp */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              <span>Indoor Air Temp</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold text-sm">
              {indoorTempC.toFixed(1)}°C
            </span>
          </div>
          <input
            type="range"
            min={18}
            max={42}
            step={0.5}
            value={indoorTempC}
            onChange={(e) => updateInputs({ indoorTempC: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg accent-cyan-500 cursor-pointer"
          />
        </div>

        {/* Outdoor Temp */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Outdoor Ambient</span>
            </span>
            <span className="font-mono text-amber-300 font-bold text-sm">
              {outdoorTempC.toFixed(1)}°C
            </span>
          </div>
          <input
            type="range"
            min={22}
            max={48}
            step={0.5}
            value={outdoorTempC}
            onChange={(e) => updateInputs({ outdoorTempC: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Relative Humidity */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-400" />
              <span>Relative Humidity</span>
            </span>
            <span className="font-mono text-sky-300 font-bold text-sm">
              {Math.round(relativeHumidityPct)}%
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={95}
            step={1}
            value={Math.round(relativeHumidityPct)}
            onChange={(e) => updateInputs({ relativeHumidityPct: parseInt(e.target.value, 10) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg accent-sky-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
