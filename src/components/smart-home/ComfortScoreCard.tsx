import React from 'react';
import { calculateComfortScore } from '@/simulation/smart-home/comfort';
import { useSimulationStore } from '@/state/useSimulationStore';
import { Smile, Info, Wind, Droplets } from 'lucide-react';

export const ComfortScoreCard: React.FC = () => {
  const { indoorTempC, relativeHumidityPct, fanSpeed } = useSimulationStore();
  const breakdown = calculateComfortScore(indoorTempC, relativeHumidityPct, fanSpeed);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 stroke-emerald-500';
    if (score >= 65) return 'text-cyan-400 stroke-cyan-500';
    if (score >= 45) return 'text-amber-400 stroke-amber-500';
    return 'text-rose-400 stroke-rose-500';
  };

  return (
    <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smile className="w-5 h-5 text-cyan-400" />
          <h4 className="text-sm font-bold font-['Outfit'] text-white">Illustrative Comfort Index</h4>
        </div>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-bold border border-current/30 ${getScoreColor(
            breakdown.score,
          )}`}
        >
          {breakdown.ratingLabel}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-4xl font-extrabold font-['Outfit'] tracking-tight text-white">
            {breakdown.score}
            <span className="text-sm text-slate-500 font-normal"> / 100</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Perceived Temp: <strong>{breakdown.operativeTempC}°C</strong>
          </span>
        </div>

        {/* Small Breakdown Badges */}
        <div className="space-y-1.5 text-right text-xs">
          <div className="flex items-center justify-end gap-1.5 text-slate-300">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>Airflow Offset: -{breakdown.fanCoolingOffsetC.toFixed(1)}°C</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-slate-300">
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            <span>Humidity Penalty: {breakdown.humidityPenalty.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>Demonstrative software index. Does not imply certified clinical comfort measurement.</span>
      </div>
    </div>
  );
};
