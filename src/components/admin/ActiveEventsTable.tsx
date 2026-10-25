import React from 'react';
import { CareEvent } from '@/domain/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ShieldCheck, Check, Eye } from 'lucide-react';

interface ActiveEventsTableProps {
  events: CareEvent[];
  onSelectEvent: (event: CareEvent) => void;
  onOpenAcknowledge: (event: CareEvent) => void;
  onOpenResolve: (event: CareEvent) => void;
}

export const ActiveEventsTable: React.FC<ActiveEventsTableProps> = ({
  events,
  onSelectEvent,
  onOpenAcknowledge,
  onOpenResolve,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0e141f]">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-[#131b26] text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-3 px-4">Event ID</th>
            <th className="py-3 px-4">Location / Room</th>
            <th className="py-3 px-4">Virtual Mass</th>
            <th className="py-3 px-4">Stage Outcomes</th>
            <th className="py-3 px-4">Lifecycle State</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {events.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                No events recorded matching current filter.
              </td>
            </tr>
          ) : (
            events.map((evt) => {
              const isAcknowledged = !!evt.acknowledgement;
              const isResolved = evt.status === 'resolved';

              return (
                <tr
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="hover:bg-[#131b26]/70 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                    {evt.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{evt.roomId}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Device: {evt.deviceId}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-amber-400 font-bold">{evt.virtualLoadKg} kg</span>
                    <span className="text-slate-500 text-[10px] block">
                      Threshold: {evt.thresholdKg} kg
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          evt.radioStatus === 'success'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : evt.radioStatus === 'failed'
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                        title="Radio Send"
                      >
                        RF:{evt.radioStatus}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          evt.gatewayStatus === 'success'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : evt.gatewayStatus === 'failed'
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                        title="Gateway Reception"
                      >
                        GW:{evt.gatewayStatus}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          evt.sharedSirenStatus === 'success'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : evt.sharedSirenStatus === 'failed'
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                        title="Siren Output"
                      >
                        SIREN:{evt.sharedSirenStatus}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge
                      status={evt.status === 'active' ? 'alarm' : evt.status === 'acknowledged' ? 'warning' : 'ready'}
                      label={evt.status}
                      size="sm"
                    />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {!isAcknowledged && !isResolved && (
                        <button
                          onClick={() => onOpenAcknowledge(evt)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Acknowledge</span>
                        </button>
                      )}

                      {!isResolved && (
                        <button
                          onClick={() => onOpenResolve(evt)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Resolve</span>
                        </button>
                      )}

                      <button
                        onClick={() => onSelectEvent(evt)}
                        className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
                        title="Inspect Incident"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
