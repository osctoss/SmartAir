import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AddRoomPage } from '@/pages/AddRoomPage';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';

describe('Add Room Wizard Component', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().initWorkspace();
  });

  it('renders Step 1: Room Identity and advances on valid input', () => {
    render(
      <MemoryRouter>
        <AddRoomPage />
      </MemoryRouter>,
    );

    // Initial step header
    expect(screen.getByText(/Step 1 — Room Identity/i)).toBeInTheDocument();

    // Fill in room name
    const roomNameInput = screen.getByPlaceholderText(/Room A-205/i);
    fireEvent.change(roomNameInput, { target: { value: 'Room Test-99' } });

    // Also ensure room ID is populated
    const roomIdInput = screen.getByPlaceholderText(/room-a205/i);
    fireEvent.change(roomIdInput, { target: { value: 'room-test-99' } });

    // Click Continue
    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueBtn);

    // Should advance to Step 2: Commercial Edition Selection
    expect(screen.getByText(/Commercial Edition/i)).toBeInTheDocument();
    expect(screen.getByText(/SmartAir Smart Home/i)).toBeInTheDocument();
    expect(screen.getByText(/SmartAir Smart Care/i)).toBeInTheDocument();
  });

  it('allows selecting Smart Care edition and configures threshold', () => {
    render(
      <MemoryRouter>
        <AddRoomPage />
      </MemoryRouter>,
    );

    // Step 1
    const roomNameInput = screen.getByPlaceholderText(/Room A-205/i);
    fireEvent.change(roomNameInput, { target: { value: 'Care Room 101' } });
    const roomIdInput = screen.getByPlaceholderText(/room-a205/i);
    fireEvent.change(roomIdInput, { target: { value: 'care-room-101' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 2: Select Smart Care
    const smartCareCard = screen.getByText(/SmartAir Smart Care/i);
    fireEvent.click(smartCareCard);
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 3: Hardware & Detection Policy
    expect(screen.getByText(/Smart Care Safety & Radio Link Routing/i)).toBeInTheDocument();
  });
});
