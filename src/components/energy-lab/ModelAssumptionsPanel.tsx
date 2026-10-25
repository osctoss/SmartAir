import React from 'react';
import { Info, Cpu, Zap, Wind, ShieldAlert } from 'lucide-react';
import { DEFAULT_FAN_POWER_WATTS, DEFAULT_AC_POWER_WATTS } from '@/domain/constants';

export const ModelAssumptionsPanel: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center gap-2">
        <Info className="w-5 h-5 text-cyan-400" />
        <h4 className="text-sm font-bold font-['Outfit'] text-white">Model Assumptions & Parameters</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Fan Power Assumptions */}
        <div className="p-3.5 rounded-xl bg-[#131b26] border border-slate-700/80 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold uppercase tracking-wider">
            <Wind className="w-4 h-4" />
            <span>BLDC Fan Power</span>
          </div>
          <div className="space-y-1 font-mono text-slate-300">
            <div className="flex justify-between">
              <span>Low Speed:</span>
              <span>{DEFAULT_FAN_POWER_WATTS.low} W</span>
            </div>
            <div className="flex justify-between">
              <span>Medium Speed:</span>
              <span>{DEFAULT_FAN_POWER_WATTS.medium} W</span>
            </div>
            <div className="flex justify-between">
              <span>High Speed:</span>
              <span>{DEFAULT_FAN_POWER_WATTS.high} W</span>
            </div>
          </div>
        </div>

        {/* AC Power Assumptions */}
        <div className="p-3.5 rounded-xl bg-[#131b26] border border-slate-700/80 space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-semibold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Inverter AC Power</span>
          </div>
          <div className="space-y-1 font-mono text-slate-300">
            <div className="flex justify-between">
              <span>Compressor Cooling:</span>
              <span>{DEFAULT_AC_POWER_WATTS.cooling} W</span>
            </div>
            <div className="flex justify-between">
              <span>Compressor Resting:</span>
              <span>{DEFAULT_AC_POWER_WATTS.resting} W</span>
            </div>
            <div className="flex justify-between">
              <span>Standby / Off:</span>
              <span>0 W</span>
            </div>
          </div>
        </div>

        {/* Thermodynamic Rules */}
        <div className="p-3.5 rounded-xl bg-[#131b26] border border-slate-700/80 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Physics & Policies</span>
          </div>
          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span>Hysteresis Band:</span>
              <span className="font-mono">±0.5°C</span>
            </div>
            <div className="flex justify-between">
              <span>Heat Transfer Rate:</span>
              <span className="font-mono">0.25 °C/h/°C</span>
            </div>
            <div className="flex justify-between">
              <span>Vacancy Delay:</span>
              <span className="font-mono">60 seconds</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong>Simulated estimate — not measured energy savings:</strong> Both strategies run through identical initial conditions, environmental profiles, and schedules. Real-world validation requires physical revenue-grade metering and controlled climate pilot testbeds.
        </p>
      </div>
    </div>
  );
};
