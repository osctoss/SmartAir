import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DoorOpen,
  Shield,
  Home,
  AlertTriangle,
  Volume2,
  Plus,
  Play,
  Activity,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { useCareEventStore } from '@/state/useCareEventStore';
import { selectWorkspaceMetrics } from '@/state/selectors';
import { MetricCard } from '@/components/common/MetricCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { rooms, selectedRoomId, selectRoom, loadDemoWorkspace } = useWorkspaceStore();
  const { events, sharedSirenActive } = useCareEventStore();

  const metrics = selectWorkspaceMetrics(rooms, events, sharedSirenActive);
  const activeRooms = rooms.filter((r) => !r.archivedAt);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <PageHeader
        title="Workspace Overview"
        subtitle="Multi-room control center for comfort, energy and abnormal-load care intelligence."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/rooms/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-cyan-900/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Virtual Room</span>
            </button>
            <button
              onClick={() => {
                const careRoom = activeRooms.find((r) => r.edition === 'smart-care');
                if (careRoom) {
                  selectRoom(careRoom.id);
                  navigate(`/rooms/${careRoom.id}`);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 text-cyan-400" />
              <span>Launch Care Demo</span>
            </button>
          </div>
        }
      />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          label="Total Rooms"
          value={metrics.totalRooms}
          icon={<DoorOpen className="w-5 h-5" />}
        />
        <MetricCard
          label="Smart Home"
          value={metrics.smartHomeRooms}
          subValue="Comfort & Energy"
          icon={<Home className="w-5 h-5 text-cyan-400" />}
          statusVariant="accent"
        />
        <MetricCard
          label="Smart Care"
          value={metrics.smartCareRooms}
          subValue="Abnormal Load & RF"
          icon={<Shield className="w-5 h-5 text-indigo-400" />}
          statusVariant="default"
        />
        <MetricCard
          label="Active Alerts"
          value={metrics.activeAlerts}
          subValue={metrics.unacknowledgedAlerts > 0 ? `${metrics.unacknowledgedAlerts} unacknowledged` : 'None pending'}
          icon={<AlertTriangle className="w-5 h-5" />}
          statusVariant={metrics.activeAlerts > 0 ? 'alarm' : 'success'}
        />
        <MetricCard
          label="Shared Siren"
          value={sharedSirenActive ? 'SOUNDING' : 'READY'}
          icon={<Volume2 className="w-5 h-5" />}
          statusVariant={sharedSirenActive ? 'alarm' : 'default'}
        />
        <MetricCard
          label="System Health"
          value={`${metrics.healthyRooms}/${metrics.totalRooms}`}
          subValue="Nodes Online"
          icon={<Activity className="w-5 h-5" />}
          statusVariant="success"
        />
      </div>

      {/* Empty State when no rooms exist */}
      {activeRooms.length === 0 ? (
        <EmptyState
          title="No Virtual Rooms in Workspace"
          description="Create your first virtual room or restore the demo hostel environment to begin exploring."
          action={
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/rooms/new')}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold shadow-lg"
              >
                Create Room
              </button>
              <button
                onClick={loadDemoWorkspace}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold border border-slate-700"
              >
                Load Demo Workspace
              </button>
            </div>
          }
        />
      ) : (
        /* Room Cards Grid */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-['Outfit'] text-white">Active Virtual Rooms</h2>
            <button
              onClick={() => navigate('/rooms')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>View All Rooms</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeRooms.map((room) => {
              const isSelected = room.id === selectedRoomId;
              const hasActiveAlert = events.some((e) => e.roomId === room.id && e.status === 'active');

              return (
                <div
                  key={room.id}
                  onClick={() => {
                    selectRoom(room.id);
                    navigate(`/rooms/${room.id}`);
                  }}
                  className={`relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-lg group ${
                    isSelected
                      ? 'border-cyan-500/50 bg-[#131b26] ring-1 ring-cyan-500/30'
                      : 'border-slate-800 hover:border-slate-700 bg-[#0e141f] hover:bg-[#131b26]'
                  } ${hasActiveAlert ? 'border-rose-500/60 ring-2 ring-rose-500/20' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            hasActiveAlert
                              ? 'bg-rose-500 animate-ping'
                              : room.edition === 'smart-home'
                              ? 'bg-cyan-400'
                              : 'bg-indigo-400'
                          }`}
                        />
                        <h3 className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {room.name}
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500 font-mono mt-1 block">
                        {room.block || 'Main'} · {room.floor || 'Floor 1'} · ID: {room.id}
                      </span>
                    </div>

                    <StatusBadge
                      status={hasActiveAlert ? 'alarm' : 'ready'}
                      label={hasActiveAlert ? 'Active Event' : 'Online'}
                      size="sm"
                    />
                  </div>

                  <p className="text-xs text-slate-400 mt-3 line-clamp-2">
                    {room.notes || 'Configured SmartAir simulated room environment.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="capitalize font-medium">
                      {room.edition === 'smart-home' ? 'Smart Home (Comfort)' : 'Smart Care (Safety)'}
                    </span>
                    <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold">
                      <span>Enter Simulator</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Alerts Section */}
      {events.length > 0 && (
        <div className="pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-['Outfit'] text-white">Recent Simulated Events</h2>
            <button
              onClick={() => navigate('/admin')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Open Admin Panel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {events.slice(0, 3).map((evt) => (
              <div
                key={evt.id}
                onClick={() => navigate(`/admin/events/${evt.id}`)}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-[#0e141f] hover:bg-[#131b26] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      evt.status === 'active'
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {evt.status === 'active' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Abnormal-load detected ({evt.virtualLoadKg} kg vs {evt.thresholdKg} kg threshold)
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Event ID: {evt.id} · Room: {evt.roomId} · Fan: {evt.deviceId}
                    </div>
                  </div>
                </div>

                <StatusBadge
                  status={evt.status === 'active' ? 'alarm' : 'ready'}
                  label={evt.status}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
