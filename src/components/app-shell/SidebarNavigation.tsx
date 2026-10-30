import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  DoorOpen,
  Eye,
  Radio,
  ShieldCheck,
  Zap,
  Settings,
  X,
} from 'lucide-react';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { useCareEventStore } from '@/state/useCareEventStore';
import { selectActiveCareEvents } from '@/state/selectors';

interface SidebarNavigationProps {
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  isOpenOnMobile,
  onCloseMobile,
}) => {
  const { selectedRoomId, rooms } = useWorkspaceStore();
  const { events } = useCareEventStore();
  const activeEvents = selectActiveCareEvents(events);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const simulatorPath = selectedRoomId ? `/rooms/${selectedRoomId}` : '/rooms';

  const navItems = [
    {
      to: '/overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/rooms',
      label: 'Room Registry',
      icon: <DoorOpen className="w-5 h-5 shrink-0" />,
      badge: rooms.filter((r) => !r.archivedAt).length.toString(),
    },
    {
      to: simulatorPath,
      label: 'Room Simulator',
      icon: <Eye className="w-5 h-5 shrink-0" />,
      subtext: selectedRoom ? selectedRoom.name : 'No room selected',
      highlight: true,
    },
    {
      to: '/network',
      label: 'Network & Gateway',
      icon: <Radio className="w-5 h-5 shrink-0" />,
    },
    {
      to: '/admin',
      label: 'Admin Operations',
      icon: <ShieldCheck className="w-5 h-5 shrink-0" />,
      badge: activeEvents.length > 0 ? activeEvents.length.toString() : undefined,
      badgeColor: activeEvents.length > 0 ? 'bg-rose-500 text-white animate-pulse' : undefined,
    },
    {
      to: '/energy-lab',
      label: 'Energy Lab',
      icon: <Zap className="w-5 h-5 shrink-0" />,
      subtext: 'Smart Home Benchmark',
    },
    {
      to: '/settings',
      label: 'Settings & Data',
      icon: <Settings className="w-5 h-5 shrink-0" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenOnMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Persistent Desktop Rail & Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0e141f] border-r border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <NavLink
            to="/overview"
            onClick={onCloseMobile}
            className="flex items-center gap-3 group focus:outline-hidden"
            title="SmartAir Overview Dashboard"
          >
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/30 group-hover:ring-cyan-400 group-hover:scale-105 transition-all shrink-0">
              <img
                src="/assets/icons/SmartAir_logo.svg"
                alt="SmartAir Official Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-lg font-bold font-['Outfit'] tracking-tight text-white block leading-none group-hover:text-cyan-300 transition-colors">
                SmartAir
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-cyan-400 block mt-1">
                Virtual Twin Sim
              </span>
            </div>
          </NavLink>

          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">
                  {item.icon}
                </div>
                <div className="truncate">
                  <div className="truncate">{item.label}</div>
                  {item.subtext && (
                    <div className="text-[11px] text-slate-500 truncate font-normal">
                      {item.subtext}
                    </div>
                  )}
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0b0f17]/40">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Prototype v1.0.0</span>
            <span className="text-emerald-400 font-mono">Offline Ready</span>
          </div>
        </div>
      </aside>
    </>
  );
};
