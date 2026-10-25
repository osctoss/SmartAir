import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'info' | 'success' | 'warning' | 'alert';
}

interface UiState {
  activeAdminTab: 'active-events' | 'history' | 'devices' | 'health';
  roomSearchQuery: string;
  roomEditionFilter: 'all' | 'smart-home' | 'smart-care';
  roomStatusFilter: 'all' | 'active-alert' | 'healthy';
  isAddRoomOpen: boolean;
  selectedEventIdForDrawer: string | null;
  toasts: ToastMessage[];

  // Actions
  setActiveAdminTab: (tab: 'active-events' | 'history' | 'devices' | 'health') => void;
  setRoomSearchQuery: (query: string) => void;
  setRoomEditionFilter: (filter: 'all' | 'smart-home' | 'smart-care') => void;
  setRoomStatusFilter: (filter: 'all' | 'active-alert' | 'healthy') => void;
  setIsAddRoomOpen: (isOpen: boolean) => void;
  openEventDrawer: (eventId: string | null) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeAdminTab: 'active-events',
  roomSearchQuery: '',
  roomEditionFilter: 'all',
  roomStatusFilter: 'all',
  isAddRoomOpen: false,
  selectedEventIdForDrawer: null,
  toasts: [],

  setActiveAdminTab: (tab) => set({ activeAdminTab: tab }),
  setRoomSearchQuery: (query) => set({ roomSearchQuery: query }),
  setRoomEditionFilter: (filter) => set({ roomEditionFilter: filter }),
  setRoomStatusFilter: (filter) => set({ roomStatusFilter: filter }),
  setIsAddRoomOpen: (isOpen) => set({ isAddRoomOpen: isOpen }),
  openEventDrawer: (eventId) => set({ selectedEventIdForDrawer: eventId }),

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4500);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
