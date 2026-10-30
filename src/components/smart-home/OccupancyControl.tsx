import React from 'react';
import { UserCheck, UserX, Clock, UserPlus, UserMinus, Users, Sparkles } from 'lucide-react';
import { useSimulationStore } from '@/state/useSimulationStore';

export const OccupancyControl: React.FC = () => {
  const {
    runState,
    occupancyCount,
    vacancyTimerRemainingSeconds,
    acActivationDelayRemainingSeconds,
    acInstalled,
    addPerson,
    removePerson,
  } = useSimulationStore();

  const isOccupied = occupancyCount > 0;
  const isRunning = runState === 'running';

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#0f1726] to-[#0c121e] border border-cyan-500/25 shadow-xl space-y-3.5 transition-all">
      {/* Header with Title and Live Status Indicator */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs shrink-0 transition-colors ${
              isOccupied
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}
          >
            {isOccupied ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
          </div>
          <div className="truncate">
            <h4 className="text-sm font-bold font-['Outfit'] text-white tracking-tight flex items-center gap-1.5 truncate">
              <span>Room Presence</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                PIR / Radar
              </span>
            </h4>
            <span className="text-[11px] text-slate-400 truncate block">
              Triggers BLDC fan & staged cooling logic
            </span>
          </div>
        </div>

        {/* Live Occupant Counter Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors shrink-0 ${
            isOccupied
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-xs'
              : 'bg-slate-800/90 border-slate-700 text-slate-400'
          }`}
        >
          {isOccupied ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ) : (
            <Users className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>
            {occupancyCount === 0
              ? 'Vacant (0)'
              : occupancyCount === 1
                ? '1 person present'
                : `${occupancyCount} persons`}
          </span>
        </span>
      </div>

      {/* Interactive Person Entry Controls */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          id="btn-add-person"
          onClick={addPerson}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white shadow-md shadow-cyan-950/40 border border-cyan-400/30 transition-all cursor-pointer active:scale-98"
          title="Simulate a person entering the room"
        >
          <UserPlus className="w-4 h-4 text-cyan-200" />
          <span>{occupancyCount === 0 ? 'Enter Room' : 'Add Person'}</span>
        </button>

        <button
          id="btn-remove-person"
          disabled={occupancyCount <= 0}
          onClick={removePerson}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs font-bold bg-[#131b26] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
          title="Simulate a person leaving the room"
        >
          <UserMinus className="w-4 h-4 text-slate-400" />
          <span>{occupancyCount <= 1 ? 'Leave Room' : 'Remove Person'}</span>
        </button>
      </div>

      {/* Multi-person Presence Indicator Strip when occupied */}
      {isOccupied && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">
              {!isRunning
                ? occupancyCount === 1
                  ? 'Occupant in room · Simulator paused (click "Run Sim" to start fan)'
                  : `${occupancyCount} occupants present · Simulator paused (click "Run Sim" to start fan)`
                : occupancyCount === 1
                  ? 'Primary occupant active · Fan running'
                  : `${occupancyCount} occupants detected · Continuous airflow`}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {Array.from({ length: Math.min(occupancyCount, 4) }).map((_, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-cyan-400/80 ring-1 ring-cyan-300/40"
                title={`Occupant #${i + 1}`}
              />
            ))}
            {occupancyCount > 4 && (
              <span className="text-[10px] text-cyan-400 font-bold font-mono">
                +{occupancyCount - 4}
              </span>
            )}
          </div>
        </div>
      )}

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
              <Clock className="w-3.5 h-3.5 text-amber-400" />
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
