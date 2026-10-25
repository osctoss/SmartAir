import React from 'react';
import { Menu, Home, Shield, BellRing } from 'lucide-react';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { useCareEventStore } from '@/state/useCareEventStore';
import { SimulationBadge } from './SimulationBadge';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const { rooms, selectedRoomId, selectRoom } = useWorkspaceStore();
  const { sharedSirenActive } = useCareEventStore();

  const activeRooms = rooms.filter((r) => !r.archivedAt);
  const currentRoom = activeRooms.find((r) => r.id === selectedRoomId);

  return (
    <header className="h-16 bg-[#0e141f]/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Quick Room Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="room-select" className="text-xs font-medium text-slate-400 hidden sm:inline">
            Active Room:
          </label>
          <select
            id="room-select"
            value={selectedRoomId || ''}
            onChange={(e) => {
              const newId = e.target.value;
              selectRoom(newId);
              navigate(`/rooms/${newId}`);
            }}
            className="bg-[#131b26] border border-slate-700 text-white text-xs sm:text-sm rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-medium cursor-pointer shadow-inner"
          >
            {activeRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.edition === 'smart-home' ? 'Home' : 'Care'})
              </option>
            ))}
          </select>

          {/* Current Room Edition Badge */}
          {currentRoom && (
            <span
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                currentRoom.edition === 'smart-home'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
              }`}
            >
              {currentRoom.edition === 'smart-home' ? (
                <>
                  <Home className="w-3 h-3 text-cyan-400" />
                  <span>Smart Home Edition</span>
                </>
              ) : (
                <>
                  <Shield className="w-3 h-3 text-indigo-400" />
                  <span>Smart Care Edition</span>
                </>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Right Tools: Siren Alert, Simulation Badge, Demo Actions */}
      <div className="flex items-center gap-3">
        {sharedSirenActive && (
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-full animate-bounce shadow-lg shadow-rose-950/50 cursor-pointer"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>BUILDING SIREN ACTIVE</span>
          </button>
        )}

        <SimulationBadge compact />
      </div>
    </header>
  );
};
