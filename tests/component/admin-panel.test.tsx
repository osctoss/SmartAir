import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminPage } from '@/pages/AdminPage';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { useCareEventStore } from '@/state/useCareEventStore';

describe('AdminPage Component', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().initWorkspace();
    useCareEventStore.getState().resetCareEvents();
  });

  it('renders all four operational tabs in the institutional admin console', () => {
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Active Incidents/i)).toBeInTheDocument();
    expect(screen.getByText(/Event History/i)).toBeInTheDocument();
    expect(screen.getByText(/Rooms & Devices/i)).toBeInTheDocument();
    expect(screen.getByText(/System Health/i)).toBeInTheDocument();
  });

  it('displays empty state when no active incidents exist', () => {
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/No events recorded matching current filter/i)).toBeInTheDocument();
  });

  it('switches to Rooms & Devices tab and displays room and gateway tree', () => {
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    );

    const registryTab = screen.getByText(/Rooms & Devices/i);
    fireEvent.click(registryTab);

    // Should display registered rooms
    expect(screen.getByText(/Room A-204/i)).toBeInTheDocument();
    expect(screen.getByText(/Room B-102/i)).toBeInTheDocument();
    expect(screen.getByText(/Room H-301/i)).toBeInTheDocument();
  });
});
