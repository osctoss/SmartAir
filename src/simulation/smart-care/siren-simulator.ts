export interface SirenActivationResult {
  canSound: boolean;
  sirenState: 'sounding' | 'silenced' | 'unavailable';
  failureReason?: string;
  summary: string;
}

export function evaluateSirenActivation(
  gatewayProcessedSuccessfully: boolean,
  sirenOutputAvailable: boolean,
  sirenOutputEnabled: boolean,
): SirenActivationResult {
  if (!sirenOutputEnabled) {
    return {
      canSound: false,
      sirenState: 'silenced',
      summary: 'Building siren output is disabled by property policy.',
    };
  }

  if (!gatewayProcessedSuccessfully) {
    return {
      canSound: false,
      sirenState: 'unavailable',
      failureReason: 'gateway-unreached',
      summary: 'Siren actuation skipped: gateway did not receive or process the incident packet.',
    };
  }

  if (!sirenOutputAvailable) {
    return {
      canSound: false,
      sirenState: 'unavailable',
      failureReason: 'siren-faulted',
      summary: 'Siren actuation failed: physical horn / siren output unit is OFFLINE or faulted.',
    };
  }

  return {
    canSound: true,
    sirenState: 'sounding',
    summary: 'Shared building siren successfully triggered by gateway.',
  };
}

/**
 * Optional synthetic audio preview.
 * Strictly user-initiated; never autoplays; provides explicit stop.
 */
class SyntheticSirenPlayer {
  private audioCtx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  public playTone(): void {
    if (typeof window === 'undefined') return;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }

      this.stop(); // Stop any existing tone

      this.osc = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();

      this.osc.type = 'sawtooth';
      this.osc.frequency.setValueAtTime(680, this.audioCtx.currentTime);
      this.osc.frequency.exponentialRampToValueAtTime(940, this.audioCtx.currentTime + 0.5);

      this.gainNode.gain.setValueAtTime(0.08, this.audioCtx.currentTime); // Safe low volume

      this.osc.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.osc.start();
    } catch (e) {
      console.warn('Audio preview error:', e);
    }
  }

  public stop(): void {
    try {
      if (this.osc) {
        this.osc.stop();
        this.osc.disconnect();
        this.osc = null;
      }
    } catch {
      // Ignore
    }
  }
}

export const SirenAudioPreview = new SyntheticSirenPlayer();
