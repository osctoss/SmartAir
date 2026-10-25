import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { useCareEventStore } from '@/state/useCareEventStore';
import { selectWorkspaceMetrics } from '@/state/selectors';
import { CareEvent } from '@/domain/types';

describe('State Management & Workspace Store (Phase 2)', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().resetWorkspace();
    useCareEventStore.getState().resetCareEvents();
  });

  it('initializes workspace with demo dataset when empty', () => {
    const store = useWorkspaceStore.getState();
    store.initWorkspace();

    const state = useWorkspaceStore.getState();
    expect(state.rooms.length).toBe(3);
    expect(state.gateways.length).toBe(1);
    expect(state.properties.length).toBe(1);
    expect(state.properties[0].name).toBe('SmartAir Demo Hostel');
    expect(state.selectedRoomId).toBe('room-care-a204');
  });

  it('supports duplicating a room with unique IDs', () => {
    const store = useWorkspaceStore.getState();
    store.initWorkspace();

    const duplicated = store.duplicateRoom('room-care-a204');
    expect(duplicated).not.toBeNull();
    expect(duplicated?.name).toContain('(Copy)');
    expect(duplicated?.id).not.toBe('room-care-a204');
    expect(duplicated?.deviceIds[0]).not.toBe('SA-CARE-A204');

    const state = useWorkspaceStore.getState();
    expect(state.rooms.length).toBe(4);
  });

  it('supports soft-deleting / archiving a room', () => {
    const store = useWorkspaceStore.getState();
    store.initWorkspace();

    store.archiveRoom('room-care-b102');
    const state = useWorkspaceStore.getState();
    const archived = state.rooms.find((r) => r.id === 'room-care-b102');
    expect(archived?.archivedAt).toBeDefined();

    const metrics = selectWorkspaceMetrics(state.rooms, [], false);
    expect(metrics.totalRooms).toBe(2); // Only active non-archived rooms
  });

  it('manages care event lifecycle and resolution correctly', () => {
    const careStore = useCareEventStore.getState();
    const mockEvent: CareEvent = {
      id: 'EVT-TEST-1',
      propertyId: 'prop-demo',
      roomId: 'room-care-a204',
      deviceId: 'SA-CARE-A204',
      type: 'abnormal-load',
      status: 'active',
      severityLabel: 'attention',
      virtualLoadKg: 12,
      thresholdKg: 10,
      createdAtSimMs: 1000,
      createdAtIso: new Date().toISOString(),
      stages: [
        { id: 'detection', name: 'Sensor Detection', status: 'success' },
        { id: 'gateway', name: 'Gateway Processing', status: 'pending' },
      ],
      localAlarmStatus: 'skipped',
      radioStatus: 'pending',
      gatewayStatus: 'pending',
      sharedSirenStatus: 'pending',
      simulationOnly: true,
    };

    careStore.recordCareEvent(mockEvent);
    expect(useCareEventStore.getState().events.length).toBe(1);

    // Acknowledge
    careStore.acknowledgeEvent('EVT-TEST-1', 'Demo Warden', 2000);
    let event = useCareEventStore.getState().events[0];
    expect(event.status).toBe('acknowledged');
    expect(event.acknowledgement?.acknowledgedByLabel).toBe('Demo Warden');

    // Resolve
    careStore.resolveEvent('EVT-TEST-1', 'Demo Warden', 3000, 'All clear');
    event = useCareEventStore.getState().events[0];
    expect(event.status).toBe('resolved');
    expect(event.resolution?.note).toBe('All clear');
  });
});
