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
 * Synthetic audio siren player using Web Audio API.
 * Oscillates carrier frequency with a Low-Frequency Oscillator (LFO)
 * for a realistic building emergency wail (650 Hz - 910 Hz).
 * Strictly user-controlled with safe volume and explicit stop.
 */
class SyntheticSirenPlayer {
  private audioCtx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private gainNode: GainNode | null = null;
  private _isPlaying = false;
  private _isMuted = false;

  public isPlaying(): boolean {
    return this._isPlaying;
  }

  public isMuted(): boolean {
    return this._isMuted;
  }

  public setMuted(muted: boolean): void {
    this._isMuted = muted;
    if (muted && this._isPlaying) {
      this.stop();
    }
  }

  public startSiren(volume = 0.08): void {
    if (typeof window === 'undefined') return;
    if (this._isMuted) return;
    if (this._isPlaying) return;

    try {
      if (!this.audioCtx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.stop(); // Stop any leftover nodes

      const now = this.audioCtx.currentTime;

      // Main tone oscillator (center frequency 780 Hz)
      this.osc = this.audioCtx.createOscillator();
      this.osc.type = 'sawtooth';
      this.osc.frequency.setValueAtTime(780, now);

      // Low-Frequency Oscillator (LFO) for periodic siren wail (1.2 Hz cycle)
      this.lfo = this.audioCtx.createOscillator();
      this.lfo.type = 'triangle';
      this.lfo.frequency.setValueAtTime(1.2, now);

      // Pitch depth (+- 130 Hz sweep)
      this.lfoGain = this.audioCtx.createGain();
      this.lfoGain.gain.setValueAtTime(130, now);

      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.osc.frequency);

      // Master gain for safe volume
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(Math.min(0.12, volume), now);

      this.osc.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.osc.start(now);
      this.lfo.start(now);
      this._isPlaying = true;
    } catch (e) {
      console.warn('Audio preview error:', e);
    }
  }

  public stop(): void {
    this._isPlaying = false;
    try {
      if (this.osc) {
        this.osc.stop();
        this.osc.disconnect();
        this.osc = null;
      }
      if (this.lfo) {
        this.lfo.stop();
        this.lfo.disconnect();
        this.lfo = null;
      }
      if (this.lfoGain) {
        this.lfoGain.disconnect();
        this.lfoGain = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
    } catch {
      // Ignore
    }
  }

  public playTone(durationMs = 1500): void {
    if (this._isMuted) return;
    this.startSiren(0.06);
    setTimeout(() => {
      this.stop();
    }, durationMs);
  }
}

export const SirenAudioPreview = new SyntheticSirenPlayer();
