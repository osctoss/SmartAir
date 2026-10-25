import { describe, it, expect } from 'vitest';
import { SimulationClock } from '@/simulation/clock';
import { TransitionQueue } from '@/simulation/shared/transition-queue';

describe('Simulation Clock & Transition Queue (Phase 5)', () => {
  it('advances simulation time based on speed multiplier', () => {
    const clock = new SimulationClock(0, 1);
    clock.play();

    // 100ms real at 1x speed => 100 simMs
    clock.step(100);
    expect(clock.getSnapshot().simTimeMs).toBe(100);

    // Switch to 5x speed
    clock.setSpeed(5);
    clock.step(100); // 100ms real at 5x => 500 simMs
    expect(clock.getSnapshot().simTimeMs).toBe(600);

    // Switch to 20x speed
    clock.setSpeed(20);
    clock.step(50); // 50ms real at 20x => 1000 simMs
    expect(clock.getSnapshot().simTimeMs).toBe(1600);
  });

  it('pauses and does not advance time when paused', () => {
    const clock = new SimulationClock(500, 1);
    clock.pause();

    clock.step(200);
    expect(clock.getSnapshot().simTimeMs).toBe(500);
    expect(clock.getSnapshot().isRunning).toBe(false);
  });

  it('advances exactly one minute when commanded', () => {
    const clock = new SimulationClock(1000, 1);
    clock.advanceOneMinute();
    expect(clock.getSnapshot().simTimeMs).toBe(61000);
  });

  it('manages deterministic transition queue properly', () => {
    const queue = new TransitionQueue<{ name: string }>();

    queue.schedule(1000, 'PACKET_ARRIVAL', { name: 'Pkt-1' });
    queue.schedule(2500, 'VACANCY_TIMEOUT', { name: 'Timer' });
    queue.schedule(500, 'LOCAL_ALARM', { name: 'Alarm' });

    // Drain at 800 simMs -> only Alarm
    let ready = queue.drainReady(800);
    expect(ready.length).toBe(1);
    expect(ready[0].type).toBe('LOCAL_ALARM');

    // Drain at 1200 simMs -> Pkt-1
    ready = queue.drainReady(1200);
    expect(ready.length).toBe(1);
    expect(ready[0].type).toBe('PACKET_ARRIVAL');

    // Cancel Timer
    const pending = queue.getPending();
    expect(pending.length).toBe(1);
    queue.cancel(pending[0].id);
    expect(queue.drainReady(3000).length).toBe(0);
  });
});
