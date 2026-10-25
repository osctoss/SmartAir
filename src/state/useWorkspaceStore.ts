import { create } from 'zustand';
import { Workspace, Room, Gateway, Property } from '@/domain/types';
import { PersistenceService, StorageStatus } from '@/services/persistence-service';
import { createDemoWorkspace } from '@/services/demo-seed-service';
import { generateRoomId, generateDeviceId } from '@/domain/ids';

interface WorkspaceState {
  properties: Property[];
  gateways: Gateway[];
  rooms: Room[];
  selectedRoomId: string | null;
  isLoaded: boolean;
  storageStatus: StorageStatus;

  // Actions
  initWorkspace: () => void;
  selectRoom: (roomId: string) => void;
  createRoom: (room: Room) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  archiveRoom: (roomId: string) => void;
  duplicateRoom: (roomId: string) => Room | null;
  createGateway: (gateway: Gateway) => void;
  updateGateway: (gatewayId: string, updates: Partial<Gateway>) => void;
  loadDemoWorkspace: () => void;
  resetWorkspace: () => void;
  importWorkspace: (workspace: Workspace) => void;
  getWorkspaceSnapshot: () => Workspace;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  properties: [],
  gateways: [],
  rooms: [],
  selectedRoomId: null,
  isLoaded: false,
  storageStatus: PersistenceService.getStorageStatus(),

  initWorkspace: () => {
    let ws = PersistenceService.loadWorkspace();
    if (!ws || ws.rooms.length === 0) {
      ws = createDemoWorkspace();
      PersistenceService.saveWorkspace(ws);
    }
    set({
      properties: ws.properties,
      gateways: ws.gateways,
      rooms: ws.rooms,
      selectedRoomId: ws.selectedRoomId || ws.rooms[0]?.id || null,
      isLoaded: true,
      storageStatus: PersistenceService.getStorageStatus(),
    });
  },

  selectRoom: (roomId: string) => {
    set({ selectedRoomId: roomId });
    const snap = get().getWorkspaceSnapshot();
    snap.selectedRoomId = roomId;
    PersistenceService.saveWorkspace(snap);
  },

  createRoom: (newRoom: Room) => {
    set((state) => {
      const updatedRooms = [...state.rooms, newRoom];
      const nextState = { rooms: updatedRooms, selectedRoomId: newRoom.id };
      const snap: Workspace = {
        ...get().getWorkspaceSnapshot(),
        rooms: updatedRooms,
        selectedRoomId: newRoom.id,
      };
      PersistenceService.saveWorkspace(snap);
      return nextState;
    });
  },

  updateRoom: (roomId: string, updates: Partial<Room>) => {
    set((state) => {
      const updatedRooms = state.rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              ...updates,
              config: updates.config ? { ...r.config, ...updates.config } : r.config,
              updatedAt: new Date().toISOString(),
            }
          : r,
      );
      const snap: Workspace = { ...get().getWorkspaceSnapshot(), rooms: updatedRooms };
      PersistenceService.saveWorkspace(snap);
      return { rooms: updatedRooms };
    });
  },

  archiveRoom: (roomId: string) => {
    set((state) => {
      const updatedRooms = state.rooms.map((r) =>
        r.id === roomId ? { ...r, archivedAt: new Date().toISOString() } : r,
      );
      const remainingActive = updatedRooms.filter((r) => !r.archivedAt);
      const nextSelected =
        state.selectedRoomId === roomId
          ? remainingActive[0]?.id || null
          : state.selectedRoomId;

      const snap: Workspace = {
        ...get().getWorkspaceSnapshot(),
        rooms: updatedRooms,
        selectedRoomId: nextSelected || undefined,
      };
      PersistenceService.saveWorkspace(snap);
      return { rooms: updatedRooms, selectedRoomId: nextSelected };
    });
  },

  duplicateRoom: (roomId: string) => {
    const state = get();
    const source = state.rooms.find((r) => r.id === roomId);
    if (!source) return null;

    const newId = generateRoomId(`${source.name} Copy`);
    const newFanId = generateDeviceId('FAN', newId);
    const newRoom: Room = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      deviceIds: [newFanId],
      config: {
        ...source.config,
        fanDeviceId: newFanId,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archivedAt: undefined,
    };

    get().createRoom(newRoom);
    return newRoom;
  },

  createGateway: (gateway: Gateway) => {
    set((state) => {
      const updatedGateways = [...state.gateways, gateway];
      const snap: Workspace = { ...get().getWorkspaceSnapshot(), gateways: updatedGateways };
      PersistenceService.saveWorkspace(snap);
      return { gateways: updatedGateways };
    });
  },

  updateGateway: (gatewayId: string, updates: Partial<Gateway>) => {
    set((state) => {
      const updatedGateways = state.gateways.map((g) =>
        g.id === gatewayId ? { ...g, ...updates } : g,
      );
      const snap: Workspace = { ...get().getWorkspaceSnapshot(), gateways: updatedGateways };
      PersistenceService.saveWorkspace(snap);
      return { gateways: updatedGateways };
    });
  },

  loadDemoWorkspace: () => {
    const demo = createDemoWorkspace();
    PersistenceService.saveWorkspace(demo);
    set({
      properties: demo.properties,
      gateways: demo.gateways,
      rooms: demo.rooms,
      selectedRoomId: demo.rooms[0]?.id || null,
      isLoaded: true,
      storageStatus: PersistenceService.getStorageStatus(),
    });
  },

  resetWorkspace: () => {
    PersistenceService.clearWorkspace();
    set({
      properties: [],
      gateways: [],
      rooms: [],
      selectedRoomId: null,
      isLoaded: true,
      storageStatus: PersistenceService.getStorageStatus(),
    });
  },

  importWorkspace: (importedWorkspace: Workspace) => {
    PersistenceService.saveWorkspace(importedWorkspace);
    set({
      properties: importedWorkspace.properties,
      gateways: importedWorkspace.gateways,
      rooms: importedWorkspace.rooms,
      selectedRoomId: importedWorkspace.selectedRoomId || importedWorkspace.rooms[0]?.id || null,
      isLoaded: true,
      storageStatus: PersistenceService.getStorageStatus(),
    });
  },

  getWorkspaceSnapshot: (): Workspace => {
    const state = get();
    return {
      schemaVersion: 1,
      properties: state.properties,
      gateways: state.gateways,
      rooms: state.rooms,
      events: [],
      packets: [],
      selectedRoomId: state.selectedRoomId || undefined,
      settings: {
        defaultSimulationSpeed: 1,
        defaultVacancyDelaySeconds: 60,
        defaultSmartCareThresholdKg: 10,
        reduceMotion: false,
        theme: 'dark',
      },
    };
  },
}));
