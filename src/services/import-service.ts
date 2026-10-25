import { Workspace } from '@/domain/types';
import { validateWorkspace } from '@/domain/schemas';
import { PersistenceService } from './persistence-service';
import { createDemoWorkspace } from './demo-seed-service';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';
import { useCareEventStore } from '@/state/useCareEventStore';
import { useSimulationStore } from '@/state/useSimulationStore';
import { useSettingsStore } from '@/state/useSettingsStore';

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  summary?: {
    propertiesCount: number;
    roomsCount: number;
    gatewaysCount: number;
    eventsCount: number;
    schemaVersion: number;
  };
  workspace?: Workspace;
}

export const ImportExportService = {
  /**
   * Generates and triggers browser download of the entire workspace as a formatted JSON file.
   */
  exportWorkspaceAsJson(): void {
    const ws = useWorkspaceStore.getState();
    const care = useCareEventStore.getState();
    const settings = useSettingsStore.getState();

    const fullWorkspace: Workspace = {
      schemaVersion: 1,
      properties: ws.properties,
      rooms: ws.rooms,
      gateways: ws.gateways,
      events: care.events,
      packets: care.activePackets,
      selectedRoomId: ws.selectedRoomId ?? undefined,
      settings: {
        defaultSimulationSpeed: settings.defaultSimulationSpeed,
        defaultVacancyDelaySeconds: settings.defaultVacancyDelaySeconds,
        defaultSmartCareThresholdKg: settings.defaultSmartCareThresholdKg,
        reduceMotion: settings.reduceMotion,
        theme: settings.theme,
      },
    };

    const json = JSON.stringify(fullWorkspace, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `smartair-workspace-${dateStr}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  },

  /**
   * Validates imported raw JSON string against the Zod schema and foreign key constraints.
   */
  validateWorkspaceJson(jsonString: string): ImportValidationResult {
    try {
      const parsed = JSON.parse(jsonString);
      const validated = validateWorkspace(parsed);

      return {
        isValid: true,
        errors: [],
        summary: {
          propertiesCount: validated.properties.length,
          roomsCount: validated.rooms.length,
          gatewaysCount: validated.gateways.length,
          eventsCount: validated.events.length,
          schemaVersion: validated.schemaVersion,
        },
        workspace: validated as Workspace,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON file structure';
      return {
        isValid: false,
        errors: [message],
      };
    }
  },

  /**
   * Applies validated workspace data across all application stores and persists to storage.
   */
  applyWorkspace(workspace: Workspace): void {
    // 1. Update Workspace Store
    useWorkspaceStore.setState({
      properties: workspace.properties,
      rooms: workspace.rooms,
      gateways: workspace.gateways,
      selectedRoomId: workspace.selectedRoomId || (workspace.rooms[0]?.id ?? null),
      isLoaded: true,
    });

    // 2. Update Care Event Store
    useCareEventStore.setState({
      events: workspace.events,
      activePackets: workspace.packets || [],
      sharedSirenActive: workspace.events.some(
        (e) => e.status === 'active' && e.sharedSirenStatus === 'success',
      ),
    });

    // 3. Update Settings Store
    if (workspace.settings) {
      useSettingsStore.setState({
        ...workspace.settings,
      });
    }

    // 4. If there's an active room, initialize simulation
    const activeRoom = workspace.rooms.find((r) => r.id === workspace.selectedRoomId) || workspace.rooms[0];
    if (activeRoom) {
      useSimulationStore.getState().initRoomSimulation(activeRoom);
    }

    // 5. Persist
    PersistenceService.saveWorkspace(workspace);
  },

  /**
   * Scoped Reset: Reset Current Room Run
   */
  resetCurrentRoom(roomId: string): void {
    const room = useWorkspaceStore.getState().rooms.find((r) => r.id === roomId);
    if (room) {
      useSimulationStore.getState().initRoomSimulation(room);
    }
  },

  /**
   * Scoped Reset: Clear / Resolve Active Events
   */
  clearActiveEvents(): void {
    const careStore = useCareEventStore.getState();
    careStore.clearActiveEvents();

    // Sync with persistence
    const currentWs = PersistenceService.loadWorkspace();
    if (currentWs) {
      PersistenceService.saveWorkspace({
        ...currentWs,
        events: careStore.events,
        packets: [],
      });
    }
  },

  /**
   * Scoped Reset: Restore Demo Workspace
   */
  restoreDemoWorkspace(): void {
    PersistenceService.clearWorkspace();
    const demo = createDemoWorkspace();
    this.applyWorkspace(demo);
  },

  /**
   * Scoped Reset: Wipe Workspace to pristine empty state
   */
  wipeWorkspace(): void {
    const emptyWorkspace: Workspace = {
      schemaVersion: 1,
      properties: [
        {
          id: 'prop-empty',
          name: 'Default Property',
          createdAt: new Date().toISOString(),
        },
      ],
      rooms: [],
      gateways: [],
      events: [],
      packets: [],
      selectedRoomId: undefined,
      settings: {
        defaultSimulationSpeed: 1,
        defaultVacancyDelaySeconds: 60,
        defaultSmartCareThresholdKg: 10,
        reduceMotion: false,
        theme: 'dark',
      },
    };

    PersistenceService.clearWorkspace();
    this.applyWorkspace(emptyWorkspace);
  },
};
