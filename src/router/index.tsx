import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/app-shell/AppShell';
import { OverviewPage } from '@/pages/OverviewPage';
import { RoomsPage } from '@/pages/RoomsPage';
import { AddRoomPage } from '@/pages/AddRoomPage';
import { RoomSimulatorPage } from '@/pages/RoomSimulatorPage';
import { NetworkPage } from '@/pages/NetworkPage';
import { AdminPage } from '@/pages/AdminPage';
import { EventDetailPage } from '@/pages/EventDetailPage';
import { EnergyLabPage } from '@/pages/EnergyLabPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/overview" replace />,
      },
      {
        path: 'overview',
        element: <OverviewPage />,
      },
      {
        path: 'rooms',
        element: <RoomsPage />,
      },
      {
        path: 'rooms/new',
        element: <AddRoomPage />,
      },
      {
        path: 'rooms/:roomId',
        element: <RoomSimulatorPage />,
      },
      {
        path: 'rooms/:roomId/simulator',
        element: <RoomSimulatorPage />,
      },
      {
        path: 'network',
        element: <NetworkPage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
      },
      {
        path: 'admin/events/:eventId',
        element: <EventDetailPage />,
      },
      {
        path: 'energy-lab',
        element: <EnergyLabPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
