import React from 'react';
import { Clock, BatteryCharging, UserCheck, UserX } from 'lucide-react';
import { useSimulationStore } from '@/state/useSimulationStore';
import { StatusBadge } from '@/components/common/StatusBadge';

export const SimulationTimeline: React.FC = () => {
  const {
    simTimeMs,
    runState,
    occupancy,
    vacancyTimerRemainingSeconds,
    cumulativeTotalKWh,
  } = useSimulationStore();

  const totalSeconds = Math.floor(simTimeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hours = Math.floor(minutes / 60);

  const formattedTime = `${hours.toString().padStart(2, '0')}:${(minutes % 60)
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#0e141f] border border-slate-800">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131b26] border border-slate-700 font-mono text-cyan-300 font-bold text-sm">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Sim Time: {formattedTime}</span>
        </div>

        <StatusBadge
          status={runState === 'running' ? 'running' : 'ready'}
          label={runState === 'running' ? 'Simulating' : 'Paused'}
          size="sm"
        />
      </div>

      <div className="flex items-center gap-4 text-xs font-medium">
        {/* Occupancy Indicator */}
        <div className="flex items-center gap-1.5 text-slate-300">
          {occupancy === 'present' ? (
            <>
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Room Occupied</span>
            </>
          ) : (
            <>
              <UserX className="w-4 h-4 text-amber-400" />
              <span>
                Room Vacant
                {vacancyTimerRemainingSeconds !== null && (
                  <strong className="text-amber-300 font-mono ml-1">
                    (Auto-off in {vacancyTimerRemainingSeconds}s)
                  </strong>
                )}
              </span>
            </>
          )}
        </div>

        {/* Energy Integration Counter */}
        <div className="flex items-center gap-1.5 text-slate-300 border-l border-slate-800 pl-4">
          <BatteryCharging className="w-4 h-4 text-cyan-400" />
          <span>Modeled Energy:</span>
          <strong className="font-mono text-white text-xs">{cumulativeTotalKWh.toFixed(3)} kWh</strong>
        </div>
      </div>
    </div>
  );
};
