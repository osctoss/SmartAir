import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNavigation } from './SidebarNavigation';
import { TopBar } from './TopBar';
import { ToastViewport } from '@/components/common/ToastViewport';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { useSettingsStore } from '@/state/useSettingsStore';

export const AppShell: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoaded, initWorkspace } = useWorkspaceStore();
  const { reduceMotion } = useSettingsStore();

  useEffect(() => {
    if (!isLoaded) {
      initWorkspace();
    }
  }, [isLoaded, initWorkspace]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('reduce-motion', reduceMotion);
    }
  }, [reduceMotion]);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <SidebarNavigation
        isOpenOnMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Area: Offset for 64px left rail on desktop */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ToastViewport />
    </div>
  );
};
