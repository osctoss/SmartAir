import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RoomSimulatorPage } from '@/pages/RoomSimulatorPage';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';

describe('RoomSimulatorPage Component', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().initWorkspace();
  });

  it('renders Smart Care controls for Room A-204 (Smart Care edition)', () => {
    render(
      <MemoryRouter initialEntries={['/rooms/room-care-a204']}>
        <Routes>
          <Route path="/rooms/:roomId" element={<RoomSimulatorPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Verify Smart Care headers and elements
    expect(screen.getByText(/Smart Care Edition/i)).toBeInTheDocument();
    expect(screen.getByText(/Virtual Load Generator/i)).toBeInTheDocument();
    expect(screen.getByText(/Radio & Siren Network Path/i)).toBeInTheDocument();
    expect(screen.getByText(/Shared Siren/i)).toBeInTheDocument();
  });

  it('renders Smart Home controls for Room H-301 (Smart Home edition)', () => {
    render(
      <MemoryRouter initialEntries={['/rooms/room-home-h301']}>
        <Routes>
          <Route path="/rooms/:roomId" element={<RoomSimulatorPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Verify Smart Home headers and comfort controls
    expect(screen.getByText(/Smart Home Edition/i)).toBeInTheDocument();
    expect(screen.getByText(/Environmental Controls/i)).toBeInTheDocument();
    expect(screen.getByText(/Illustrative Comfort Index/i)).toBeInTheDocument();
    expect(screen.getByText(/Air Conditioner/i)).toBeInTheDocument();
  });
});
