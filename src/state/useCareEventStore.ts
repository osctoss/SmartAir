import { create } from 'zustand';
import {
  CareEvent,
  SimulatedRadioPacket,
  EventStatus,
  EventStageStatus,
} from '@/domain/types';

interface CareEventState {
  events: CareEvent[];
  activePackets: SimulatedRadioPacket[];
  sharedSirenActive: boolean;
  localAlarmActiveByRoomId: Record<string, boolean>;

  // Actions
  recordCareEvent: (event: CareEvent) => void;
  updateEventStage: (
    eventId: string,
    stageId: string,
    status: EventStageStatus,
    detail?: string,
    simTimeMs?: number,
  ) => void;
  setEventStatus: (eventId: string, status: EventStatus) => void;
  queueRadioPacket: (packet: SimulatedRadioPacket) => void;
  updateRadioPacket: (packetId: string, updates: Partial<SimulatedRadioPacket>) => void;
  setSharedSiren: (active: boolean) => void;
  setLocalRoomAlarm: (roomId: string, active: boolean) => void;
  acknowledgeEvent: (eventId: string, operatorLabel: string, simTimeMs: number) => void;
  resolveEvent: (eventId: string, operatorLabel: string, simTimeMs: number, note?: string) => void;
  clearActiveEvents: () => void;
  resetCareEvents: () => void;
}

export const useCareEventStore = create<CareEventState>((set) => ({
  events: [],
  activePackets: [],
  sharedSirenActive: false,
  localAlarmActiveByRoomId: {},

  recordCareEvent: (newEvent: CareEvent) => {
    set((state) => ({
      events: [newEvent, ...state.events],
    }));
  },

  updateEventStage: (eventId, stageId, status, detail, simTimeMs) => {
    set((state) => ({
      events: state.events.map((evt) => {
        if (evt.id !== eventId) return evt;
        const updatedStages = evt.stages.map((st) =>
          st.id === stageId
            ? {
                ...st,
                status,
                detail: detail ?? st.detail,
                timestampSimMs: simTimeMs ?? st.timestampSimMs ?? Date.now(),
              }
            : st,
        );
        return {
          ...evt,
          stages: updatedStages,
        };
      }),
    }));
  },

  setEventStatus: (eventId, status) => {
    set((state) => ({
      events: state.events.map((e) => (e.id === eventId ? { ...e, status } : e)),
    }));
  },

  queueRadioPacket: (packet) => {
    set((state) => ({
      activePackets: [...state.activePackets, packet],
    }));
  },

  updateRadioPacket: (packetId, updates) => {
    set((state) => ({
      activePackets: state.activePackets.map((p) =>
        p.packetId === packetId ? { ...p, ...updates } : p,
      ),
    }));
  },

  setSharedSiren: (active) => {
    set({ sharedSirenActive: active });
  },

  setLocalRoomAlarm: (roomId, active) => {
    set((state) => ({
      localAlarmActiveByRoomId: {
        ...state.localAlarmActiveByRoomId,
        [roomId]: active,
      },
    }));
  },

  acknowledgeEvent: (eventId, operatorLabel, simTimeMs) => {
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              status: 'acknowledged' as EventStatus,
              acknowledgement: {
                acknowledgedAtSimMs: simTimeMs,
                acknowledgedAtIso: new Date().toISOString(),
                acknowledgedByLabel: operatorLabel,
              },
            }
          : e,
      ),
    }));
  },

  resolveEvent: (eventId, operatorLabel, simTimeMs, note) => {
    set((state) => {
      const target = state.events.find((e) => e.id === eventId);
      const nextLocalAlarms = { ...state.localAlarmActiveByRoomId };
      if (target?.roomId) {
        delete nextLocalAlarms[target.roomId];
      }

      return {
        sharedSirenActive: false,
        localAlarmActiveByRoomId: nextLocalAlarms,
        events: state.events.map((e) =>
          e.id === eventId
            ? {
                ...e,
                status: 'resolved' as EventStatus,
                resolution: {
                  resolvedAtSimMs: simTimeMs,
                  resolvedAtIso: new Date().toISOString(),
                  resolvedByLabel: operatorLabel,
                  note,
                },
              }
            : e,
        ),
      };
    });
  },

  clearActiveEvents: () => {
    set((state) => ({
      sharedSirenActive: false,
      localAlarmActiveByRoomId: {},
      events: state.events.map((e) =>
        e.status === 'active'
          ? {
              ...e,
              status: 'resolved' as EventStatus,
              resolution: {
                resolvedAtSimMs: Date.now(),
                resolvedAtIso: new Date().toISOString(),
                resolvedByLabel: 'System Operator (Bulk Clear)',
                note: 'Cleared via Admin Bulk Action',
              },
            }
          : e,
      ),
    }));
  },

  resetCareEvents: () => {
    set({
      events: [],
      activePackets: [],
      sharedSirenActive: false,
      localAlarmActiveByRoomId: {},
    });
  },
}));
