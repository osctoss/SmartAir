import React from 'react';
import { Zap, BatteryCharging, ArrowUpRight } from 'lucide-react';
import { useSimulationStore } from '@/state/useSimulationStore';
import { useNavigate } from 'react-router-dom';

export const EnergyMetricCards: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentFanWatts,
    currentCoolingWatts,
    cumulativeFanKWh,
    cumulativeCoolingKWh,
    cumulativeTotalKWh,
  } = useSimulationStore();

  const totalWatts = currentFanWatts + currentCoolingWatts;

  return (
    <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h4 className="text-sm font-bold font-['Outfit'] text-white">Power & Energy Telemetry</h4>
        </div>

        <button
          onClick={() => navigate('/energy-lab')}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <span>Open Energy Lab</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Instantaneous Power */}
        <div className="p-3 rounded-xl bg-[#131b26] border border-slate-700/80">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Power</span>
          <span className="text-2xl font-bold font-['Outfit'] text-white mt-0.5 block">
            {totalWatts} <span className="text-sm font-normal text-slate-400">W</span>
          </span>
          <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
            <span>Fan: {currentFanWatts}W</span>
            <span>AC: {currentCoolingWatts}W</span>
          </div>
        </div>

        {/* Cumulative Energy */}
        <div className="p-3 rounded-xl bg-[#131b26] border border-slate-700/80">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">Integrated Energy</span>
          <span className="text-2xl font-bold font-['Outfit'] text-cyan-400 mt-0.5 block">
            {cumulativeTotalKWh.toFixed(3)} <span className="text-sm font-normal text-slate-400">kWh</span>
          </span>
          <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
            <span>Fan: {cumulativeFanKWh.toFixed(3)}</span>
            <span>AC: {cumulativeCoolingKWh.toFixed(3)}</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-500">
        <BatteryCharging className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>Modeled estimate (energyKWh = Watts × Hours / 1000). Not measured meter data.</span>
      </div>
    </div>
  );
};
