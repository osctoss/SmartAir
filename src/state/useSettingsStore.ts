import { create } from 'zustand';
import { WorkspaceSettings } from '@/domain/types';

interface SettingsState extends WorkspaceSettings {
  setDefaultSpeed: (speed: 1 | 5 | 20) => void;
  setDefaultVacancyDelay: (seconds: number) => void;
  setDefaultCareThreshold: (kg: number) => void;
  setReduceMotion: (reduce: boolean) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  updateSettings: (settings: Partial<WorkspaceSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  defaultSimulationSpeed: 1,
  defaultVacancyDelaySeconds: 60,
  defaultSmartCareThresholdKg: 10,
  reduceMotion: false,
  theme: 'dark',

  setDefaultSpeed: (defaultSimulationSpeed) => set({ defaultSimulationSpeed }),
  setDefaultVacancyDelay: (defaultVacancyDelaySeconds) => set({ defaultVacancyDelaySeconds }),
  setDefaultCareThreshold: (defaultSmartCareThresholdKg) => set({ defaultSmartCareThresholdKg }),
  setReduceMotion: (reduceMotion) => set({ reduceMotion }),
  setTheme: (theme) => set({ theme }),
  updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
}));
