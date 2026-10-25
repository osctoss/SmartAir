import React from 'react';
import { UserCheck, UserX, Clock } from 'lucide-react';
import { useSimulationStore } from '@/state/useSimulationStore';

export const OccupancyControl: React.FC = () => {
  const { occupancy, vacancyTimerRemainingSeconds, updateInputs } = useSimulationStore();

  const handleToggle = () => {
    const nextOccupancy = occupancy === 'present' ? 'absent' : 'present';
    updateInputs({ occupancy: nextOccupancy });
  };

  return (
    <div className="p-4 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-3 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {occupancy === 'present' ? (
            <UserCheck className="w-5 h-5 text-emerald-400" />
          ) : (
            <UserX className="w-5 h-5 text-amber-400" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Room Occupancy Sensor
          </span>
        </div>

        <button
          onClick={handleToggle}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            occupancy === 'present'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
              : 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
          }`}
        >
          {occupancy === 'present' ? 'Occupied' : 'Vacant'}
        </button>
      </div>

      {/* Vacancy Auto-Off Countdown Warning */}
      {occupancy === 'absent' && vacancyTimerRemainingSeconds !== null && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Vacancy Delay Running</span>
            </span>
            <span className="font-mono font-bold text-sm">{vacancyTimerRemainingSeconds}s</span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${(vacancyTimerRemainingSeconds / 60) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-amber-400/80 leading-tight">
            Fan will automatically shut off when timer reaches zero. Toggle to Occupied to cancel.
          </p>
        </div>
      )}
    </div>
  );
};
