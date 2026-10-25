import React, { useState } from 'react';
import { Terminal, Trash2, Filter } from 'lucide-react';
import { useSimulationStore } from '@/state/useSimulationStore';

export const DecisionLog: React.FC = () => {
  const { logs, clearLogs } = useSimulationStore();
  const [severityFilter, setSeverityFilter] = useState<'all' | 'alert' | 'warning' | 'info'>('all');

  const filteredLogs = logs.filter((l) => {
    if (severityFilter === 'all') return true;
    if (severityFilter === 'alert') return l.severity === 'alert';
    if (severityFilter === 'warning') return l.severity === 'warning';
    return l.severity === 'info' || l.severity === 'notice';
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0e141f] flex flex-col h-[280px] overflow-hidden shadow-xl">
      {/* Feed Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-[#131b26]/70">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            System Reasoning & Decision Log
          </h4>
          <span className="text-[11px] font-mono text-slate-500">({logs.length})</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] bg-[#0b0f17] px-2 py-1 rounded-lg border border-slate-700">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as 'all' | 'alert' | 'warning' | 'info')}
              aria-label="Filter decision log by severity"
              className="bg-transparent text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="alert">Alerts Only</option>
              <option value="warning">Warnings Only</option>
              <option value="info">Info / Notices</option>
            </select>
          </div>

          <button
            onClick={clearLogs}
            className="p-1 text-slate-500 hover:text-slate-300 rounded-md transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Log Items */}
      <div className="flex-1 p-3 font-mono text-xs overflow-y-auto space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-600 italic">
            No decision events logged in current run.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const timeSec = Math.floor(log.simTimeMs / 1000);
            const m = Math.floor(timeSec / 60)
              .toString()
              .padStart(2, '0');
            const s = (timeSec % 60).toString().padStart(2, '0');

            const severityStyles = {
              alert: 'text-rose-400 bg-rose-950/20 border-rose-900/40',
              warning: 'text-amber-300 bg-amber-950/20 border-amber-900/40',
              notice: 'text-cyan-300 bg-cyan-950/20 border-cyan-900/40',
              info: 'text-slate-300 bg-slate-900/40 border-slate-800',
            }[log.severity || 'info'];

            return (
              <div
                key={log.id}
                className={`p-2 rounded-lg border flex items-start gap-2.5 transition-colors ${severityStyles}`}
              >
                <span className="text-[10px] text-slate-500 shrink-0 select-none">
                  [{m}:{s}]
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 border border-current opacity-80">
                  {log.type}
                </span>
                <span className="flex-1 leading-relaxed text-[11px]">{log.summary}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
