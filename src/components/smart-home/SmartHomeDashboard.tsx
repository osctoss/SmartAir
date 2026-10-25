import React from 'react';
import { FanControlPanel } from './FanControlPanel';
import { CoolingControlPanel } from './CoolingControlPanel';
import { OccupancyControl } from './OccupancyControl';
import { ComfortScoreCard } from './ComfortScoreCard';
import { EnergyMetricCards } from './EnergyMetricCards';
import { Thermometer, Sun, Droplets } from 'lucide-react';
import { useSimulationStore } from '@/state/useSimulationStore';

export const SmartHomeDashboard: React.FC = () => {
  const { indoorTempC, outdoorTempC, relativeHumidityPct, updateInputs } = useSimulationStore();

  return (
    <div className="space-y-5">
      {/* Environmental Sliders */}
      <div className="p-4 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-3 shadow-xl">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
          Environmental Controls
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Indoor Temp */}
          <div>
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span className="flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                <span>Indoor Air</span>
              </span>
              <span className="font-mono text-cyan-300 font-bold">{indoorTempC.toFixed(1)}°C</span>
            </div>
            <input
              type="range"
              min={18}
              max={42}
              step={0.5}
              value={indoorTempC}
              onChange={(e) => updateInputs({ indoorTempC: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Outdoor Temp */}
          <div>
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span className="flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Outdoor Ambient</span>
              </span>
              <span className="font-mono text-amber-300 font-bold">{outdoorTempC.toFixed(1)}°C</span>
            </div>
            <input
              type="range"
              min={22}
              max={48}
              step={0.5}
              value={outdoorTempC}
              onChange={(e) => updateInputs({ outdoorTempC: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Humidity */}
          <div>
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                <span>Relative Humidity</span>
              </span>
              <span className="font-mono text-sky-300 font-bold">{relativeHumidityPct}%</span>
            </div>
            <input
              type="range"
              min={15}
              max={95}
              step={1}
              value={relativeHumidityPct}
              onChange={(e) => updateInputs({ relativeHumidityPct: parseInt(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Comfort & Energy Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComfortScoreCard />
        <EnergyMetricCards />
      </div>

      {/* Appliance Actuators & Occupancy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FanControlPanel />
        <CoolingControlPanel />
      </div>

      <OccupancyControl />
    </div>
  );
};
