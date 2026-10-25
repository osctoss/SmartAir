import React from 'react';
import { clsx } from 'clsx';
import { Info } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  icon?: React.ReactNode;
  disclaimer?: string;
  statusVariant?: 'default' | 'accent' | 'success' | 'warning' | 'alarm';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subValue,
  icon,
  disclaimer,
  statusVariant = 'default',
  className,
}) => {
  const borderVariants = {
    default: 'border-slate-800 hover:border-slate-700 bg-[#131b26]',
    accent: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300',
    success: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
    warning: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
    alarm: 'border-rose-500/40 bg-rose-950/25 text-rose-300',
  }[statusVariant];

  return (
    <div
      className={clsx(
        'relative rounded-xl border p-4 transition-all duration-200 shadow-lg group',
        borderVariants,
        className,
      )}
    >
      <div className="flex items-center justify-between text-slate-400 mb-1.5">
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        {icon && <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-2xl font-bold font-['Outfit'] tracking-tight text-white">{value}</span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>

      {subValue && <div className="text-xs text-slate-400 mt-1">{subValue}</div>}

      {disclaimer && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1 text-[11px] text-slate-500">
          <Info className="w-3 h-3 shrink-0" />
          <span className="truncate" title={disclaimer}>
            {disclaimer}
          </span>
        </div>
      )}
    </div>
  );
};
