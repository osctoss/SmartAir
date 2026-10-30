import { useEffect, useRef, useCallback } from 'react';
import { useSimulationStore } from '@/state/useSimulationStore';
import { useCareEventStore } from '@/state/useCareEventStore';
import { SirenAudioPreview } from '@/simulation/smart-care/siren-simulator';

export function useSimulationClock() {
  const {
    runState,
    speedMultiplier,
    simTimeMs,
    setRunState,
    setSpeedMultiplier,
    applySimulationStep,
    resetSimulationState,
  } = useSimulationStore();

  const isRunning = runState === 'running';
  const lastRealTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const togglePlay = useCallback(() => {
    const nextState = isRunning ? 'paused' : 'running';
    setRunState(nextState);
    if (nextState !== 'running') {
      SirenAudioPreview.stop();
    }
  }, [isRunning, setRunState]);

  const advanceOneMinute = useCallback(() => {
    applySimulationStep({
      simTimeMs: simTimeMs + 60000,
    });
  }, [simTimeMs, applySimulationStep]);

  const reset = useCallback(() => {
    resetSimulationState();
    useCareEventStore.getState().setSharedSiren(false);
    SirenAudioPreview.stop();
  }, [resetSimulationState]);

  // Frame tick loop
  useEffect(() => {
    if (!isRunning) {
      lastRealTimeRef.current = null;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      return;
    }

    const tick = (nowRealMs: number) => {
      if (lastRealTimeRef.current === null) {
        lastRealTimeRef.current = nowRealMs;
      }

      // Delta real time since last frame
      const deltaRealMs = Math.min(nowRealMs - lastRealTimeRef.current, 100); // Clamp to 100ms max to prevent spiral
      lastRealTimeRef.current = nowRealMs;

      // Virtual simulation advance
      const deltaSimMs = Math.round(deltaRealMs * speedMultiplier);

      if (deltaSimMs > 0) {
        applySimulationStep({
          simTimeMs: useSimulationStore.getState().simTimeMs + deltaSimMs,
        });
      }

      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isRunning, speedMultiplier, applySimulationStep]);

  return {
    isRunning,
    speedMultiplier,
    simTimeMs,
    togglePlay,
    setSpeed: setSpeedMultiplier,
    advanceOneMinute,
    reset,
  };
}
