import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCareEventStore } from '@/state/useCareEventStore';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EventTimeline } from '@/components/admin/EventTimeline';
import {
  AcknowledgeEventDialog,
  ResolveEventDialog,
} from '@/components/admin/EventActionDialogs';
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const { events, acknowledgeEvent, resolveEvent } = useCareEventStore();
  const { rooms } = useWorkspaceStore();

  const [isAckOpen, setIsAckOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);

  const event = events.find((e) => e.id === eventId);
  const room = rooms.find((r) => r.id === event?.roomId);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <h2 className="text-xl font-bold font-['Outfit'] text-white">Event Not Found</h2>
        <p className="text-sm text-slate-400 mt-2">
          Event ID "{eventId}" does not exist in the simulation audit registry.
        </p>
        <button
          onClick={() => navigate('/admin')}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Admin Panel</span>
        </button>
      </div>
    );
  }

  const isResolved = event.status === 'resolved';
  const isAcknowledged = !!event.acknowledgement;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <PageHeader
        title={`Incident Record: ${event.id}`}
        subtitle={`Detected at ${new Date(event.createdAtIso).toLocaleString()}`}
        badge={<StatusBadge status={event.status === 'active' ? 'alarm' : event.status} />}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin</span>
            </button>
            {!isAcknowledged && !isResolved && (
              <button
                onClick={() => setIsAckOpen(true)}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Acknowledge</span>
              </button>
            )}
            {!isResolved && (
              <button
                onClick={() => setIsResolveOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Resolve Incident</span>
              </button>
            )}
          </div>
        }
      />

      {/* Prominent Simulated Event Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300 leading-relaxed">
          <strong>SIMULATED EVENT:</strong> This incident was generated in a local browser simulation. No physical devices, LoRa radio transmissions, external SMS, or public emergency services were contacted.
        </p>
      </div>

      {/* Location & Sensor Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0e141f] border border-slate-800">
          <span className="text-[11px] text-slate-500 uppercase font-semibold block">Room Location</span>
          <span className="text-base font-bold text-white mt-1 block">
            {room ? room.name : event.roomId}
          </span>
          <span className="text-xs text-slate-400 font-mono mt-0.5 block">ID: {event.roomId}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e141f] border border-slate-800">
          <span className="text-[11px] text-slate-500 uppercase font-semibold block">Virtual Device</span>
          <span className="text-base font-mono font-bold text-cyan-400 mt-1 block truncate">
            {event.deviceId}
          </span>
          <span className="text-xs text-slate-400 block">Ceiling Fan Module</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e141f] border border-slate-800">
          <span className="text-[11px] text-slate-500 uppercase font-semibold block">Applied Mass</span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-0.5 block">
            {event.virtualLoadKg} kg
          </span>
          <span className="text-xs text-slate-400 block">Threshold: {event.thresholdKg} kg</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e141f] border border-slate-800">
          <span className="text-[11px] text-slate-500 uppercase font-semibold block">Simulated Time</span>
          <span className="text-base font-mono font-bold text-slate-200 mt-1 block">
            +{Math.floor(event.createdAtSimMs / 1000)}s
          </span>
          <span className="text-xs text-slate-500 block">From scenario start</span>
        </div>
      </div>

      {/* Operator Notes Box */}
      {(event.acknowledgement || event.resolution) && (
        <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-3 shadow-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Operator Response Audit
          </h4>

          {event.acknowledgement && (
            <div className="p-3 rounded-xl bg-[#131b26] border border-slate-700/80 text-xs text-slate-300">
              <span className="font-bold text-cyan-400">Acknowledged by:</span>{' '}
              {event.acknowledgement.acknowledgedByLabel} at{' '}
              {new Date(event.acknowledgement.acknowledgedAtIso).toLocaleTimeString()}
            </div>
          )}

          {event.resolution && (
            <div className="p-3 rounded-xl bg-[#131b26] border border-emerald-500/30 text-xs text-slate-300 space-y-1">
              <div>
                <span className="font-bold text-emerald-400">Resolved by:</span>{' '}
                {event.resolution.resolvedByLabel} at{' '}
                {new Date(event.resolution.resolvedAtIso).toLocaleTimeString()}
              </div>
              {event.resolution.note && (
                <div className="text-slate-400 italic">"{event.resolution.note}"</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Vertical Lifecycle Timeline */}
      <div className="p-6 rounded-2xl bg-[#0e141f] border border-slate-800 shadow-xl">
        <EventTimeline event={event} />
      </div>

      {/* Action Dialogs */}
      <AcknowledgeEventDialog
        isOpen={isAckOpen}
        event={event}
        onConfirm={(op) => {
          acknowledgeEvent(event.id, op, Date.now());
          setIsAckOpen(false);
        }}
        onCancel={() => setIsAckOpen(false)}
      />

      <ResolveEventDialog
        isOpen={isResolveOpen}
        event={event}
        onConfirm={(op, note) => {
          resolveEvent(event.id, op, Date.now(), note);
          setIsResolveOpen(false);
        }}
        onCancel={() => setIsResolveOpen(false)}
      />
    </div>
  );
};
