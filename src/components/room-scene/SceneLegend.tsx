import React from 'react';
import { Fan, Thermometer, Radio, Tv, Droplets, Users } from 'lucide-react';

interface SceneLegendProps {
  fanSpeed: string;
  fanWatts: number;
  coolingState: string;
  indoorTemp: number;
  isCareMode: boolean;
  radioOnline: boolean;
  acInstalled?: boolean;
  coolerInstalled?: boolean;
  coolerEnabled?: boolean;
  occupancyCount?: number;
}

export const SceneLegend: React.FC<SceneLegendProps> = ({
  fanSpeed,
  fanWatts,
  coolingState,
  indoorTemp,
  isCareMode,
  radioOnline,
  acInstalled = true,
  coolerInstalled = false,
  coolerEnabled = false,
  occupancyCount,
}) => {
  return (
    <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
      {/* Occupancy Badge */}
      {occupancyCount !== undefined && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e141f]/80 border border-slate-700/60 backdrop-blur-xs text-[11px] text-slate-300 font-medium">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>Occupancy:</span>
          <strong className="text-white">
            {occupancyCount === 0
              ? 'Vacant'
              : occupancyCount === 1
              ? '1 Person'
              : `${occupancyCount} Persons`}
          </strong>
        </div>
      )}

      {/* Ceiling Fan Badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e141f]/80 border border-slate-700/60 backdrop-blur-xs text-[11px] text-slate-300 font-medium">
        <Fan className="w-3.5 h-3.5 text-cyan-400" />
        <span>Fan:</span>
        <strong className="text-white capitalize">{fanSpeed}</strong>
        <span className="text-slate-500 font-mono">({fanWatts}W)</span>
      </div>

      {/* Wall AC Badge (only when installed) */}
      {acInstalled && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e141f]/80 border border-slate-700/60 backdrop-blur-xs text-[11px] text-slate-300 font-medium">
          <Tv className="w-3.5 h-3.5 text-sky-400" />
          <span>AC:</span>
          <strong className="text-white capitalize">{coolingState}</strong>
        </div>
      )}

      {/* Evaporative Cooler Badge (only when installed) */}
      {coolerInstalled && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e141f]/80 border border-slate-700/60 backdrop-blur-xs text-[11px] text-slate-300 font-medium">
          <Droplets className="w-3.5 h-3.5 text-teal-400" />
          <span>Cooler:</span>
          <strong className="text-white">{coolerEnabled ? 'ON' : 'OFF'}</strong>
        </div>
      )}

      {/* Sensor Badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e141f]/80 border border-slate-700/60 backdrop-blur-xs text-[11px] text-slate-300 font-medium">
        <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
        <span>Room Air:</span>
        <strong className="text-white font-mono">{indoorTemp.toFixed(1)}°C</strong>
      </div>

      {/* Radio Node (Care Mode) */}
      {isCareMode && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e141f]/80 border border-slate-700/60 backdrop-blur-xs text-[11px] text-slate-300 font-medium">
          <Radio className={`w-3.5 h-3.5 ${radioOnline ? 'text-cyan-400' : 'text-rose-400'}`} />
          <span>RF Link:</span>
          <strong className={radioOnline ? 'text-emerald-400' : 'text-rose-400'}>
            {radioOnline ? 'Online' : 'Offline'}
          </strong>
        </div>
      )}
    </div>
  );
};
