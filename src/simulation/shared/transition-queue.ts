/**
 * Deterministic Transition Queue for Delayed Simulation Events
 */

export interface ScheduledTransition<T = unknown> {
  id: string;
  triggerSimTimeMs: number;
  type: string;
  payload: T;
}

export class TransitionQueue<T = unknown> {
  private queue: ScheduledTransition<T>[] = [];

  public schedule(triggerSimTimeMs: number, type: string, payload: T, id?: string): string {
    const transitionId = id || `tr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    this.queue.push({
      id: transitionId,
      triggerSimTimeMs,
      type,
      payload,
    });
    // Keep sorted by triggerSimTimeMs ascending
    this.queue.sort((a, b) => a.triggerSimTimeMs - b.triggerSimTimeMs);
    return transitionId;
  }

  public drainReady(currentSimTimeMs: number): ScheduledTransition<T>[] {
    const ready: ScheduledTransition<T>[] = [];
    const remaining: ScheduledTransition<T>[] = [];

    for (const item of this.queue) {
      if (item.triggerSimTimeMs <= currentSimTimeMs) {
        ready.push(item);
      } else {
        remaining.push(item);
      }
    }

    this.queue = remaining;
    return ready;
  }

  public cancel(id: string): boolean {
    const initialLen = this.queue.length;
    this.queue = this.queue.filter((item) => item.id !== id);
    return this.queue.length < initialLen;
  }

  public clear(): void {
    this.queue = [];
  }

  public getPending(): ScheduledTransition<T>[] {
    return [...this.queue];
  }
}
