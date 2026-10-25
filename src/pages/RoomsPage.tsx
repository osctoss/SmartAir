import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Copy,
  Trash2,
  ExternalLink,
  Shield,
  Home,
  LayoutGrid,
  List,
  Layers,
} from 'lucide-react';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { useCareEventStore } from '@/state/useCareEventStore';
import { useUiStore } from '@/state/useUiStore';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PageHeader } from '@/components/common/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';

export const RoomsPage: React.FC = () => {
  const navigate = useNavigate();
  const { rooms, selectedRoomId, selectRoom, duplicateRoom, archiveRoom } = useWorkspaceStore();
  const { events } = useCareEventStore();
  const { addToast } = useUiStore();

  const [search, setSearch] = useState('');
  const [editionFilter, setEditionFilter] = useState<'all' | 'smart-home' | 'smart-care'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [roomToArchive, setRoomToArchive] = useState<string | null>(null);

  const activeRooms = rooms.filter((r) => !r.archivedAt);

  const filteredRooms = activeRooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      (r.block && r.block.toLowerCase().includes(search.toLowerCase())) ||
      (r.floor && r.floor.toLowerCase().includes(search.toLowerCase()));

    const matchesEdition = editionFilter === 'all' || r.edition === editionFilter;
    return matchesSearch && matchesEdition;
  });

  const handleDuplicate = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const dup = duplicateRoom(roomId);
    if (dup) {
      addToast({
        title: 'Room Duplicated',
        description: `Created clone "${dup.name}" with independent device ID.`,
        type: 'success',
      });
    }
  };

  const handleArchiveConfirm = () => {
    if (roomToArchive) {
      archiveRoom(roomToArchive);
      addToast({
        title: 'Room Archived',
        description: 'Room removed from active list. Historical event records remain preserved.',
        type: 'info',
      });
      setRoomToArchive(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Room Registry"
        subtitle="Manage virtual rooms, edition policies, device bindings and simulation states."
        actions={
          <button
            onClick={() => navigate('/rooms/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-cyan-900/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Virtual Room</span>
          </button>
        }
      />

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0e141f] p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by room name, ID, block or floor..."
            className="w-full bg-[#131b26] border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Edition Filter Pills */}
          <div className="flex bg-[#131b26] p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setEditionFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                editionFilter === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({activeRooms.length})
            </button>
            <button
              onClick={() => setEditionFilter('smart-home')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                editionFilter === 'smart-home' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Smart Home
            </button>
            <button
              onClick={() => setEditionFilter('smart-care')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                editionFilter === 'smart-care' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Smart Care
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-[#131b26] p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-700 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-700 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering: Grid vs Table */}
      {filteredRooms.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-6 h-6 text-cyan-400" />}
          title="No Matching Rooms Found"
          description={
            search ? `No rooms match search query "${search}".` : 'No virtual rooms registered in this edition.'
          }
          action={
            <button
              onClick={() => {
                setSearch('');
                setEditionFilter('all');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
            >
              Clear Filters
            </button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            const isSelected = room.id === selectedRoomId;
            const hasActiveAlert = events.some((e) => e.roomId === room.id && e.status === 'active');

            return (
              <div
                key={room.id}
                onClick={() => {
                  selectRoom(room.id);
                  navigate(`/rooms/${room.id}`);
                }}
                className={`relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-lg group flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-500/50 bg-[#131b26] ring-1 ring-cyan-500/30'
                    : 'border-slate-800 hover:border-slate-700 bg-[#0e141f] hover:bg-[#131b26]'
                } ${hasActiveAlert ? 'border-rose-500/60 ring-2 ring-rose-500/20' : ''}`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {room.edition === 'smart-home' ? (
                          <Home className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                        )}
                        <h3 className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {room.name}
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500 font-mono mt-1 block">
                        ID: {room.id}
                      </span>
                    </div>

                    <StatusBadge
                      status={hasActiveAlert ? 'alarm' : 'ready'}
                      label={hasActiveAlert ? 'Incident Active' : 'Normal'}
                      size="sm"
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-[#0b0f17] border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Location</span>
                      <span className="text-slate-300 font-medium truncate block">
                        {room.block || 'Main'} · {room.floor || 'Floor 1'}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0b0f17] border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Fan Device</span>
                      <span className="text-cyan-400 font-mono font-medium truncate block">
                        {room.config.fanDeviceId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDuplicate(room.id, e)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Duplicate Room"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRoomToArchive(room.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Archive Room"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-xs text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Enter Simulator</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0e141f]">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#131b26] text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Room Name & ID</th>
                <th className="py-3.5 px-4">Edition</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Device Binding</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRooms.map((room) => {
                const hasActiveAlert = events.some((e) => e.roomId === room.id && e.status === 'active');
                return (
                  <tr
                    key={room.id}
                    onClick={() => {
                      selectRoom(room.id);
                      navigate(`/rooms/${room.id}`);
                    }}
                    className="hover:bg-[#131b26]/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{room.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{room.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-medium text-xs">
                        {room.edition === 'smart-home' ? 'Smart Home' : 'Smart Care'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {room.block || 'Main'} · {room.floor || 'Floor 1'}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-cyan-400">
                      {room.config.fanDeviceId}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={hasActiveAlert ? 'alarm' : 'ready'}
                        label={hasActiveAlert ? 'Incident Active' : 'Online'}
                        size="sm"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={(e) => handleDuplicate(room.id, e)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                          title="Duplicate Room"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRoomToArchive(room.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                          title="Archive Room"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm Deletion / Archival Dialog */}
      <ConfirmDialog
        isOpen={roomToArchive !== null}
        title="Archive Virtual Room"
        message="Archiving this room will remove it from the active room switcher. To maintain full audit integrity, past emergency events associated with this room ID will remain in the event history labeled as an archived room."
        confirmLabel="Archive Room"
        isDestructive
        onConfirm={handleArchiveConfirm}
        onCancel={() => setRoomToArchive(null)}
      />
    </div>
  );
};
