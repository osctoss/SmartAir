import React from 'react';
import { UserCheck, UserX, Clock, UserPlus, UserMinus, Users } from 'lucide-react';
import { useSimulationStore } from '@/state/useSimulationStore';

export const OccupancyControl: React.FC = () => {
  const {
    occupancyCount,
    vacancyTimerRemainingSeconds,
    acActivationDelayRemainingSeconds,
    acInstalled,
    addPerson,
    removePerson,
  } = useSimulationStore();

  const isOccupied = occupancyCount > 0;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isOccupied
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {isOccupied ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-sm font-bold font-['Outfit'] text-white">
              Occupancy Detection & Presence
            </h4>
            <span className="text-[11px] text-slate-400">
              PIR & Millimeter Wave Sensor Coordination
            </span>
          </div>
        </div>

        {/* Occupant Counter Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
            isOccupied
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>
            {occupancyCount === 1 ? '1 person present' : `${occupancyCount} persons present`}
          </span>
        </span>
      </div>

      {/* Interactive Person Entry Controls */}
      <div className="grid grid-cols-2 gap-3">
        <button
          id="btn-add-person"
          onClick={addPerson}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/40 border border-cyan-400/30 transition-all cursor-pointer active:scale-98"
        >
          <UserPlus className="w-4 h-4" />
          <span>{occupancyCount === 0 ? 'Enter Room' : 'Add Person'}</span>
        </button>

        <button
          id="btn-remove-person"
          disabled={occupancyCount <= 0}
          onClick={removePerson}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#131b26] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
        >
          <UserMinus className="w-4 h-4" />
          <span>{occupancyCount === 1 ? 'Leave Room' : 'Remove Person'}</span>
        </button>
      </div>

      {/* AC 5-Minute Activation Delay Badge */}
      {isOccupied && acInstalled && acActivationDelayRemainingSeconds !== null && (
        <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Automatic AC Activation Delay</span>
            </span>
            <span className="font-mono font-bold text-sm">
              {Math.floor(acActivationDelayRemainingSeconds / 60)}m{' '}
              {acActivationDelayRemainingSeconds % 60}s
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-sky-400 h-full transition-all duration-300"
              style={{
                width: `${((300 - acActivationDelayRemainingSeconds) / 300) * 100}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-sky-300/80 leading-tight">
            Fan is running. AC compressor will evaluate outdoor temperature and room setpoint when
            timer finishes.
          </p>
        </div>
      )}

      {/* Vacancy Auto-Off Countdown Warning */}
      {!isOccupied && vacancyTimerRemainingSeconds !== null && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Vacancy Countdown Active</span>
            </span>
            <span className="font-mono font-bold text-sm">{vacancyTimerRemainingSeconds}s remaining</span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${(vacancyTimerRemainingSeconds / 20) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-amber-400/80 leading-tight">
            AC turned OFF. Fan reduced to LOW RPM. Fan will automatically shut off after 20s of
            continuous vacancy. Click "Enter Room" to cancel.
          </p>
        </div>
      )}
    </div>
  );
};
