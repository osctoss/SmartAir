/**
 * SimulationClock Controller
 * Manages virtual simulation time (simTimeMs), speed multiplier, and deterministic stepping.
 */

export type SpeedMultiplier = 1 | 5 | 20;

export interface ClockSnapshot {
  simTimeMs: number;
  isRunning: boolean;
  speedMultiplier: SpeedMultiplier;
}

export class SimulationClock {
  private simTimeMs: number = 0;
  private isRunning: boolean = false;
  private speedMultiplier: SpeedMultiplier = 1;
  private listeners: Set<(snapshot: ClockSnapshot) => void> = new Set();

  constructor(initialSimTimeMs = 0, initialSpeed: SpeedMultiplier = 1) {
    this.simTimeMs = initialSimTimeMs;
    this.speedMultiplier = initialSpeed;
  }

  public getSnapshot(): ClockSnapshot {
    return {
      simTimeMs: this.simTimeMs,
      isRunning: this.isRunning,
      speedMultiplier: this.speedMultiplier,
    };
  }

  public subscribe(listener: (snapshot: ClockSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const snap = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snap);
    }
  }

  public play(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.notify();
    }
  }

  public pause(): void {
    if (this.isRunning) {
      this.isRunning = false;
      this.notify();
    }
  }

  public toggle(): void {
    this.isRunning = !this.isRunning;
    this.notify();
  }

  public setSpeed(multiplier: SpeedMultiplier): void {
    this.speedMultiplier = multiplier;
    this.notify();
  }

  public step(deltaRealMs: number): number {
    if (!this.isRunning) return 0;
    const effectiveDeltaSimMs = Math.round(deltaRealMs * this.speedMultiplier);
    this.simTimeMs += effectiveDeltaSimMs;
    this.notify();
    return effectiveDeltaSimMs;
  }

  public advanceExactSimMs(simMs: number): void {
    this.simTimeMs += simMs;
    this.notify();
  }

  public advanceOneMinute(): number {
    const deltaSimMs = 60 * 1000;
    this.simTimeMs += deltaSimMs;
    this.notify();
    return deltaSimMs;
  }

  public reset(): void {
    this.simTimeMs = 0;
    this.isRunning = false;
    this.notify();
  }
}
