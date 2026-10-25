import { z } from 'zod';

export const EditionSchema = z.enum(['smart-home', 'smart-care']);
export const RoomStatusSchema = z.enum(['ready', 'running', 'paused', 'faulted', 'offline']);
export const DeviceHealthSchema = z.enum(['ready', 'degraded', 'offline', 'faulted']);
export const FanSpeedSchema = z.enum(['off', 'low', 'medium', 'high']);
export const OccupancyStateSchema = z.enum(['present', 'absent']);
export const ClimateProfileSchema = z.enum(['balanced', 'hot-dry', 'hot-humid']);
export const CoolingTypeSchema = z.enum(['ac', 'evaporative-cooler']);
export const CompressorStateSchema = z.enum(['off', 'cooling', 'resting']);
export const GatewayStatusSchema = z.enum(['online', 'offline']);
export const SirenStatusSchema = z.enum(['ready', 'activating', 'sounding', 'silenced', 'unavailable']);
export const EventStatusSchema = z.enum(['active', 'acknowledged', 'resolved']);
export const EventStageStatusSchema = z.enum(['pending', 'in-progress', 'success', 'failed', 'skipped']);
export const PacketStatusSchema = z.enum(['queued', 'transmitting', 'received', 'failed']);

export const PropertySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Property name is required'),
  createdAt: z.string(),
});

export const FanConfigSchema = z.object({
  speed: FanSpeedSchema,
  autoMode: z.boolean(),
  quietMode: z.boolean(),
  quietSpeedLimit: FanSpeedSchema,
  powerWattsBySpeed: z.object({
    off: z.number().nonnegative(),
    low: z.number().nonnegative(),
    medium: z.number().nonnegative(),
    high: z.number().nonnegative(),
  }),
});

export const CoolingConfigSchema = z.object({
  type: CoolingTypeSchema,
  enabled: z.boolean(),
  setpointC: z.number().min(16).max(35),
  compressorState: CompressorStateSchema,
  powerWattsByState: z.record(z.string(), z.number().nonnegative()),
});

export const SmartCareConfigSchema = z.object({
  illustrativeThresholdKg: z.number().min(1).max(50),
  loadKg: z.number().min(0).max(100),
  loadPlacedOnFan: z.boolean(),
  radioOnline: z.boolean(),
  localAlarmEnabled: z.boolean(),
  localAlarmAvailable: z.boolean(),
  sharedSirenEnabled: z.boolean(),
  assignedGatewayId: z.string().min(1),
});

export const RoomConfigSchema = z.object({
  initialIndoorTempC: z.number().min(-10).max(60),
  outdoorTempC: z.number().min(-10).max(60),
  relativeHumidityPct: z.number().min(0).max(100),
  occupancy: OccupancyStateSchema,
  occupancyCount: z.number().int().nonnegative(),
  climateProfile: ClimateProfileSchema,
  fanDeviceId: z.string().min(1),
  fanConfig: FanConfigSchema,
  coolingConfig: CoolingConfigSchema.optional(),
  smartCareConfig: SmartCareConfigSchema.optional(),
});

export const RoomSchema = z.object({
  id: z.string().min(1, 'Room ID is required'),
  propertyId: z.string().min(1),
  name: z.string().min(1, 'Room name is required'),
  block: z.string().optional(),
  floor: z.string().optional(),
  notes: z.string().optional(),
  edition: EditionSchema,
  deviceIds: z.array(z.string()),
  gatewayId: z.string().optional(),
  config: RoomConfigSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().optional(),
});

export const GatewaySchema = z.object({
  id: z.string().min(1),
  propertyId: z.string().min(1),
  name: z.string().min(1),
  status: GatewayStatusSchema,
  radioAvailable: z.boolean(),
  sharedSirenId: z.string().min(1),
  sharedSirenAvailable: z.boolean(),
  createdAt: z.string(),
});

export const EventStageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  status: EventStageStatusSchema,
  timestampSimMs: z.number().optional(),
  detail: z.string().optional(),
});

export const EventAcknowledgementSchema = z.object({
  acknowledgedAtSimMs: z.number(),
  acknowledgedAtIso: z.string(),
  acknowledgedByLabel: z.string().min(1),
});

export const EventResolutionSchema = z.object({
  resolvedAtSimMs: z.number(),
  resolvedAtIso: z.string(),
  resolvedByLabel: z.string().min(1),
  note: z.string().optional(),
});

export const CareEventSchema = z.object({
  id: z.string().min(1),
  propertyId: z.string().min(1),
  roomId: z.string().min(1),
  deviceId: z.string().min(1),
  gatewayId: z.string().optional(),
  type: z.literal('abnormal-load'),
  status: EventStatusSchema,
  severityLabel: z.literal('attention'),
  virtualLoadKg: z.number(),
  thresholdKg: z.number(),
  createdAtSimMs: z.number(),
  createdAtIso: z.string(),
  stages: z.array(EventStageSchema),
  localAlarmStatus: EventStageStatusSchema,
  radioStatus: EventStageStatusSchema,
  gatewayStatus: EventStageStatusSchema,
  sharedSirenStatus: EventStageStatusSchema,
  acknowledgement: EventAcknowledgementSchema.optional(),
  resolution: EventResolutionSchema.optional(),
  simulationOnly: z.literal(true),
});

export const SimulatedRadioPacketSchema = z.object({
  packetId: z.string().min(1),
  eventId: z.string().min(1),
  sourceDeviceId: z.string().min(1),
  sourceRoomId: z.string().min(1),
  destinationGatewayId: z.string().min(1),
  eventType: z.literal('abnormal-load'),
  createdAtSimMs: z.number(),
  transmittedAtSimMs: z.number().optional(),
  receivedAtSimMs: z.number().optional(),
  status: PacketStatusSchema,
  failureReason: z.enum(['radio-offline', 'gateway-offline', 'unknown-gateway', 'corrupt-packet']).optional(),
  simulatedLatencyMs: z.number(),
});

export const WorkspaceSettingsSchema = z.object({
  defaultSimulationSpeed: z.union([z.literal(1), z.literal(5), z.literal(20)]),
  defaultVacancyDelaySeconds: z.number().positive(),
  defaultSmartCareThresholdKg: z.number().positive(),
  reduceMotion: z.boolean(),
  theme: z.enum(['dark', 'light', 'system']),
});

export const WorkspaceSchema = z.object({
  schemaVersion: z.number().int().positive(),
  properties: z.array(PropertySchema),
  rooms: z.array(RoomSchema),
  gateways: z.array(GatewaySchema),
  events: z.array(CareEventSchema),
  packets: z.array(SimulatedRadioPacketSchema),
  selectedRoomId: z.string().optional(),
  settings: WorkspaceSettingsSchema,
});

/**
 * Validates raw JSON into a typed Workspace and verifies foreign key integrity.
 */
export function validateWorkspace(data: unknown) {
  const parsed = WorkspaceSchema.parse(data);

  // Foreign key cross-validation
  const gatewayIds = new Set(parsed.gateways.map((g) => g.id));
  const propertyIds = new Set(parsed.properties.map((p) => p.id));

  for (const room of parsed.rooms) {
    if (!propertyIds.has(room.propertyId)) {
      throw new Error(`Integrity Error: Room "${room.name}" references non-existent property "${room.propertyId}"`);
    }
    if (room.edition === 'smart-care' && room.config.smartCareConfig) {
      const assignedGw = room.config.smartCareConfig.assignedGatewayId;
      if (assignedGw && !gatewayIds.has(assignedGw)) {
        throw new Error(`Integrity Error: Room "${room.name}" references unmapped gateway "${assignedGw}"`);
      }
    }
  }

  return parsed;
}
