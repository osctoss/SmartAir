import React from 'react';
import { clsx } from 'clsx';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  PowerOff,
  Activity,
  Volume2,
  VolumeX,
} from 'lucide-react';

export type StatusVariant =
  | 'ready'
  | 'running'
  | 'cooling'
  | 'resting'
  | 'warning'
  | 'alarm'
  | 'sounding'
  | 'silenced'
  | 'offline'
  | 'faulted';

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className,
}) => {
  const normStatus = status.toLowerCase() as StatusVariant;

  const config: Record<
    StatusVariant,
    { text: string; bg: string; border: string; textCol: string; icon: React.ReactNode }
  > = {
    ready: {
      text: label || 'Ready',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      textCol: 'text-emerald-400',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    running: {
      text: label || 'Running',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      textCol: 'text-cyan-400',
      icon: <Activity className="w-3.5 h-3.5 animate-pulse" />,
    },
    cooling: {
      text: label || 'Cooling',
      bg: 'bg-sky-500/15',
      border: 'border-sky-500/40',
      textCol: 'text-sky-300',
      icon: <Activity className="w-3.5 h-3.5" />,
    },
    resting: {
      text: label || 'Compressor Resting',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      textCol: 'text-amber-300',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    warning: {
      text: label || 'Warning',
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/40',
      textCol: 'text-amber-400',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    alarm: {
      text: label || 'Alarm Active',
      bg: 'bg-rose-500/20',
      border: 'border-rose-500/50',
      textCol: 'text-rose-400',
      icon: <AlertOctagon className="w-3.5 h-3.5 animate-bounce" />,
    },
    sounding: {
      text: label || 'Siren Sounding',
      bg: 'bg-rose-500/25',
      border: 'border-rose-500/60',
      textCol: 'text-rose-300',
      icon: <Volume2 className="w-3.5 h-3.5 animate-pulse" />,
    },
    silenced: {
      text: label || 'Silenced',
      bg: 'bg-slate-700/30',
      border: 'border-slate-600',
      textCol: 'text-slate-300',
      icon: <VolumeX className="w-3.5 h-3.5" />,
    },
    offline: {
      text: label || 'Offline',
      bg: 'bg-slate-800/40',
      border: 'border-slate-700',
      textCol: 'text-slate-400',
      icon: <PowerOff className="w-3.5 h-3.5" />,
    },
    faulted: {
      text: label || 'Faulted',
      bg: 'bg-rose-950/40',
      border: 'border-rose-800',
      textCol: 'text-rose-400',
      icon: <AlertOctagon className="w-3.5 h-3.5" />,
    },
  };

  const item = config[normStatus] || {
    text: label || status,
    bg: 'bg-slate-800/40',
    border: 'border-slate-700',
    textCol: 'text-slate-300',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border transition-colors shadow-xs',
        item.bg,
        item.border,
        item.textCol,
        sizeClasses,
        className,
      )}
    >
      {item.icon}
      <span>{item.text}</span>
    </span>
  );
};
