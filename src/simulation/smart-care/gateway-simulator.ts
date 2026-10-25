import { Room, Gateway, SimulatedRadioPacket } from '@/domain/types';

export interface GatewayProcessingResult {
  isSuccess: boolean;
  resolvedRoom?: Room;
  resolvedGateway?: Gateway;
  failureReason?: 'gateway-offline' | 'unknown-gateway' | 'unmapped-room';
  logSummary: string;
}

/**
 * Deterministic simulated gateway processor.
 * Performs lookup against the room and gateway registries using immutable IDs.
 */
export function processGatewayIngestion(
  packet: SimulatedRadioPacket,
  gateways: Gateway[],
  rooms: Room[],
): GatewayProcessingResult {
  // 1. Check Gateway existence
  const gateway = gateways.find((g) => g.id === packet.destinationGatewayId);
  if (!gateway) {
    return {
      isSuccess: false,
      failureReason: 'unknown-gateway',
      logSummary: `Gateway ingestion rejected: Destination Gateway ID "${packet.destinationGatewayId}" not found in property registry.`,
    };
  }

  // 2. Check Gateway Online Health
  if (gateway.status === 'offline') {
    return {
      isSuccess: false,
      resolvedGateway: gateway,
      failureReason: 'gateway-offline',
      logSummary: `Gateway ingestion failed: Gateway "${gateway.name}" (${gateway.id}) is OFFLINE. Packet dropped.`,
    };
  }

  // 3. Resolve Room from Immutable Room ID
  const room = rooms.find((r) => r.id === packet.sourceRoomId);
  if (!room) {
    return {
      isSuccess: false,
      resolvedGateway: gateway,
      failureReason: 'unmapped-room',
      logSummary: `Gateway lookup warning: Source Room ID "${packet.sourceRoomId}" has no matching active room.`,
    };
  }

  // 4. Ingestion and Resolution Success
  return {
    isSuccess: true,
    resolvedRoom: room,
    resolvedGateway: gateway,
    logSummary: `Gateway "${gateway.name}" verified packet. Resolved location: ${room.name} (${room.block || 'Main'}, ${room.floor || 'Floor 1'}), Device: ${packet.sourceDeviceId}.`,
  };
}
