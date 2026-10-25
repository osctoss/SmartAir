import { Workspace } from '@/domain/types';
import { validateWorkspace } from '@/domain/schemas';

const STORAGE_KEY = 'smartair_workspace_v1';

export interface StorageStatus {
  isAvailable: boolean;
  isInMemoryFallback: boolean;
  lastSavedAt?: string;
  errorMessage?: string;
}

let inMemoryWorkspaceFallback: Workspace | null = null;
let currentStorageStatus: StorageStatus = {
  isAvailable: true,
  isInMemoryFallback: false,
};

export const PersistenceService = {
  getStorageStatus(): StorageStatus {
    return { ...currentStorageStatus };
  },

  isLocalStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__smartair_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },

  loadWorkspace(): Workspace | null {
    if (!this.isLocalStorageAvailable()) {
      currentStorageStatus = {
        isAvailable: false,
        isInMemoryFallback: true,
        errorMessage: 'Local storage is disabled or unavailable in this browser context.',
      };
      return inMemoryWorkspaceFallback;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      const validated = validateWorkspace(parsed);
      currentStorageStatus = {
        isAvailable: true,
        isInMemoryFallback: false,
        lastSavedAt: new Date().toISOString(),
      };
      return validated as Workspace;
    } catch (err: unknown) {
      console.warn('Failed to load or validate workspace from localStorage:', err);
      currentStorageStatus = {
        isAvailable: true,
        isInMemoryFallback: true,
        errorMessage: err instanceof Error ? err.message : 'Corrupted workspace data',
      };
      return null;
    }
  },

  saveWorkspace(workspace: Workspace): boolean {
    if (!this.isLocalStorageAvailable()) {
      inMemoryWorkspaceFallback = workspace;
      currentStorageStatus = {
        isAvailable: false,
        isInMemoryFallback: true,
        errorMessage: 'Changes are running in-memory only and will reset on reload.',
      };
      return false;
    }

    try {
      const json = JSON.stringify(workspace);
      window.localStorage.setItem(STORAGE_KEY, json);
      currentStorageStatus = {
        isAvailable: true,
        isInMemoryFallback: false,
        lastSavedAt: new Date().toISOString(),
      };
      return true;
    } catch (err: unknown) {
      console.error('Failed to save workspace to localStorage:', err);
      inMemoryWorkspaceFallback = workspace;
      currentStorageStatus = {
        isAvailable: false,
        isInMemoryFallback: true,
        errorMessage: 'Storage quota exceeded. Switched to in-memory mode.',
      };
      return false;
    }
  },

  clearWorkspace(): void {
    inMemoryWorkspaceFallback = null;
    if (this.isLocalStorageAvailable()) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.warn('Failed to clear localStorage:', err);
      }
    }
  },
};
