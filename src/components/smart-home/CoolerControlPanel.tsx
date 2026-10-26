import React from 'react';
import { useSimulationStore } from '@/state/useSimulationStore';
import { Droplets, AlertTriangle, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

export const CoolerControlPanel: React.FC = () => {
  const {
    coolerInstalled,
    coolerEnabled,
    relativeHumidityPct,
    outdoorTempC,
    highHumidityThresholdPct,
    humidityTrend,
    humidityProtectionTriggered,
    setCoolerEnabled,
    setHighHumidityThreshold,
    updateInputs,
  } = useSimulationStore();

  if (!coolerInstalled) return null;

  const outdoorRh = outdoorTempC > 35 ? 35 : 55;

  return (
    <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-4 shadow-xl">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-['Outfit'] text-white">Evaporative Cooler</h4>
            <span className="text-[11px] text-slate-400">Hot-Dry Climate Water Pad Model</span>
          </div>
        </div>

        {/* Cooler Power Toggle */}
        <button
          onClick={() => setCoolerEnabled(!coolerEnabled)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            coolerEnabled
              ? 'bg-teal-500/15 border border-teal-500/40 text-teal-300 shadow-teal-950/40'
              : 'bg-slate-800 border border-slate-700 text-slate-500 hover:text-white'
          }`}
        >
          {coolerEnabled ? 'Cooler ON' : 'Off'}
        </button>
      </div>

      {/* High Humidity Protection Alert Banner */}
      {humidityProtectionTriggered && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">High-Humidity Protection Triggered</strong>
            <span>
              Humidity exceeded {highHumidityThresholdPct}%. Cooler turned OFF and fan switched ON
              to circulate air.
            </span>
          </div>
        </div>
      )}

      {/* Humidity Status Card */}
      <div className="p-3.5 rounded-xl bg-[#131b26] border border-slate-700/80 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
              Simulated Room Humidity
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-bold font-['Outfit'] text-teal-300 font-mono">
                {Math.round(relativeHumidityPct)}%
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                  humidityTrend === 'rising'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : humidityTrend === 'recovering'
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {humidityTrend === 'rising' ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-amber-400" />
                    <span>Rising (Moisture Added)</span>
                  </>
                ) : humidityTrend === 'recovering' ? (
                  <>
                    <TrendingDown className="w-3 h-3 text-cyan-400" />
                    <span>Recovering to Outdoor RH</span>
                  </>
                ) : (
                  <>
                    <Minus className="w-3 h-3 text-slate-400" />
                    <span>Stable</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Outdoor Ambient RH</span>
            <span className="text-xs font-mono font-bold text-slate-300">{outdoorRh}%</span>
          </div>
        </div>

        {/* Manual Humidity Adjustment Slider */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>Manual Humidity Test Slider</span>
            <span className="font-mono text-teal-400">{Math.round(relativeHumidityPct)}%</span>
          </div>
          <input
            type="range"
            min={20}
            max={95}
            step={1}
            value={Math.round(relativeHumidityPct)}
            onChange={(e) => updateInputs({ relativeHumidityPct: parseInt(e.target.value, 10) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg accent-teal-500 cursor-pointer"
          />
        </div>

        {/* Configurable High-Humidity Trigger Threshold Slider */}
        <div className="space-y-1 pt-2 border-t border-slate-700/60">
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>Protection Cutoff Threshold</span>
            <span className="font-mono text-rose-400 font-bold">{highHumidityThresholdPct}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={85}
            step={1}
            value={highHumidityThresholdPct}
            onChange={(e) => setHighHumidityThreshold(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg accent-rose-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Physics note */}
      <div className="flex items-start gap-2 text-[11px] text-slate-500 leading-tight">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          Simplified air-exchange model: fan circulates air but does not dehumidify. When cooler
          is off, room humidity gradually recovers toward outdoor equilibrium.
        </span>
      </div>
    </div>
  );
};
