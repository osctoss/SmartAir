import { describe, it, expect, beforeEach } from 'vitest';
import { ImportExportService } from '@/services/import-service';
import { createDemoWorkspace } from '@/services/demo-seed-service';
import { useWorkspaceStore } from '@/state/useWorkspaceStore';

describe('ImportExportService & Workspace Validation', () => {
  beforeEach(() => {
    useWorkspaceStore.getState().initWorkspace();
  });

  it('validates a valid workspace JSON correctly and produces summary metrics', () => {
    const demo = createDemoWorkspace();
    const jsonStr = JSON.stringify(demo);

    const result = ImportExportService.validateWorkspaceJson(jsonStr);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.summary?.roomsCount).toBe(demo.rooms.length);
    expect(result.summary?.gatewaysCount).toBe(demo.gateways.length);
    expect(result.summary?.schemaVersion).toBe(1);
  });

  it('rejects invalid JSON syntax', () => {
    const invalidJson = '{ bad json syntax...';
    const result = ImportExportService.validateWorkspaceJson(invalidJson);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects payload missing mandatory schema fields', () => {
    const partialData = {
      schemaVersion: 1,
      // Missing properties, rooms, gateways
    };
    const result = ImportExportService.validateWorkspaceJson(JSON.stringify(partialData));

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects foreign key violation when a room references a non-existent gateway', () => {
    const demo = createDemoWorkspace();
    // Point Room A-204 to a non-existent gateway
    if (demo.rooms[0]?.config.smartCareConfig) {
      demo.rooms[0].config.smartCareConfig.assignedGatewayId = 'gw-does-not-exist';
    }

    const result = ImportExportService.validateWorkspaceJson(JSON.stringify(demo));

    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('unmapped gateway');
  });

  it('successfully restores demo workspace via scoped reset', () => {
    ImportExportService.restoreDemoWorkspace();
    const ws = useWorkspaceStore.getState();

    expect(ws.rooms.length).toBeGreaterThanOrEqual(3);
    expect(ws.gateways.length).toBeGreaterThanOrEqual(1);
    expect(ws.properties.length).toBeGreaterThanOrEqual(1);
  });
});
