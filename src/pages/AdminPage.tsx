import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { ActiveEventsTable } from '@/components/admin/ActiveEventsTable';
import { RoomDeviceRegistryTable } from '@/components/admin/RoomDeviceRegistryTable';
import {
  AcknowledgeEventDialog,
  ResolveEventDialog,
} from '@/components/admin/EventActionDialogs';
import { useCareEventStore } from '@/state/useCareEventStore';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { useUiStore } from '@/state/useUiStore';
import { ExportService } from '@/services/export-service';
import { CareEvent } from '@/domain/types';
import {
  AlertTriangle,
  History,
  Layers,
  Activity,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { events, acknowledgeEvent, resolveEvent } = useCareEventStore();
  const { rooms, properties, gateways, storageStatus } = useWorkspaceStore();
  const { activeAdminTab, setActiveAdminTab, addToast } = useUiStore();

  const [selectedEventToAck, setSelectedEventToAck] = useState<CareEvent | null>(null);
  const [selectedEventToResolve, setSelectedEventToResolve] = useState<CareEvent | null>(null);

  const activeEvents = events.filter((e) => e.status !== 'resolved');

  const handleConfirmAck = (operatorLabel: string) => {
    if (selectedEventToAck) {
      acknowledgeEvent(selectedEventToAck.id, operatorLabel, Date.now());
      addToast({
        title: 'Event Acknowledged',
        description: `Logged response by ${operatorLabel}.`,
        type: 'info',
      });
      setSelectedEventToAck(null);
    }
  };

  const handleConfirmResolve = (operatorLabel: string, note: string) => {
    if (selectedEventToResolve) {
      resolveEvent(selectedEventToResolve.id, operatorLabel, Date.now(), note);
      addToast({
        title: 'Incident Resolved',
        description: 'Building siren silenced and audit history closed.',
        type: 'success',
      });
      setSelectedEventToResolve(null);
    }
  };

  const handleExportCsv = () => {
    const csv = ExportService.exportEventsToCsv(events);
    ExportService.downloadFile(csv, `smartair-events-${Date.now()}.csv`, 'text/csv');
    addToast({
      title: 'Events Exported',
      description: 'Downloaded CSV audit record.',
      type: 'success',
    });
  };

  const handleExportJson = () => {
    const json = JSON.stringify(events, null, 2);
    ExportService.downloadFile(json, `smartair-events-${Date.now()}.json`, 'application/json');
    addToast({
      title: 'Events Exported',
      description: 'Downloaded JSON audit record.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Admin Operations Center"
        subtitle="Hostel/PG warden management dashboard for active abnormal-load alarms, room mapping, and incident audits."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>
          </div>
        }
      />

      {/* Admin Tab Navigation */}
      <div className="flex bg-[#0e141f] p-1.5 rounded-2xl border border-slate-800 max-w-2xl">
        <button
          onClick={() => setActiveAdminTab('active-events')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeAdminTab === 'active-events'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Active Incidents</span>
          {activeEvents.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px]">
              {activeEvents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('history')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeAdminTab === 'history'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Event History ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('devices')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeAdminTab === 'devices'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Rooms & Devices</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('health')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeAdminTab === 'health'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Health</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeAdminTab === 'active-events' && (
        <ActiveEventsTable
          events={activeEvents}
          onSelectEvent={(e) => navigate(`/admin/events/${e.id}`)}
          onOpenAcknowledge={setSelectedEventToAck}
          onOpenResolve={setSelectedEventToResolve}
        />
      )}

      {activeAdminTab === 'history' && (
        <ActiveEventsTable
          events={events}
          onSelectEvent={(e) => navigate(`/admin/events/${e.id}`)}
          onOpenAcknowledge={setSelectedEventToAck}
          onOpenResolve={setSelectedEventToResolve}
        />
      )}

      {activeAdminTab === 'devices' && (
        <RoomDeviceRegistryTable
          properties={properties}
          gateways={gateways}
          rooms={rooms}
        />
      )}

      {activeAdminTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 block">Gateway Uptime</span>
            <span className="text-xl font-bold text-emerald-400 font-mono block">100% Online</span>
            <span className="text-xs text-slate-500 block">
              Node: {gateways[0]?.name || 'Gateway-01'} · Heartbeat simulated
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 block">Radio Transport</span>
            <span className="text-xl font-bold text-cyan-400 font-mono block">865/868 MHz</span>
            <span className="text-xs text-slate-500 block">
              Transceiver state: Virtual ISM band active
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e141f] border border-slate-800 space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 block">Persistence Health</span>
            <span className="text-xl font-bold text-white font-mono block">
              {storageStatus.isAvailable ? 'localStorage OK' : 'In-Memory Mode'}
            </span>
            <span className="text-xs text-slate-500 block">
              Schema: v1 · {events.length} events persisted
            </span>
          </div>
        </div>
      )}

      {/* Action Dialogs */}
      <AcknowledgeEventDialog
        isOpen={selectedEventToAck !== null}
        event={selectedEventToAck}
        onConfirm={handleConfirmAck}
        onCancel={() => setSelectedEventToAck(null)}
      />

      <ResolveEventDialog
        isOpen={selectedEventToResolve !== null}
        event={selectedEventToResolve}
        onConfirm={handleConfirmResolve}
        onCancel={() => setSelectedEventToResolve(null)}
      />
    </div>
  );
};
