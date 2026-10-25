import React from 'react';
import { CareEvent } from '@/domain/types';
import { CheckCircle2, AlertOctagon, Clock, MinusCircle } from 'lucide-react';

interface EventTimelineProps {
  event: CareEvent;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ event }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
        Incident Lifecycle Timeline
      </h4>

      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {event.stages.map((st) => {
          const isSuccess = st.status === 'success';
          const isFailed = st.status === 'failed';
          const isSkipped = st.status === 'skipped';
          const isInProgress = st.status === 'in-progress';

          const iconColor = isSuccess
            ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500'
            : isFailed
            ? 'text-rose-400 bg-rose-950/60 border-rose-500'
            : isSkipped
            ? 'text-slate-500 bg-slate-900 border-slate-700'
            : isInProgress
            ? 'text-cyan-400 bg-cyan-950/60 border-cyan-500 animate-pulse'
            : 'text-slate-600 bg-slate-950 border-slate-800';

          return (
            <div key={st.id} className="relative group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center text-xs transition-colors ${iconColor}`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : isFailed ? (
                  <AlertOctagon className="w-3 h-3" />
                ) : isSkipped ? (
                  <MinusCircle className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#131b26] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{st.name}</span>
                  <span
                    className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                      isSuccess
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : isFailed
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {st.status}
                  </span>
                </div>

                {st.detail && <p className="text-xs text-slate-400">{st.detail}</p>}

                {st.timestampSimMs !== undefined && (
                  <span className="text-[10px] text-slate-500 font-mono block pt-1">
                    Simulated Time: +{Math.floor(st.timestampSimMs / 1000)}s
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
