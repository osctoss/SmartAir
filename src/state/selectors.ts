import { Room, CareEvent, Gateway } from '@/domain/types';

export const selectActiveCareEvents = (events: CareEvent[]): CareEvent[] => {
  return events.filter((e) => e.status === 'active');
};

export const selectUnresolvedEvents = (events: CareEvent[]): CareEvent[] => {
  return events.filter((e) => e.status !== 'resolved');
};

export const selectRoomById = (rooms: Room[], roomId: string | null): Room | undefined => {
  if (!roomId) return undefined;
  return rooms.find((r) => r.id === roomId);
};

export const selectActiveRooms = (rooms: Room[]): Room[] => {
  return rooms.filter((r) => !r.archivedAt);
};

export const selectGatewayByRoom = (gateways: Gateway[], room?: Room): Gateway | undefined => {
  if (!room || !room.config.smartCareConfig?.assignedGatewayId) return undefined;
  return gateways.find((g) => g.id === room.config.smartCareConfig?.assignedGatewayId);
};

export const selectRoomsByGateway = (rooms: Room[], gatewayId: string): Room[] => {
  return rooms.filter((r) => r.config.smartCareConfig?.assignedGatewayId === gatewayId && !r.archivedAt);
};

export interface WorkspaceMetrics {
  totalRooms: number;
  smartHomeRooms: number;
  smartCareRooms: number;
  healthyRooms: number;
  activeAlerts: number;
  unacknowledgedAlerts: number;
  sharedSirenSounding: boolean;
}

export const selectWorkspaceMetrics = (
  rooms: Room[],
  events: CareEvent[],
  sharedSirenActive: boolean,
): WorkspaceMetrics => {
  const activeRooms = selectActiveRooms(rooms);
  const smartHomeCount = activeRooms.filter((r) => r.edition === 'smart-home').length;
  const smartCareCount = activeRooms.filter((r) => r.edition === 'smart-care').length;
  const activeEvents = selectActiveCareEvents(events);
  const activeAlertRooms = new Set(activeEvents.map((e) => e.roomId));

  return {
    totalRooms: activeRooms.length,
    smartHomeRooms: smartHomeCount,
    smartCareRooms: smartCareCount,
    healthyRooms: activeRooms.length - activeAlertRooms.size,
    activeAlerts: activeEvents.length,
    unacknowledgedAlerts: activeEvents.filter((e) => !e.acknowledgement).length,
    sharedSirenSounding: sharedSirenActive,
  };
};
