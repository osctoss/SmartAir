import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CareEvent, EventStageStatus } from '@/domain/types';
import { useCareEventStore } from '@/state/useCareEventStore';
import { useSimulationStore } from '@/state/useSimulationStore';
import {
  CheckCircle2,
  AlertOctagon,
  Clock,
  Radio,
  Server,
  Volume2,
  FileText,
  MinusCircle,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

interface EventPipelineProps {
  latestEvent?: CareEvent;
}

export const EventPipeline: React.FC<EventPipelineProps> = ({ latestEvent }) => {
  const navigate = useNavigate();
  const { acknowledgeEvent } = useCareEventStore();
  const { simTimeMs } = useSimulationStore();

  const isAcknowledged = latestEvent?.stages.find((s) => s.id === 'acknowledgement')?.status === 'success';

  const defaultStages = [
    {
      id: 'detection',
      name: 'Sensor Detection',
      status: 'pending',
      desc: 'Ceiling mount load cell sensing',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      id: 'local-alarm',
      name: 'Local Alarm',
      status: 'pending',
      desc: 'In-room buzzer on fan module',
      icon: <Volume2 className="w-4 h-4" />,
    },
    {
      id: 'radio-transmission',
      name: 'Radio Send',
      status: 'pending',
      desc: '868 MHz ISM packet to gateway',
      icon: <Radio className="w-4 h-4" />,
    },
    {
      id: 'gateway-processing',
      name: 'Gateway Lookup',
      status: 'pending',
      desc: 'Registry mapping & relay trip',
      icon: <Server className="w-4 h-4" />,
    },
    {
      id: 'shared-siren',
      name: 'Building Siren',
      status: 'pending',
      desc: 'Shared facility alarm wail',
      icon: <Volume2 className="w-4 h-4" />,
    },
    {
      id: 'acknowledgement',
      name: 'Admin Record',
      status: 'pending',
      desc: 'Human warden acknowledgement',
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  const stages = defaultStages.map((st) => {
    if (!latestEvent) return st;
    const match = latestEvent.stages.find((s) => s.id === st.id);
    return match ? { ...st, status: match.status } : st;
  });

  const getStageColor = (status: EventStageStatus | string) => {
    switch (status) {
      case 'success':
        return 'border-emerald-500 bg-emerald-500/15 text-emerald-400';
      case 'in-progress':
        return 'border-cyan-500 bg-cyan-500/20 text-cyan-300 animate-pulse';
      case 'failed':
        return 'border-rose-500 bg-rose-500/20 text-rose-400';
      case 'skipped':
        return 'border-slate-700 bg-slate-800 text-slate-500';
      default:
        return 'border-slate-800 bg-[#0b0f17] text-slate-600';
    }
  };

  const getStatusIcon = (status: EventStageStatus | string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'failed':
        return <AlertOctagon className="w-3.5 h-3.5" />;
      case 'skipped':
        return <MinusCircle className="w-3.5 h-3.5" />;
      case 'in-progress':
        return <Clock className="w-3.5 h-3.5 animate-spin" />;
      default:
        return <Clock className="w-3.5 h-3.5 opacity-40" />;
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold font-['Outfit'] text-white">Care Event Processing Pipeline</h4>
          <span className="text-xs text-slate-400">
            End-to-end signal propagation: Sensor → Module → Radio → Gateway → Siren → Admin
          </span>
        </div>

        {latestEvent && (
          <div className="flex items-center gap-2">
            {!isAcknowledged && (
              <button
                onClick={() => acknowledgeEvent(latestEvent.id, 'Hostel Warden', simTimeMs)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-all cursor-pointer"
                title="Acknowledge this incident as a facility operator"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Acknowledge</span>
              </button>
            )}
            <button
              onClick={() => navigate(`/events/${latestEvent.id}`)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
              title="Open full incident record in Admin Console"
            >
              <span>{latestEvent.id}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
        {stages.map((st, idx) => (
          <div
            key={st.id}
            className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${getStageColor(
              st.status,
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase opacity-75">
                Stage 0{idx + 1}
              </span>
              {getStatusIcon(st.status)}
            </div>

            <div>
              <span className="text-xs font-bold block leading-snug">{st.name}</span>
              <span className="text-[10px] opacity-75 block truncate mt-0.5" title={st.desc}>
                {st.desc}
              </span>
              <span className="text-[10px] uppercase font-mono font-semibold mt-1.5 block opacity-95">
                {st.id === 'acknowledgement' && st.status === 'pending' && latestEvent
                  ? 'Awaiting Ack'
                  : st.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
