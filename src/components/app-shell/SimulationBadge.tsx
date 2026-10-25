import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface SimulationBadgeProps {
  compact?: boolean;
}

export const SimulationBadge: React.FC<SimulationBadgeProps> = ({ compact = false }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-500/35 bg-amber-500/10 text-amber-400 font-semibold uppercase tracking-wider shadow-xs ${
        compact ? 'text-[10px]' : 'text-xs'
      }`}
      title="Digital-Twin Simulation Only: No physical fans, sensors, LoRa radio, real sirens, SMS or emergency alerts are connected."
    >
      <ShieldAlert className={compact ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      <span>SIMULATION ONLY</span>
    </div>
  );
};
